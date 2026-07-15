import MonacoEditor from '@monaco-editor/react'
import './Editor.css'

function getLanguage(filePath) {
  const ext = filePath?.split('.').pop()?.toLowerCase()
  const map = {
    js: 'javascript', jsx: 'javascript',
    ts: 'typescript', tsx: 'typescript',
    css: 'css', scss: 'scss',
    html: 'html', json: 'json',
    md: 'markdown', yml: 'yaml', yaml: 'yaml',
    py: 'python', sh: 'shell', dockerfile: 'dockerfile',
    svg: 'xml', xml: 'xml',
  }
  return map[ext] ?? 'plaintext'
}

function TabBar({ openFiles, activeFile, onSelect, onClose }) {
  return (
    <div className="tab-bar" role="tablist">
      {Object.keys(openFiles).map(filePath => {
        const name = filePath.split('/').pop()
        const isActive = filePath === activeFile
        return (
          <div
            key={filePath}
            className={`tab ${isActive ? 'active' : ''}`}
            role="tab"
            aria-selected={isActive}
          >
            <button className="tab-label" onClick={() => onSelect(filePath)} title={filePath}>
              {name}
            </button>
            <button
              className="tab-close"
              onClick={e => { e.stopPropagation(); onClose(filePath) }}
              aria-label={`Close ${name}`}
            >
              ×
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default function Editor({ openFiles, activeFile, onSelect, onClose, onSave, onChange }) {
  const hasFiles = Object.keys(openFiles).length > 0
  const content = activeFile ? openFiles[activeFile] : ''

  function handleEditorChange(value) {
    if (activeFile) onChange(activeFile, value ?? '')
  }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      if (activeFile) onSave(activeFile, openFiles[activeFile])
    }
  }

  return (
    <div className="editor-container" onKeyDown={handleKeyDown}>
      {hasFiles ? (
        <>
          <TabBar
            openFiles={openFiles}
            activeFile={activeFile}
            onSelect={onSelect}
            onClose={onClose}
          />
          <div className="editor-body">
            <MonacoEditor
              key={activeFile}
              height="100%"
              language={getLanguage(activeFile)}
              value={content}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                fontSize: 13,
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                fontLigatures: true,
                lineHeight: 22,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                renderLineHighlight: 'line',
                overviewRulerBorder: false,
                hideCursorInOverviewRuler: true,
                padding: { top: 12, bottom: 12 },
                smoothScrolling: true,
                cursorSmoothCaretAnimation: 'on',
                cursorBlinking: 'smooth',
                tabSize: 2,
                wordWrap: 'off',
                bracketPairColorization: { enabled: true },
                guides: { bracketPairs: false, indentation: true },
                renderWhitespace: 'selection',
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnCommitCharacter: true,
              }}
            />
          </div>
        </>
      ) : (
        <div className="editor-empty">
          <div className="editor-empty-logo">
            <span>I</span><span>N</span><span>K</span>
            <span className="editor-empty-z">z</span>
          </div>
          <p>Select a file from the explorer to start editing</p>
          <p className="editor-empty-hint">↑ K8s sandbox is live — every save triggers HMR</p>
        </div>
      )}
    </div>
  )
}
