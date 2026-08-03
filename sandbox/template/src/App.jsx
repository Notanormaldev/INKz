import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="inkz-template-root">
      <section id="center" className="inkz-template-center">
        {/* INKz Brand Hero Logo & Motto */}
        <div className="inkz-hero-wrapper">
          <div className="inkz-template-logo">
            <span className="logo-i">I</span>
            <span className="logo-n">N</span>
            <span className="logo-k">K</span>
            <span className="logo-z">z</span>
          </div>
          <p className="inkz-template-motto">YOUR CODE. YOUR CANVAS.</p>
        </div>

        <div className="inkz-title-block">
          <h1 className="inkz-template-title">Welcome to your INKz Sandbox</h1>
          <p className="inkz-template-subtitle">
            Edit <code>src/App.jsx</code> and save to test <code>HMR</code> live preview inside your isolated Kubernetes container.
          </p>
        </div>

        {/* Custom INKz Counter Button (Clean, No Drop Emoji) */}
        <div className="inkz-counter-wrapper">
          <button
            type="button"
            className="inkz-counter-btn"
            onClick={() => setCount((c) => c + 1)}
          >
            <span className="counter-text">INKz Count is</span>
            <span className="counter-badge">{count}</span>
          </button>
        </div>
      </section>

      <div className="ticks"></div>

      {/* INKz Platform Feature Cards */}
      <section id="next-steps" className="inkz-template-features">
        <div id="docs" className="feature-box">
          <div className="feature-icon">⚡</div>
          <h2>Sandbox Features</h2>
          <p>Pre-configured environment for instant cloud development</p>
          <ul className="feature-list">
            <li>
              <span className="bullet">✓</span>
              <span>Isolated Kubernetes Pod Sandbox</span>
            </li>
            <li>
              <span className="bullet">✓</span>
              <span>Bi-Directional S3 File Persistence</span>
            </li>
            <li>
              <span className="bullet">✓</span>
              <span>Embedded AI Pair Programmer</span>
            </li>
          </ul>
        </div>

        <div id="social" className="feature-box">
          <div className="feature-icon">🌐</div>
          <h2>INKz Ecosystem</h2>
          <p>Connect with the INKz platform & community</p>
          <ul className="social-links">
            <li>
              <a href="https://github.com/Notanormaldev/INKz" target="_blank" rel="noreferrer">
                <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                </svg>
                GitHub Repository
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </div>
  )
}

export default App
