import { Router } from "express";
import { createpod, deletepod } from '../kubernetes/pod.js'
import { createservice, deleteservice } from '../kubernetes/service.js'
import { v7 as uuid } from 'uuid'
import { createsandboxkey, createprojectkey, getactivesandbox, refreshTTL } from '../config/redis.js'
import { authMiddleware } from "../middleware/auth.middleware.js";
import Project from "../models/project.model.js";
import User from "../models/user.model.js";
import { k8sCoreV1Api } from '../kubernetes/config.js'
import {
    S3Client,
    ListObjectsV2Command,
    DeleteObjectsCommand
} from '@aws-sdk/client-s3'

const router = Router()

// ─── S3 client (server-side, for project deletion cleanup) ───────────────────

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
})

const BUCKET = 'inkz-s3'

/**
 * Deletes ALL S3 objects under a projectid prefix.
 * Called only on permanent project deletion.
 */
async function deleteProjectS3Files(projectid) {
    const keys = []
    let token = undefined

    do {
        const res = await s3.send(new ListObjectsV2Command({
            Bucket: BUCKET,
            Prefix: `${projectid}/`,
            ContinuationToken: token
        }))
        if (res.Contents) keys.push(...res.Contents.map(o => ({ Key: o.Key })))
        token = res.IsTruncated ? res.NextContinuationToken : undefined
    } while (token)

    if (keys.length === 0) return

    await s3.send(new DeleteObjectsCommand({
        Bucket: BUCKET,
        Delete: { Objects: keys }
    }))

    console.log(`[S3] Deleted ${keys.length} object(s) for project ${projectid}`)
}

const ADMIN_EMAIL = 'harshpatelpc20051@gmail.com'

