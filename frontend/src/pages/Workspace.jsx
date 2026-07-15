import { useEffect, useState, useCallback } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import TopBar from '../components/TopBar'
import FileTree from '../components/FileTree'
import Editor from '../components/Editor'
import ChatPanel from '../components/ChatPanel'
import Terminal from '../components/Terminal'
import Preview from '../components/Preview'
import { useFiles } from '../hooks/useFiles'
import { useChat } from '../hooks/useChat'
import './Workspace.css'

// Panel layout modes
// 'editor'  → FileTree | Editor+Terminal | Chat
// 'preview' → FileTree | Preview         | Chat
// 'split'   → FileTree | Editor+Terminal | Preview + Chat

export default function Workspace() {
  const { sandboxId } = useParams()
  const location = useLocation()
  const previewUrl = location.state?.previewUrl

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

  // Load files on mount
  useEffect(() => {
    if (sandboxId) fetchFiles()
  }, [sandboxId, fetchFiles])

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
    const content = localEdits[filePath] ?? openFiles[filePath]
    if (content === undefined) return
    await saveFile(filePath, content)
    setLocalEdits(prev => { const n = { ...prev }; delete n[filePath]; return n })
  }, [localEdits, openFiles, saveFile])

  const handleClose = useCallback((filePath) => {
    setLocalEdits(prev => { const n = { ...prev }; delete n[filePath]; return n })
    closeFile(filePath)
  }, [closeFile])

  const draggingActive = isDraggingSidebar || isDraggingTerminal || isDraggingSplit || isDraggingChat

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
                    <Terminal sandboxId={sandboxId} />
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
            onSend={sendMessage}
            onStop={stopStreaming}
            sandboxId={sandboxId}
          />
        </div>
      </div>
    </div>
  )
}

