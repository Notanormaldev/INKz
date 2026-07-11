import axios from "axios";
import {tool} from "langchain"
import fs from 'fs'
import z from "zod"



export const listfiles=tool(
    async ({},config)=>{

      const writer=config.writer

      writer("working in directory(watching files) :\n",config.context.projectid)

    
        const res = await axios.get(`http://sandbox-service-${config.context.projectid}:3000/list-files`)
      
        writer("files listed sucessfully",res.data.elements)

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
    async (input,config)=>{


        const writer=config.writer

        writer("files you asked to read are \n",JSON.stringify(input.files,null,2))

        const files = input.files;
        try {
            const res = await axios.get(`http://sandbox-service-${config.context.projectid}:3000/read-file?files=`+files.join(","))
            writer("files read sucessfully\n",JSON.stringify(res.data,null,2))
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
    async (input,config)=>{
        const writer=config.writer
        writer("files you asked to update are \n",JSON.stringify(input.updates,null,2))
        const updates = input.updates;
        try {
            const res = await axios.patch(`http://sandbox-service-${config.context.projectid}:3000/update-files`,{
                updates:updates
            })
            writer("files updated sucessfully\n",JSON.stringify(res.data,null,2))
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
    async (input,config)=>{
        const writer=config.writer
        writer("files you asked to create are \n",JSON.stringify(input.files,null,2))
        const files = input.files;
        try {
            const res = await axios.post(`http://sandbox-service-${config.context.projectid}:3000/create-files`,{
                  files:files
            })
            writer("files created sucessfully\n",JSON.stringify(res.data,null,2))
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




























