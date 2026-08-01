import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Navbar.css'

export default function Navbar({ onOpenAuth }) {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('inkz_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        console.error(e)
      }
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLaunchClick = () => {
    if (user) {
      navigate('/projects')
    } else {
      onOpenAuth()
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem('inkz_user')
    setUser(null)
  }

  return (
    <header className={`floating-navbar-wrapper ${scrolled ? 'nav-scrolled' : ''}`}>
      <nav className="floating-navbar">
        {/* Brand Logo */}
        <div className="nav-brand" onClick={() => navigate('/')}>
          <div className="brand-logo-icon">
            <span className="logo-i">I</span>
            <span className="logo-n">N</span>
            <span className="logo-k">K</span>
            <span className="logo-z">z</span>
          </div>
        </div>

        {/* Center Links */}
        <div className="nav-center-links">
          <a href="#features" className="nav-link">Features</a>
          <a href="#architecture" className="nav-link">Architecture</a>
          <a href="#demo" className="nav-link">IDE Preview</a>
          <a href="#pricing" className="nav-link">Pricing</a>
        </div>

        {/* Right CTA Actions */}
        <div className="nav-right-actions">
          {user ? (
            <div className="user-profile-badge">
              <img src={user.avatar} alt={user.name} className="user-avatar" />
              <span className="user-name">{user.name}</span>
              <button className="nav-dashboard-btn" onClick={() => navigate('/projects')}>
                Dashboard →
              </button>
              <button className="signout-icon-btn" onClick={handleSignOut} title="Sign Out">
                ✕
              </button>
            </div>
          ) : (
            <>
              <button className="nav-signin-btn" onClick={onOpenAuth}>
                Sign In
              </button>
              <button className="nav-get-started-btn" onClick={handleLaunchClick}>
                <span>Get Started</span>
                <span className="btn-sparkle">✦</span>
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
