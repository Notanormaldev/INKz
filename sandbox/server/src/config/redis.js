import Redis from 'ioredis'
import { deletepod } from '../kubernetes/pod.js';
import { deleteservice } from '../kubernetes/service.js';

const redis = new Redis(process.env.REDIS_URL);
const subscriber = new Redis(process.env.REDIS_URL);

export async function createsandboxkey(sandboxid){
    await redis.set(`sandbox:${sandboxid}`,JSON.stringify({
        status:"active"
    }),"EX",120);
}


subscriber.config("SET",'notify-keyspace-events',"Ex");
subscriber.subscribe("__keyevent@0__:expired");

subscriber.on("message",async(channel,key)=>{
    console.log(`Key expired: ${key}`);
    const sandboxid = key.split(':')[1];

    await deletepod(sandboxid)
    await deleteservice(sandboxid)
})


export default{ subscriber } 