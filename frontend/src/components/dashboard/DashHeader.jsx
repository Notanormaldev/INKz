import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SignOutModal from '../landing/SignOutModal'
import './DashHeader.css'

/**
 * Top header bar — INKz logo + Admin panel + "New Project" button.
 */
export default function DashHeader({ onNewProject }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [showSignOutModal, setShowSignOutModal] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => {
        if (res.ok) return res.json()
        throw new Error('Not authenticated')
      })
      .then(data => setUser(data))
      .catch(() => setUser(null))
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

  const isAdmin = user && user.email?.toLowerCase().trim() === 'harshpatelpc20051@gmail.com'

  return (
    <>
      <header className="dash-header">
        <div
          className="dash-logo"
          aria-label="INKz"
          onClick={() => navigate('/')}
          title="Go to Home"
        >
          <span>I</span>
          <span>N</span>
          <span>K</span>
          <span className="logo-z">z</span>
          <div className="logo-drop" aria-hidden="true" />
        </div>

        <div className="dash-header-actions">
          {isAdmin && (
            <button
              className="dash-admin-btn"
              onClick={() => navigate('/admin')}
            >
              Admin Panel
            </button>
          )}

          <button
            id="new-project-btn"
            className="dash-new-btn"
            onClick={onNewProject}
          >
            <span aria-hidden="true">+</span> New Project
          </button>

          {user && (
            <button
              className="dash-signout-btn"
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
          )}
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
