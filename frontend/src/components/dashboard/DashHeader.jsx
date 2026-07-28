import './DashHeader.css'

/**
 * Top header bar — INKz logo + "New Project" button.
 */
export default function DashHeader({ onNewProject }) {
  return (
    <header className="dash-header">
      <div className="dash-logo" aria-label="INKz">
        <span>I</span>
        <span>N</span>
        <span>K</span>
        <span className="logo-z">z</span>
        <div className="logo-drop" aria-hidden="true" />
      </div>

      <button
        id="new-project-btn"
        className="dash-new-btn"
        onClick={onNewProject}
      >
        <span aria-hidden="true">+</span> New Project
      </button>
    </header>
  )
}
