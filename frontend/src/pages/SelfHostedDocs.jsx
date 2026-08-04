import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/archive/Header'
import Footer from '../components/archive/Footer'
import './SelfHostedDocs.css'

export default function SelfHostedDocs() {
  const [copiedCmd, setCopiedCmd] = useState(null)
  const [selectedRam, setSelectedRam] = useState('8GB')

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedCmd(id)
    setTimeout(() => setCopiedCmd(null), 2000)
  }

  const ramModels = {
    '4GB': [
      { name: 'qwen2.5-coder:1.5b', cmd: 'ollama run qwen2.5-coder:1.5b', desc: 'Ultra lightweight coder, fast response on low-RAM laptops.', recommended: true },
      { name: 'phi3:mini', cmd: 'ollama run phi3:mini', desc: '3.8B Microsoft model, great general reasoning & fast speed.', recommended: false },
      { name: 'tinyllama', cmd: 'ollama run tinyllama', desc: '1.1B parameter compact chat model.', recommended: false }
    ],
    '8GB': [
      { name: 'qwen2.5-coder:7b', cmd: 'ollama run qwen2.5-coder:7b', desc: 'BEST OVERALL for 8GB RAM. Top accuracy & multi-file coding.', recommended: true },
      { name: 'mistral:7b-instruct', cmd: 'ollama run mistral', desc: 'Default high-performance instruct & coding model.', recommended: false },
      { name: 'llama3:8b', cmd: 'ollama run llama3:8b', desc: 'Meta Llama 3 8B instruct model for general coding & chat.', recommended: false }
    ],
    '16GB+': [
      { name: 'qwen2.5-coder:14b', cmd: 'ollama run qwen2.5-coder:14b', desc: 'BEST PERFORMING local coding model for 16GB+ RAM.', recommended: true },
      { name: 'deepseek-coder-v2:16b', cmd: 'ollama run deepseek-coder-v2', desc: 'Advanced MoE coding model with 128k context.', recommended: false },
      { name: 'codellama:13b', cmd: 'ollama run codellama:13b', desc: 'Meta CodeLlama 13B specialized programming model.', recommended: false }
    ]
  }

  const langChainCode = `// Default: Mistral AI
import { ChatMistralAI } from "@langchain/mistralai"
const model = new ChatMistralAI({
  model: "mistral-medium-latest",
  apiKey: process.env.MISTRAL_API_KEY
})

// Alternative: Google Gemini (or OpenAI / DeepSeek)
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
const model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-pro",
  apiKey: process.env.GEMINI_API_KEY
})`

  const secretYmlCode = `apiVersion: v1
kind: Secret
metadata:
  name: ai-secret
type: Opaque
stringData:
  MISTRAL_API_KEY: "your_api_key_here"  # Or GEMINI_API_KEY / OPENAI_API_KEY

---

apiVersion: v1
kind: Secret
metadata:
  name: database
type: Opaque
stringData:
  SANDBOX_MONGO_URI: "mongodb://localhost:27017/sandbox"
  AI_MONGO_URI: "mongodb://localhost:27017/ai"
  REDIS_URL: "redis://localhost:6379"`

  const skaffoldYamlCode = `manifests:
  rawYaml:
    - k8s/rbac.yml
    - k8s/secret.yml
    - k8s/sandbox-deployment.yml
    - k8s/sandbox-service.yml
    - k8s/ai-deployment.yml
    - k8s/ai-service.yml
    # - k8s/auth-deployment.yml         # (Skip to save ~1GB RAM)
    # - k8s/notification-deployment.yml # (Skip to save ~1.5GB RAM)`

  return (
    <div className="docs-page-root">
      <Header minimal={true} />

      <div className="docs-container">
        {/* Top Header */}
        <div className="docs-hero-header">
          <div className="docs-badge-container">
            <span className="hero-boxed-word">
              <span className="box-handle tl" />
              <span className="box-handle tr" />
              <span className="box-handle bl" />
              <span className="box-handle br" />
              SELF-HOSTING & DETAILED SETUP GUIDE
            </span>
          </div>
          <h1 className="docs-title">
            Run INKz Locally with <span className="docs-highlight">Offline AI</span> & Local Container Sandboxes
          </h1>
          <p className="docs-subtitle">
            Complete technical guide to setup INKz microservices, Docker sandboxes, Kubernetes pods, and Ollama or LangChain AI models on your own machine.
          </p>

          {/* GitHub Star Callout Banner */}
          <div className="author-star-banner">
            <div className="author-info">
              <svg className="doc-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <div>
                <span className="author-name">Created by <strong>Harsh Patel</strong></span>
                <span className="author-sub">100% Free & Open Source Platform</span>
              </div>
            </div>
            <a 
              href="https://github.com/Notanormaldev/INKz" 
              target="_blank" 
              rel="noreferrer" 
              className="github-star-btn"
            >
              <svg className="star-svg-icon" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Star on GitHub
            </a>
          </div>
        </div>

        {/* 1. Hardware & Software Requirements */}
        <section className="docs-card-section">
          <div className="section-title-row">
            <svg className="section-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
              <line x1="6" y1="6" x2="6.01" y2="6"/>
              <line x1="6" y1="18" x2="6.01" y2="18"/>
            </svg>
            <h2 className="section-heading">Hardware & Software Requirements</h2>
          </div>

          <div className="requirements-grid">
            <div className="req-card">
              <h3>Required Packages & Apps</h3>
              <ul className="req-list">
                <li><strong>Docker Desktop</strong> (Container runtime & Kubernetes enabled)</li>
                <li><strong>Skaffold</strong> (Local Kubernetes orchestrator)</li>
                <li><strong>Minikube / Kubectl</strong> (Kubernetes CLI)</li>
                <li><strong>Node.js (v18+) & npm</strong></li>
                <li><strong>Git</strong></li>
              </ul>
            </div>

            <div className="req-card">
              <h3>Recommended Laptop Configuration</h3>
              <ul className="req-list">
                <li><strong>RAM:</strong> 8GB minimum (16GB+ recommended for local Ollama AI)</li>
                <li><strong>CPU:</strong> 4-Core or 8-Core Processor (M1/M2/M3 or i7/Ryzen 7)</li>
                <li><strong>Disk:</strong> 20GB+ Free SSD Storage</li>
                <li><strong>GPU:</strong> Optional (NVIDIA CUDA or Apple Silicon Metal acceleration)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 2. Setup & How to Run */}
        <section className="docs-card-section">
          <div className="section-title-row">
            <svg className="section-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
            <h2 className="section-heading">Setup & How to Run</h2>
          </div>
          <p className="section-desc">Clone the repo, launch Skaffold Kubernetes dev environment, and start the frontend web app:</p>

          <div className="cmd-block-list">
            <div className="cmd-block">
              <div className="cmd-block-header">
                <span>Clone Repository & Navigate</span>
                <button onClick={() => copyToClipboard('git clone https://github.com/Notanormaldev/INKz.git && cd INKz', 'cmd1')}>
                  {copiedCmd === 'cmd1' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="cmd-code">git clone https://github.com/Notanormaldev/INKz.git && cd INKz</pre>
            </div>

            <div className="cmd-block">
              <div className="cmd-block-header">
                <span>Launch Microservices & Kubernetes Sandboxes (Skaffold)</span>
                <button onClick={() => copyToClipboard('skaffold dev', 'cmd2')}>
                  {copiedCmd === 'cmd2' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="cmd-code">skaffold dev</pre>
            </div>

            <div className="cmd-block">
              <div className="cmd-block-header">
                <span>Start Frontend Server</span>
                <button onClick={() => copyToClipboard('cd frontend && npm run dev', 'cmd3')}>
                  {copiedCmd === 'cmd3' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="cmd-code">cd frontend && npm run dev</pre>
            </div>
          </div>
        </section>

        {/* 3. AI Partner Setup (Option A vs Option B) */}
        <section className="docs-card-section">
          <div className="section-title-row">
            <svg className="section-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4l3 3"/>
            </svg>
            <h2 className="section-heading">AI Partner Setup (Two Options)</h2>
          </div>

          {/* Option A: No API Key (Ollama) */}
          <div className="sub-section-box">
            <h3>Option A: No API Key (100% Offline Local AI via Ollama)</h3>
            <p className="section-desc">Run AI models locally on your laptop without API keys or third-party servers.</p>

            <div className="ram-selector-tabs">
              <span className="ram-label">Select Your Laptop RAM:</span>
              {['4GB', '8GB', '16GB+'].map((ram) => (
                <button
                  key={ram}
                  className={`ram-tab-btn ${selectedRam === ram ? 'active' : ''}`}
                  onClick={() => setSelectedRam(ram)}
                >
                  {ram} RAM
                </button>
              ))}
            </div>

            <div className="models-grid">
              {ramModels[selectedRam].map((model, idx) => (
                <div key={idx} className={`model-card ${model.recommended ? 'recommended-model' : ''}`}>
                  {model.recommended && <span className="model-badge">RECOMMENDED</span>}
                  <h3 className="model-title">{model.name}</h3>
                  <p className="model-desc">{model.desc}</p>
                  <div className="model-cmd-box">
                    <code>{model.cmd}</code>
                    <button onClick={() => copyToClipboard(model.cmd, `model-${idx}`)}>
                      {copiedCmd === `model-${idx}` ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Option B: Have API Key (LangChain) */}
          <div className="sub-section-box margin-top-box">
            <h3>Option B: Have API Key (Cloud AI via LangChain)</h3>
            <p className="section-desc">
              Default provider is <strong>Mistral AI</strong> (<code>MISTRAL_API_KEY</code>). If you don't have Mistral and have another API key (Gemini, OpenAI, DeepSeek, Claude, Grok), set your key in <code>k8s/secret.yml</code> and adjust the LangChain setup:
            </p>

            <div className="cmd-block">
              <div className="cmd-block-header">
                <span>File: ai-orchestration/src/agents/code.agent.js</span>
                <button onClick={() => copyToClipboard(langChainCode, 'multiAi')}>
                  {copiedCmd === 'multiAi' ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
              <pre className="cmd-code">{langChainCode}</pre>
            </div>
          </div>
        </section>

        {/* 4. Kubernetes Setup & Storage */}
        <section className="docs-card-section">
          <div className="section-title-row">
            <svg className="section-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <h2 className="section-heading">Kubernetes Setup & Storage (Local vs AWS)</h2>
          </div>
          <p className="section-desc">
            All secrets are configured in <code>k8s/secret.yml</code>. If you don't have AWS, use local disk storage for workspace file persistence.
          </p>

          <div className="cmd-block">
            <div className="cmd-block-header">
              <span>File: k8s/secret.yml (Minimal Core Config)</span>
              <button onClick={() => copyToClipboard(secretYmlCode, 'secretYml')}>
                {copiedCmd === 'secretYml' ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <pre className="cmd-code">{secretYmlCode}</pre>
          </div>

          <div className="skipped-secrets-card">
            <h4>Secrets You Can Safely Skip in <code>k8s/secret.yml</code> (If Auth & Notification are Disabled):</h4>
            <ul className="skipped-secrets-list">
              <li><strong>email secret</strong> (<code>BREVO_API_KEY</code>, <code>EMAIL_USER</code>) — Only for Notification service</li>
              <li><strong>google secret</strong> (<code>GOOGLE_CLIENT_ID</code>, <code>GOOGLE_CLIENT_SECRET</code>) — Only for Auth service</li>
              <li><strong>jwt secret</strong> (<code>JWT</code>) — Only for Auth service</li>
              <li><strong>AUTH_MONGO_URI</strong> — Only for Auth service</li>
            </ul>
          </div>
        </section>

        {/* 5. Low-RAM Laptop Optimization */}
        <section className="docs-card-section">
          <div className="section-title-row">
            <svg className="section-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <h2 className="section-heading">Low-RAM Laptop Optimization (Skip Auth & Notification Services & Secrets)</h2>
          </div>
          <p className="section-desc">
            Auth and Notification services are optional feature add-ons — they are <strong>NOT part of the core sandbox runner</strong>. If running on a low-RAM laptop (e.g. 8GB RAM), you can safely skip or comment them out in <code>skaffold.yml</code> to save ~2.5GB+ RAM!
          </p>

          <div className="cmd-block">
            <div className="cmd-block-header">
              <span>Edit skaffold.yml to skip unnecessary services:</span>
              <button onClick={() => copyToClipboard(skaffoldYamlCode, 'skaffoldYml')}>
                {copiedCmd === 'skaffoldYml' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="cmd-code">{skaffoldYamlCode}</pre>
          </div>
        </section>

        {/* Back Link & Star Callout */}
        <div className="docs-footer-callout">
          <h3>Enjoying INKz? Support the Project!</h3>
          <p>INKz is built by <strong>Harsh Patel</strong> and is 100% open source & free to use.</p>
          <div className="action-row">
            <Link to="/" className="back-home-btn">← Back to Home</Link>
            <a href="https://github.com/Notanormaldev/INKz" target="_blank" rel="noreferrer" className="github-star-btn">
              <svg className="star-svg-icon" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Star Repository on GitHub
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
