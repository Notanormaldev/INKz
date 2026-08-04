import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import GoogleAuthModal from '../components/landing/GoogleAuthModal'
import './ApplyCloud.css'

const TOTAL_SPOTS = 5
const SPOTS_TAKEN = 2

export default function ApplyCloud() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [existingApp, setExistingApp] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    github: '',
    usecase: '',
    experience: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const spotsLeft = TOTAL_SPOTS - SPOTS_TAKEN

  useEffect(() => {
    window.scrollTo(0, 0)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
      setAuthChecked(true)
    }, 3500)

    // Check user authentication
    fetch('/api/auth/me', { credentials: 'include', signal: controller.signal })
      .then(res => {
        if (res.ok) return res.json()
        throw new Error('Not authenticated')
      })
      .then(data => {
        setUser(data)
        setForm(prev => ({
          ...prev,
          name: data.name || '',
          email: data.email || ''
        }))

        // Check if this user has already submitted an application
        return fetch('/api/auth/my-application', { credentials: 'include', signal: controller.signal })
      })
      .then(res => res ? res.json() : null)
      .then(appData => {
        if (appData?.hasApplied) {
          setHasApplied(true)
          setExistingApp(appData.application)
        }
        clearTimeout(timeoutId)
        setAuthChecked(true)
      })
      .catch(() => {
        clearTimeout(timeoutId)
        setUser(null)
        setAuthChecked(true)
      })
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Sign in mandatory check
    if (!user) {
      setShowAuthModal(true)
      return
    }

    if (!form.name || !form.email || !form.usecase) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      })
      const data = await res.json()

      if (data?.alreadyApplied || data?.hasApplied) {
        setHasApplied(true)
        setExistingApp(data.application)
        setLoading(false)
        return
      }

      if (!res.ok) {
        if (res.status === 400 && data.message?.includes('reviewing')) {
          setHasApplied(true)
          setExistingApp(data.application)
          setLoading(false)
          return
        }
        throw new Error(data.message || 'Failed to submit application')
      }

      setLoading(false)
      setHasApplied(true)
      setExistingApp(data.application)
    } catch (err) {
      setLoading(false)
      setError(err.message || 'Error submitting application')
    }
  }

  if (!authChecked) {
    return (
      <div className="apply-page-root flex-center-root">
        <div className="apply-bg-grid" />
        <div className="apply-bg-glow" />
        <div className="apply-logo-loader-card">
          {/* Animated INKz Brand Logo */}
          <div className="loader-logo-wrap">
            <div className="loader-logo-ring" />
            <div className="loader-brand-logo">
              <span className="logo-i">I</span>
              <span className="logo-n">N</span>
              <span className="logo-k">K</span>
              <span className="logo-z">z</span>
            </div>
          </div>

          {/* Sheryians-style 4-corner handles bounding box */}
          <div className="loader-badge-wrap">
            <span className="hero-boxed-word">
              <span className="box-handle tl" />
              <span className="box-handle tr" />
              <span className="box-handle bl" />
              <span className="box-handle br" />
              CLOUD IDE ACCESS
            </span>
          </div>

          <p className="loader-subtext">Verifying application session...</p>
          
          <div className="loader-progress-bar">
            <div className="loader-progress-fill" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="apply-page-root">
      <div className="apply-bg-grid" />
      <div className="apply-bg-glow" />

      {/* Back nav */}
      <button className="apply-back-btn" onClick={() => navigate('/')}>
        ← Back to Home
      </button>

      <div className="apply-content">
        {/* STATE 1: NOT LOGGED IN — Prompt Sign In */}
        {!user ? (
          <div className="apply-auth-required-box">
            <div className="apply-badge-container">
              <span className="hero-boxed-word">
                <span className="box-handle tl" />
                <span className="box-handle tr" />
                <span className="box-handle bl" />
                <span className="box-handle br" />
                SIGN IN REQUIRED
              </span>
            </div>

            <h1 className="apply-title">
              Sign In to Apply for <span className="apply-title-accent">Cloud IDE</span>
            </h1>

            <p className="apply-subtitle">
              You must be signed in with your Google account before submitting an application for INKz Cloud IDE Early Access.
            </p>

            <button
              className="apply-auth-btn"
              onClick={() => setShowAuthModal(true)}
            >
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.37 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"/>
              </svg>
              Sign In with Google to Apply →
            </button>
          </div>
        ) : hasApplied ? (
          /* STATE 2: ALREADY APPLIED — Application Under Review */
          <div className="apply-under-review-box">
            <div className="apply-badge-container">
              <span className="hero-boxed-word">
                <span className="box-handle tl" />
                <span className="box-handle tr" />
                <span className="box-handle bl" />
                <span className="box-handle br" />
                APPLICATION UNDER REVIEW
              </span>
            </div>

            <div className="review-clock-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>

            <h1 className="apply-title text-orange">
              Wait for some time, your application is on reviewing
            </h1>

            <p className="apply-subtitle">
              We have received your application for <strong>INKz Cloud IDE Early Access</strong> under <strong>{user.email}</strong>. Our team is manually reviewing all applications.
            </p>

            <div className="review-status-card">
              <div className="status-row">
                <span className="status-label">Applicant Name:</span>
                <span className="status-value">{existingApp?.name || user.name}</span>
              </div>
              <div className="status-row">
                <span className="status-label">Email:</span>
                <span className="status-value">{existingApp?.email || user.email}</span>
              </div>
              <div className="status-row">
                <span className="status-label">Status:</span>
                <span className="status-pill-pending">
                  <span className="pulse-dot" />
                  Under Review
                </span>
              </div>
            </div>

            <p className="review-subnote">
              Selected developers will be notified via email with early access cloud pod credentials.
            </p>

            <div className="review-actions">
              <button className="apply-back-home-btn" onClick={() => navigate('/')}>
                ← Back to Home
              </button>
              <a
                href="https://github.com/Notanormaldev/INKz"
                target="_blank"
                rel="noopener noreferrer"
                className="apply-github-btn"
              >
                Star on GitHub
              </a>
            </div>
          </div>
        ) : (
          /* STATE 3: LOGGED IN & NOT APPLIED — Show Form */
          <>
            {/* Header */}
            <div className="apply-header">
              <div className="apply-spots-pill">
                <span className="apply-spots-dot" />
                {spotsLeft} of {TOTAL_SPOTS} spots remaining
              </div>

              <h1 className="apply-title">
                Apply for <span className="apply-title-accent">Cloud IDE</span> Early Access
              </h1>

              <p className="apply-subtitle">
                INKz Cloud IDE is not open to the public yet. We're hand-picking{' '}
                <strong>top {TOTAL_SPOTS} developers</strong> who will get{' '}
                <strong>unlimited free cloud access</strong> — real Kubernetes pods,
                S3 storage, and AI partner, hosted and managed for you, zero cost.
              </p>

              {/* Perks row */}
              <div className="apply-perks-row">
                <div className="apply-perk">
                  <span className="perk-icon">☸</span>
                  <span>Unlimited K8s Pods</span>
                </div>
                <div className="apply-perk">
                  <span className="perk-icon">🪣</span>
                  <span>Unlimited S3 Storage</span>
                </div>
                <div className="apply-perk">
                  <span className="perk-icon">🤖</span>
                  <span>Mistral AI Partner</span>
                </div>
                <div className="apply-perk">
                  <span className="perk-icon">⚡</span>
                  <span>Priority Pod Boot</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form className="apply-form" onSubmit={handleSubmit} noValidate>
              <div className="apply-form-grid">
                <div className="apply-field">
                  <label htmlFor="apply-name">
                    Full Name <span className="required-star">*</span>
                  </label>
                  <input
                    id="apply-name"
                    name="name"
                    type="text"
                    placeholder="Harsh Patel"
                    value={form.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                  />
                </div>

                <div className="apply-field">
                  <label htmlFor="apply-email">
                    Email Address <span className="required-star">*</span>
                  </label>
                  <input
                    id="apply-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    readOnly={Boolean(user?.email)}
                  />
                </div>
              </div>

              <div className="apply-field">
                <label htmlFor="apply-github">
                  GitHub Profile URL{' '}
                  <span className="optional-label">(optional but recommended)</span>
                </label>
                <input
                  id="apply-github"
                  name="github"
                  type="url"
                  placeholder="https://github.com/yourusername"
                  value={form.github}
                  onChange={handleChange}
                />
              </div>

              <div className="apply-field">
                <label htmlFor="apply-experience">
                  Years of development experience
                </label>
                <select
                  id="apply-experience"
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                >
                  <option value="">Select...</option>
                  <option value="<1">Less than 1 year</option>
                  <option value="1-3">1–3 years</option>
                  <option value="3-5">3–5 years</option>
                  <option value="5+">5+ years</option>
                </select>
              </div>

              <div className="apply-field">
                <label htmlFor="apply-usecase">
                  Why do you want cloud access? What will you build?{' '}
                  <span className="required-star">*</span>
                </label>
                <textarea
                  id="apply-usecase"
                  name="usecase"
                  rows={5}
                  placeholder="Tell us about your project idea, stack, and why INKz Cloud would help you ship faster..."
                  value={form.usecase}
                  onChange={handleChange}
                  required
                />
                <span className="char-count">{form.usecase.length} / 500 chars</span>
              </div>

              {error && <p className="apply-error">{error}</p>}

              <button
                type="submit"
                className={`apply-submit-btn ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="apply-spinner" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    Submit Application →
                  </>
                )}
              </button>

              <p className="apply-disclaimer">
                Applications are reviewed manually. Selected developers will be
                notified via email within 48 hours.
              </p>
            </form>
          </>
        )}
      </div>

      <GoogleAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  )
}
