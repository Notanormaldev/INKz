import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../components/archive/Header'
import Footer from '../components/archive/Footer'
import './FreePlan.css'

const REPO_URL = 'https://github.com/Notanormaldev/INKz'

const steps = [
  {
    step: '01',
    title: 'Clone the Repository',
    cmd: `git clone ${REPO_URL}`,
    note: 'Clones full INKz source code to your local machine',
  },
  {
    step: '02',
    title: 'Enter project directory',
    cmd: 'cd INKz',
    note: 'Navigate into root directory containing skaffold.yml',
  },
  {
    step: '03',
    title: 'Launch Kubernetes Pods & Microservices',
    cmd: 'skaffold dev',
    note: 'Skaffold builds local Docker sandboxes & orchestrates Kubernetes pods',
  },
  {
    step: '04',
    title: 'Start Frontend Dev Server',
    cmd: 'cd frontend && npm run dev',
    note: 'Launches web dashboard at http://localhost:5173',
  },
]

const ramModels = {
  '4GB': [
    { name: 'qwen2.5-coder:1.5b', cmd: 'ollama run qwen2.5-coder:1.5b', desc: 'Ultra lightweight coder model, super fast on low RAM.', recommended: true },
    { name: 'phi3:mini', cmd: 'ollama run phi3:mini', desc: 'Microsoft 3.8B chat model with fast response.', recommended: false },
    { name: 'tinyllama', cmd: 'ollama run tinyllama', desc: '1.1B compact chat model.', recommended: false }
  ],
  '8GB': [
    { name: 'qwen2.5-coder:7b', cmd: 'ollama run qwen2.5-coder:7b', desc: 'BEST OVERALL for 8GB RAM laptops. Top coding accuracy.', recommended: true },
    { name: 'mistral:7b-instruct', cmd: 'ollama run mistral', desc: 'Default high-performance instruct & reasoning model.', recommended: false },
    { name: 'llama3:8b', cmd: 'ollama run llama3:8b', desc: 'Meta Llama 3 8B instruct model.', recommended: false }
  ],
  '16GB+': [
    { name: 'qwen2.5-coder:14b', cmd: 'ollama run qwen2.5-coder:14b', desc: 'BEST PERFORMING local AI model for 16GB+ RAM.', recommended: true },
    { name: 'deepseek-coder-v2:16b', cmd: 'ollama run deepseek-coder-v2', desc: 'State-of-the-art MoE coding model with 128k context.', recommended: false },
    { name: 'codellama:13b', cmd: 'ollama run codellama:13b', desc: 'Meta CodeLlama 13B programming model.', recommended: false }
  ]
}

