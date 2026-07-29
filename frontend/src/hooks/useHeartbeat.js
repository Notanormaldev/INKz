import { useEffect, useRef } from 'react'

const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000  // 5 minutes

/**
 * Sends a periodic heartbeat to the backend to reset both Redis TTLs
 * (sandbox:<id> and project:<id>) so the pod is never killed mid-session.
 *
 * @param {string} sandboxId  - Active sandbox UUID
 * @param {string} projectId  - MongoDB project ID
 */
export function useHeartbeat(sandboxId, projectId) {
    const intervalRef = useRef(null)

    useEffect(() => {
        if (!sandboxId || !projectId) return

        async function beat() {
            try {
                await fetch('/api/sandbox/heartbeat', {
                    method:      'POST',
                    credentials: 'include',
                    headers:     { 'Content-Type': 'application/json' },
                    body:        JSON.stringify({ sandboxid: sandboxId, projectid: projectId }),
                })
            } catch {
                // Silently ignore — network hiccups shouldn't crash the IDE
            }
        }

        // Fire once immediately so TTL is refreshed right on workspace open,
        // then repeat every 5 minutes.
        beat()
        intervalRef.current = setInterval(beat, HEARTBEAT_INTERVAL_MS)

        return () => clearInterval(intervalRef.current)
    }, [sandboxId, projectId])
}
