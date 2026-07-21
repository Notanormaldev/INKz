import express, { urlencoded } from 'express'
import morgan from "morgan"
import { createpod } from './kubernetes/pod.js'
import { createservice } from './kubernetes/service.js'
import {v7 as uuid}from 'uuid'
import { createsandboxkey } from './config/redis.js'

const app = express()

app.use(express.json())
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: true }))

app.get('/api/sandbox/health', (req, res) => {
    return res.status(200).json({
        message: "Sandbox api is healthy",
        status:'ok'
    })
})
app.post('/api/sandbox/start',async (req,res)=>{
  const sandboxid= uuid()
  await Promise.all([
    createpod(sandboxid),
    createservice(sandboxid),
    createsandboxkey(sandboxid),
  ])
  return res.status(201).json({
    message:"Sandbox created successfully",
    sandboxid:sandboxid,
    preview:`http://${sandboxid}.preview.localhost`

  })
})
export default app