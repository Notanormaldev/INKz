# INKz — System Architecture & Technical Reference

INKz is a cloud-native, event-driven **browser-based Cloud IDE and Agentic AI Coding Platform**. It orchestrates ephemeral Kubernetes container sandboxes, manages workspace file persistence via AWS S3, handles real-time terminal streaming via WebSockets, and drives autonomous multi-file code edits through a LangChain AI agent loop — all from the browser with zero local setup required.

This document is the single source of truth for how every component is architected, how data flows between services, and why specific technical decisions were made. All details are sourced directly from the actual codebase.

---

## Table of Contents

1. [High-Level System Overview](#1-high-level-system-overview)
2. [Service Inventory](#2-service-inventory)
3. [Request Flow: Browser to Running Pod](#3-request-flow-browser-to-running-pod)
4. [Kubernetes Infrastructure & Pod Anatomy](#4-kubernetes-infrastructure--pod-anatomy)
5. [Redis TTL Lifecycle: Pod Birth to Auto-Deletion](#5-redis-ttl-lifecycle-pod-birth-to-auto-deletion)
6. [S3 Sync Agent: Workspace File Persistence](#6-s3-sync-agent-workspace-file-persistence)
7. [Router Service: Subdomain Reverse Proxy](#7-router-service-subdomain-reverse-proxy)
8. [RabbitMQ Event Bus: Asynchronous Messaging](#8-rabbitmq-event-bus-asynchronous-messaging)
9. [AI Orchestration: LangChain Agent Loop](#9-ai-orchestration-langchain-agent-loop)
10. [Auth Service: Google OAuth + JWT](#10-auth-service-google-oauth--jwt)
11. [NGINX Ingress Routing Table](#11-nginx-ingress-routing-table)
12. [RBAC: Kubernetes Permission Model](#12-rbac-kubernetes-permission-model)
13. [Skaffold: Local vs AWS EKS Deployment](#13-skaffold-local-vs-aws-eks-deployment)
14. [Data Store Reference](#14-data-store-reference)
15. [Security Model](#15-security-model)
16. [Self-Hosted / Local Mode (No AWS Required)](#16-self-hosted--local-mode-no-aws-required)

---

## 1. High-Level System Overview

```
+--------------------------------------------------------------------+
|                          Browser (Client)                          |
|   React + Vite    Monaco Editor    Xterm.js    Socket.IO Client    |
+----------------------------------+---------------------------------+
                                   |
                              HTTPS / WSS
                                   |
+----------------------------------v---------------------------------+
|              NGINX Ingress Controller (K8s Ingress)               |
|   /api/auth        -->  auth-service                              |
|   /api/sandbox     -->  sandbox-service                           |
|   /api/ai          -->  ai-service                                |
|   *.preview.localhost  -->  router-service (port 80)              |
|   *.agent.localhost    -->  router-service (port 3000)            |
+---+--------------------+--------------------+---------------------+
    |                    |                    |
    v                    v                    v
+-------+         +-----------+        +----------+        +--------------+
| auth  |         | sandbox   |        |    ai    |        | notification |
|service|         | service   |        | service  |        |   service    |
+---+---+         +-----+-----+        +-----+----+        +------+-------+
    |                   |                    |                    |
    |           +-------+--------+           |                    |
    |           | Kubernetes API |           |                    |
    |           +-------+--------+           |                    |
    |                   |                    |                    |
    |      +------------+------------+       |                    |
    |      |            |            |       |                    |
    |  +---+-------+  +-+------+  +-+-----+ |                    |
    |  | sandbox   |  | agent  |  | sync  | |                    |
    |  | container |  |sidecar |  | agent | |                    |
    |  | :5173     |  | :3000  |  | (S3)  | |                    |
    |  +-----------+  +--------+  +-------+ |                    |
    |       All 3 share /workspace volume   |                    |
    |                                       |                    |
+---+----------+                    +-------+----+        +------+-------+
| MongoDB Auth |                    | MongoDB AI |        |   RabbitMQ   |
+--------------+                    +------------+        |  CloudAMQP   |
                                                          +------+-------+
+------------------+    +-------------------+                    |
| MongoDB Sandbox  |    |   Redis Cloud     |            +-------+-------+
+------------------+    | (TTL + K-V store) |            |  Brevo Email  |
                        +-------------------+            +---------------+

+-----------------------------------+
|       AWS S3 Bucket: inkz-s3      |
|   <project-id>/<filename>         |
+-----------------------------------+
```

---

## 2. Service Inventory

INKz is composed of **8 distinct services**, each deployed as a separate Kubernetes workload and built from its own Dockerfile.

| # | Service | Source Path | Container Port | Image Name | Primary Role |
|---|---|---|---|---|---|
| 1 | `auth` | `auth/` | 3000 | `auth` | Google OAuth 2.0, JWT cookie issuance, early-access application management |
| 2 | `sandbox` | `sandbox/server/` | 3000 | `sandbox` | Kubernetes pod/service provisioning, Redis TTL management, project CRUD, S3 cleanup on delete |
| 3 | `ai-orchestration` | `ai-orchestration/` | 3000 | `ai-orchestration` | LangChain ReAct agent, Mistral AI, chat history in MongoDB |
| 4 | `notification` | `notification/` | 3000 | `notification` | RabbitMQ AMQP consumer, Brevo transactional email delivery |
| 5 | `router` | `sandbox/router/` | 3000 | `router` | Subdomain-aware HTTP + WebSocket reverse proxy to sandbox pods |
| 6 | `template` | `sandbox/template/` | 5173 | `template` | Base workspace Docker image seeded into every new sandbox pod |
| 7 | `agent` | `sandbox/agent/` | 3000 | `agent` | Per-pod file API sidecar: list-files, read-file, update-files, create-files |
| 8 | `sync-agent` | `sandbox/sync-agent/` | — | `sync-agent` | Per-pod S3 bidirectional sync sidecar using chokidar file watcher |

---

## 3. Request Flow: Browser to Running Pod

This traces the exact sequence of calls from the moment a user opens a workspace.

```
Step 1: Browser sends POST /api/sandbox/start { projectid }
        --> Nginx --> sandbox-service

Step 2: sandbox-service queries Redis: GET project:<projectid>
        If key exists --> sandboxid found --> pod already running
        If null --> must create new pod

Step 3 (new pod only):
        sandboxid = uuid()
        createNamespacedPod("sandbox-pod-<sandboxid>")         [K8s API]
        createNamespacedService("sandbox-service-<sandboxid>")  [K8s API]
        Redis SET sandbox:<sandboxid>  EX 1200                  [Redis]
        Redis SET project:<projectid> <sandboxid>  EX 1200      [Redis]

Step 4: Response to browser:
        201 { sandboxid, preview: "http://<sandboxid>.preview.localhost" }

Step 5: Browser polls GET /api/sandbox/status/<projectid>
        --> sandbox-service reads pod phase from K8s API
        --> Returns "starting" (Pending) or "ready" (Running + all containers ready)

Step 6: Once "ready", browser connects to:
        http://<sandboxid>.preview.localhost  --> via Nginx wildcard --> router-service
        ws://<sandboxid>.agent.localhost      --> via Nginx wildcard --> router-service
        Router-service extracts sandboxid from subdomain and forwards to:
        sandbox-service-<sandboxid>:80   (template Vite dev server)
        sandbox-service-<sandboxid>:3000 (agent file API sidecar)
```

---

## 4. Kubernetes Infrastructure & Pod Anatomy

### Pod Structure

Every sandbox is a single Kubernetes **Pod** with **3 containers sharing one `emptyDir` volume** mounted at `/workspace`. This means all 3 containers see the same filesystem.

```
+----------------------------------------------------------------+
|                  sandbox-pod-<sandboxid>                       |
|                                                                |
|  +----------------+  +-----------------+  +----------------+  |
|  |sandbox-container  |  agent-container  |  | sync-agent    |  |
|  | image: template|  | image: agent    |  | image:sync-    |  |
|  | port:  5173    |  | port: 3000      |  | agent          |  |
|  | (Vite dev srv) |  | (File API srv)  |  | (no port)      |  |
|  +-------+--------+  +-------+---------+  +-------+--------+  |
|          |                   |                    |            |
|          +-------------------+--------------------+            |
|                              |                                 |
|                   +----------+----------+                      |
|                   |  workspace-volume   |  (emptyDir: shared)  |
|                   |  mountPath:/workspace                      |
|                   +---------------------+                      |
+----------------------------------------------------------------+
```

### Init Container

Before any main containers start, an init container runs once:
- **Image:** `template`
- **Command:** `sh -c 'cp -r /workspace/. /seed/'`
- **Mount:** `workspace-volume` at `/seed`

This seeds the shared volume with base template files. The `sync-agent` then overwrites these with S3 files if the project was previously saved.

### Resource Limits (from `pod.js`)

| Container | CPU Request | CPU Limit | Memory Request | Memory Limit |
|---|---|---|---|---|
| `sandbox-container` | 250m | 500m | 256Mi | 512Mi |
| `agent-container` | 250m | 500m | 256Mi | 512Mi |
| `sync-agent` | 250m | 500m | 256Mi | 512Mi |

Limits are enforced by Kubernetes cgroups. A pod cannot exceed its limits regardless of what runs inside.

### Kubernetes Service Per Pod

Each pod gets a dedicated `ClusterIP` Service named `sandbox-service-<sandboxid>`. This provides a stable internal DNS name inside the cluster so the `router` service can reach the pod by name rather than by IP.

---

## 5. Redis TTL Lifecycle: Pod Birth to Auto-Deletion

Redis is not used for caching — it is the **pod lifecycle controller**. Two keys track every active sandbox:

| Redis Key | Value | TTL |
|---|---|---|
| `sandbox:<sandboxid>` | `{"status":"active"}` | 1200 seconds (20 minutes) |
| `project:<projectid>` | `<sandboxid>` string | 1200 seconds (20 minutes) |

### Full Lifecycle

```
[POD CREATED]
  sandbox-service sets both Redis keys with EX 1200

[DEVELOPER ACTIVE]
  Browser sends POST /api/sandbox/heartbeat { projectid, sandboxid }
  every ~5 minutes while workspace is open
  --> sandbox-service calls: Redis EXPIRE sandbox:<sid> 1200
  --> sandbox-service calls: Redis EXPIRE project:<pid> 1200
  TTL resets to 20 minutes on every heartbeat
  Pod stays alive

[DEVELOPER CLOSES TAB]
  Heartbeat stops
  Redis countdown runs
  After 1200s of silence...

[REDIS KEY EXPIRES]
  Redis emits keyspace notification on channel:
  __keyevent@0__:expired  with message: sandbox:<sandboxid>

[SANDBOX SERVICE REACTS]
  subscriber.on('message', (channel, key) => {
    if (key.startsWith('sandbox:')) {
      deletepod(sandboxid)        // k8s deleteNamespacedPod
      deleteservice(sandboxid)    // k8s deleteNamespacedService
    }
  })

[ORPHAN REAPER - runs every 3 minutes]
  Lists all K8s pods with label selector: sandboxid
  For each pod: checks redis.exists('sandbox:<sandboxid>')
  If Redis key is gone but pod still running --> force delete pod + service
  Safety net in case a Redis expiry pub/sub event was missed during restart
```

### Keyspace Notification Configuration

```js
subscriber.config('SET', 'notify-keyspace-events', 'Ex')
subscriber.subscribe('__keyevent@0__:expired')
```

`Ex` enables only **key expiry events** — not all keyspace events. This keeps Redis pub/sub traffic minimal and avoids flooding the subscription channel.

---

## 6. S3 Sync Agent: Workspace File Persistence

Kubernetes pods are ephemeral — when deleted, their filesystem is gone. The `sync-agent` sidecar makes the `/workspace` directory persistent across pod restarts.

### Initial Sync on Startup (from `sync.js`)

```
initialSync():
  s3Keys = listS3Files()  [ListObjectsV2Command with pagination]

  if s3Keys.length > 0:
    // Returning project: download saved state
    for each s3Key: downloadFile(s3Key) --> write to /workspace/
  else:
    // New project: upload template files to S3
    localFiles = collectLocalFiles('/workspace')
    for each file: uploadFile(file) --> PutObjectCommand to S3
```

### Ongoing File Sync: chokidar Watcher

After initial sync completes, a chokidar watcher is started on `/workspace`:

| Event | Handler | S3 Action |
|---|---|---|
| `add` (file created) | `uploadFile(localPath)` | `PutObjectCommand` |
| `change` (file modified) | `uploadFile(localPath)` | `PutObjectCommand` |
| `unlink` (file deleted) | `deleteFile(localPath)` | `DeleteObjectCommand` |

**`awaitWriteFinish`** is configured with `stabilityThreshold: 500ms` — the watcher waits for a file to stop being written before triggering upload, preventing partial uploads.

**Ignored paths:** `node_modules`, `.env`, `.git` are never synced.

### S3 Key Structure

```
Bucket: inkz-s3
Region: ap-south-1

Local path:  /workspace/src/components/App.jsx
S3 key:      <mongodb-project-id>/src/components/App.jsx

Local path:  /workspace/package.json
S3 key:      <mongodb-project-id>/package.json
```

### Project Permanent Deletion

`DELETE /api/sandbox/project/:id` in the sandbox service:
1. Verifies ownership via MongoDB.
2. Gets active sandboxid from Redis.
3. Deletes pod and K8s service if running.
4. Calls `ListObjectsV2Command` with pagination to collect all S3 keys under the `<projectid>/` prefix.
5. Calls `DeleteObjectsCommand` in a single batch request.
6. Removes the project document from MongoDB.

---

## 7. Router Service: Subdomain Reverse Proxy

The `router` service (`sandbox/router/`) is a dynamic HTTP and WebSocket reverse proxy. It parses the incoming `Host` header and routes the request to the correct sandbox pod by sandboxid.

### Subdomain Routing Logic (from `router/src/app.js`)

```
Incoming Host: abc123uuid.preview.localhost
  parts = host.split('.')        --> ["abc123uuid", "preview", "localhost"]
  sandboxid = parts[0]           --> "abc123uuid"
  parts[1] === "preview"
  --> proxy to: http://sandbox-service-abc123uuid:80
      (sandbox-container running Vite dev server)

Incoming Host: abc123uuid.agent.localhost
  parts[1] === "agent"
  --> proxy to: http://sandbox-service-abc123uuid:3000
      (agent-container running file API server)
```

### Proxy Creation

Proxies are created lazily and cached per sandboxid using `http-proxy-middleware`:

```js
const proxies = {}
function getproxy(sandboxid) {
    if (!proxies[sandboxid]) {
        proxies[sandboxid] = createProxyMiddleware({
            target: `http://sandbox-service-${sandboxid}:80`,
            changeOrigin: true
        })
    }
    return proxies[sandboxid]
}
```

### WebSocket Upgrade Handling

WebSocket upgrades are handled separately via `http-proxy`:

```js
server.on('upgrade', async (req, socket, head) => {
    const sandboxid = req.headers.host.split('.')[0]
    await refreshTTL(sandboxid)   // Every WS connection resets Redis TTL
    wsProxy.ws(req, socket, head, { target })
})
```

Every WebSocket connection (terminal session, HMR, Socket.IO) also refreshes the Redis TTL — meaning active terminal usage keeps the pod alive even without a heartbeat.

---

## 8. RabbitMQ Event Bus: Asynchronous Messaging

INKz uses **CloudAMQP** (managed RabbitMQ) over `amqps://` (AMQP 0-9-1 over TLS) for decoupled asynchronous event delivery between services.

### Current Event Flow: Login Notification

```
[User logs in via Google OAuth]
  |
  v
Auth Service:
  Saves User to MongoDB
  Publishes to queue: auth_notification_queue
  Payload: { userId, email, timestamp }
  Returns 200 to browser immediately -- does NOT wait for email

[Asynchronously]
  |
  v
Notification Service:
  channel.consume('auth_notification_queue', async (msg) => {
    const { userId, email, timestamp } = JSON.parse(msg.content)
    await sendEmail({
      to: email,
      subject: "New login detected",
      html: "A new login was detected at " + timestamp + "..."
    })
    channel.ack(msg)   // acknowledge only after email sends successfully
  })
  |
  v
Brevo API (Sendinblue HTTP API):
  Delivers transactional email to user's inbox
```

### Why RabbitMQ Instead of Direct HTTP?

If auth called notification directly via HTTP:
- If notification service is down → login fails or hangs
- No retry mechanism
- Tight coupling means both services must be up simultaneously

With RabbitMQ:
- Auth responds to user instantly (message queued in <1ms)
- If notification service restarts, pending messages are delivered on reconnect
- Services are fully decoupled and independently deployable

---

## 9. AI Orchestration: LangChain Agent Loop

The `ai-orchestration` service runs an autonomous **LangChain ReAct agent** powered by Mistral AI.

### Agent Setup (from `code.agent.js`)

```js
const model = new ChatMistralAI({
    model: "mistral-medium-latest",
    apiKey: process.env.MISTRAL_API_KEY
})

const agent = createAgent({
    model,
    tools: [listfiles, createFile, updatefile, readfile],
    systemPrompt: INKZ_SYSTEM_PROMPT
}).withConfig({
    recursionLimit: 200   // max 200 tool calls per task
})
```

`recursionLimit: 200` allows complex multi-file tasks (e.g., refactoring an entire feature) without hitting the default limit.

### Agent Tools (from `tool.js`)

Each tool communicates with the `agent` sidecar container inside the user's sandbox pod via internal cluster DNS:

| Tool | HTTP Method + Endpoint | Purpose |
|---|---|---|
| `listfiles` | `GET http://sandbox-service-<projectid>:3000/list-files` | Returns the full file tree of `/workspace` |
| `readfile` | `GET /read-file?files=src/a.js,src/b.js` | Returns file contents as a JSON object |
| `updatefile` | `PATCH /update-files` body: `[{filename, content}]` | Overwrites one or more existing files |
| `createFile` | `POST /create-files` body: `[{filename, content}]` | Creates new files, creating parent directories if needed |

The `projectid` is injected into the agent via LangChain's `configurable` context per request, so every tool call automatically targets the correct sandbox pod.

### Execution Example

```
User prompt: "Add a REST API route /api/hello that returns { hello: 'world' }"

Agent Step 1 - listfiles:
  GET http://sandbox-service-<sid>:3000/list-files
  --> ["src/index.js", "package.json", "README.md"]

Agent Step 2 - readfile:
  GET /read-file?files=src/index.js
  --> { "src/index.js": "import express from 'express'..." }

Agent Step 3 - updatefile:
  PATCH /update-files
  body: [{ filename: "src/index.js", content: "...updated with /api/hello route..." }]
  --> { success: true }

Agent Final Response:
  "Done. I added GET /api/hello to src/index.js returning { hello: 'world' }."
```

---

## 10. Auth Service: Google OAuth + JWT

### OAuth 2.0 Flow

```
1. Browser:       GET /api/auth/google
2. Auth Service:  passport.authenticate('google', { scope: ['profile', 'email'] })
3. Google:        Shows OAuth consent screen
4. User allows:   Google redirects to /api/auth/google/callback?code=...
5. Auth Service:  Exchanges code for access_token with Google
6. Auth Service:  Fetches user profile (name, email, photo, googleId)
7. Auth Service:  Upserts User document in MongoDB (findOrCreate by googleId)
8. Auth Service:  Signs JWT: jwt.sign({ id, role, plan }, SECRET, { expiresIn: '7d' })
9. Auth Service:  Sets cookie: res.cookie('token', jwt, { httpOnly: true, sameSite: 'Lax' })
10. Browser:      Redirected to /dashboard with session established
```

### JWT Cookie Security Properties

| Property | Value | Reason |
|---|---|---|
| `httpOnly` | `true` | JavaScript cannot access the cookie — XSS attacks cannot steal the token |
| `sameSite` | `Lax` | Cookie not sent on cross-origin requests — blocks CSRF attacks |
| `secure` | `true` (production) | Cookie only transmitted over HTTPS |
| Expiry | 7 days | Long enough for ongoing developer sessions |

### Plan-Based Access Control (`checkUnlimitedAccess`)

Every sandbox start and project creation request runs through:

```
1. Check JWT claims: role === 'admin' || plan === 'unlimited' || email === ADMIN_EMAIL
   --> if true: allow immediately (fast path)

2. If not matched: query MongoDB User document for fresh plan/role
   --> Allows real-time plan upgrades without forcing a new login/JWT re-issue
   --> user.plan === 'unlimited' || user.role === 'admin' --> allow

3. If neither: return 403 { requiresApplication: true }
   --> Frontend redirects user to the Early Access application page
```

---

## 11. NGINX Ingress Routing Table

All external traffic enters through a single NGINX Ingress Controller. Routing is defined in `k8s/ingress.yml`.

| Match Type | Path / Host Pattern | Backend Service | Backend Port |
|---|---|---|---|
| Path prefix | `/api/sandbox` | `sandbox-service` | 80 |
| Path prefix | `/api/ai` | `ai-service` | 80 |
| Path prefix | `/api/auth` | `auth-service` | 80 |
| Wildcard host | `*.preview.localhost` | `router-service` | 80 |
| Wildcard host | `*.agent.localhost` | `router-service` | 80 |

### Key Annotations

```yaml
nginx.ingress.kubernetes.io/proxy-read-timeout:    "6000"
nginx.ingress.kubernetes.io/proxy-send-timeout:    "6000"
nginx.ingress.kubernetes.io/proxy-connect-timeout: "6000"
nginx.ingress.kubernetes.io/affinity:              "cookie"
nginx.ingress.kubernetes.io/session-cookie-name:   "route"
```

**6000-second timeouts:** AI agent responses can stream for minutes. Long-running terminal sessions must not be interrupted. Without these, NGINX would drop connections after its default 60-second timeout.

**Cookie-based sticky sessions:** WebSocket connections are stateful. If multiple sandbox service replicas exist, sticky sessions ensure all WebSocket frames from the same browser session hit the same backend pod. Without this, WebSocket connections would break when requests round-robin to a different replica.

---

## 12. RBAC: Kubernetes Permission Model

The `sandbox` service calls the Kubernetes API directly to create and delete pods and services. This requires a dedicated service account with scoped permissions — defined in `k8s/rbac.yml`.

```yaml
ServiceAccount: resource-manager  (namespace: default)

Role: resource-manager
  apiGroups: [""]
  resources: ["pods", "services"]
  verbs: ["create", "get", "list", "watch", "delete", "update"]

RoleBinding: resource-manager-binding
  subjects: ServiceAccount/resource-manager
  roleRef: Role/resource-manager
```

The sandbox deployment uses `serviceAccountName: resource-manager`. Kubernetes mounts the service account token inside the container at:
```
/var/run/secrets/kubernetes.io/serviceaccount/token
```

`@kubernetes/client-node` picks this up automatically via `kc.loadFromCluster()`.

**Why namespace-scoped (Role) instead of cluster-wide (ClusterRole)?**  
The sandbox service only needs to manage pods in the `default` namespace. Using a `Role` instead of `ClusterRole` ensures that even if the sandbox service is compromised, an attacker cannot affect pods in other namespaces.

---

## 13. Skaffold: Local vs AWS EKS Deployment

| Attribute | `skaffold.yml` (Local Dev) | `skaffold-eks.yml` (Production) |
|---|---|---|
| Image Registry | Local Docker daemon | AWS ECR: `980195619982.dkr.ecr.ap-south-1.amazonaws.com` |
| K8s Cluster | Docker Desktop / Minikube | AWS EKS (Mumbai region: `ap-south-1`) |
| Build Platform | Host native | `linux/amd64` (forced for EKS node arch compatibility) |
| File Sync | `infer: ["src/**"]` for hot reload | Not configured (full rebuild required) |
| K8s Manifests | `k8s/*.yml` | `k8s/*.yml` (same manifests, different image prefixes) |

### Services Built by Skaffold

Both `skaffold.yml` and `skaffold-eks.yml` build the same 8 images:
`auth`, `ai-orchestration`, `agent`, `sandbox`, `template`, `router`, `notification`, `sync-agent`

### Hot File Sync (Local Only)

For `auth`, `ai-orchestration`, `notification`, and `router`, Skaffold `sync.infer` is configured for `src/**`. Code changes inside `src/` are **synced directly into the running container filesystem** without rebuilding the Docker image — near-instant feedback for server-side changes.

---

## 14. Data Store Reference

| Store | Provider | Used By | Database / Collection / Key Pattern |
|---|---|---|---|
| `AUTH_MONGO_URI` | MongoDB Atlas | `auth` service | DB: `auth`, collections: `users`, `applications` |
| `SANDBOX_MONGO_URI` | MongoDB Atlas | `sandbox` service | DB: `sandbox`, collection: `projects` |
| `AI_MONGO_URI` | MongoDB Atlas | `ai-orchestration` | DB: `ai`, collection: `chats` |
| `REDIS_URL` | Redis Cloud | `sandbox`, `router` | Keys: `sandbox:<sid>`, `project:<pid>` |
| S3 Bucket `inkz-s3` | AWS S3 `ap-south-1` | `sync-agent`, `sandbox` | Key pattern: `<project-id>/<relative-file-path>` |
| `AMQP_URL` | CloudAMQP | `auth` (publish), `notification` (consume) | Queue: `auth_notification_queue` |

---

## 15. Security Model

| Layer | Mechanism | Threat Mitigated |
|---|---|---|
| Auth cookie | `httpOnly: true, sameSite: Lax` | XSS token theft; CSRF attacks |
| JWT expiry | 7 days | Long-lived credential exposure |
| Plan check (DB-backed) | Re-queries MongoDB per request | JWT claim spoofing / stale plan bypass |
| K8s RBAC | Namespace-scoped `Role` (not `ClusterRole`) | Sandbox service cannot affect other namespaces even if compromised |
| Pod resource limits | CPU: 500m limit, Memory: 512Mi limit per container | Resource exhaustion / noisy-neighbor abuse |
| Pod filesystem isolation | Each user gets a dedicated pod with its own `emptyDir` volume | Cross-user filesystem access is structurally impossible |
| S3 prefix isolation | `<project-id>/` prefix per project | One project cannot list or access another project's files |
| NGINX ingress path routing | Only explicitly defined paths and hosts are routed | Services are not directly accessible; only via the ingress |
| NGINX session timeouts | 6000s proxy timeouts | Long-running WS and AI streams complete without forced disconnection |

---

## 16. Self-Hosted / Local Mode (No AWS Required)

You don't need AWS to run INKz. Below is a complete guide to running everything on your **local machine or a bare-metal server** — replacing every managed cloud dependency with a local equivalent.

### 16.1 Overview: What to Replace / Skip

| Cloud Service | Local Replacement | Can Skip? |
|---|---|---|
| AWS S3 (`inkz-s3`) | Local disk volume (`hostPath` or PVC) | ❌ Must replace |
| Redis Cloud | `redis` Docker container / K8s pod | ❌ Must replace |
| MongoDB Atlas (×3) | `mongo` Docker container / K8s pod | ❌ Must replace |
| CloudAMQP (RabbitMQ) | `rabbitmq` Docker container / K8s pod | ✅ Skip if skipping notifications |
| Brevo Email API | — | ✅ Skip entirely |
| Auth Service (Google OAuth) | — | ✅ Skip for local-only dev |
| Notification Service | — | ✅ Skip entirely |

---

### 16.2 Replace AWS S3 with Local Disk

The `sync-agent` uses the AWS SDK (`@aws-sdk/client-s3`). To swap it for local disk, **no Kubernetes volume sharing magic is needed** — just replace the S3 calls with `fs` calls.

#### Option A: Direct `emptyDir` Persistence (Simplest)

If you only care about persistence *within a single run* (i.e., pod restarts don't matter), the existing `emptyDir` shared volume already works — no changes needed.

#### Option B: `hostPath` Volume (Persist Across Pod Restarts)

Replace the `emptyDir` volume in `pod.js` with a `hostPath` volume pointing to a directory on your local machine:

```js
// In sandbox/server/src/pod.js — volumes section
volumes: [
  {
    name: 'workspace-volume',
    // BEFORE (cloud):  emptyDir: {}
    // AFTER  (local):  hostPath pointing to a per-project directory
    hostPath: {
      path: `/data/inkz-workspaces/${projectid}`,  // host machine path
      type: 'DirectoryOrCreate'
    }
  }
]
```

> **Note:** `hostPath` only works with single-node clusters (Docker Desktop, Minikube, k3s). For multi-node clusters use a `PersistentVolumeClaim` with `local-path-provisioner`.

#### Option C: Disable `sync-agent` Entirely

If you use `hostPath`, the `sync-agent` container becomes redundant. Remove it from the pod spec in `pod.js`:

```js
// Remove this entry from the containers array:
{
  name: 'sync-agent',
  image: 'sync-agent',
  // ...
}
```

Also remove the `sync-agent` build artifact from `skaffold.yml`.

#### Option D: Keep `sync-agent` but Point to a Local MinIO Instance

MinIO is an S3-compatible object store you can run locally. Zero code changes needed — just swap env vars:

```yaml
# In your K8s secret / .env:
AWS_ACCESS_KEY_ID: minioadmin
AWS_SECRET_ACCESS_KEY: minioadmin
AWS_REGION: us-east-1          # MinIO ignores region but SDK requires it
S3_BUCKET_NAME: inkz-s3
# Add this to override the S3 endpoint:
S3_ENDPOINT: http://minio-service:9000   # internal cluster DNS
```

Then patch `sync.js` to pass `endpoint` to the S3 client:

```js
// sandbox/sync-agent/sync.js
const client = new S3Client({
  region: process.env.AWS_REGION,
  endpoint: process.env.S3_ENDPOINT,          // add this line
  forcePathStyle: true,                        // required for MinIO
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})
```

Deploy MinIO via Helm or a single manifest:
```bash
kubectl apply -f https://raw.githubusercontent.com/minio/minio/master/docs/orchestration/kubernetes/minio-standalone.yaml
```

---

### 16.3 Skip the Notification Service

The `notification` service only sends login-alert emails via Brevo. It is **safe to skip entirely** in local mode.

**Steps:**

1. **Remove from `skaffold.yml`** — delete the `notification` entry from both `build.artifacts` and `deploy.helm.releases` (or `manifests`).

2. **Remove its K8s manifest** — delete or don't apply `k8s/notification-deployment.yml` (if it exists as a separate file).

3. **Comment out the publish call in `auth`** — open `auth/src/` and find where the auth service publishes to `auth_notification_queue`. Comment it out:

```js
// auth/src/routes/auth.js (approximate location)
// -- SKIP IN LOCAL MODE: no RabbitMQ / email needed --
// await channel.sendToQueue(
//   'auth_notification_queue',
//   Buffer.from(JSON.stringify({ userId, email, timestamp: new Date() }))
// )
```

4. **Remove `AMQP_URL` from secrets** — since nothing publishes or consumes, RabbitMQ itself can also be removed from your local setup.

> **Result:** Login still works. Users just don't receive an email notification. Zero other side-effects.

---

### 16.4 Skip the Auth Service (Fully Local Dev)

For pure local development where you don't need Google OAuth or access control, you can **bypass the auth service entirely** and hardcode a user identity in the sandbox service.

> ⚠️ **Never do this in production or any internet-exposed deployment.**

**Steps:**

1. **Remove from `skaffold.yml`** — delete the `auth` build artifact and its K8s deployment.

2. **Remove the NGINX ingress rule** for `/api/auth` from `k8s/ingress.yml`.

3. **Replace auth middleware in `sandbox-service`** — the sandbox service validates JWTs on every request. Replace the real middleware with a fake one that returns a hardcoded local user:

```js
// sandbox/server/src/middleware/auth.js — LOCAL OVERRIDE
const localDevUser = {
  id: 'local-dev-user-001',
  email: 'dev@localhost',
  role: 'admin',
  plan: 'unlimited'
}

export function authenticateToken(req, res, next) {
  // Skip JWT verification entirely in local mode
  req.user = localDevUser
  next()
}
```

4. **Skip `AUTH_MONGO_URI`** — the `auth` MongoDB collection (`users`, `applications`) is no longer needed. Remove it from your secrets/env.

5. **Frontend: skip the login page** — in the React frontend, set a fake token cookie or comment out the redirect-to-login guard so the app boots straight to the dashboard.

#### Local Mode Environment Variables (Minimal Set)

With auth + notification + AWS S3 all skipped (using MinIO or hostPath), your `.env` / K8s secrets reduce to:

```env
# Required
SANDBOX_MONGO_URI=mongodb://localhost:27017/sandbox
AI_MONGO_URI=mongodb://localhost:27017/ai
REDIS_URL=redis://localhost:6379
MISTRAL_API_KEY=<your-mistral-key>

# Only if using MinIO (Option D above)
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_REGION=us-east-1
S3_BUCKET_NAME=inkz-s3
S3_ENDPOINT=http://minio-service:9000

# Removed / not needed in local mode
# AUTH_MONGO_URI      -- skipped (no auth service)
# AMQP_URL            -- skipped (no notification service)
# BREVO_API_KEY       -- skipped (no emails)
# AWS_ACCESS_KEY_ID   -- skipped (no real S3)
# AWS_SECRET_ACCESS_KEY
```

---

### 16.5 Recommended Local Stack

For a fully self-hosted local setup, run these alongside your K8s cluster:

```bash
# Start Redis
docker run -d -p 6379:6379 redis:alpine

# Start MongoDB (single instance, 3 logical DBs)
docker run -d -p 27017:27017 mongo:7

# Start MinIO (optional — only if using Option D)
docker run -d -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  quay.io/minio/minio server /data --console-address ':9001'
# Then create the bucket:
# Open http://localhost:9001 → login → create bucket 'inkz-s3'
```

Then run Skaffold as usual:
```bash
skaffold dev   # hot-reload local dev
```

---

## Author

Designed and engineered by **Harsh Patel**

- GitHub: [Notanormaldev/INKz](https://github.com/Notanormaldev/INKz)
- License: MIT
