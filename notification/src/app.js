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
            const {to,subject,text,html} = content
            await sendEmail({
                to,
                subject,
                textContent:text,
                htmlContent:html
            })
          check.ack(msg)
            
        } catch (error) {
            console.error("Error processing",error)
        }
        

        
     }else{
        console.log("Received null message");
        
     }
})


export default app