export default function FreePlan() {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(null)
  const [selectedRam, setSelectedRam] = useState('8GB')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="free-page-root">
      <Header />
      <div className="free-bg-grid" />
      <div className="free-bg-glow" />

      <div className="free-content">
        {/* Header */}
        <div className="free-header">
          <div className="free-badge-container">
            <span className="hero-boxed-word">
              <span className="box-handle tl" />
              <span className="box-handle tr" />
              <span className="box-handle bl" />
              <span className="box-handle br" />
              100% FREE · SELF-HOST · UNLIMITED PODS
            </span>
          </div>
          <h1 className="free-title">
            Run INKz <span className="free-title-accent">Locally</span> for Free
          </h1>
          <p className="free-subtitle">
            INKz is 100% open-source. Clone the repository, run <code>skaffold dev</code>, and get <strong>unlimited Kubernetes pods, S3 file sync, and offline AI partner</strong> on your own machine.
          </p>

          {/* Author Banner */}
          <div className="free-author-bar">
            <span>Created by <strong>Harsh Patel</strong></span>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="free-author-star">
              <svg className="star-svg-icon" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Follow & Star on GitHub
            </a>
          </div>
        </div>

        {/* GitHub Repo Card */}
        <div className="free-repo-card">
          <div className="free-repo-left">
            <svg className="free-repo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
              <path d="M9 18c-4.51 2-5-2-7-2"/>
            </svg>
            <div>
              <p className="free-repo-label">Official GitHub Repository</p>
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="free-repo-url">
                {REPO_URL.replace('https://', '')}
              </a>
            </div>
          </div>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="free-repo-btn">
            View Source Code →
          </a>
        </div>

        {/* 1. Requirements */}
        <div className="free-card-box">
          <div className="card-box-header">
            <svg className="box-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
            </svg>
            <h2 className="box-title">Package & Laptop Requirements</h2>
          </div>
          <div className="free-req-grid">
            <div className="req-col">
              <h4>Required Software Packages:</h4>
              <ul>
                <li>✓ <strong>Docker Desktop</strong> (Container runtime & Kubernetes)</li>
                <li>✓ <strong>Skaffold</strong> (Local Kubernetes orchestrator)</li>
                <li>✓ <strong>Minikube / Kubectl</strong></li>
                <li>✓ <strong>Node.js (v18+) & npm</strong></li>
                <li>✓ <strong>Git</strong></li>
              </ul>
            </div>
            <div className="req-col">
              <h4>Minimum Laptop Configuration:</h4>
              <ul>
                <li>✓ <strong>RAM:</strong> 8GB min (16GB+ recommended for Ollama)</li>
                <li>✓ <strong>CPU:</strong> Quad-Core / 8-Core (Apple Silicon or i7/Ryzen 7)</li>
                <li>✓ <strong>Storage:</strong> 20GB+ Free SSD</li>
                <li>✓ <strong>GPU:</strong> Optional (Apple Metal / NVIDIA CUDA acceleration)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 2. Quickstart Commands */}
        <div className="free-steps-header">
          <h2>Execution Commands & Quickstart</h2>
        </div>

        <div className="free-steps">
          {steps.map((s) => (
            <div key={s.step} className="free-step-card">
              <div className="free-step-num">{s.step}</div>
              <div className="free-step-body">
                <p className="free-step-title">{s.title}</p>
                <div className="free-step-cmd-row">
                  <code className="free-step-cmd">
                    <span className="cmd-prompt">$</span> {s.cmd}
                  </code>
                  <button
                    className={`free-copy-btn ${copied === s.step ? 'copied' : ''}`}
                    onClick={() => handleCopy(s.cmd, s.step)}
                  >
                    {copied === s.step ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <p className="free-step-note">{s.note}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 3. AI Partner Setup */}
        <div className="free-card-box">
          <div className="card-box-header">
            <svg className="box-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4l3 3"/>
            </svg>
            <h2 className="box-title">AI Partner Setup (Two Options)</h2>
          </div>
          <p className="box-desc">
            <strong>Option A (No API Key):</strong> Use local Ollama AI models.<br/>
            <strong>Option B (Have API Key):</strong> Default is Mistral AI (<code>MISTRAL_API_KEY</code>). If you don't have Mistral and have another API key (Gemini, OpenAI, DeepSeek, Claude, Grok), set your key in <code>k8s/secret.yml</code> and adjust your LangChain provider model in <code>ai-orchestration</code>.
          </p>

          <div className="free-ram-tabs">
            {['4GB', '8GB', '16GB+'].map((ram) => (
              <button
                key={ram}
                className={`free-ram-btn ${selectedRam === ram ? 'active' : ''}`}
                onClick={() => setSelectedRam(ram)}
              >
                {ram} RAM (Ollama)
              </button>
            ))}
          </div>

          <div className="free-models-list">
            {ramModels[selectedRam].map((m, idx) => (
              <div key={idx} className={`free-model-item ${m.recommended ? 'recommended' : ''}`}>
                <div className="model-header-row">
                  <span className="model-name">{m.name}</span>
                  {m.recommended && <span className="model-tag">RECOMMENDED</span>}
                </div>
                <p className="model-info">{m.desc}</p>
                <div className="model-cmd-row">
                  <code>{m.cmd}</code>
                  <button onClick={() => handleCopy(m.cmd, `m-${idx}`)}>
                    {copied === `m-${idx}` ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Kubernetes Secrets & Storage */}
        <div className="free-card-box">
          <div className="card-box-header">
            <svg className="box-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <h2 className="box-title">Kubernetes Secrets & Storage (Local vs AWS)</h2>
          </div>
          <p className="box-desc">
            All API keys and secrets are defined in <code>k8s/secret.yml</code>. If you don't have AWS, use local disk storage for workspace file persistence.
          </p>
          <div className="env-code-block">
            <code>k8s/secret.yml (MISTRAL_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY, SANDBOX_MONGO_URI, AI_MONGO_URI, REDIS_URL)</code>
          </div>
          <div className="env-code-block" style={{ marginTop: '0.75rem' }}>
            <code>Skipped Secrets (If Auth/Notification Disabled): email (BREVO_API_KEY), google (GOOGLE_CLIENT_ID), jwt (JWT), AUTH_MONGO_URI</code>
          </div>
        </div>

        {/* 5. Low-RAM Optimization */}
        <div className="free-card-box">
          <div className="card-box-header">
            <svg className="box-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <h2 className="box-title">Low-RAM Laptop Optimization (Skip Auth & Notification)</h2>
          </div>
          <p className="box-desc">
            Auth and Notification services are optional feature add-ons — they are <strong>NOT part of the main core sandbox runner</strong>. If running on a low-RAM laptop (e.g. 8GB RAM), you can safely skip or comment out <code>auth-deployment.yml</code> and <code>notification-deployment.yml</code> in <code>skaffold.yml</code> to save ~2.5GB+ RAM!
          </p>
        </div>

        {/* Detailed Docs Banner */}
        <div className="free-docs-banner">
          <div className="docs-banner-text">
            <h3>Need Complete API Specs & Deep Documentation?</h3>
            <p>Explore full Kubernetes secret examples, LangChain provider code snippets, and low-RAM optimization guides.</p>
          </div>
          <Link to="/docs" className="free-docs-link-btn">
            Refer to Full Docs →
          </Link>
        </div>

        {/* Footer note */}
        <p className="free-footer-note">
          Created by <strong>Harsh Patel</strong>. All rights reserved. 100% Free & Open Source.
        </p>
      </div>

      <Footer />
    </div>
  )
}
