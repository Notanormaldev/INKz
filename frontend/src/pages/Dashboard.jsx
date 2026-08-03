import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useProjects }      from '../hooks/useProjects'
import LoadingScreen         from '../components/LoadingScreen'
import DashHeader            from '../components/dashboard/DashHeader'
import ProjectGrid           from '../components/dashboard/ProjectGrid'
import NewProjectModal       from '../components/dashboard/NewProjectModal'
import DeleteModal           from '../components/dashboard/DeleteModal'
import ApplyAccessModal      from '../components/dashboard/ApplyAccessModal'

import './Dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  const {
    projects, fetching, error, setError,
    createProject, deleteProject, startSandbox,
  } = useProjects()

  // Modal visibility
  const [showNewModal,     setShowNewModal]     = useState(false)
  const [showAccessModal,  setShowAccessModal]  = useState(false)
  const [deleteTarget,     setDeleteTarget]     = useState(null)

  // Sandbox launch overlay
  const [launching,  setLaunching]  = useState(false)
  const [launchMsg,  setLaunchMsg]  = useState('')

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data))
      .catch(() => setUser(null))
  }, [])

  const isUnlimited = Boolean(
    user && (
      user.role === 'admin' ||
      user.plan === 'unlimited' ||
      user.email?.toLowerCase().trim() === 'harshpatelpc20051@gmail.com'
    )
  )

  const handleNewProjectClick = () => {
    if (!isUnlimited) {
      setShowAccessModal(true)
      return
    }
    setShowNewModal(true)
  }

  // ── Open sandbox ────────────────────────────────────────────────────────────

  async function handleOpen(project) {
    setLaunching(true)
    setLaunchMsg(`Starting sandbox for "${project.title}"…`)

    try {
      const { sandboxid, preview } = await startSandbox(project._id, setLaunchMsg)

      setLaunchMsg('Sandbox ready. Launching IDE…')
      await new Promise(r => setTimeout(r, 600))
      navigate(`/workspace/${sandboxid}`, { state: { previewUrl: preview, projectId: project._id } })
    } catch (err) {
      setLaunching(false)
      if (err.requiresApplication) {
        setShowAccessModal(true)
      } else {
        setError(err.message)
      }
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  async function handleDeleteConfirm() {
    await deleteProject(deleteTarget._id)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (launching) return <LoadingScreen message={launchMsg} />

  return (
    <div className="dash">
      <div className="dash-bg-grid" aria-hidden="true" />
      <div className="dash-bg-glow" aria-hidden="true" />

      <DashHeader onNewProject={handleNewProjectClick} />

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
          onNewProject={handleNewProjectClick}
        />
      </main>

      {showNewModal && (
        <NewProjectModal
          onClose={() => setShowNewModal(false)}
          onCreate={async (title) => {
            try {
              await createProject(title)
            } catch (err) {
              if (err.requiresApplication) {
                setShowNewModal(false)
                setShowAccessModal(true)
              } else {
                throw err
              }
            }
          }}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          project={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* Restricted Cloud Access Popup */}
      <ApplyAccessModal
        isOpen={showAccessModal}
        onClose={() => setShowAccessModal(false)}
      />
    </div>
  )
}
