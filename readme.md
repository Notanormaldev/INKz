# 🚀 INKz — Cloud IDE & Agentic AI Platform

> **Next-generation, browser-based cloud development platform powering isolated Kubernetes pod sandboxes, real-time file mirroring, and an autonomous Agentic AI pair programmer.**

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Kubernetes-blue.svg)](https://www.docker.com/)
[![RabbitMQ](https://img.shields.io/badge/Message_Queue-RabbitMQ-ff6600.svg)](https://www.rabbitmq.com/)
[![Redis](https://img.shields.io/badge/Caching-Redis_TTL-red.svg)](https://redis.io/)
[![GitHub Stars](https://img.shields.io/github/stars/Notanormaldev/INKz?style=social)](https://github.com/Notanormaldev/INKz)

---

## 🖼️ Application Showcase & Screenshots

### 1. Platform Overview & Hero Showcase
![INKz Platform Overview](frontend/public/hero.png)

---

### 2. VS Code-Grade Monaco Editor & Real-Time Workspace Explorer
![Monaco Code Editor & Real-Time Workspace File Explorer](frontend/public/ide1.png)

---

### 3. Integrated Dev Server Preview & Live Hot Module Reloading (HMR)
![Live Browser Preview with Hot Module Reloading](frontend/public/ide2.png)

---

### 4. Autonomous Agentic AI Coding Partner & Multi-File Refactoring
![Agentic AI Pair Programmer Chat & Multi-File Edits](frontend/public/ide3.png)

---

### 5. Mobile & Responsive Layout
![Mobile & Responsive UI View](frontend/public/mbview.png)

---

## ⚡ What is INKz?

**INKz** is a full-stack **Cloud IDE and Agentic AI Platform** designed to replace slow local development setups. It provisions isolated Kubernetes container pod sandboxes in seconds, streams Monaco editor code in real time over WebSockets, continuously mirrors workspace files to AWS S3 / Local storage, and pairs you with an **autonomous AI pair programmer**.

Whether you're running locally with **100% offline Ollama LLMs** or deploying to production on **AWS EKS**, INKz provides a zero-setup, lightning-fast development environment directly inside your browser.

---

## 🏗️ Deep-Dive Architecture Summary

INKz is built on a high-availability, microservice architecture powered by **Kubernetes, Redis, RabbitMQ, and LangChain**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            INKz ARCHITECTURE OVERVIEW                        │
├───────────────────┬───────────────────┬───────────────────┬─────────────────┤
│    auth-service   │  sandbox-service  │   ai-service      │ notification-svc│
│   (Auth & JWT)    │ (K8s & S3 Runner) │(LangChain Agent)  │(RabbitMQ Email) │
└─────────┬─────────┴─────────┬─────────┴─────────┬─────────┴─────────┬───────┘
          │                   │                   │                   │
          ▼                   ▼                   ▼                   ▼
    ┌───────────┐       ┌───────────┐       ┌───────────┐       ┌───────────┐
    │ Auth Mongo│       │Redis & K8s│       │Ollama/LLMs│       │Brevo Email│
    └───────────┘       └───────────┘       └───────────┘       └───────────┘
```

### 🧱 Microservices Breakdown
- 🔑 **Auth Service (`auth`)**: Handles Google OAuth 2.0 logins, issues secure HTTP-only JWT cookies, manages cloud early access applications (`/apply`), and publishes registration events.
- ☸️ **Sandbox Runner (`sandbox`)**: Interacts directly with the Kubernetes API (`@kubernetes/client-node`) to spawn isolated developer pods (`inkz-sandbox-<id>`). Controls container cgroups (`512Mi` - `2Gi` RAM), streams interactive `node-pty` terminal shells over WebSockets, proxies HMR ports, and mirrors workspace files to S3.
- 🤖 **AI Orchestration (`ai-orchestration`)**: Built on **LangChain**. Autonomous coding agent equipped with tools to read source code, write/edit files, list directory structures, and execute bash build commands inside the container sandbox. Supports **100% Offline Ollama** (`qwen2.5-coder:7b`) and Cloud AI (Mistral, Gemini 1.5 Pro, DeepSeek, OpenAI, Claude).
- ✉️ **Notification Service (`notification`)**: Listens to RabbitMQ event channels and dispatches transactional emails via **Brevo API (Sendinblue)** / SMTP.

---

## ⚡ Technical Highlights

### 1. 🔄 Redis TTL Sandbox Pod Lifecycle & Auto-Cleanup
- Every provisioned Kubernetes sandbox pod is assigned a Redis key `sandbox:ttl:<pod_id>` with a **15-minute inactivity TTL (900 seconds)**.
- Active developer browser tabs send background heartbeats (`POST /api/sandbox/heartbeat`) every 30 seconds to refresh the TTL.
- If a developer closes their tab or disconnects for 15 minutes, Redis evicts the key, triggering an automated Kubernetes pod deletion to reclaim cluster RAM.

### 2. 🐇 RabbitMQ AMQP Message Broker
- Asynchronous message passing decouples authentication and sandbox provisioning from transactional email dispatch.
- Event channels (`application.created`, `sandbox.provisioned`, `user.registered`) ensure zero-latency API responses.

### 3. 🪣 AWS S3 & Local Disk Workspace Mirroring
- File modifications in the Monaco editor stream to the Sandbox Service via Socket.IO.
- Updates are debounced and mirrored continuously to **AWS S3 persistent buckets** (or local disk directory `/data/workspaces` if AWS keys are omitted).
- Re-opening a workspace re-attaches persistent S3 files instantly, even if the container pod was deleted.

---

## 📖 Complete Documentation Links

- 📐 **System Architecture & Sequence Diagrams**: Read [ARCHITECTURE.md](./ARCHITECTURE.md) for complete Mermaid diagrams, RabbitMQ workflows, and security sandbox policies.
- 🛠️ **Local Setup & Self-Hosting Guide**: Read [SELF_HOST.md](./SELF_HOST.md) for hardware specs, Skaffold commands, 100% offline Ollama RAM model selectors, and Kubernetes secret configurations.
- 📚 **In-App Interactive Documentation**: [/docs](http://localhost:5173/docs)
- ⚡ **Free Plan & Quickstart**: [/free](http://localhost:5173/free)

---

## 🚀 Quickstart (4 Commands)

Run INKz locally on your machine in 4 simple commands:

```bash
# 1. Clone the repository
git clone https://github.com/Notanormaldev/INKz.git

# 2. Enter project directory
cd INKz

# 3. Launch Kubernetes pods & microservices
skaffold dev

# 4. Open a new terminal tab & start frontend server
cd frontend && npm run dev
```

Open `http://localhost:5173` in your browser!

---

## 💻 Tech Stack Overview

| Category | Technology |
|---|---|
| **Frontend** | React, Vite, Monaco Editor, Locomotive Scroll, Lenis, Vanilla CSS |
| **Backend Microservices** | Node.js, Express, Socket.IO, Passport.js, JWT |
| **Orchestration & Sandboxing** | Kubernetes, Skaffold, Docker Desktop, AWS EKS |
| **AI Agent & LLMs** | LangChain, Ollama (`qwen2.5-coder:7b`), Mistral AI, Gemini Pro, OpenAI |
| **Databases & Event Bus** | MongoDB, Redis (TTL Caching), RabbitMQ (AMQP) |
| **Storage & Email** | AWS S3 / Local Storage Fallback, Brevo API (Sendinblue) |

---

## ⭐ Author & Open Source Credits

Created with ❤️ by **Harsh Patel**

If you find INKz impressive, please consider starring the repository on GitHub!

- **GitHub Repository**: [Notanormaldev/INKz](https://github.com/Notanormaldev/INKz)
- **Star the Repo**: Click the Star button on GitHub to support the project!
