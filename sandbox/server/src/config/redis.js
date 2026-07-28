import Redis from 'ioredis'
import { deletepod } from '../kubernetes/pod.js';
import { deleteservice } from '../kubernetes/service.js';

export const redis = new Redis(process.env.REDIS_URL);
const subscriber = new Redis(process.env.REDIS_URL);

const SANDBOX_TTL = 60 * 20  // 20 minutes

/**
 * Creates the sandbox activity key (TTL-based expiry triggers pod deletion).
 */
export async function createsandboxkey(sandboxid) {
    await redis.set(`sandbox:${sandboxid}`, JSON.stringify({ status: 'active' }), 'EX', SANDBOX_TTL)
}

/**
 * Stores projectid → sandboxid mapping with the same TTL.
 * Lets /start check if a pod is already running for this project.
 */
export async function createprojectkey(projectid, sandboxid) {
    await redis.set(`project:${projectid}`, sandboxid, 'EX', SANDBOX_TTL)
}

/**
 * Returns the active sandboxid for a project, or null if the pod has expired.
 */
export async function getactivesandbox(projectid) {
    return redis.get(`project:${projectid}`)
}

/**
 * Refreshes TTL on both sandbox and project keys to reset the 20-min inactivity timer.
 */
export async function refreshTTL(sandboxid, projectid) {
    await redis.expire(`sandbox:${sandboxid}`, SANDBOX_TTL)
    if (projectid) await redis.expire(`project:${projectid}`, SANDBOX_TTL)
}

// ─── Keyspace expiry listener (auto-delete pod on inactivity) ────────────────

subscriber.config('SET', 'notify-keyspace-events', 'Ex')
subscriber.subscribe('__keyevent@0__:expired')

subscriber.on('message', async (channel, key) => {
    if (!key.startsWith('sandbox:')) return   // ignore project: key expiry

    console.log(`[REDIS] Sandbox expired: ${key}`)
    const sandboxid = key.split(':')[1]

    await deletepod(sandboxid)
    await deleteservice(sandboxid)
})

export default { subscriber }