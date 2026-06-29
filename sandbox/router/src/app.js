import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware';
import morgan from 'morgan';
const app= express();

app.use(morgan("combined"))


app.get('/api/status/healthz',(req,res)=>{
    return res.json({
        message:"router is healthy"
    })
})
app.get('/api/satus/readyz',(req,res)=>{
    res.json({
        message:"router is ready"
    })
})
app.use((req,res,next)=>{
    const host = req.headers.host

    const sandboxId = host.split('.')[0]

    const target =`http://sandbox-service-${sandboxId}`;

    return createProxyMiddleware({
        target,
        changeOrigin: true,
        ws: true,

    })(req,res,next);
})

export default app;