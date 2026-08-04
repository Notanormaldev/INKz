import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ParticleTextEffect from './ParticleTextEffect'
import './HeroSection.css'

export default function HeroSection({ onOpenAuth }) {
  const navigate = useNavigate()
  const [showDemoModal, setShowDemoModal] = useState(false)

  const handleStartTrial = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (res.ok) {
        const user = await res.json()
        const isUnlimited = Boolean(
          user && (
            user.role === 'admin' ||
            user.plan === 'unlimited' ||
            user.email?.toLowerCase().trim() === 'harshpatelpc20051@gmail.com'
          )
        )
        if (isUnlimited) {
          navigate('/projects')
        } else {
          navigate('/apply')
        }
      } else {
        onOpenAuth()
      }
    } catch {
      onOpenAuth()
    }
  }

  return (
    <section className="archive-hero-exact">
      {/* Background Diamond Circuit Lines & Mesh Layer */}
      <svg className="hero-bg-circuit-svg" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <path d="M -80 450 L 320 50 L 720 450 L 320 850 Z" stroke="rgba(249, 115, 22, 0.14)" strokeWidth="1.2" />
        <path d="M -20 450 L 320 110 L 660 450 L 320 790 Z" stroke="rgba(249, 115, 22, 0.08)" strokeWidth="1" />
        <path d="M 720 450 L 1120 50 L 1520 450 L 1120 850 Z" stroke="rgba(249, 115, 22, 0.14)" strokeWidth="1.2" />
        <path d="M 780 450 L 1120 110 L 1460 450 L 1120 790 Z" stroke="rgba(249, 115, 22, 0.08)" strokeWidth="1" />
        <line x1="-100" y1="260" x2="400" y2="260" stroke="rgba(249, 115, 22, 0.09)" strokeWidth="1" />
        <line x1="1040" y1="260" x2="1540" y2="260" stroke="rgba(249, 115, 22, 0.09)" strokeWidth="1" />
        <line x1="-100" y1="640" x2="400" y2="640" stroke="rgba(249, 115, 22, 0.09)" strokeWidth="1" />
        <line x1="1040" y1="640" x2="1540" y2="640" stroke="rgba(249, 115, 22, 0.09)" strokeWidth="1" />
      </svg>

      {/* 1. Top Stage: Particle Text Effect */}
      <div className="particle-stage-exact">
        <ParticleTextEffect words={["INKz", "K8s PODS", "S3 SYNC", "INKz", "AGENTIC AI", "DEV WORKSPACE", "CLOUD IDE"]} />
      </div>

      {/* 2. Center Stage: Tagline, Title, Buttons & Logo Wall */}
      <div className="hero-center-exact">
        <h2 className="hero-exact-heading">
          The <span className="hero-boxed-word">
            Cloud IDE
            <span className="box-handle tl" />
            <span className="box-handle tr" />
            <span className="box-handle bl" />
            <span className="box-handle br" />
          </span> that <span className="text-gray-300">thinks while you ship.</span>
        </h2>

        <p className="hero-exact-sub">
          Instant, browser-based cloud workspaces running inside isolated Kubernetes pods with real-time S3 file mirroring and a built-in AI coding partner.
        </p>

        <div className="hero-exact-buttons">
          <button className="archive-cta-primary-btn group" onClick={handleStartTrial}>
            <span>Start Free Trial</span>
            <span className="arrow-icon">→</span>
          </button>
          <button className="archive-cta-outline-btn" onClick={() => setShowDemoModal(true)}>
            Watch Demo
          </button>
        </div>

        {/* 3. Logo Wall Infinite Slider (Archive Original) */}
        <div className="archive-logo-wall-box">
          <div className="logo-wall-layout">
            <div className="logo-wall-label-side">
              <p className="label-side-text">Powered by world-class cloud tech</p>
            </div>
            <div className="logo-wall-marquee">
              <div className="marquee-content-exact">
                <span className="marquee-logo-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9"/><polygon points="12 3 16.5 7.5 16.5 13.5 12 18 7.5 13.5 7.5 7.5 12 3"/><circle cx="12" cy="12" r="2"/></svg>
                  Kubernetes
                </span>
                <span className="marquee-logo-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
                  AWS S3 Sync
                </span>
                <span className="marquee-logo-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="11" width="4" height="4"/><rect x="7" y="11" width="4" height="4"/><rect x="12" y="11" width="4" height="4"/><rect x="7" y="6" width="4" height="4"/><path d="M2 16c2 4 8 5 12 4 3-1 6-4 7-8-2 0-4 1-5 2-2-1-5-1-7 0-3 1-5 2-7 2"/></svg>
                  Docker
                </span>
                <span className="marquee-logo-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  Vite
                </span>
                <span className="marquee-logo-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                  Monaco Editor
                </span>
                <span className="marquee-logo-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 14a4 4 0 1 1 4-4 4 4 0 0 1-4 4z"/><circle cx="12" cy="12" r="1.5"/></svg>
                  Mistral AI
                </span>
                <span className="marquee-logo-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  Socket.IO
                </span>
                <span className="marquee-logo-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 6l8-4 8 4v12l-8 4-8-4z"/><path d="M4 6l8 4 8-4"/><path d="M12 10v12"/></svg>
                  Redis
                </span>
                {/* Duplicate Loop */}
                <span className="marquee-logo-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9"/><polygon points="12 3 16.5 7.5 16.5 13.5 12 18 7.5 13.5 7.5 7.5 12 3"/><circle cx="12" cy="12" r="2"/></svg>
                  Kubernetes
                </span>
                <span className="marquee-logo-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
                  AWS S3 Sync
                </span>
                <span className="marquee-logo-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="11" width="4" height="4"/><rect x="7" y="11" width="4" height="4"/><rect x="12" y="11" width="4" height="4"/><rect x="7" y="6" width="4" height="4"/><path d="M2 16c2 4 8 5 12 4 3-1 6-4 7-8-2 0-4 1-5 2-2-1-5-1-7 0-3 1-5 2-7 2"/></svg>
                  Docker
                </span>
                <span className="marquee-logo-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  Vite
                </span>
                <span className="marquee-logo-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                  Monaco Editor
                </span>
                <span className="marquee-logo-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 14a4 4 0 1 1 4-4 4 4 0 0 1-4 4z"/><circle cx="12" cy="12" r="1.5"/></svg>
                  OpenAI
                </span>
                <span className="marquee-logo-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  Socket.IO
                </span>
                <span className="marquee-logo-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 6l8-4 8 4v12l-8 4-8-4z"/><path d="M4 6l8 4 8-4"/><path d="M12 10v12"/></svg>
                  Redis
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Demo Modal */}
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
