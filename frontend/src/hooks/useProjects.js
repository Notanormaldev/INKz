import { useState, useEffect, useCallback } from 'react'

const API = {
  projects:      '/api/sandbox/projects',
  createProject: '/api/sandbox/project',
  startSandbox:  '/api/sandbox/start',
  status:        (id) => `/api/sandbox/status/${id}`,
  deleteProject: (id) => `/api/sandbox/project/${id}`,
}

/**
 * Polls /status/:projectId every 2 s until the pod is 'ready' or timeout.
 * @param {string} projectId
 * @param {Function} [onProgress] - called with a status string on each poll
 * @param {number} [timeoutMs=120000]
 * @returns {Promise<{sandboxid, preview}>}
 */
async function pollUntilReady(projectId, onProgress, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 2000))
    const res  = await fetch(API.status(projectId), { credentials: 'include' })
    const data = await res.json()
    if (data.status === 'ready') {
      return { sandboxid: data.sandboxid, preview: data.preview }
    }
    if (data.status === 'stopped') {
      throw new Error('Pod stopped unexpectedly during startup')
    }
    // still 'starting' — notify caller if they want to show progress
    onProgress?.(`Pod is starting… (${data.phase ?? 'Pending'})`)
  }
  throw new Error('Sandbox did not become ready within 2 minutes')
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
    if (!res.ok) {
      const err = new Error(data.message || 'Failed to create project')
      err.requiresApplication = data.requiresApplication || res.status === 403
      throw err
    }
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

  // ── Start sandbox (waits until pod is truly Ready) ────────────────────────

  const startSandbox = useCallback(async (projectId, onProgress) => {
    // 1. Ask the server to create/resume the pod
    onProgress?.('Requesting sandbox…')
    const res  = await fetch(API.startSandbox, {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({ projectid: projectId }),
    })
    const data = await res.json()
    if (!res.ok) {
      const err = new Error(data.message || 'Failed to start sandbox')
      err.requiresApplication = data.requiresApplication || res.status === 403
      throw err
    }

    // 2. If the pod was already running, it's immediately ready
    if (data.message === 'Sandbox already running') {
      return { sandboxid: data.sandboxid, preview: data.preview }
    }

    // 3. New pod was just created — wait for it to actually be Ready
    onProgress?.('Pod created, waiting for containers to start…')
    return await pollUntilReady(projectId, onProgress)
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
