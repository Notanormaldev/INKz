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

        <h3 className="access-modal-title">New Project Access Restricted</h3>

        <p className="access-modal-text">
          You cannot create a new project on the <strong>Free Plan</strong>. Creating new projects & launching Kubernetes sandboxes is reserved for <strong>approved Early Access users</strong>.
        </p>

        <div className="access-modal-box">
          <p>
            If you want access to create projects, you can apply for it! Get <strong>100% free access</strong> to managed Kubernetes pods, S3 file persistence & AI coding partner.
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
