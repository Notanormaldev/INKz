import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './ApplyCloud.css'

const TOTAL_SPOTS = 5
// In a real app this would come from a backend count
const SPOTS_TAKEN = 2

export default function ApplyCloud() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    github: '',
    usecase: '',
    experience: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const spotsLeft = TOTAL_SPOTS - SPOTS_TAKEN

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
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
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to submit application')
      setLoading(false)
      setSubmitted(true)
    } catch (err) {
      setLoading(false)
      setError(err.message || 'Error submitting application')
    }
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
        {!submitted ? (
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
        ) : (
          /* Success State */
          <div className="apply-success">
            <div className="apply-success-icon">🎉</div>
            <h2 className="apply-success-title">Application Received!</h2>
            <p className="apply-success-sub">
              Thanks <strong>{form.name}</strong>! Your application for INKz Cloud Early
              Access is in. We'll review it and reach out to{' '}
              <strong>{form.email}</strong> within 48 hours if you're selected.
            </p>
            <div className="apply-success-note">
              <span>🏆</span>
              <span>Only {TOTAL_SPOTS} developers will be chosen. We'll pick those
              with the most interesting projects and strongest need for cloud infra.</span>
            </div>
            <div className="apply-success-actions">
              <button className="apply-back-home-btn" onClick={() => navigate('/')}>
                ← Back to Home
              </button>
              <a
                href="https://github.com/Notanormaldev/INKz"
                target="_blank"
                rel="noopener noreferrer"
                className="apply-github-btn"
              >
                Star us on GitHub ⭐
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
