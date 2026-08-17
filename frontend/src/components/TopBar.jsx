import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './TopBar.css'

export default function TopBar({
  sandboxId, activePanel, onPanelChange, onGoHome, onNewProject, onSwitchProject,
  projects = [], currentProjectId
}) {
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const currentProject = projects.find(p =>
    (currentProjectId && String(p._id) === String(currentProjectId)) ||
    (sandboxId && p.sandboxId === sandboxId)
  )

  const displayTitle = currentProject?.title || (projects.length > 0 ? projects[0]?.title : 'Project Workspace')

  const panels = [
    { id: 'editor', label: 'Editor', icon: '◈' },
    { id: 'preview', label: 'Preview', icon: '◻' },
    { id: 'split', label: 'Split', icon: '▤' },
  ]

  return (
    <header className="topbar">
      {/* Left: logo + project selector */}
      <div className="topbar-left">
        <button className="topbar-logo" onClick={onGoHome} title="Go to home">
          <span className="logo-i">I</span>
          <span className="logo-n">N</span>
          <span className="logo-k">K</span>
          <span className="logo-z">z</span>
        </button>

        <div className="topbar-divider" />

        {/* Project Selector */}
        <div className="topbar-project-selector">
          <button
            className={`topbar-project-btn ${dropdownOpen ? 'open' : ''}`}
            onClick={() => setDropdownOpen(o => !o)}
            title="Switch project"
          >
            <span className="topbar-project-icon">📂</span>
            <span className="topbar-project-title">
              {displayTitle}
            </span>
            <span className="topbar-project-count-badge">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </span>
            <span className={`topbar-project-chevron ${dropdownOpen ? 'open' : ''}`}>›</span>
          </button>

          {dropdownOpen && (
            <div className="topbar-project-dropdown">
              <div className="project-dropdown-header">YOUR PROJECTS ({projects.length})</div>
              <div className="project-dropdown-list">
                {projects.map(p => {
                  const isCurrent = (currentProjectId && String(p._id) === String(currentProjectId)) || (sandboxId && p.sandboxId === sandboxId)
                  return (
                    <button
                      key={p._id}
                      className={`project-dropdown-item ${isCurrent ? 'active' : ''}`}
                      onClick={() => {
                        setDropdownOpen(false)
                        if (!isCurrent) {
                          if (onSwitchProject) {
                            onSwitchProject(p)
                          } else {
                            navigate(`/workspace/${p.sandboxId || p._id}`, { state: { projectId: p._id } })
                          }
                        }
                      }}
                    >
                      <div className="project-item-left">
                        <span className="project-item-icon">📁</span>
                        <span className="project-item-title">{p.title || 'Untitled Project'}</span>
                      </div>
                      {isCurrent && <span className="project-current-badge">Active</span>}
                    </button>
                  )
                })}
              </div>

              <div className="project-dropdown-footer">
                <button
                  className="project-dropdown-new-btn"
                  onClick={() => {
                    setDropdownOpen(false)
                    onNewProject()
                  }}
                >
                  <span>+</span> Create New Project
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: panel switcher */}
      <div className="topbar-center">
        {panels.map(p => (
          <button
            key={p.id}
            className={`topbar-panel-btn ${activePanel === p.id ? 'active' : ''}`}
            onClick={() => onPanelChange(p.id)}
          >
            <span className="panel-btn-icon">{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>

      {/* Right: Back to Home button */}
      <div className="topbar-right">
        <button
          className="topbar-home-btn"
          onClick={onGoHome}
          title="Return to Dashboard"
        >
          <svg className="home-btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Home</span>
        </button>
      </div>
    </header>
  )
}
