import { Router } from "express";
import codingagent from "../agents/code.agent.js";

const agentrouter = Router()


agentrouter.post('/invoke',async (req,res)=>{


    try {
        const {message,projectid}=req.body


        res.writeHead(200,{
          'Content-Type':"text/event-stream",
          'Cache-Control':"no-cache",
          'Connection':'keep-alive',
        })
        const response = await codingagent.stream({messages:[{
            role:"user",
            content:message
        }]},{
            configurable:{
                projectid,
                writer: (title, data) => {
                    res.write(`data: ${JSON.stringify({ title, data })}\n\n`);
                }
            },
            streamMode:"updates"
        });

        for await (const chunk of response){
           console.log(chunk);  
           res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }
        res.end();
    } catch (error) {
        console.error("error invoking the agent",error)
        if (!res.headersSent) {
            res.status(500).json({error: error.message})
        } else {
            res.write(`event: error\ndata: ${JSON.stringify({error: error.message})}\n\n`);
            res.end();
        }
    }
})


export default agentrouter