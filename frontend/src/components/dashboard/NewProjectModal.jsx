import { useState } from 'react'
import './Modal.css'

/**
 * Modal for creating a new project.
 * Props:
 *   onClose    — () => void
 *   onCreate   — async (title: string) => void  — should throw on error
 */
export default function NewProjectModal({ onClose, onCreate }) {
  const [title,    setTitle]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError(null)
    try {
      await onCreate(title)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Project</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {error && <p className="modal-error">⚠ {error}</p>}

        <form onSubmit={handleSubmit} className="modal-form">
          <label className="modal-label" htmlFor="project-title">Project name</label>
          <input
            id="project-title"
            className="modal-input"
            type="text"
            placeholder="my-awesome-project"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
            disabled={loading}
          />
          <div className="modal-actions">
            <button
              type="button"
              className="modal-cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              id="create-project-submit"
              type="submit"
              className="modal-submit-btn"
              disabled={loading || !title.trim()}
            >
              {loading ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
