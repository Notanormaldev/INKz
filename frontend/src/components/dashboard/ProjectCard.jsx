import './ProjectCard.css'

/** Returns a human-readable "time ago" string for a given ISO date string. */
function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

/**
 * Single project card.
 * Props:
 *   project   — project object { _id, title, createdAt }
 *   onOpen    — called when user clicks "Open Workspace"
 *   onDelete  — called when user clicks the delete icon
 */
export default function ProjectCard({ project, onOpen, onDelete }) {
  const initial = project.title.charAt(0).toUpperCase()

  return (
    <article className="project-card">
      <div className="pc-top">
        <div className="pc-icon" aria-hidden="true">{initial}</div>
        <button
          className="pc-delete-btn"
          title="Delete project"
          aria-label={`Delete ${project.title}`}
          onClick={(e) => { e.stopPropagation(); onDelete(project) }}
        >
          🗑
        </button>
      </div>

      <div className="pc-body">
        <h2 className="pc-title">{project.title}</h2>
        <p className="pc-meta">Created {timeAgo(project.createdAt)}</p>
      </div>

      <button
        id={`open-project-${project._id}`}
        className="pc-open-btn"
        onClick={() => onOpen(project)}
      >
        Open Workspace →
      </button>
    </article>
  )
}
