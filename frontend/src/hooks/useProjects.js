import { useState, useEffect, useCallback } from 'react'

const API = {
  projects:      '/api/sandbox/projects',
  createProject: '/api/sandbox/project',
  startSandbox:  '/api/sandbox/start',
  deleteProject: (id) => `/api/sandbox/project/${id}`,
}

/**
 * Custom hook — encapsulates all project CRUD + sandbox start logic.
 * Returns state and action handlers to be used by Dashboard and its children.
 */
export function useProjects() {
  const [projects, setProjects]   = useState([])
  const [fetching, setFetching]   = useState(true)
  const [error, setError]         = useState(null)

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchProjects = useCallback(async () => {
    setFetching(true)
    setError(null)
    try {
      const res  = await fetch(API.projects, { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to load projects')
      setProjects(data.projects)
    } catch (err) {
      setError(err.message)
    } finally {
      setFetching(false)
    }
  }, [])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  // ── Create ────────────────────────────────────────────────────────────────

  const createProject = useCallback(async (title) => {
    const res  = await fetch(API.createProject, {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({ title: title.trim() }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to create project')
    setProjects(prev => [data.project, ...prev])
    return data.project
  }, [])

  // ── Delete ────────────────────────────────────────────────────────────────

  const deleteProject = useCallback(async (projectId) => {
    const res  = await fetch(API.deleteProject(projectId), {
      method:      'DELETE',
      credentials: 'include',
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to delete project')
    setProjects(prev => prev.filter(p => p._id !== projectId))
  }, [])

  // ── Start sandbox ─────────────────────────────────────────────────────────

  const startSandbox = useCallback(async (projectId) => {
    const res  = await fetch(API.startSandbox, {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({ projectid: projectId }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to start sandbox')
    return { sandboxid: data.sandboxid, preview: data.preview }
  }, [])

  return {
    projects,
    fetching,
    error,
    setError,
    fetchProjects,
    createProject,
    deleteProject,
    startSandbox,
  }
}
