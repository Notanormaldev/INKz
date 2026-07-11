import { Router } from "express";
import codingagent from "../agents/code.agent.js";

const agentrouter = Router()


agentrouter.post('/invoke',async (req,res)=>{
    try {
        const {message,projectid}=req.body
        const response = await codingagent.stream({messages:[{
            role:"user",
            content:message
        }]},{
            configurable:{projectid},
            streamMode:"custom"
        });

        for await (const chunk of response){
           console.log(chunk);    
        }
        res.json({response})
    } catch (error) {
        console.error("error invoking the agent",error)
        res.status(500).json({error})
    }
})


export default agentrouter