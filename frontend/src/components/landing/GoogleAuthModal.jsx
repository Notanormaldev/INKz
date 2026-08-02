import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './GoogleAuthModal.css'

export default function GoogleAuthModal({ isOpen, onClose, onSuccess }) {
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleGoogleSignIn = () => {
    // TODO: hook up real Google OAuth
    window.location.href = '/api/auth/google'
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div
        className="auth-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button className="auth-modal-close" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        {/* Brand Logo Header */}
        <div className="auth-header">
          <div className="auth-logo-badge">
            <span className="logo-i">I</span>
            <span className="logo-n">N</span>
            <span className="logo-k">K</span>
            <span className="logo-z">z</span>
          </div>
          <h2 className="auth-title">Welcome to INKz Cloud IDE</h2>
          <p className="auth-subtitle">
            Sign in with Google to launch isolated Kubernetes pods, persistent S3 storage,
            and your AI pair programmer.
          </p>
        </div>

        {/* Auth Body — Google Only */}
        <div className="auth-body">
          <button
            className="google-signin-btn"
            onClick={handleGoogleSignIn}
          >
            <svg className="google-icon" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.37 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Auth Footer Note */}
        <div className="auth-footer-note">
          <span>By signing in you agree to our Terms & Privacy Policy.</span>
        </div>
      </div>
    </div>
  )
}
