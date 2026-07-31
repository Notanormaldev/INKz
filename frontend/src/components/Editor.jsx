import { useEffect } from 'react'
import MonacoEditor, { useMonaco } from '@monaco-editor/react'
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

function handleEditorWillMount(monaco) {
  if (!monaco) return

  // Define One Dark Pro theme
  monaco.editor.defineTheme('one-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'c678dd', fontStyle: 'bold' },
      { token: 'operator', foreground: '56b6c2' },
      { token: 'string', foreground: '98c379' },
      { token: 'number', foreground: 'd19a66' },
      { token: 'identifier', foreground: '61afef' },
      { token: 'type', foreground: 'e5c07b' },
    ],
    colors: {
      'editor.background': '#282c34',
      'editor.foreground': '#abb2bf',
      'editor.lineHighlightBackground': '#2c313c',
      'editorCursor.foreground': '#528bff',
      'editorWhitespace.foreground': '#3b4048',
    }
  })

  // Define Monokai theme
  monaco.editor.defineTheme('monokai', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '75715e', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'f92672', fontStyle: 'bold' },
      { token: 'operator', foreground: 'f92672' },
      { token: 'string', foreground: 'e6db74' },
      { token: 'number', foreground: 'ae81ff' },
      { token: 'identifier', foreground: 'a6e22e' },
      { token: 'type', foreground: '66d9ef' },
    ],
    colors: {
      'editor.background': '#272822',
      'editor.foreground': '#f8f8f2',
      'editor.lineHighlightBackground': '#3e3d32',
      'editorCursor.foreground': '#f8f8f0',
    }
  })
}

export default function Editor({
  openFiles, activeFile, onSelect, onClose, onSave, onChange,
  theme = 'vs-dark', fontSize = 13, wordWrap = 'off'
}) {
  const monaco = useMonaco()

  useEffect(() => {
    if (!monaco) return
    handleEditorWillMount(monaco)
    monaco.editor.setTheme(theme)
  }, [monaco, theme])

  const hasFiles = Object.keys(openFiles).length > 0
  const content = activeFile ? openFiles[activeFile] : ''

  function handleEditorChange(value) {
    if (activeFile) onChange(activeFile, value ?? '')
  }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      if (activeFile) onSave(activeFile)
    }
  }

  return (
    <div className="editor-container" data-editor-theme={theme} onKeyDown={handleKeyDown}>
      {hasFiles && (
        <TabBar
          openFiles={openFiles}
          activeFile={activeFile}
          onSelect={onSelect}
          onClose={onClose}
        />
      )}

      {hasFiles ? (
        <div className="editor-body">
          <MonacoEditor
            key={activeFile}
            height="100%"
            language={getLanguage(activeFile)}
            value={content}
            onChange={handleEditorChange}
            beforeMount={handleEditorWillMount}
            theme={theme}
            options={{
              automaticLayout: true,
              fontSize: Number(fontSize),
              wordWrap: wordWrap,
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
              bracketPairColorization: { enabled: true },
              guides: { bracketPairs: false, indentation: true },
              renderWhitespace: 'selection',
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnCommitCharacter: true,
            }}
          />
        </div>
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
