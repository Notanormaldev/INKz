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

export default function FreePlan() {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(null)

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
      <Header minimal={true} />
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
            INKz is 100% open-source. Clone the repository, run <code>skaffold dev</code>, and get <strong>unlimited Kubernetes pods, file storage, and offline AI partner</strong> on your own machine.
          </p>

          {/* Author Banner */}
          <div className="free-author-bar">
            <span>Created by <strong>Harsh Patel</strong></span>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="free-author-star">
              <svg className="star-svg-icon" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 8.91 8.26 12 2"/>
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

        {/* Quickstart Commands */}
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

        {/* Software & Laptop Requirements */}
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

        {/* What you get with self-hosting */}
        <div className="free-info-banner">
          <svg className="info-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          <div>
            <p className="free-info-title">What You Get With Self-Hosting</p>
            <ul className="free-info-list">
              <li><strong>Skaffold & K8s:</strong> Automatically compiles microservices and spawns Docker pod sandboxes in seconds.</li>
              <li><strong>S3 / Local File Sync:</strong> Mirrors workspace files continuously to local storage.</li>
              <li><strong>Monaco IDE & Socket.IO:</strong> Provides real-time browser code editing with instant HMR port forwarding.</li>
              <li><strong>AI Orchestration:</strong> Connects to Ollama offline or Cloud AI models for multi-file code generation.</li>
            </ul>
          </div>
        </div>

        {/* Detailed Docs Banner */}
        <div className="free-docs-banner">
          <div className="docs-banner-text">
            <h3>Need Complete API Specs & Deep Technical Documentation?</h3>
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
