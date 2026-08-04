# INKz — Self-Hosting & Local Development Guide

This guide walks you through running every part of INKz locally on your own machine — from Kubernetes microservices to the React frontend — with step-by-step instructions, every secret explained, AI provider configuration, storage options, and low-RAM optimization strategies.

---

## Table of Contents

1. [Prerequisites: Required Software](#1-prerequisites-required-software)
2. [Hardware Requirements](#2-hardware-requirements)
3. [Clone and Run](#3-clone-and-run)
4. [What Skaffold Does When You Run It](#4-what-skaffold-does-when-you-run-it)
5. [Understanding `k8s/secret.yml`](#5-understanding-k8ssecretyml)
6. [MongoDB: Atlas Cloud vs Local](#6-mongodb-atlas-cloud-vs-local)
7. [Redis: Cloud vs Local](#7-redis-cloud-vs-local)
8. [RabbitMQ: CloudAMQP vs Local](#8-rabbitmq-cloudamqp-vs-local)
9. [AI Provider: Offline Ollama vs Cloud API](#9-ai-provider-offline-ollama-vs-cloud-api)
10. [File Storage: AWS S3 vs Local Disk](#10-file-storage-aws-s3-vs-local-disk)
11. [Google OAuth Setup](#11-google-oauth-setup)
12. [Minimal Secrets Configuration](#12-minimal-secrets-configuration)
13. [Low-RAM Laptop Optimization](#13-low-ram-laptop-optimization)
14. [Frontend Setup](#14-frontend-setup)
15. [Verifying Everything Works](#15-verifying-everything-works)
16. [Deploying to AWS EKS (Production)](#16-deploying-to-aws-eks-production)

---

## 1. Prerequisites: Required Software

Install all of the following before proceeding:

| Software | Purpose | Install Link |
|---|---|---|
| **Docker Desktop** | Container runtime; must have Kubernetes enabled in settings | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) |
| **Skaffold** | Builds Docker images, applies K8s manifests, hot-syncs source files | [skaffold.dev](https://skaffold.dev/docs/install/) |
| **kubectl** | Kubernetes CLI — used to inspect pods, check logs, debug | Included with Docker Desktop or [kubectl install](https://kubernetes.io/docs/tasks/tools/) |
| **Node.js v18+** | Required to run the React frontend locally | [nodejs.org](https://nodejs.org/) |
| **Git** | Clone the repository | [git-scm.com](https://git-scm.com/) |

### Enable Kubernetes in Docker Desktop

Open Docker Desktop → Settings → Kubernetes → check **Enable Kubernetes** → Apply & Restart.

Wait until the Kubernetes status indicator in the bottom-left shows green.

### Install NGINX Ingress Controller

INKz uses NGINX Ingress to route requests to the correct microservice. Run this once:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.0/deploy/static/provider/cloud/deploy.yaml
```

Verify it is running:
```bash
kubectl get pods -n ingress-nginx
```
Wait until the `ingress-nginx-controller-*` pod shows `Running`.

---

## 2. Hardware Requirements

| Configuration | Minimum | Recommended |
|---|---|---|
| RAM | 8 GB | 16 GB+ |
| CPU | 4-core | 8-core (Apple M1/M2 or Intel/AMD i7+) |
| Storage | 20 GB free | 40 GB+ free (local AI models need space) |
| GPU | Not required | Optional — NVIDIA CUDA or Apple Metal for faster Ollama inference |

**RAM breakdown when all 8 services run:**

| Service | Approximate RAM Usage |
|---|---|
| auth | ~128 MB |
| sandbox | ~200 MB |
| ai-orchestration | ~256 MB |
| notification | ~64 MB |
| router | ~64 MB |
| template (per pod) | ~128 MB |
| agent (per pod) | ~128 MB |
| sync-agent (per pod) | ~128 MB |
| Kubernetes system overhead | ~512 MB |
| **Total (1 active sandbox)** | **~1.6 GB** |

With 8 GB RAM, you have enough headroom. With 16 GB+, you can run multiple sandboxes and a local Ollama model simultaneously.

---

## 3. Clone and Run

```bash
# 1. Clone the repository
git clone https://github.com/Notanormaldev/INKz.git
cd INKz

# 2. Edit secrets BEFORE running (see Section 5)
# nano k8s/secret.yml

# 3. Start all Kubernetes microservices
skaffold dev

# 4. In a new terminal: start the frontend
cd frontend
npm install
npm run dev
```

Frontend will be available at: `http://localhost:5173`

> **Important:** Do NOT run `skaffold dev` without first configuring `k8s/secret.yml`. Pods will crash-loop on startup if required secrets are missing.

---

## 4. What Skaffold Does When You Run It

When you run `skaffold dev`, this is the exact sequence of events:

```
1. Reads skaffold.yml
2. Finds all 8 Dockerfiles (auth, sandbox, ai-orchestration, etc.)
3. Builds Docker images for each service using the local Docker daemon
4. Tags each image with its sha256 content hash
5. Applies all manifests in k8s/*.yml to the local Kubernetes cluster:
   - k8s/rbac.yml       (ServiceAccount, Role, RoleBinding)
   - k8s/secret.yml     (all secrets mounted as env vars)
   - k8s/ingress.yml    (NGINX routing rules)
   - auth-deployment.yml + auth-service.yml
   - sandbox-deployment.yml + sandbox-service.yml
   - ai-deployment.yml + ai-service.yml
   - router-deployment.yml + router-service.yml
   - notification-deployment.yml + notification-service.yml
6. Watches source files for changes
7. For services with sync.infer configured (auth, ai-orchestration,
   notification, router): copies changed src/ files directly into the
   running container WITHOUT rebuilding the Docker image
8. Streams all pod logs to your terminal in real time
9. On Ctrl+C: deletes all deployments cleanly
```

---

## 5. Understanding `k8s/secret.yml`

All secrets are stored in `k8s/secret.yml` as Kubernetes `Secret` objects. Skaffold applies this file to Kubernetes, which mounts the values as environment variables inside the containers. **Never commit real secrets to a public repository.**

The file currently contains 6 separate `Secret` objects:

### Secret 1: `database`
```yaml
name: database
stringData:
  AUTH_MONGO_URI:     # MongoDB connection string for auth database
  SANDBOX_MONGO_URI:  # MongoDB connection string for sandbox database
  AI_MONGO_URI:       # MongoDB connection string for AI chat history database
  REDIS_URL:          # Redis connection string (redis:// or rediss://)
  AMQP_URL:           # RabbitMQ connection string (amqp:// or amqps://)
```
**Used by:** `auth` (AUTH_MONGO_URI, AMQP_URL), `sandbox` (SANDBOX_MONGO_URI, REDIS_URL), `ai-orchestration` (AI_MONGO_URI), `notification` (AMQP_URL), `router` (REDIS_URL)

### Secret 2: `jwt`
```yaml
name: jwt
stringData:
  JWT:  # Secret key used to sign and verify JWT tokens
        # Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
**Used by:** `auth` (to sign tokens), `sandbox` (to verify tokens from requests), `ai-orchestration` (to verify tokens)

### Secret 3: `google`
```yaml
name: google
stringData:
  GOOGLE_CLIENT_ID:     # From Google Cloud Console OAuth app
  GOOGLE_CLIENT_SECRET: # From Google Cloud Console OAuth app
```
**Used by:** `auth` service only. See Section 11 for how to create these.

### Secret 4: `ai-secret`
```yaml
name: ai-secret
stringData:
  MISTRAL_API_KEY:  # API key from console.mistral.ai
```
**Used by:** `ai-orchestration` service only.

### Secret 5: `email`
```yaml
name: email
stringData:
  BREVO_API_KEY:  # From app.brevo.com → API & Integrations → API Keys
  EMAIL_USER:     # The sender email address registered in Brevo
```
**Used by:** `notification` service only.

### Secret 6: `aws`
```yaml
name: aws
stringData:
  AWS_REGION:            # e.g. ap-south-1
  AWS_ACCESS_KEY_ID:     # From AWS IAM → Create Access Key
  AWS_SECRET_ACCESS_KEY: # From AWS IAM → Create Access Key
```
**Used by:** `sandbox` service (for S3 cleanup on project delete), `sync-agent` sidecar (for ongoing S3 file sync)

---

## 6. MongoDB: Atlas Cloud vs Local

### Option A: MongoDB Atlas (Recommended)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → Create free cluster
2. Create a database user with read/write access
3. Whitelist your IP (or set 0.0.0.0/0 for development)
4. Copy the connection string — it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net
   ```
5. Set three separate URIs in `secret.yml` with different database names:
   ```
   AUTH_MONGO_URI:    mongodb+srv://user:pass@cluster.mongodb.net/auth
   SANDBOX_MONGO_URI: mongodb+srv://user:pass@cluster.mongodb.net/sandbox
   AI_MONGO_URI:      mongodb+srv://user:pass@cluster.mongodb.net/ai
   ```

### Option B: Local MongoDB

```bash
# Run MongoDB locally with Docker
docker run -d --name mongo -p 27017:27017 mongo:7
```

Then use:
```yaml
AUTH_MONGO_URI:    "mongodb://localhost:27017/auth"
SANDBOX_MONGO_URI: "mongodb://localhost:27017/sandbox"
AI_MONGO_URI:      "mongodb://localhost:27017/ai"
```

> **Note:** When Kubernetes pods try to connect to `localhost:27017`, they cannot reach your host machine's MongoDB. Use `host.docker.internal:27017` instead on Mac/Windows, or use the host machine's local network IP on Linux.

---

## 7. Redis: Cloud vs Local

### Option A: Redis Cloud (Recommended for ease)

1. Go to [redis.io/try-free](https://redis.io/try-free) → Create free database
2. Copy the connection string: `redis://default:<password>@<host>:<port>`
3. Set in `secret.yml`:
   ```yaml
   REDIS_URL: "redis://default:yourpassword@your-host.redis.io:12345"
   ```

### Option B: Local Redis

```bash
docker run -d --name redis -p 6379:6379 redis:7
```

Use connection string:
```yaml
REDIS_URL: "redis://host.docker.internal:6379"
```

> **Critical:** Redis must have **keyspace notifications enabled** for the TTL pod auto-deletion to work. The sandbox service does this automatically:
> ```js
> subscriber.config('SET', 'notify-keyspace-events', 'Ex')
> ```
> This works on Redis 7.x by default. Ensure your Redis instance allows `CONFIG SET` commands (some managed Redis providers restrict this).

---

## 8. RabbitMQ: CloudAMQP vs Local

### Option A: CloudAMQP (Free hosted RabbitMQ)

1. Go to [cloudamqp.com](https://www.cloudamqp.com) → Create free "Little Lemur" instance
2. Copy the AMQP URL: `amqps://user:pass@warthog.lmq.cloudamqp.com/vhost`
3. Set in `secret.yml`:
   ```yaml
   AMQP_URL: "amqps://user:pass@host.cloudamqp.com/vhost"
   ```

### Option B: Local RabbitMQ

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

Management UI available at `http://localhost:15672` (user: guest, pass: guest)

Use connection string:
```yaml
AMQP_URL: "amqp://guest:guest@host.docker.internal:5672"
```

---

## 9. AI Provider: Offline Ollama vs Cloud API

### Option A: 100% Offline — Ollama (No API Key Needed)

Ollama runs open-source LLMs locally on your machine. Completely private, no costs, no internet required after model download.

**Install Ollama:**  
Download from [ollama.com](https://ollama.com/) and install for your OS.

**Start a model:**
```bash
ollama run qwen2.5-coder:7b
```

Ollama serves on `http://localhost:11434` by default.

**Choose model based on your RAM:**

| RAM Available | Recommended Model | Command | Notes |
|---|---|---|---|
| 4 GB | `qwen2.5-coder:1.5b` | `ollama run qwen2.5-coder:1.5b` | Fast, lightweight, good for simple edits |
| 4 GB | `phi3:mini` | `ollama run phi3:mini` | Microsoft Phi-3, good reasoning |
| 8 GB | `qwen2.5-coder:7b` | `ollama run qwen2.5-coder:7b` | Best overall for coding tasks at 8 GB |
| 8 GB | `mistral:7b-instruct` | `ollama run mistral` | Strong reasoning and chat quality |
| 16 GB+ | `qwen2.5-coder:14b` | `ollama run qwen2.5-coder:14b` | Top-tier multi-file coding accuracy |
| 16 GB+ | `deepseek-coder:6.7b` | `ollama run deepseek-coder:6.7b` | Excellent for code generation |

> Only use `chat` / `instruct` / `coder` variants. Plain text-completion models are not compatible with the LangChain chat interface.

**Update `ai-orchestration/src/agents/code.agent.js`:**

```js
import { ChatOllama } from "@langchain/ollama"

const model = new ChatOllama({
    model: "qwen2.5-coder:7b",
    baseUrl: "http://host.docker.internal:11434"  // inside K8s, use host machine IP
})
```

> Inside Kubernetes on Mac/Windows, use `host.docker.internal` to reach your machine's Ollama server. On Linux, use your machine's LAN IP.

### Option B: Cloud AI API Key

INKz is pre-configured for **Mistral AI**. You can switch to any LangChain-supported provider.

**Mistral AI (default):**
```yaml
# k8s/secret.yml → ai-secret
MISTRAL_API_KEY: "your_key_from_console.mistral.ai"
```

**Switch to Google Gemini:**
```js
// ai-orchestration/src/agents/code.agent.js
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"

const model = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-pro",
    apiKey: process.env.GEMINI_API_KEY
})
```
Add `GEMINI_API_KEY` to the `ai-secret` in `secret.yml`.

**Switch to OpenAI:**
```js
import { ChatOpenAI } from "@langchain/openai"

const model = new ChatOpenAI({
    model: "gpt-4o",
    apiKey: process.env.OPENAI_API_KEY
})
```
Add `OPENAI_API_KEY` to the `ai-secret` in `secret.yml`.

---

## 10. File Storage: AWS S3 vs Local Storage (MinIO / hostPath)

### Option A: AWS S3 (Cloud)

1. Go to AWS Console → S3 → Create bucket named `inkz-s3` in `ap-south-1`
2. Go to IAM → Create user → Attach policy `AmazonS3FullAccess`
3. Create access key for that user
4. Fill in `secret.yml`:
   ```yaml
   AWS_REGION:            ap-south-1
   AWS_ACCESS_KEY_ID:     your_access_key_id
   AWS_SECRET_ACCESS_KEY: your_secret_access_key
   ```

### Option B: MinIO (Free & Self-Hosted S3 Replacement - Recommended)

[MinIO](https://min.io/) is a 100% free, open-source, S3-compatible local object store. It allows running `sync-agent` without an AWS account or S3 bucket.

1. **Run MinIO container locally:**
   ```bash
   docker run -d -p 9000:9000 -p 9001:9001 \
     -e MINIO_ROOT_USER=minioadmin \
     -e MINIO_ROOT_PASSWORD=minioadmin \
     quay.io/minio/minio server /data --console-address ':9001'
   ```
2. **Access Web Console:** Open `http://localhost:9001` (user: `minioadmin`, pass: `minioadmin`) and create a bucket named `inkz-s3`.
3. **Set Secrets in `k8s/secret.yml`:**
   ```yaml
   AWS_REGION:            "us-east-1"
   AWS_ACCESS_KEY_ID:     "minioadmin"
   AWS_SECRET_ACCESS_KEY: "minioadmin"
   S3_ENDPOINT:           "http://host.docker.internal:9000"
   ```
4. **Update `sandbox/sync-agent/sync.js`:** Pass `endpoint` to `S3Client`:
   ```js
   const client = new S3Client({
     region: process.env.AWS_REGION,
     endpoint: process.env.S3_ENDPOINT,
     forcePathStyle: true,
     credentials: {
       accessKeyId: process.env.AWS_ACCESS_KEY_ID,
       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
     }
   })
   ```

### Option C: `hostPath` Volume (No S3 / No MinIO)

If you don't want any object store at all, mount a local host directory into the sandbox pod spec in `sandbox/server/src/pod.js`:

```js
volumes: [
  {
    name: 'workspace-volume',
    hostPath: {
      path: `/data/inkz-workspaces/${projectid}`,
      type: 'DirectoryOrCreate'
    }
  }
]
```
Then remove the `sync-agent` container from `pod.js` and `skaffold.yml`.

---

## 11. Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project or select existing
3. Go to **APIs & Services** → **OAuth consent screen** → External → Fill in app name
4. Go to **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs: add `http://localhost:3000/api/auth/google/callback`
7. Copy `Client ID` and `Client Secret`
8. Put them in `k8s/secret.yml`:
   ```yaml
   GOOGLE_CLIENT_ID:     "27345846xxxx.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET: "GOCSPX-xxxxxxxx"
   ```

---

## 12. Minimal Secrets Configuration

If you want to run only the core sandbox + AI functionality (no auth, no notifications, no email), this is the absolute minimum `secret.yml` you need:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: database
type: Opaque
stringData:
  AUTH_MONGO_URI:    "mongodb://host.docker.internal:27017/auth"
  SANDBOX_MONGO_URI: "mongodb://host.docker.internal:27017/sandbox"
  AI_MONGO_URI:      "mongodb://host.docker.internal:27017/ai"
  REDIS_URL:         "redis://host.docker.internal:6379"
  AMQP_URL:          "amqp://guest:guest@host.docker.internal:5672"

---

apiVersion: v1
kind: Secret
metadata:
  name: jwt
type: Opaque
stringData:
  JWT: "any-random-hex-string-at-least-32-chars"

---

apiVersion: v1
kind: Secret
metadata:
  name: google
type: Opaque
stringData:
  GOOGLE_CLIENT_ID:     "your-google-client-id"
  GOOGLE_CLIENT_SECRET: "your-google-client-secret"

---

apiVersion: v1
kind: Secret
metadata:
  name: ai-secret
type: Opaque
stringData:
  MISTRAL_API_KEY: "your-mistral-api-key"

---

apiVersion: v1
kind: Secret
metadata:
  name: email
type: Opaque
stringData:
  BREVO_API_KEY: "optional-leave-empty-if-skipping-notification-service"
  EMAIL_USER:    "optional@example.com"

---

apiVersion: v1
kind: Secret
metadata:
  name: aws
type: Opaque
stringData:
  AWS_REGION:            "ap-south-1"
  AWS_ACCESS_KEY_ID:     "your-aws-key-id"
  AWS_SECRET_ACCESS_KEY: "your-aws-secret"
```

---

## 13. Low-RAM Laptop Optimization

If you're on an 8 GB RAM machine and running low on memory, you can disable non-essential services:

### Disable Auth and Notification Services

Edit `skaffold.yml` — change the manifests section from `k8s/*.yml` to explicit files:

```yaml
manifests:
  rawYaml:
    - k8s/rbac.yml
    - k8s/secret.yml
    - k8s/ingress.yml
    - k8s/sandbox-deployment.yml
    - k8s/sandbox-service.yml
    - k8s/ai-deployment.yml
    - k8s/ai-service.yml
    - k8s/router-deployment.yml
    - k8s/router-service.yml
    # k8s/auth-deployment.yml          <-- comment out: saves ~128 MB
    # k8s/auth-service.yml
    # k8s/notification-deployment.yml  <-- comment out: saves ~64 MB
    # k8s/notification-service.yml
```

Also remove `auth`, `notification` from the `build.artifacts` list in `skaffold.yml` to avoid building their Docker images.

**What you lose:**
- Google OAuth login (all users would need to bypass auth, or you hardcode a user)
- Email notifications on login

**What still works:**
- Sandbox pod creation and management
- File editing, S3 sync
- AI agent coding
- Router and preview URLs

### Reduce Docker Desktop Resource Allocation

Docker Desktop → Settings → Resources:
- CPUs: set to half your physical cores (e.g., 4 on an 8-core machine)
- Memory: set to 4–5 GB (leaves headroom for OS + Ollama)
- Swap: 1 GB

---

## 14. Frontend Setup

The React frontend runs outside Kubernetes — directly on your machine with Node.js.

```bash
cd frontend
npm install
npm run dev
```

Default URL: `http://localhost:5173`

The frontend connects to the Kubernetes services via the NGINX Ingress at `http://localhost` (port 80). Ensure the ingress controller is running and the services are healthy before opening the dashboard.

**Vite proxy config** in `frontend/vite.config.js` forwards `/api/*` requests to `http://localhost` (the NGINX ingress), so the frontend and backend can run on different ports without CORS issues.

---

## 15. Verifying Everything Works

After `skaffold dev` is running, check that all pods are healthy:

```bash
kubectl get pods

# Expected output (all should show Running or Completed):
NAME                            READY   STATUS    
auth-xxxx                       1/1     Running
sandbox-xxxx                    1/1     Running
ai-orchestration-xxxx           1/1     Running
notification-xxxx               1/1     Running
router-xxxx                     1/1     Running
ingress-nginx-controller-xxxx   1/1     Running
```

Check service health endpoints:

```bash
curl http://localhost/api/sandbox/health
# {"message":"ok"} or similar

curl http://localhost/api/auth/status/healthz
# {"message":"auth is ready"}
```

Check logs for a specific service:

```bash
kubectl logs -l app=sandbox-server --tail=50
kubectl logs -l app=auth --tail=50
```

---

## 16. Deploying to AWS EKS (Production)

### Prerequisites

- AWS CLI installed and configured (`aws configure`)
- `eksctl` installed
- ECR repository created for each image

### Steps

```bash
# 1. Create EKS cluster (takes ~15 minutes)
eksctl create cluster --name inkz --region ap-south-1 --nodes 2 --node-type t3.medium

# 2. Update kubeconfig
aws eks update-kubeconfig --name inkz --region ap-south-1

# 3. Authenticate Docker with ECR
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin \
  980195619982.dkr.ecr.ap-south-1.amazonaws.com

# 4. Install NGINX Ingress on EKS
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.0/deploy/static/provider/cloud/deploy.yaml

# 5. Update k8s/secret.yml with production values

# 6. Deploy with Skaffold EKS config
skaffold run -f skaffold-eks.yml
```

The `skaffold-eks.yml` uses `platforms: linux/amd64` to ensure images are built for the correct architecture of EKS nodes (which run on `x86_64` by default).

---

## Author

Created by **Harsh Patel**

- GitHub: [Notanormaldev/INKz](https://github.com/Notanormaldev/INKz)
- License: MIT
