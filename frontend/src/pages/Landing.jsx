import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoadingScreen from '../components/LoadingScreen'
import './Landing.css'

const SANDBOX_API = '/api/sandbox/start'

export default function Landing() {
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const navigate = useNavigate()

  async function handleNewProject() {
    setLoading(true)
    setLoadingMsg('Initialising sandbox environment…')

    try {
      setTimeout(() => setLoadingMsg('Allocating Kubernetes pod…'), 800)
      setTimeout(() => setLoadingMsg('Mounting workspace volume…'), 2000)
      setTimeout(() => setLoadingMsg('Starting dev server…'), 3500)

      const res = await fetch(SANDBOX_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      // Guard against HTML error pages from proxy/nginx before calling .json()
      const contentType = res.headers.get('content-type') ?? ''
      if (!contentType.includes('application/json')) {
        const text = await res.text()
        throw new Error(
          `Server returned ${res.status} with non-JSON response.\n` +
          `Make sure the sandbox API is running and accessible.\n` +
          `Response preview: ${text.slice(0, 120)}`
        )
      }

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || `API error ${res.status}`)
      }

      setLoadingMsg('Sandbox ready. Launching IDE…')
      await new Promise(r => setTimeout(r, 600))
      navigate(`/workspace/${data.sandboxid}`, {
        state: { previewUrl: data.preview }
      })
    } catch (err) {
      console.error('[INKz] handleNewProject error:', err)
      setLoadingMsg(`⚠ ${err.message.split('\n')[0]}`)
      setTimeout(() => setLoading(false), 3000)
    }
  }

  if (loading) return <LoadingScreen message={loadingMsg} />

  return (
    <div className="landing">
      {/* Background grid */}
      <div className="landing-grid" aria-hidden="true" />

      {/* Ambient glow */}
      <div className="landing-glow" aria-hidden="true" />

      <main className="landing-content">
        {/* Logo */}
        <div className="logo-block">
          <div className="logo-mark" aria-hidden="true">
            <span className="logo-i">I</span>
            <span className="logo-n">N</span>
            <span className="logo-k">K</span>
            <span className="logo-z">z</span>
            <div className="ink-drop" aria-hidden="true" />
          </div>
          <p className="tagline">YOUR CODE. YOUR CANVAS.</p>
        </div>

        {/* Hero text */}
        <div className="hero-text">
          <h1>
            The cloud IDE that<br />
            <span className="hero-accent">thinks while you ship.</span>
          </h1>
          <p className="hero-sub">
            Every project runs in its own isolated sandbox.
            AI writes, you decide. Files change in real time.
          </p>
        </div>

        {/* CTA */}
        <button
          id="new-project-btn"
          className="new-project-btn"
          onClick={handleNewProject}
        >
          <span className="btn-icon">+</span>
          New Project
          <span className="btn-shimmer" aria-hidden="true" />
        </button>

        {/* Stats row */}
        <div className="stats-row">
          <div className="stat">
            <span className="stat-value">~4s</span>
            <span className="stat-label">sandbox boot</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-value">K8s</span>
            <span className="stat-label">isolated pods</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-value">AI</span>
            <span className="stat-label">powered edits</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <span>INKz</span>
        <span className="footer-sep">·</span>
        <span>Cloud-native coding, reimagined</span>
      </footer>
    </div>
  )
}
