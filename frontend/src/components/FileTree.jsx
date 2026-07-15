import { useMemo, useState } from 'react'
import './FileTree.css'

// Build a tree structure from flat file paths
function buildTree(files) {
  const root = {}
  for (const f of files) {
    const parts = f.split('/')
    let node = root
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (i === parts.length - 1) {
        node[part] = f // leaf = full path
      } else {
        if (!node[part] || typeof node[part] === 'string') {
          node[part] = {}
        }
        node = node[part]
      }
    }
  }
  return root
}

function getFileIcon(name) {
  const lowerName = name.toLowerCase()
  
  if (lowerName === 'dockerfile' || lowerName === '.dockerignore' || lowerName.includes('docker')) {
    return { char: '🐳', color: '#0db7ed' }
  }
  if (lowerName === '.gitignore' || lowerName === '.gitattributes') {
    return { char: '🌳', color: '#f1502f' }
  }
  if (lowerName === 'package.json' || lowerName === 'package-lock.json') {
    return { char: '📦', color: '#cb3837' }
  }
  if (lowerName.includes('vite.config')) {
    return { char: '⚡', color: '#bd34fe' }
  }
  if (lowerName === '.env' || lowerName.includes('.env.')) {
    return { char: '🔑', color: '#e9b143' }
  }

  const ext = name.split('.').pop()?.toLowerCase()
  const icons = {
    jsx: { char: '⚛', color: '#61dafb' },
    tsx: { char: '⚛', color: '#61dafb' },
    js: { char: '◈', color: '#f7df1e' },
    ts: { char: '◈', color: '#3178c6' },
    css: { char: '◉', color: '#1572b6' },
    scss: { char: '◉', color: '#c6538c' },
    html: { char: '◻', color: '#e34f26' },
    json: { char: '⚙', color: '#cbcb41' },
    md: { char: '✦', color: '#519aba' },
    svg: { char: '◆', color: '#ffb13b' },
    png: { char: '◆', color: '#a074c4' },
    jpg: { char: '◆', color: '#a074c4' },
    jpeg: { char: '◆', color: '#a074c4' },
    yml: { char: '⬡', color: '#cb171e' },
    yaml: { char: '⬡', color: '#cb171e' },
  }
  return icons[ext] ?? { char: '📄', color: '#8f9aae' }
}

function TreeNode({ name, node, depth, onOpenFile, activeFile, openFiles }) {
  const isDir = typeof node === 'object'
  const isFile = typeof node === 'string'
  const [expanded, setExpanded] = useState(depth < 2)

  const isOpen = isFile && Object.keys(openFiles).includes(node)
  const isActive = isFile && activeFile === node

  if (isDir) {
    return (
      <div className="tree-dir">
        <button
          className="tree-item tree-dir-item"
          style={{ paddingLeft: `${8 + depth * 14}px` }}
          onClick={() => setExpanded(e => !e)}
        >
          <span className={`tree-chevron ${expanded ? 'expanded' : ''}`}>›</span>
          <span className="tree-folder-icon" style={{ color: '#e9b143' }}>{expanded ? '📂' : '📁'}</span>
          <span className="tree-name">{name}</span>
        </button>
        {expanded && (
          <div className="tree-children">
            {Object.entries(node).map(([k, v]) => (
              <TreeNode
                key={k}
                name={k}
                node={v}
                depth={depth + 1}
                onOpenFile={onOpenFile}
                activeFile={activeFile}
                openFiles={openFiles}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  const fileIcon = getFileIcon(name)

  return (
    <button
      className={`tree-item tree-file-item ${isActive ? 'active' : ''} ${isOpen ? 'open' : ''}`}
      style={{ paddingLeft: `${8 + depth * 14}px` }}
      onClick={() => onOpenFile(node)}
      title={node}
    >
      <span className="tree-file-icon" style={{ color: fileIcon.color }}>{fileIcon.char}</span>
      <span className="tree-name truncate">{name}</span>
      {isOpen && <span className="tree-dot" />}
    </button>
  )
}

export default function FileTree({ files, activeFile, openFiles, onOpenFile, onRefresh, loading }) {
  const tree = useMemo(() => buildTree(files), [files])

  return (
    <div className="file-tree">
      <div className="file-tree-header">
        <span className="file-tree-title">EXPLORER</span>
        <button
          className="file-tree-refresh"
          onClick={onRefresh}
          title="Refresh files"
          disabled={loading}
        >
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.65 2.35A7.958 7.958 0 0 0 8 0C3.58 0 .01 3.58.01 8S3.58 16 8 16c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 8 14c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L9 7h7V0l-2.35 2.35z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>

      <div className="file-tree-body">
        {loading ? (
          <div className="file-tree-loading">
            <span className="tree-spinner" />
          </div>
        ) : files.length === 0 ? (
          <p className="file-tree-empty">No files found</p>
        ) : (
          Object.entries(tree).map(([k, v]) => (
            <TreeNode
              key={k}
              name={k}
              node={v}
              depth={0}
              onOpenFile={onOpenFile}
              activeFile={activeFile}
              openFiles={openFiles}
            />
          ))
        )}
      </div>
    </div>
  )
}
