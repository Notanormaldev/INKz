import express from 'express'
import morgan from "morgan"
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import sandboxrouter from './routes/sandbox.route.js'

const app = express()

// Security headers
app.use(helmet({
  contentSecurityPolicy: false // disabled CSP so previews and WebSocket proxies work smoothly
}))

// General API rate limiter (150 requests per 15 min window)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(express.json())
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.get('/api/sandbox/health', (req, res) => {
    return res.status(200).json({
        message: "Sandbox api is healthy",
        status:'ok'
    })
})

app.use('/api/sandbox', generalLimiter, sandboxrouter)
export default app