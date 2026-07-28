import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useProjects }      from '../hooks/useProjects'
import LoadingScreen         from '../components/LoadingScreen'
import DashHeader            from '../components/dashboard/DashHeader'
import ProjectGrid           from '../components/dashboard/ProjectGrid'
import NewProjectModal       from '../components/dashboard/NewProjectModal'
import DeleteModal           from '../components/dashboard/DeleteModal'

import './Dashboard.css'

/**
 * Dashboard page — thin orchestrator.
 * All API logic lives in useProjects.
 * All UI sub-pieces live in their own components.
 */
export default function Dashboard() {
  const navigate = useNavigate()

  const {
    projects, fetching, error, setError,
    createProject, deleteProject, startSandbox,
  } = useProjects()

  // Modal visibility
  const [showNewModal,   setShowNewModal]   = useState(false)
  const [deleteTarget,   setDeleteTarget]   = useState(null)   // project to delete

  // Sandbox launch overlay
  const [launching,  setLaunching]  = useState(false)
  const [launchMsg,  setLaunchMsg]  = useState('')

  // ── Open sandbox ────────────────────────────────────────────────────────────

  async function handleOpen(project) {
    setLaunching(true)
    setLaunchMsg(`Starting sandbox for "${project.title}"…`)

    try {
      const t1 = setTimeout(() => setLaunchMsg('Allocating Kubernetes pod…'),   900)
      const t2 = setTimeout(() => setLaunchMsg('Mounting workspace volume…'),  2200)
      const t3 = setTimeout(() => setLaunchMsg('Starting dev server…'),        3800)

      const { sandboxid, preview } = await startSandbox(project._id)

      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3)
      setLaunchMsg('Sandbox ready. Launching IDE…')
      await new Promise(r => setTimeout(r, 600))
      navigate(`/workspace/${sandboxid}`, { state: { previewUrl: preview } })
    } catch (err) {
      setLaunching(false)
      setError(err.message)
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  async function handleDeleteConfirm() {
    await deleteProject(deleteTarget._id)   // throws on error → caught by DeleteModal
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (launching) return <LoadingScreen message={launchMsg} />

  return (
    <div className="dash">
      <div className="dash-bg-grid" aria-hidden="true" />
      <div className="dash-bg-glow" aria-hidden="true" />

      <DashHeader onNewProject={() => setShowNewModal(true)} />

      <main className="dash-main">
        <div className="dash-title-row">
          <h1 className="dash-title">Your Projects</h1>
          <span className="dash-count">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </span>
        </div>

        {error && (
          <div className="dash-error" role="alert">
            <span>⚠ {error}</span>
            <button onClick={() => setError(null)} aria-label="Dismiss error">✕</button>
          </div>
        )}

        <ProjectGrid
          projects={projects}
          fetching={fetching}
          onOpen={handleOpen}
          onDelete={setDeleteTarget}
          onNewProject={() => setShowNewModal(true)}
        />
      </main>

      {showNewModal && (
        <NewProjectModal
          onClose={() => setShowNewModal(false)}
          onCreate={createProject}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          project={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  )
}
