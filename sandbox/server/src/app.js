import express, { urlencoded } from 'express'
import morgan from "morgan"
import cookieParser from 'cookie-parser'
import sandboxrouter from './routes/sandbox.route.js'

const app = express()

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


app.use('/api/sandbox',sandboxrouter)
export default app