async function checkUnlimitedAccess(reqUser) {
    if (!reqUser) return false

    const email = (reqUser.email || '').toLowerCase().trim()
    const isAdminEmail = Boolean(email && email === ADMIN_EMAIL.toLowerCase().trim())

    // 1. Direct JWT token claim check
    if (reqUser.role === 'admin' || reqUser.plan === 'unlimited' || isAdminEmail) {
        return true
    }

    // 2. DB fallback check if user plan was updated to 'unlimited' in DB or user is admin
    try {
        const userId = reqUser.id || reqUser._id
        let user = null
        if (userId) {
            user = await User.findById(userId)
        } else if (email) {
            user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') })
        }

        if (user) {
            const isUserAdmin = user.role === 'admin' || (user.email && user.email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim())
            if (user.plan === 'unlimited' || isUserAdmin) {
                return true
            }
        }
    } catch (err) {
        console.error('[checkUnlimitedAccess DB check error]', err)
    }

    // Free plan users cannot create projects or start sandboxes (return false -> 403 Forbidden)
    return false
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// Create a new project (metadata only, no pod)
router.post('/project', authMiddleware, async (req, res) => {
    const { title } = req.body

    if (!title) return res.status(400).json({ message: 'Title is required' })

    const isUnlimited = await checkUnlimitedAccess(req.user)
    if (!isUnlimited) {
        return res.status(403).json({
            message: 'Cloud access restricted. Please apply for early access.',
            requiresApplication: true
        })
    }

    const project = await Project.create({ title, user: req.user.id })
    return res.status(201).json({ message: 'Project created successfully', project })
})

// List all projects for the user
router.get('/projects', authMiddleware, async (req, res) => {
    const projects = await Project.find({ user: req.user.id })
    return res.status(200).json({ projects })
})

/**
 * Start (or resume) a sandbox pod for a project.
 */
router.post('/start', authMiddleware, async (req, res) => {
    const { projectid } = req.body

    if (!projectid) return res.status(400).json({ message: 'Project ID is required' })

    const project = await Project.findOne({ _id: projectid, user: req.user.id })
    if (!project) return res.status(404).json({ message: 'Project not found' })

    const isUnlimited = await checkUnlimitedAccess(req.user)
    if (!isUnlimited) {
        return res.status(403).json({
            message: 'Cloud access restricted. Please apply for early access.',
            requiresApplication: true
        })
    }

    // ── Resume: pod already running for this project ──
    const existingSandboxid = await getactivesandbox(projectid)
    if (existingSandboxid) {
        console.log(`[START] Resuming existing pod for project ${projectid}: ${existingSandboxid}`)
        return res.status(200).json({
            message: 'Sandbox already running',
            sandboxid: existingSandboxid,
            preview: `http://${existingSandboxid}.preview.localhost`
        })
    }

    // ── Create: no active pod found, spin up a new one ──
    const sandboxid = uuid()
    await Promise.all([
        createpod(sandboxid, projectid),
        createservice(sandboxid),
        createsandboxkey(sandboxid),
        createprojectkey(projectid, sandboxid)   // store project → sandbox mapping
    ])

    console.log(`[START] New pod for project ${projectid}: ${sandboxid}`)
    return res.status(201).json({
        message: 'Sandbox created successfully',
        sandboxid: sandboxid,
        preview: `http://${sandboxid}.preview.localhost`
    })

})


/**
 * Get sandbox status for a project.
 * Frontend uses this to show: stopped / starting / ready
 *
 * Possible states returned:
 *   stopped  → no active pod in Redis (pod was deleted or never started)
 *   starting → pod exists in k8s but not all containers are Ready yet
 *   ready    → all containers Running and Ready
 */
router.get('/status/:projectid', authMiddleware, async (req, res) => {
    const { projectid } = req.params

    const project = await Project.findOne({ _id: projectid, user: req.user.id })
    if (!project) return res.status(404).json({ message: 'Project not found' })

    const sandboxid = await getactivesandbox(projectid)

    // No active sandbox in Redis → pod was deleted or never started
    if (!sandboxid) {
        return res.status(200).json({ status: 'stopped', sandboxid: null, preview: null })
    }

    // Check actual pod state in Kubernetes
    try {
        const pod = await k8sCoreV1Api.readNamespacedPod({
            name: `sandbox-pod-${sandboxid}`,
            namespace: 'default'
        })

        const phase = pod.status?.phase           // Pending / Running / Failed
        const conditions = pod.status?.conditions || []
        const allReady = pod.status?.containerStatuses?.every(c => c.ready) ?? false

        if (phase === 'Running' && allReady) {
            return res.status(200).json({
                status: 'ready',
                sandboxid,
                preview: `http://${sandboxid}.preview.localhost`
            })
        }

        return res.status(200).json({
            status: 'starting',
            sandboxid,
            preview: null,
            phase
        })
    } catch (err) {
        // Pod not found in k8s (e.g. Redis key still alive but pod was force-deleted)
        return res.status(200).json({ status: 'stopped', sandboxid: null, preview: null })
    }
})

/**
 * Heartbeat — called by the frontend every ~5 min while the workspace is open.
 * Resets TTL on BOTH Redis keys so neither expires mid-session.
 */
router.post('/heartbeat', authMiddleware, async (req, res) => {
    const { projectid, sandboxid } = req.body
    if (!projectid || !sandboxid) {
        return res.status(400).json({ message: 'projectid and sandboxid are required' })
    }
    await refreshTTL(sandboxid, projectid)
    return res.status(200).json({ message: 'TTL refreshed' })
})

/**
 * Permanently delete a project:
 *   1. Verify ownership
 *   2. Stop & delete active Kubernetes pod & service if running
 *   3. Delete all S3 files under the projectid prefix
 *   4. Remove the project from the DB
 */
router.delete('/project/:id', authMiddleware, async (req, res) => {
    const project = await Project.findOne({ _id: req.params.id, user: req.user.id })
    if (!project) return res.status(404).json({ message: 'Project not found' })

    // Stop & delete active pod/service in Kubernetes if running
    const sandboxid = await getactivesandbox(req.params.id)
    if (sandboxid) {
        try {
            await deletepod(sandboxid)
            await deleteservice(sandboxid)
            console.log(`[DELETE] Deleted active pod/service for sandbox ${sandboxid}`)
        } catch (e) {
            console.error(`[DELETE] Pod cleanup error (ignoring):`, e.message)
        }
    }

    // Delete S3 files permanently
    await deleteProjectS3Files(req.params.id)

    // Remove from DB
    await Project.deleteOne({ _id: req.params.id })

    return res.status(200).json({ message: 'Project deleted successfully' })
})

export default router
