import express from "express"
import morgan from "morgan"
import fs from 'fs'

const app=express()
app.use(express.json())
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: true }))


const WORKING_DIR='/workspace'


app.get('/',(req,res)=>{
    res.status(200).json({
        message:"Hello from sandbox agent",
        status:"success"
    })
})
app.get('/list-files',async (req,res)=>{
   const elements = await fs.promises.readdir(WORKING_DIR);
    
   res.status(200).json({
    message:"elements in the working directory",
    elements
   })
})

export default app    