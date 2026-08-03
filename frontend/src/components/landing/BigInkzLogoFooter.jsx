import { useState } from 'react'
import './BigInkzLogoFooter.css'

export default function BigInkzLogoFooter() {
  const [activeLetterIdx, setActiveLetterIdx] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const letters = [
    { char: 'I', key: 'i', isZ: false },
    { char: 'N', key: 'n', isZ: false },
    { char: 'K', key: 'k', isZ: false },
    { char: 'z', key: 'z', isZ: true },
  ]

  const handleLetterMouseMove = (idx, e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setMousePos({ x, y })
  }

  const handleLetterMouseEnter = (idx, e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setMousePos({ x, y })
    setActiveLetterIdx(idx)
  }

  const handleLetterMouseLeave = () => {
    setActiveLetterIdx(null)
  }

  return (
    <div className="big-inkz-footer-wrapper">
      {/* Left Side: Modern Branding with Creator Proof of Work */}
      <div className="footer-left-brand-block">
        <div className="motto-row">
          <span className="left-accent-line" />
          <h3 className="left-brand-motto">
            BUILD AT THE <span className="motto-accent">SPEED OF THOUGHT</span>
          </h3>
        </div>
        <p className="left-brand-sub">
          Instant isolated Kubernetes containers, bi-directional S3 persistence & AI pair programmer.
        </p>

        {/* Creator Proof of Work Badge */}
        <div className="creator-pow-box">
          <span className="pow-label">Crafted & Engineered By</span>
          <div className="pow-user-row">
            <span className="pow-name">Harsh Patel</span>
            <div className="pow-social-links">
              <a 
                href="https://github.com/Notanormaldev" 
                target="_blank" 
                rel="noreferrer" 
                className="pow-link" 
                title="GitHub Profile"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                </svg>
              </a>
              <a 
                href="https://www.linkedin.com/in/harsh-patel-a77148314/" 
                target="_blank" 
                rel="noreferrer" 
                className="pow-link" 
                title="LinkedIn Profile"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect x="2" y="9" width="4" height="12"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
              <a 
                href="https://x.com/Coder_Hp" 
                target="_blank" 
                rel="noreferrer" 
                className="pow-link" 
                title="X (Twitter) Profile"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                  <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: INKz Logo & Tagline */}
      <div className="big-inkz-logo-container">
        <div className="big-logo-text-wrapper">
          {letters.map((item, idx) => {
            const isThisLetterHovered = activeLetterIdx === idx

            return (
              <div
                key={item.key}
                className={`big-logo-letter-box ${item.isZ ? 'is-italic-z' : ''} ${isThisLetterHovered ? 'letter-active' : ''}`}
                onMouseEnter={(e) => handleLetterMouseEnter(idx, e)}
                onMouseLeave={handleLetterMouseLeave}
                onMouseMove={(e) => handleLetterMouseMove(idx, e)}
                style={{
                  '--letter-mouse-x': `${mousePos.x}px`,
                  '--letter-mouse-y': `${mousePos.y}px`,
                }}
              >
                {/* Dark Stroke Layer */}
                <span className="letter-stroke">{item.char}</span>
                
                {/* Dull Burnt Copper Fill */}
                <span className="letter-fill">
                  {item.char}
                </span>
              </div>
            )
          })}
        </div>

        <div className="big-logo-sub-tagline">
          YOUR CODE. YOUR CANVAS.
        </div>
      </div>
    </div>
  )
}
