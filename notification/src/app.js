import express from 'express'
import morgan from 'morgan'

const app = express()

app.use(morgan("dev"))
app.use(express.json())
app.get('/api/noti/health', (req, res) => {
    res.json({ message: "Notification Service is Running" })
})

export default app