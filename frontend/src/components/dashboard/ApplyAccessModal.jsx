import { useNavigate } from 'react-router-dom'
import './ApplyAccessModal.css'

export default function ApplyAccessModal({ isOpen, onClose }) {
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleApplyClick = () => {
    onClose()
    navigate('/apply')
  }

  return (
    <div className="access-modal-overlay" onClick={onClose}>
      <div className="access-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="access-modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="access-modal-badge">
          EARLY ACCESS REQUIRED
        </div>

        <h3 className="access-modal-title">Cloud Access Restricted</h3>

        <p className="access-modal-text">
          Creating projects and running Kubernetes sandboxes is currently restricted to{' '}
          <strong>approved Early Access users</strong>.
        </p>

        <div className="access-modal-box">
          <p>
            Fill out a short application form to get <strong>100% free unlimited cloud access</strong> (managed Kubernetes pods, S3 storage, & AI coding partner).
          </p>
        </div>

        <div className="access-modal-actions">
          <button className="access-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="access-apply-btn" onClick={handleApplyClick}>
            Apply for Free Access →
          </button>
        </div>
      </div>
    </div>
  )
}
