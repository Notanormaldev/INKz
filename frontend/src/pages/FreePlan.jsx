import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './FreePlan.css'

const REPO_URL = 'https://github.com/Notanormaldev/INKz'

const steps = [
  {
    step: '01',
    title: 'Clone the Repository',
    cmd: `git clone ${REPO_URL}`,
    note: 'Clones the full INKz source to your machine',
  },
  {
    step: '02',
    title: 'Enter the project',
    cmd: 'cd INKz',
    note: 'Navigate into the project root',
  },
  {
    step: '03',
    title: 'Install dependencies',
    cmd: 'npm install',
    note: 'Installs all required packages',
  },
  {
    step: '04',
    title: 'Start local dev server',
    cmd: 'npm run dev',
    note: 'Launches INKz locally at http://localhost:5173',
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
      {/* Background Grid */}
      <div className="free-bg-grid" />
      <div className="free-bg-glow" />

      {/* Back nav */}
      <button className="free-back-btn" onClick={() => navigate('/')}>
        <span>←</span> Back to Home
      </button>

      <div className="free-content">
        {/* Header */}
        <div className="free-header">
          <div className="free-badge">
            <span className="free-badge-dot" />
            100% FREE · SELF-HOST · UNLIMITED
          </div>
          <h1 className="free-title">
            Run INKz <span className="free-title-accent">locally</span> for free
          </h1>
          <p className="free-subtitle">
            INKz is fully open-source. Clone the repo, spin it up on your machine
            and get <strong>unlimited pods, unlimited storage</strong> — no account needed.
          </p>
        </div>

        {/* Repo Card */}
        <div className="free-repo-card">
          <div className="free-repo-left">
            <svg className="free-repo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
              <path d="M9 18c-4.51 2-5-2-7-2"/>
            </svg>
            <div>
              <p className="free-repo-label">GitHub Repository</p>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="free-repo-url"
              >
                {REPO_URL.replace('https://', '')}
              </a>
            </div>
          </div>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="free-repo-btn"
          >
            View on GitHub →
          </a>
        </div>

        {/* Steps */}
        <div className="free-steps-header">
          <h2>Get started in 4 commands</h2>
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
                    title="Copy command"
                  >
                    {copied === s.step ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <p className="free-step-note">{s.note}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Info Banner */}
        <div className="free-info-banner">
          <div className="free-info-icon">⚡</div>
          <div>
            <p className="free-info-title">What you get with self-hosting</p>
            <ul className="free-info-list">
              <li>Unlimited Kubernetes pods (on your own cluster)</li>
              <li>Unlimited S3/local file storage</li>
              <li>Full AI coding partner (bring your own Mistral API key)</li>
              <li>Monaco Editor + HMR dev server</li>
              <li>Zero cost, zero account required</li>
            </ul>
          </div>
        </div>

        {/* Footer note */}
        <p className="free-footer-note">
          Want the managed cloud version with zero setup?{' '}
          <button className="free-cloud-link" onClick={() => navigate('/')}>
            Join the waitlist →
          </button>
        </p>
      </div>
    </div>
  )
}
