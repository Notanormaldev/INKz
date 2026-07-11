import { Router } from "express";
import codingagent from "../agents/code.agent.js";

const agentrouter = Router()


agentrouter.post('/invoke',async (req,res)=>{
    try {
        const {message,projectid}=req.body
        const response = await codingagent.invoke({messages:[{
            role:"user",
            content:message
        }]},{
            context:{projectid}
        });
        res.json({response})
    } catch (error) {
        console.error("error invoking the agent",error)
        res.status(500).json({error})
    }
})


export default agentrouter