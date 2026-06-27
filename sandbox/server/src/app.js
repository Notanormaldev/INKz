import express, { urlencoded } from 'express'
import morgan from "morgan"


const app = express()

app.use(express.json())
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: true }))

app.get('/api/sandbox/health', (req, res) => {
    return res.status(200).json({
        message: "Sandbox api is healthy",
        status:'ok'
    })
})

export default app