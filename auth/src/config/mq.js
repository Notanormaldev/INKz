import amqplib from "amqplib";

const QUEUE = 'auth_notification_queue';

const connection = await amqplib.connect(process.env.AMQP_URL)

const channel = await connection.createChannel()

channel.assertQueue(QUEUE,{durable:true});


export async function sendAuthnotification(message){
    channel.sendToQueue(
        QUEUE,
        Buffer.from(JSON.stringify(message)),
        {persistent:true}
    )
}
