import 'dotenv/config'
import chokidar from 'chokidar'
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    ListObjectsV2Command,
    DeleteObjectCommand
} from '@aws-sdk/client-s3'

import fs from 'fs'
import path from 'path'

// ─── Config ───────────────────────────────────────────────────────────────────

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
})

const PROJECT_ID = process.env.PROJECT_ID
const BUCKET     = 'inkz-s3'
const LOCAL_DIR  = '/workspace'

/** Paths/patterns to completely ignore (local watcher + uploads) */
const IGNORE_PATTERNS = ['node_modules', '.env', '.git']

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns true if the given absolute local path should be ignored.
 */
function shouldIgnore(localPath) {
    const rel = path.relative(LOCAL_DIR, localPath)
    const parts = rel.split(path.sep)
    return IGNORE_PATTERNS.some(p => parts.some(part => part === p || part.startsWith(p)))
}

/**
 * Converts an absolute local path to an S3 key with projectid prefix.
 * e.g. /workspace/src/index.js  →  <PROJECT_ID>/src/index.js
 */
function localPathToS3Key(localPath) {
    const rel = path.relative(LOCAL_DIR, localPath)
    return `${PROJECT_ID}/${rel.replace(/\\/g, '/')}`
}

/**
 * Converts an S3 key to an absolute local path.
 * e.g. <PROJECT_ID>/src/index.js  →  /workspace/src/index.js
 */
function s3KeyToLocalPath(s3Key) {
    const rel = s3Key.slice(`${PROJECT_ID}/`.length)
    return path.join(LOCAL_DIR, rel)
}

/** Converts a Node.js Readable stream to a Buffer */
function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = []
        stream.on('data', chunk => chunks.push(chunk))
        stream.on('end',  ()    => resolve(Buffer.concat(chunks)))
        stream.on('error', reject)
    })
}

// ─── S3 Operations ───────────────────────────────────────────────────────────

/**
 * Uploads a single local file to S3 under the projectid prefix.
 */
async function uploadFile(localPath) {
    if (shouldIgnore(localPath)) return

    const key     = localPathToS3Key(localPath)
    const content = await fs.promises.readFile(localPath)

    await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: content }))
    console.log(`[UPLOAD] ${localPath} → s3://${BUCKET}/${key}`)
}

/**
 * Deletes the S3 object that corresponds to a local path.
 */
async function deleteFile(localPath) {
    const key = localPathToS3Key(localPath)
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
    console.log(`[DELETE] s3://${BUCKET}/${key}`)
}

/**
 * Downloads a single S3 object and writes it to the local filesystem.
 */
async function downloadFile(s3Key) {
    const localPath = s3KeyToLocalPath(s3Key)
    const dir       = path.dirname(localPath)

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    const res  = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: s3Key }))
    const data = await streamToBuffer(res.Body)

    fs.writeFileSync(localPath, data)
    console.log(`[DOWNLOAD] s3://${BUCKET}/${s3Key} → ${localPath}`)
}

/**
 * Lists all S3 objects under the projectid prefix.
 * Returns an array of S3 key strings.
 */
async function listS3Files() {
    const keys = []
    let token  = undefined

    do {
        const res = await s3.send(new ListObjectsV2Command({
            Bucket:            BUCKET,
            Prefix:            `${PROJECT_ID}/`,
            ContinuationToken: token
        }))

        if (res.Contents) keys.push(...res.Contents.map(obj => obj.Key))
        token = res.IsTruncated ? res.NextContinuationToken : undefined
    } while (token)

    return keys
}

/**
 * Recursively collects all local file paths under LOCAL_DIR, excluding ignored paths.
 */
function collectLocalFiles(dir = LOCAL_DIR) {
    const results = []

    if (!fs.existsSync(dir)) return results

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name)
        if (shouldIgnore(fullPath)) continue

        if (entry.isDirectory()) {
            results.push(...collectLocalFiles(fullPath))
        } else {
            results.push(fullPath)
        }
    }

    return results
}

// ─── Initial Sync ────────────────────────────────────────────────────────────

/**
 * Performs the initial sync on startup:
 *   - If S3 has files for this project → download them all to LOCAL_DIR
 *   - If S3 is empty for this project  → upload all local files (except ignored)
 */
async function initialSync() {
    console.log(`[INIT] Starting initial sync for project: ${PROJECT_ID}`)

    const s3Keys = await listS3Files()

    if (s3Keys.length > 0) {
        console.log(`[INIT] Found ${s3Keys.length} file(s) in S3. Downloading to ${LOCAL_DIR}...`)
        await Promise.all(s3Keys.map(key => downloadFile(key)))
        console.log('[INIT] Download complete.')
    } else {
        const localFiles = collectLocalFiles()

        if (localFiles.length === 0) {
            console.log('[INIT] No local files and no S3 files. Starting fresh.')
            return
        }

        console.log(`[INIT] S3 is empty. Uploading ${localFiles.length} local file(s)...`)
        await Promise.all(localFiles.map(f => uploadFile(f)))
        console.log('[INIT] Upload complete.')
    }
}

// ─── Chokidar Watcher ────────────────────────────────────────────────────────

/**
 * Starts the chokidar watcher on LOCAL_DIR and syncs changes to S3.
 */
function startWatcher() {
    console.log(`[WATCH] Watching ${LOCAL_DIR} for changes...`)

    const watcher = chokidar.watch(LOCAL_DIR, {
        persistent:       true,
        ignoreInitial:    true,   // initial files handled by initialSync()
        awaitWriteFinish: {
            stabilityThreshold: 500,
            pollInterval:       100
        },
        ignored: (filePath) => {
            if (filePath === LOCAL_DIR) return false
            return shouldIgnore(filePath)
        }
    })

    watcher.on('add',    async (filePath) => {
        try { await uploadFile(filePath) }
        catch (err) { console.error(`[ERROR] add ${filePath}:`, err.message) }
    })

    watcher.on('change', async (filePath) => {
        try { await uploadFile(filePath) }
        catch (err) { console.error(`[ERROR] change ${filePath}:`, err.message) }
    })

    watcher.on('unlink', async (filePath) => {
        try { await deleteFile(filePath) }
        catch (err) { console.error(`[ERROR] unlink ${filePath}:`, err.message) }
    })

    watcher.on('error', (err) => console.error('[WATCHER ERROR]', err.message))

    return watcher
}

// ─── Entry Point ─────────────────────────────────────────────────────────────

async function main() {
    if (!PROJECT_ID)                        throw new Error('PROJECT_ID env var is not set')
    if (!process.env.AWS_ACCESS_KEY_ID)     throw new Error('AWS_ACCESS_KEY_ID env var is not set')
    if (!process.env.AWS_SECRET_ACCESS_KEY) throw new Error('AWS_SECRET_ACCESS_KEY env var is not set')
    if (!process.env.AWS_REGION)            throw new Error('AWS_REGION env var is not set')

    await initialSync()
    startWatcher()
}

main().catch(err => {
    console.error('[FATAL]', err.message)
    process.exit(1)
})
