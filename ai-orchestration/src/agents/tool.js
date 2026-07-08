import axios from "axios";
import {tool} from "langchain"
import fs from 'fs'
import z from "zod"



export const listfiles=tool(
    async ({})=>{
        console.log("===============");
        console.log("list file tool called"); 
        console.log("===============");
        
        const res = await axios.get("http://sandbox-service-019f4129-8a4e-7288-9a75-248ffc3b637b:3000/list-files")
       console.log("===============");
        console.log(res.data.elements); 
        console.log("===============");

        return JSON.stringify(res.data.elements)
    },
    {
        name:'listfiles',
        description:'list the files in the working directory , this is usefull to understanding project structure or location of the files'
        ,schema:z.object({
            
        })
    }
)


export const readfile=tool(
    async (input)=>{
        console.log("===============");
        console.log("read file tool called with input:", input); 
        console.log("===============");
        const files = input.files;
        try {
            const res = await axios.get("http://sandbox-service-019f4129-8a4e-7288-9a75-248ffc3b637b:3000/read-file?files="+files.join(","))
            console.log("===============");
            console.log(res.data.content); 
            console.log("===============");
            return JSON.stringify(res.data)
        } catch (error) {
            console.error("Error in readfile tool:", error.response ? error.response.data : error.message);
            return JSON.stringify({ error: error.response ? error.response.data : error.message, status: "error" });
        }
    },
    {
        name:'readfile',
        description:'read the content of the file and req in files in query parameter and return their content as a json object'
        ,schema:z.object({
            files:z.array(z.string()).describe("files to be read must be json array of the strings")
        })
    }
)

export const updatefile=tool(
    async (input)=>{
        console.log("===============");
        console.log("update file tool called with input:", input); 
        console.log("===============");
        const updates = input.updates;
        try {
            const res = await axios.patch("http://sandbox-service-019f4129-8a4e-7288-9a75-248ffc3b637b:3000/update-files",{
                updates:updates
            })
            console.log("===============");
            console.log(res.data); 
            console.log("===============");
            return JSON.stringify(res.data)
        } catch (error) {
            console.error("Error in updatefile tool:", error.response ? error.response.data : error.message);
            return JSON.stringify({ error: error.response ? error.response.data : error.message, status: "error" });
        }
    },
    {
        name:'updatefile',
        description:'update the content of the file and req in files in body parameter req boys is json array of the objects with keys filename and content'
        ,schema:z.object({
            updates:z.array(z.object({
                filename:z.string().describe("filename to be updated"),
                content:z.string().describe("content of the file")
            })).describe("files to be updated must be json array of the objects with keys filename and content")
        })
    }
)


export const createFile=tool(
    async (input)=>{
        console.log("===============");
        console.log("create file tool called with input:", input); 
        console.log("===============");
        const files = input.files;
        try {
            const res = await axios.post("http://sandbox-service-019f4129-8a4e-7288-9a75-248ffc3b637b:3000/create-files",{
                  files:files
            })
            console.log("===============");
            console.log(res.data); 
            console.log("===============");
            return JSON.stringify(res.data)
        } catch (error) {
            console.error("Error in createFile tool:", error.response ? error.response.data : error.message);
            return JSON.stringify({ error: error.response ? error.response.data : error.message, status: "error" });
        }
    },
    {
        name:'createFile',
        description:'create a new file in the working directory with the given filename and content and if it need in folder then create also in folder and also create folder also '  
        ,schema:z.object({
          files:z.array(z.object({
            filename:z.string().describe("filename to be created"),
            content:z.string().describe("content of the file")
          })).describe("files to be created must be json array of the objects with keys filename and content")
        })
    }
)




























