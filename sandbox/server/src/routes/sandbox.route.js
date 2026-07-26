import { Router } from "express";
import { createpod } from '../kubernetes/pod.js'
import { createservice } from '../kubernetes/service.js'
import {v7 as uuid} from 'uuid'
import { createsandboxkey } from '../config/redis.js'
import { authMiddleware } from "../middleware/auth.middleware.js";
import Project from "../models/project.model.js";

const router = Router()

router.post('/project',authMiddleware,async (req,res)=>{
   const {title} = req.body
   
   if(!title){
    return res.status(400).json({message:"Title is required"})
   }
   const project = await Project.create({title,user:req.user.id})
   return res.status(201).json({message:"Project created successfully",project})
})

router.get('/projects',authMiddleware,async (req,res)=>{
   const projects = await Project.find({user:req.user.id})
   return res.status(200).json({projects})
})

router.post('/start',authMiddleware,async (req,res)=>{

   const projectid = req.body.projectid

   if(!projectid){
    return res.status(400).json({message:"Project ID is required"})
   }
  
   const project = await Project.findOne({_id:projectid,user:req.user.id})
   if(!project){
    return res.status(404).json({message:"Project not found"})
   }

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