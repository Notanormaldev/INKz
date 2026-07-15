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

  // Load files on mount
  useEffect(() => {
    if (sandboxId) fetchFiles()
  }, [sandboxId, fetchFiles])

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

  return (
    <div className="workspace">
      <TopBar
        sandboxId={sandboxId}
        activePanel={activePanel}
        onPanelChange={setActivePanel}
      />

      <div className="workspace-body">
        {/* ── Sidebar ── */}
        <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
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

        {/* ── Center ── */}
        <div className="center-area">
          {(activePanel === 'editor' || activePanel === 'split') && (
            <div className={`editor-area ${terminalOpen ? 'with-terminal' : ''}`}>
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
                <div className="terminal-area">
                  <Terminal sandboxId={sandboxId} />
                </div>
              )}
            </div>
          )}

          {(activePanel === 'preview' || activePanel === 'split') && (
            <div className={`preview-area ${activePanel === 'split' ? 'split' : ''}`}>
              <Preview previewUrl={previewUrl} sandboxId={sandboxId} />
            </div>
          )}
        </div>

        {/* ── Chat ── */}
        <div className="chat-area">
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
