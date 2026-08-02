import { useState } from 'react'
import './SignOutModal.css'

export default function SignOutModal({ isOpen, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
    onClose()
  }

  return (
    <div className="signout-modal-overlay" onClick={onClose}>
      <div className="signout-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="signout-modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <h3 className="signout-modal-title">Confirm Sign Out</h3>
        <p className="signout-modal-text">
          Are you sure you want to sign out of INKz Cloud IDE?
        </p>

        <div className="signout-modal-actions">
          <button
            className="signout-cancel-btn"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="signout-confirm-btn"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Signing Out...' : 'Yes, Sign Out'}
          </button>
        </div>
      </div>
    </div>
  )
}
