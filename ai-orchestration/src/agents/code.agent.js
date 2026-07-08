import dotenv from "dotenv"
dotenv.config()
import { ChatMistralAI } from "@langchain/mistralai"
import { listfiles, createFile, updatefile, readfile } from "./tool.js"
import { createAgent } from "langchain"
import { INKZ_SYSTEM_PROMPT } from "./prompt.js"


const model = new ChatMistralAI({
    model: "mistral-medium-latest",
    apiKey: process.env.MISTRAL_API_KEY
})


const agent = (createAgent({
    model,
    tools: [listfiles, createFile, updatefile, readfile],
    systemPrompt: INKZ_SYSTEM_PROMPT
})).withConfig({
    recursionLimit: 200
})


export default agent