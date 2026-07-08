import { Router } from "express";
import codingagent from "../agents/code.agent.js";

const agentrouter = Router()


agentrouter.post('/invoke',async (req,res)=>{
    try {
        const {message}=req.body
        const res = await codingagent.invoke({messages:[{
            role:"user",
            message:message
        }]});
        res.json({res})
    } catch (error) {
        console.error("error invoking the agent",error)
        res.status(500).json({error})
    }
})


export default agentrouter