import { useState } from 'react'
import './Modal.css'

/**
 * Confirmation modal for deleting a project.
 * Props:
 *   project   — project object { _id, title }
 *   onClose   — () => void
 *   onConfirm — async () => void — should throw on error
 */
export default function DeleteModal({ project, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  async function handleDelete() {
    setLoading(true)
    setError(null)
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--danger" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Delete Project</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <p className="modal-danger-text">
          Are you sure you want to delete <strong>"{project.title}"</strong>?
          <br />All files will be permanently removed from S3. This cannot be undone.
        </p>

        {error && <p className="modal-error">⚠ {error}</p>}

        <div className="modal-actions">
          <button
            className="modal-cancel-btn"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            id="confirm-delete-btn"
            className="modal-delete-btn"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Deleting…' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
