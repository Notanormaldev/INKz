import './LoadingScreen.css'

export default function LoadingScreen({ message = 'Loading…' }) {
  return (
    <div className="loading-screen">
      <div className="loading-grid" aria-hidden="true" />

      <div className="loading-center">
        {/* Logo */}
        <div className="loading-logo" aria-label="INKz">
          <span>I</span><span>N</span><span>K</span>
          <span className="loading-z">z</span>
          <div className="loading-ink-drop" aria-hidden="true" />
        </div>

        {/* Ink line animation */}
        <div className="ink-loader" aria-hidden="true">
          <div className="ink-track">
            <div className="ink-fill" />
          </div>
          <div className="ink-dots">
            <span /><span /><span />
          </div>
        </div>

        {/* Status message */}
        <p className="loading-msg" aria-live="polite">{message}</p>
      </div>
    </div>
  )
}
