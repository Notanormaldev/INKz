import { Router } from "express";
import { createpod } from '../kubernetes/pod.js'
import { createservice } from '../kubernetes/service.js'
import {v7 as uuid} from 'uuid'
import { createsandboxkey } from '../config/redis.js'
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router()



router.post('/api/sandbox/start',authMiddleware,async (req,res)=>{
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

export default router