import dotenv from "dotenv"
dotenv.config()
import {ChatMistralAI} from "@langchain/mistralai"
import { listfiles,createFile,updatefile,readfile } from "./tool.js"
import { createAgent } from "langchain"


const model = new ChatMistralAI({
    model:"mistral-medium-latest",
    apiKey:process.env.MISTRAL_API_KEY
})


const agent = createAgent({
    model,
    tools:[listfiles,createFile,updatefile,readfile],
    
    
})



const response = await agent.invoke(
    {
        messages: [
            {
                role: "user",
                content: "Get started Edit src/App.jsx and save to test HMR  just remove this text from App.jsx  "
            }
        ]
    },
    {
        recursionLimit: 100
    }
)
console.log("Agent Response:", JSON.stringify(response, null, 2));