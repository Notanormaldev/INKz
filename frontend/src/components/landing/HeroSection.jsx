import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './HeroSection.css'

export default function HeroSection({ onOpenAuth }) {
  const navigate = useNavigate()
  const [btnHover, setBtnHover] = useState(false)
  const [showDemoModal, setShowDemoModal] = useState(false)

  const handleStartCoding = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (res.ok) {
        navigate('/projects')
      } else {
        onOpenAuth()
      }
    } catch {
      onOpenAuth()
    }
  }

  return (
    <section className="hero-container">
      {/* Beta Release Pill */}
      <div className="hero-pill-wrapper">
        <div className="hero-pill">
          <span className="pill-dot" />
          <span className="pill-text">BETA RELEASE — KUBERNETES POWERED</span>
        </div>
      </div>

      {/* Main Headline */}
      <div className="hero-text-block">
        <h1 className="hero-main-heading">
          Unlock your <br />
          <span className="hero-serif-italic">next-gen</span> cloud IDE
        </h1>

        {/* Brand Tagline */}
        <div className="hero-brand-tagline">
          <span>YOUR CODE. YOUR CANVAS.</span>
        </div>

        <p className="hero-subdescription">
          INKz is an instant, browser-based cloud development platform. Every workspace runs inside an
          isolated <strong>Kubernetes pod</strong> with <strong>real-time S3 file sync</strong>, an integrated dev server, and a <strong>built-in AI coding partner</strong>.
        </p>
      </div>

      {/* Bracket Button [START CODING] + Secondary Watch Demo Button */}
      <div className="hero-cta-row">
        <button
          className={`skal-bracket-btn ${btnHover ? 'skal-bracket-btn--hover' : ''}`}
          onMouseEnter={() => setBtnHover(true)}
          onMouseLeave={() => setBtnHover(false)}
          onClick={handleStartCoding}
        >
          <span className="bracket-left">[</span>
          <span className="btn-inner-text">START CODING</span>
          <span className="bracket-right">]</span>
        </button>

        <button className="lelo-demo-btn" onClick={() => setShowDemoModal(true)}>
          <span>Watch Demo</span>
          <span className="demo-play-icon">▶</span>
        </button>
      </div>

      {/* Stats Row */}
      <div className="hero-stats-row">
        <div className="hero-stat-card">
          <span className="stat-num">~4s</span>
          <span className="stat-lbl">Sandbox Boot</span>
        </div>
        <div className="stat-divider" />
        <div className="hero-stat-card">
          <span className="stat-num">K8s</span>
          <span className="stat-lbl">Isolated Pods</span>
        </div>
        <div className="stat-divider" />
        <div className="hero-stat-card">
          <span className="stat-num">S3 Sync</span>
          <span className="stat-lbl">Persistent Storage</span>
        </div>
      </div>

      {/* Tech Wall Marquee Slider */}
      <div className="tech-slider-section">
        <p className="tech-slider-title">POWERING NEXT-GEN CLOUD DEVELOPMENT</p>
        <div className="tech-slider-track">
          <div className="tech-slider-content">
            <span className="tech-badge">☸ Kubernetes</span>
            <span className="tech-badge">🪣 AWS S3 Sync</span>
            <span className="tech-badge">🐳 Docker Sandboxes</span>
            <span className="tech-badge">⚡ Vite DevServer</span>
            <span className="tech-badge">📝 Monaco Editor</span>
            <span className="tech-badge">🤖 Mistral AI</span>
            <span className="tech-badge">⚡ Socket.IO HMR</span>
            <span className="tech-badge">🔴 Redis TTL Cache</span>
            {/* Duplicated for smooth loop */}
            <span className="tech-badge">☸ Kubernetes</span>
            <span className="tech-badge">🪣 AWS S3 Sync</span>
            <span className="tech-badge">🐳 Docker Sandboxes</span>
            <span className="tech-badge">⚡ Vite DevServer</span>
            <span className="tech-badge">📝 Monaco Editor</span>
            <span className="tech-badge">🤖 Mistral AI</span>
          </div>
        </div>
      </div>

      {/* Demo Video Modal */}
      {showDemoModal && (
        <div className="demo-modal-overlay" onClick={() => setShowDemoModal(false)}>
          <div className="demo-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="demo-modal-close" onClick={() => setShowDemoModal(false)}>✕</button>
            <div className="demo-video-wrapper">
              <iframe
                src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="INKz Cloud IDE Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
