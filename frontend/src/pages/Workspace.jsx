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

  // Handle file save and refresh chat awareness
  const handleSave = useCallback(async (filePath, content) => {
    await saveFile(filePath, content)
  }, [saveFile])

  const handleChange = useCallback((filePath, content) => {
    // Local update only — saveFile on Ctrl+S
    import('../hooks/useFiles').then(() => {}) // no-op, state in hook
  }, [])

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
            <button className="activity-btn" title="Git">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="6" cy="18" r="2" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="18" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M6 8v8M6 8c2 0 3.5 1 4.5 2.5L15 14a3 3 0 0 0 3-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* File tree panel */}
          {!sidebarCollapsed && (
            <FileTree
              files={files}
              activeFile={activeFile}
              openFiles={openFiles}
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
                openFiles={openFiles}
                activeFile={activeFile}
                onSelect={setActiveFile}
                onClose={closeFile}
                onSave={handleSave}
                onChange={(path, content) => {
                  // Mirror local state
                  saveFile(path, content)
                }}
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
