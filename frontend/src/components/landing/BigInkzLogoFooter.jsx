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
      {/* Left Side: Modern Branding with Accent Line & Elevated Position */}
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
