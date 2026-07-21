import Redis from 'ioredis'


const redis = new Redis(process.env.REDIS_URL);



redis.on("ready",()=>{
    console.log("Redis connected ready");
})

redis.on("error",(err)=>{
    console.log("Redis error",err);
})

export async function  refreshTTL(sandboxid) {
    await redis.expire(`sandbox:${sandboxid}`,120)
    
}