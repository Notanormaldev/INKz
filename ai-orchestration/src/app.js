import express from "express"
import morgan from "morgan"
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

import agentrouter from "./routes/agents.route.js"

const app = express();

// Security headers
app.use(helmet())

// Rate limiter for AI endpoint (60 requests per 15 min window per IP)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { message: 'Too many AI requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(express.json())
app.use(morgan("dev"))
app.use("/api/ai/health",(req,res)=>{
    return res.status(200).json({
        message:"AI server orchestration is healthy",
        status:"ok"
    })
})
app.use("/api/ai", aiLimiter, agentrouter)

export default app;