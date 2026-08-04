# INKz — Self-Hosted Cloud IDE & Agentic AI Platform

> **Instant, browser-based cloud development platform running isolated Kubernetes pods with real-time file mirroring and a built-in AI coding partner.**

---

## Hardware & Software Requirements

Before running INKz locally or self-hosting, ensure your machine meets the following requirements:

### Required Software Packages & Apps:
- **Docker Desktop** (Container runtime with Kubernetes enabled)
- **Skaffold** (Automated local Kubernetes development & container orchestrator)
- **Minikube** or **Kubernetes CLI** (`kubectl`)
- **Node.js** (v18.x or higher) & **npm**
- **Git**

### Laptop Hardware Configuration:
| Spec | Minimum Config (Cloud API) | Recommended Config (Offline AI with Ollama) |
|---|---|---|
| **RAM** | 8 GB RAM | 16 GB+ RAM |
| **CPU** | Dual-Core / Quad-Core | 8-Core CPU (Apple Silicon M1/M2/M3 or Intel/AMD i7/Ryzen 7) |
| **Storage** | 15 GB Free SSD | 30 GB+ Free SSD (for storing local AI models) |
| **GPU** | Integrated | Optional (NVIDIA CUDA or Apple Silicon Metal acceleration) |

---

## Setup & How to Run

Execute the following commands in your terminal to clone and launch INKz:

```bash
# Clone the repository
git clone https://github.com/Notanormaldev/INKz.git

# Navigate into project root
cd INKz

# Launch Kubernetes microservices & container sandboxes
skaffold dev

# Open a new terminal tab to start the frontend web app
cd frontend
npm run dev
```

The web dashboard will be running locally at `http://localhost:5173`!

---

## AI Partner Setup (Two Options)

Choose how you want to power your AI coding partner:

### Option A: No API Key (100% Offline Local AI via Ollama)

If you do NOT have an API key or want 100% private offline development, run Ollama locally on your machine.

#### Install & Start Ollama
Download Ollama from [ollama.com](https://ollama.com/) and run your model:

```bash
ollama run <model_name>
```

#### Choose Model Based on Laptop RAM
> **NOTE**: Use Chat, Instruct, or Coder models only. Plain text completion models are not recommended.

| Laptop RAM | Recommended Model | Command | Performance |
|---|---|---|---|
| **4 GB RAM** | `qwen2.5-coder:1.5b` or `phi3:mini` | `ollama run qwen2.5-coder:1.5b` | Lightweight & fast |
| **8 GB RAM** | `qwen2.5-coder:7b` *(Best Overall)* | `ollama run qwen2.5-coder:7b` | High coding accuracy |
| **8 GB RAM** | `mistral:7b-instruct` | `ollama run mistral` | Great reasoning & chat |
| **16 GB+ RAM** | `qwen2.5-coder:14b` *(Best Performing)* | `ollama run qwen2.5-coder:14b` | Top-tier multi-file coding |

---

### Option B: Have API Key (Cloud AI via LangChain)

By default, INKz is configured to use **Mistral AI** (`MISTRAL_API_KEY`).

If you don't have Mistral and have another API key (Google Gemini, OpenAI, DeepSeek, Claude, Grok, etc.), simply put your API key in `k8s/secret.yml` and adjust the LangChain setup in `ai-orchestration/src/agents/code.agent.js`:

#### Set API Key in `k8s/secret.yml`
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: ai-secret
type: Opaque
stringData:
  MISTRAL_API_KEY: "your_api_key_here"  # Or GEMINI_API_KEY / OPENAI_API_KEY
```

#### Update LangChain Setup in `ai-orchestration/src/agents/code.agent.js`
```javascript
// Example: Switching provider to Google Gemini (or OpenAI / DeepSeek)
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"

const model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-pro",
  apiKey: process.env.GEMINI_API_KEY
})
```

---

## Kubernetes Setup & Storage (Local vs AWS)

All secrets are managed in `k8s/secret.yml` and automatically mounted by Skaffold.

### Secrets You Can Safely Skip (If Auth & Notification Services are Disabled):
- **email secret** (`BREVO_API_KEY`, `EMAIL_USER`) — *Only for Notification service*
- **google secret** (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) — *Only for Auth service*
- **jwt secret** (`JWT`) — *Only for Auth service*
- **AUTH_MONGO_URI** — *Only for Auth service*

#### Minimal `k8s/secret.yml` Required for Core Sandbox & AI:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: ai-secret
type: Opaque
stringData:
  MISTRAL_API_KEY: "your_api_key_here"

---

apiVersion: v1
kind: Secret
metadata:
  name: database
type: Opaque
stringData:
  SANDBOX_MONGO_URI: "mongodb://localhost:27017/sandbox"
  AI_MONGO_URI: "mongodb://localhost:27017/ai"
  REDIS_URL: "redis://localhost:6379"
```

### Storage Configuration:
If you don't have AWS, use local disk storage for workspace file persistence.

---

## Low-RAM Laptop Optimization (Skip Auth & Notification Services & Secrets)

Auth and Notification are optional features — they are **NOT part of the main core sandbox runner**.

If you are running on a low-spec laptop (e.g. 8GB RAM), you can safely **ignore or disable `auth` and `notification` services** to free up ~2.5GB+ RAM!

### How to Skip Auth & Notification in `skaffold.yml`:

Edit `skaffold.yml` and comment out or remove `auth-deployment.yml` and `notification-deployment.yml`:

```yaml
manifests:
  rawYaml:
    - k8s/rbac.yml
    - k8s/secret.yml
    - k8s/sandbox-deployment.yml
    - k8s/sandbox-service.yml
    - k8s/ai-deployment.yml
    - k8s/ai-service.yml
    # - k8s/auth-deployment.yml        # (Optional: skip to save ~1GB RAM)
    # - k8s/notification-deployment.yml# (Optional: skip to save ~1.5GB RAM)
```

---

## Author & Credits

Created by **Harsh Patel**

If you find INKz useful, please consider starring the repository and following on GitHub!

- **GitHub Repository**: [Notanormaldev/INKz](https://github.com/Notanormaldev/INKz)
- **Star the Repo**: Click the Star button on GitHub to support the project!
