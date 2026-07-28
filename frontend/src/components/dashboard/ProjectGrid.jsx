import ProjectCard from './ProjectCard'
import './ProjectGrid.css'

/** Three pulsing skeleton cards shown while projects are loading. */
function SkeletonCards() {
  return (
    <>
      {[1, 2, 3].map(i => (
        <div key={i} className="project-card project-card--skeleton">
          <div className="sk sk-icon" />
          <div className="sk sk-title" />
          <div className="sk sk-meta" />
          <div className="sk sk-btn" />
        </div>
      ))}
    </>
  )
}

/** Empty state shown when the user has no projects yet. */
function EmptyState({ onNewProject }) {
  return (
    <div className="pg-empty">
      <div className="pg-empty-icon" aria-hidden="true">⬡</div>
      <p className="pg-empty-title">No projects yet</p>
      <p className="pg-empty-sub">Create your first project to get started.</p>
      <button className="pg-empty-btn" onClick={onNewProject}>
        <span aria-hidden="true">+</span> New Project
      </button>
    </div>
  )
}

/**
 * Renders the project grid with:
 *  - loading skeletons while fetching
 *  - empty state when no projects
 *  - a responsive card grid otherwise
 *
 * Props:
 *   projects      — array of project objects
 *   fetching      — boolean
 *   onOpen        — (project) => void
 *   onDelete      — (project) => void
 *   onNewProject  — () => void  (used by empty-state CTA)
 */
export default function ProjectGrid({ projects, fetching, onOpen, onDelete, onNewProject }) {
  if (fetching) {
    return (
      <div className="project-grid">
        <SkeletonCards />
      </div>
    )
  }

  if (projects.length === 0) {
    return <EmptyState onNewProject={onNewProject} />
  }

  return (
    <div className="project-grid">
      {projects.map(project => (
        <ProjectCard
          key={project._id}
          project={project}
          onOpen={onOpen}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
