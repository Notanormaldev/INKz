import { useState, useCallback } from 'react'

/**
 * Manages file list and read/write operations via the sandbox agent API.
 */
export function useFiles(sandboxId) {
  const [files, setFiles] = useState([])
  const [openFiles, setOpenFiles] = useState({}) // { path: content }
  const [activeFile, setActiveFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const agentBase = `/agent-api/${sandboxId}`

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${agentBase}/list-files`)
      const data = await res.json()
      setFiles(data.elements || [])
    } catch (e) {
      console.error('list-files error:', e)
    } finally {
      setLoading(false)
    }
  }, [agentBase])

  const openFile = useCallback(async (filePath) => {
    // If already open, just switch to it
    if (openFiles[filePath] !== undefined) {
      setActiveFile(filePath)
      return
    }
    try {
      const res = await fetch(`${agentBase}/read-file?files=${encodeURIComponent(filePath)}`)
      const data = await res.json()
      setOpenFiles(prev => ({ ...prev, [filePath]: data.content?.[filePath] ?? '' }))
      setActiveFile(filePath)
    } catch (e) {
      console.error('read-file error:', e)
    }
  }, [agentBase, openFiles])

  const saveFile = useCallback(async (filePath, content) => {
    // Optimistically update local state
    setOpenFiles(prev => ({ ...prev, [filePath]: content }))
    try {
      await fetch(`${agentBase}/update-files`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: [{ filename: filePath, content }] })
      })
    } catch (e) {
      console.error('update-files error:', e)
    }
  }, [agentBase])

  const closeFile = useCallback((filePath) => {
    setOpenFiles(prev => {
      const next = { ...prev }
      delete next[filePath]
      return next
    })
    setActiveFile(prev => {
      if (prev !== filePath) return prev
      const remaining = Object.keys(openFiles).filter(f => f !== filePath)
      return remaining[remaining.length - 1] ?? null
    })
  }, [openFiles])

  const refreshFile = useCallback(async (filePath) => {
    try {
      const res = await fetch(`${agentBase}/read-file?files=${encodeURIComponent(filePath)}`)
      const data = await res.json()
      const content = data.content?.[filePath]
      if (content !== undefined) {
        setOpenFiles(prev => ({ ...prev, [filePath]: content }))
      }
    } catch (e) {
      console.error('refresh-file error:', e)
    }
  }, [agentBase])

  return {
    files, openFiles, activeFile, loading,
    fetchFiles, openFile, saveFile, closeFile, refreshFile, setActiveFile
  }
}
