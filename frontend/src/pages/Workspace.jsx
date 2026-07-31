import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import FileTree from '../components/FileTree'
import Editor from '../components/Editor'
import ChatPanel from '../components/ChatPanel'
import Terminal from '../components/Terminal'
import Preview from '../components/Preview'
import { useFiles } from '../hooks/useFiles'
import { useChat } from '../hooks/useChat'
import { useHeartbeat } from '../hooks/useHeartbeat'
import './Workspace.css'

// Panel layout modes
// 'editor'  → FileTree | Editor+Terminal | Chat
// 'preview' → FileTree | Preview         | Chat
// 'split'   → FileTree | Editor+Terminal | Preview + Chat

const STATUS_API = (projectId) => `/api/sandbox/status/${projectId}`

export default function Workspace() {
  const { sandboxId } = useParams()
  const location = useLocation()
  const navigate  = useNavigate()
  const previewUrl = location.state?.previewUrl
  const projectId  = location.state?.projectId

  // ── Pod readiness gate ───────────────────────────────────────────────────
  // 'unknown'  = haven't checked yet (mount)
  // 'starting' = pod exists but containers not ready
  // 'ready'    = all containers Ready → unlock UI
  // 'stopped'  = no pod in Redis → redirect to dashboard
  const [podStatus, setPodStatus]   = useState('unknown')
  const [podPhase,  setPodPhase]    = useState('')
  const pollTimerRef = useRef(null)

  useEffect(() => {
    if (!projectId) return // no projectId in state (direct URL) → assume ready

    async function checkStatus() {
      try {
        const res  = await fetch(STATUS_API(projectId), { credentials: 'include' })
        const data = await res.json()

        if (data.status === 'ready') {
          setPodStatus('ready')
          clearInterval(pollTimerRef.current)
        } else if (data.status === 'stopped') {
          setPodStatus('stopped')
          clearInterval(pollTimerRef.current)
        } else {
          // 'starting' — keep polling
          setPodStatus('starting')
          setPodPhase(data.phase ?? 'Pending')
        }
      } catch {
        // network error — keep polling
      }
    }

    checkStatus()
    pollTimerRef.current = setInterval(checkStatus, 3000)

    return () => clearInterval(pollTimerRef.current)
  }, [projectId])

  // If the pod is confirmed stopped (stale URL / page refresh after pod died) → go back
  useEffect(() => {
    if (podStatus === 'stopped') {
      navigate('/', { replace: true })
    }
  }, [podStatus, navigate])

  const podReady = podStatus === 'ready' || !projectId // unlock if no projectId (dev fallback)

  // Keep both Redis TTLs alive every 5 min so the pod isn't killed mid-session
  useHeartbeat(sandboxId, projectId)

  const [activePanel, setActivePanel] = useState('editor')
  const [terminalOpen, setTerminalOpen] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  // Track in-editor (unsaved) changes separately from persisted content
  const [localEdits, setLocalEdits] = useState({})

  const {
    files, openFiles, activeFile, loading: filesLoading,
    fetchFiles, openFile, saveFile, closeFile, setActiveFile
  } = useFiles(sandboxId)

  const {
    messages, streaming, sendMessage, stopStreaming
  } = useChat(sandboxId)

  const [sidebarWidth, setSidebarWidth] = useState(260)
  const [terminalHeight, setTerminalHeight] = useState(240)
  const [splitWidth, setSplitWidth] = useState(50) // percentage
  const [chatWidth, setChatWidth] = useState(320)

  // Dragging states
  const [isDraggingSidebar, setIsDraggingSidebar] = useState(false)
  const [isDraggingTerminal, setIsDraggingTerminal] = useState(false)
  const [isDraggingSplit, setIsDraggingSplit] = useState(false)
  const [isDraggingChat, setIsDraggingChat] = useState(false)

  // Load files only once pod is ready
  useEffect(() => {
    if (sandboxId && podReady) fetchFiles()
  }, [sandboxId, podReady, fetchFiles])

  // Mouse move and up handlers for resizing
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingSidebar) {
        const newWidth = Math.max(150, Math.min(600, e.clientX))
        setSidebarWidth(newWidth)
      } else if (isDraggingTerminal) {
        const editorAreaEl = document.querySelector('.editor-area')
        if (editorAreaEl) {
          const rect = editorAreaEl.getBoundingClientRect()
          const newHeight = Math.max(80, Math.min(rect.height - 100, rect.bottom - e.clientY))
          setTerminalHeight(newHeight)
        }
      } else if (isDraggingSplit) {
        const centerAreaEl = document.querySelector('.center-area')
        if (centerAreaEl) {
          const rect = centerAreaEl.getBoundingClientRect()
          const relativeX = e.clientX - rect.left
          const percentage = Math.max(15, Math.min(85, (relativeX / rect.width) * 100))
          setSplitWidth(percentage)
        }
      } else if (isDraggingChat) {
        const newWidth = Math.max(200, Math.min(600, window.innerWidth - e.clientX))
        setChatWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsDraggingSidebar(false)
      setIsDraggingTerminal(false)
      setIsDraggingSplit(false)
      setIsDraggingChat(false)
    }

    if (isDraggingSidebar || isDraggingTerminal || isDraggingSplit || isDraggingChat) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDraggingSidebar, isDraggingTerminal, isDraggingSplit, isDraggingChat])

  // Display content = persisted + any unsaved local edits overlaid
  const displayFiles = { ...openFiles, ...localEdits }

  const handleChange = useCallback((filePath, content) => {
    setLocalEdits(prev => ({ ...prev, [filePath]: content }))
  }, [])

  const handleSave = useCallback(async (filePath) => {
    if (!podReady) return // block saves while pod not ready — edits are kept in localEdits
    const content = localEdits[filePath] ?? openFiles[filePath]
    if (content === undefined) return
    await saveFile(filePath, content)
    setLocalEdits(prev => { const n = { ...prev }; delete n[filePath]; return n })
  }, [localEdits, openFiles, saveFile, podReady])

  const handleClose = useCallback((filePath) => {
    setLocalEdits(prev => { const n = { ...prev }; delete n[filePath]; return n })
    closeFile(filePath)
  }, [closeFile])

  const draggingActive = isDraggingSidebar || isDraggingTerminal || isDraggingSplit || isDraggingChat

  // ── Pod-starting overlay ─────────────────────────────────────────────────
  if (podStatus === 'starting' || podStatus === 'unknown') {
    return (
      <div className="workspace">
        <TopBar sandboxId={sandboxId} activePanel={activePanel} onPanelChange={setActivePanel} />
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', flex: 1, height: 'calc(100vh - 48px)',
          gap: '16px', color: 'var(--text-secondary, #8b949e)'
        }}>
          <div style={{
            width: 36, height: 36, border: '3px solid var(--accent, #d4631a)',
            borderTopColor: 'transparent', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <span style={{ fontSize: 14 }}>
            {podStatus === 'unknown' ? 'Checking sandbox…' : `Pod is starting… (${podPhase})`}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={`workspace ${draggingActive ? 'dragging-active' : ''}`}>
      <TopBar
        sandboxId={sandboxId}
        activePanel={activePanel}
        onPanelChange={setActivePanel}
      />

      <div className="workspace-body">
        {/* ── Sidebar ── */}
        <div
          className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}
          style={{ width: sidebarCollapsed ? undefined : sidebarWidth }}
        >
          {/* Activity bar */}
          <div className="activity-bar">
            <button
              className="activity-btn active"
              title="Explorer"
              onClick={() => setSidebarCollapsed(c => !c)}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 5h18M3 12h18M3 19h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <button className="activity-btn" title="Search">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <button className="activity-btn" title="Terminal" onClick={() => setTerminalOpen(t => !t)}>
              <svg viewBox="0 0 24 24" fill="none"><path d="M4 17l6-6-6-6M12 19h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

          {/* File tree panel */}
          {!sidebarCollapsed && (
            <FileTree
              files={files}
              activeFile={activeFile}
              openFiles={displayFiles}
              onOpenFile={openFile}
              onRefresh={fetchFiles}
              loading={filesLoading}
            />
          )}
        </div>

        {/* Sidebar resizer handle */}
        {!sidebarCollapsed && (
          <div
            className={`resizer-col ${isDraggingSidebar ? 'active' : ''}`}
            onMouseDown={() => setIsDraggingSidebar(true)}
          />
        )}

        {/* ── Center ── */}
        <div className="center-area">
          {(activePanel === 'editor' || activePanel === 'split') && (
            <div
              className={`editor-area ${terminalOpen ? 'with-terminal' : ''}`}
              style={{ flex: activePanel === 'split' ? splitWidth : 1 }}
            >
              <Editor
                openFiles={displayFiles}
                activeFile={activeFile}
                onSelect={setActiveFile}
                onClose={handleClose}
                onSave={handleSave}
                onChange={handleChange}
              />

              {/* Terminal toggle */}
              <button
                className="terminal-toggle"
                onClick={() => setTerminalOpen(t => !t)}
                title={terminalOpen ? 'Hide terminal' : 'Show terminal'}
              >
                <span className="tt-icon">⌘</span>
                Terminal
                <span className={`tt-arrow ${terminalOpen ? 'up' : ''}`}>›</span>
              </button>

              {terminalOpen && (
                <>
                  <div
                    className={`resizer-row ${isDraggingTerminal ? 'active' : ''}`}
                    onMouseDown={() => setIsDraggingTerminal(true)}
                  />
                  <div className="terminal-area" style={{ height: terminalHeight }}>
                    {/* Terminal connects only when pod is ready */}
                    <Terminal sandboxId={podReady ? sandboxId : null} podReady={podReady} />
                  </div>
                </>
              )}
            </div>
          )}

          {activePanel === 'split' && (
            <div
              className={`resizer-col ${isDraggingSplit ? 'active' : ''}`}
              onMouseDown={() => setIsDraggingSplit(true)}
            />
          )}

          {(activePanel === 'preview' || activePanel === 'split') && (
            <div
              className={`preview-area ${activePanel === 'split' ? 'split' : ''}`}
              style={{ flex: activePanel === 'split' ? (100 - splitWidth) : 1 }}
            >
              <Preview previewUrl={previewUrl} sandboxId={sandboxId} />
            </div>
          )}
        </div>

        {/* Chat resizer handle */}
        <div
          className={`resizer-col ${isDraggingChat ? 'active' : ''}`}
          onMouseDown={() => setIsDraggingChat(true)}
        />

        {/* ── Chat ── */}
        <div className="chat-area" style={{ width: chatWidth }}>
          <ChatPanel
            messages={messages}
            streaming={streaming}
            onSend={podReady ? sendMessage : undefined}
            onStop={stopStreaming}
            sandboxId={sandboxId}
            podReady={podReady}
          />
        </div>
      </div>
    </div>
  )
}
