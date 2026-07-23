import amqplib from "amqplib";

const QUEUE = 'auth_notification_queue';

const connection = await amqplib.connect(process.env.AMQP_URL)

const channel = await connection.createChannel()

channel.assertQueue(QUEUE,{durable:true});


export default channel

