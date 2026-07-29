import { useNavigate } from 'react-router-dom'
import './Landing.css'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="landing">
      {/* Ambient background effects */}
      <div className="landing-grid" aria-hidden="true" />
      <div className="landing-glow" aria-hidden="true" />

      {/* Top Navbar */}
      <header className="landing-header">
        <div className="nav-logo">
          <span className="logo-i">I</span>
          <span className="logo-n">N</span>
          <span className="logo-k">K</span>
          <span className="logo-z">z</span>
          <div className="ink-drop-mini" aria-hidden="true" />
        </div>
        <button
          className="nav-projects-btn"
          onClick={() => navigate('/projects')}
        >
          View Projects →
        </button>
      </header>

      <main className="landing-content">
        {/* Brand Hero Badge */}
        <div className="brand-badge">
          <span className="badge-pulse" />
          <span>Next-Gen Cloud IDE</span>
        </div>

        {/* Hero Section */}
        <div className="hero-section">
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

          <h1 className="hero-heading">
            The Cloud IDE that<br />
            <span className="hero-accent">thinks while you ship.</span>
          </h1>

          <p className="hero-description">
            INKz is an instant, browser-based cloud development platform.
            Every workspace runs inside an isolated Kubernetes pod with real-time S3 file sync,
            an integrated dev server, and a built-in AI coding partner.
          </p>

          <div className="cta-group">
            <button
              id="start-projects-btn"
              className="cta-primary-btn"
              onClick={() => navigate('/projects')}
            >
              <span>Start Coding</span>
              <span className="btn-arrow">→</span>
              <span className="btn-shimmer" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-value">~4s</span>
            <span className="stat-label">Sandbox Boot</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-card">
            <span className="stat-value">K8s</span>
            <span className="stat-label">Isolated Pods</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-card">
            <span className="stat-value">S3 Sync</span>
            <span className="stat-label">Persistent Storage</span>
          </div>
        </div>

        {/* Feature Grid */}
        <section className="features-section">
          <h2 className="features-title">Why Developers Choose INKz</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Instant Isolated Sandboxes</h3>
              <p>Spin up fresh Docker/Kubernetes container environments in seconds. Zero local setup required.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">☁</div>
              <h3>Real-Time S3 Persistence</h3>
              <p>Your workspace files are continuously mirrored to AWS S3. Stop or resume anytime without losing progress.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI-Powered Pair Programming</h3>
              <p>Integrated intelligent assistant capable of understanding your codebase, fixing bugs, and writing components.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <span>INKz Platform</span>
        <span className="footer-sep">·</span>
        <span>Cloud-Native Development Reimagined</span>
      </footer>
    </div>
  )
}
