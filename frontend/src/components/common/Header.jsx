import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import SignOutModal from "../landing/SignOutModal"
import "./Header.css"

export default function Header({ onOpenAuth, minimal = false }) {
  const navigate = useNavigate()
  const [isScrolled, setIsScrolled] = useState(false)
  const [user, setUser] = useState(null)
  const [showSignOutModal, setShowSignOutModal] = useState(false)

  useEffect(() => {
    // Verify session via HTTP-only cookie
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => {
        if (res.ok) return res.json()
        throw new Error('Not logged in')
      })
      .then(data => {
        setUser(data)
      })
      .catch(() => {
        setUser(null)
      })

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const confirmSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch (e) {
      console.error(e)
    }
    localStorage.removeItem("inkz_user")
    setUser(null)
    navigate('/')
  }

  const handleGetStarted = () => {
    if (user) {
      const isUnlimited = Boolean(
        user.role === 'admin' ||
        user.plan === 'unlimited' ||
        user.email?.toLowerCase().trim() === 'harshpatelpc20051@gmail.com'
      )
      if (isUnlimited) {
        navigate('/projects')
      } else {
        navigate('/apply')
      }
    } else {
      if (onOpenAuth) onOpenAuth()
      else navigate('/')
    }
  }

  const scrollToSection = (e, id) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/#' + id)
    }
  }

  const isAdmin = user && (user.role === 'admin' || user.email?.toLowerCase().trim() === 'harshpatelpc20051@gmail.com')

  return (
    <>
      <header className={`archive-header-fixed ${minimal ? 'minimal-header' : ''}`}>
        <div className={`archive-header-card ${isScrolled ? 'header-scrolled' : ''}`}>
          {/* FINAL INKz Logo */}
          <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <span className="logo-i">I</span>
            <span className="logo-n">N</span>
            <span className="logo-k">K</span>
            <span className="logo-z">z</span>
            <div className="ink-drop-mini" aria-hidden="true" />
          </div>

          {/* Center Nav Links — Hidden when minimal === true */}
          {!minimal && (
            <nav className="archive-nav-links">
              <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="archive-nav-link">Features</a>
              <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="archive-nav-link">About Us</a>
              <a href="#demo" onClick={(e) => scrollToSection(e, 'demo')} className="archive-nav-link">IDE Preview</a>
              <a href="/docs" onClick={(e) => { e.preventDefault(); navigate('/docs') }} className="archive-nav-link">Docs</a>
              <a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="archive-nav-link">Pricing</a>
              <a href="#faq" onClick={(e) => scrollToSection(e, 'faq')} className="archive-nav-link">FAQ</a>
            </nav>
          )}

          {/* Right Action Buttons */}
          <div className="archive-nav-actions">
            {minimal && (
              <button className="archive-back-home-link" onClick={() => navigate('/')}>
                ← Home
              </button>
            )}
            {user ? (
              <div className="user-badge-group">
                {isAdmin && (
                  <button className="archive-admin-btn" onClick={() => navigate('/admin')}>
                    Admin Panel
                  </button>
                )}
                <button className="archive-dash-btn" onClick={() => navigate('/projects')}>
                  My Projects →
                </button>
                <button
                  className="archive-signout-btn"
                  onClick={() => setShowSignOutModal(true)}
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            ) : (
              !minimal && (
                <>
                  <button className="archive-signin-btn" onClick={onOpenAuth}>
                    Sign In
                  </button>
                  <button className="archive-getstarted-btn" onClick={handleGetStarted}>
                    Get Started →
                  </button>
                </>
              )
            )}
          </div>
        </div>
      </header>

      {/* Sign Out Confirmation Modal */}
      <SignOutModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={confirmSignOut}
      />
    </>
  )
}
