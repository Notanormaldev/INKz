import express from 'express'
import morgan from 'morgan'
import channel from './mq.js'
import sendEmail from './email.js'
const app = express()

app.use(morgan("dev"))
app.use(express.json())
app.get('/api/notification/health', (req, res) => {
    res.json({ message: "Notification Service is Running" })
})

channel.consume('auth_notification_queue',async (msg)=>{
     if(msg !== null){
        const content = JSON.parse(msg.content.toString())
        console.log("Received message :",content);

        try {
            const {userId,email,timestamp} = content

            const subject = "New login detected"
            const text = `A New login detected at this time ${timestamp}`
            const html = `<p>A New login detected at this time ${timestamp}</p><p>If you didn't login at this time please change your password</p><p>Thanks Team INKz</p>`
            await sendEmail({
                to:email,
                subject,
                textContent:text,
                htmlContent:html
            })
          channel.ack(msg)
            
        } catch (error) {
            console.error("Error processing",error)
        }
        

        
     }else{
        console.log("Received null message");
        
     }
})


export default app