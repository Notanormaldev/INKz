import { useNavigate } from 'react-router-dom'
import './TopBar.css'

export default function TopBar({ sandboxId, activePanel, onPanelChange }) {
  const navigate = useNavigate()

  const panels = [
    { id: 'editor', label: 'Editor', icon: '◈' },
    { id: 'preview', label: 'Preview', icon: '◻' },
    { id: 'split', label: 'Split', icon: '▤' },
  ]

  return (
    <header className="topbar">
      {/* Left: logo + back */}
      <div className="topbar-left">
        <button className="topbar-logo" onClick={() => navigate('/')} title="Back to home">
          <span>I</span><span>N</span><span>K</span>
          <span className="topbar-z">z</span>
          <div className="topbar-dot" />
        </button>
        <div className="topbar-divider" />
        <span className="topbar-sandbox-id">
          sandbox/<code>{sandboxId?.slice(0, 8)}</code>
        </span>
        <span className="topbar-live-badge">
          <span className="live-dot" />
          live
        </span>
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

      {/* Right: actions */}
      <div className="topbar-right">
        <button
          className="topbar-action"
          onClick={() => navigate('/')}
          title="New project"
        >
          + New
        </button>
      </div>
    </header>
  )
}
