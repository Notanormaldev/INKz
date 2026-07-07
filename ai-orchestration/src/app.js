import express from "express"
import morgan from "morgan"



app.use(express.json())
app.use(morgan("dev"))



const app = express();
app.get("/api/ai/health",(req,res)=>{
    return res.status(200).json({
        message:"AI server orchestration is healthy",
        status:"ok"
    })
})

export default app;