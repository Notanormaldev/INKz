import express from "express"
import morgan from "morgan"
import fs from 'fs'
import path from 'path'

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

/**
 *@route:GET /list-files
 *@description:list the files in the working directory also ignore .git , node_modules and dist , we need also folder in file not a only folder or file name if folder have files when we need folder/file1 folder/file2
 *@returns {Object} :list of the files in the working directory
 *-eg.{
    message:"elements in the working directory",
    elements:[
        "file1.txt",
        "file2.txt",
        "src/file3.txt",
        "src/app.jsx",
        "public/hii.png"
    ]
 }
*/

// Helper function to recursively read files in a directory (ignoring specific folders)
async function getAllFiles(dirPath, originalDir = dirPath) {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    const files = await Promise.all(entries.map(async (entry) => {
        if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist') {
            return [];
        }
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            return getAllFiles(fullPath, originalDir);
        } else {
            return path.relative(originalDir, fullPath).replace(/\\/g, '/');
        }
    }));
    return files.flat();
}

app.get('/list-files',async (req,res)=>{
    try {
        const elements = await getAllFiles(WORKING_DIR);
        res.status(200).json({
         message:"elements in the working directory",
         elements:elements
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "error listing files",
            status: "error"
        })
    }
})



/*
 *@route  : get /read-file
 *@description :reads the content of the all file and req in files in query parameter and return their content as a json object
 *@returns {Object} :content of the file as a key value pair where key is the filename and value is the content of the file
 -eg. : read-files?files=file1.txt,file2.txt,src/file3.txt

*/
app.get('/read-file',async (req,res)=>{
    const {files}=req.query
    if(!files){
        return res.status(400).json({
            message:"files are required",
            status:"error"
        })
    }

   
    const filelist=files.split(',')
    const content={}
    
    await Promise.all(filelist.map(async (file)=>{
        let filepath = `${WORKING_DIR}/${file}`
        try {
            let fileContent=await fs.promises.readFile(filepath,'utf-8')
            fileContent=fileContent.split('\n')
            content[file]=fileContent
        } catch (error) {
            console.error(error)
            return res.status(500).json({
                message:`error reading ${file}`,
                status:"error"
            })
        }
    }))
    res.status(200).json({
        message:"content of the file",
        content
    })
})


/**
 *@route : Patch /update-files
 *@description : update the content of the file and req in files in body parameter req boys is json array of the objects with keys filename and content
 -eg. : 
   body:{
        updates:[
            {
                "filename":"file1.txt",
                "content":"new content"
            },
            {
                "filename":"file2.txt",
                "content":"new content"
            },
            {
                "filename":"src/file3.txt",
                "content":"new content"
            }
        ]
   }
*/

app.patch('/update-files',async (req,res)=>{
    const {updates}=req.body
    if(!updates || !Array.isArray(updates) || updates.length===0){
        return res.status(400).json({
            message:"updates are required",
            status:"error"
        })
    }

    await Promise.all(updates.map(async (update)=>{
        let filepath = `${WORKING_DIR}/${update.filename}`
        try {
            await fs.promises.writeFile(filepath,update.content)
        } catch (error) {
            console.error(error)
            return res.status(500).json({
                message:`error writing ${update.filename}`,
                status:"error"
            })
        }
    }))
    res.status(200).json({
        message:"files updated successfully",
        status:"success"
    })
})

/*
@route:Post /create-file
@description:create a new file in the working directory with the given filename and content and if it need in folder then create also in folder and also create folder also 
@returns: {Object} :message of the file creation
-eg. : 
  body:{
       "filename":"file1.txt",
       "content":"new content"
  }
*/



app.post('/create-files',(req,res)=>{
    const {files}=req.body  
    files.map(async (file)=>{
      let filepath = `${WORKING_DIR}/${file.filename}`
      try {
        await fs.promises.mkdir(path.dirname(filepath), { recursive: true })
        await fs.promises.writeFile(filepath,file.content)
      } catch (error) {
        console.error(error)
        res.status(500).json({
            message:`error creating ${file.filename}`,
            status:"error"
        })
      }
    })

    res.status(200).json({
        message:"files created successfully",
        status:"success"
    })
})

export default app    