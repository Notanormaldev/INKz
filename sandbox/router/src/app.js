import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware';
import morgan from 'morgan';
const app = express();

app.use(morgan("combined"))


app.get('/api/status/healthz', (req, res) => {
    return res.json({
        message: "router is healthy"
    })
})
app.get('/api/status/readyz', (req, res) => {
    res.json({
        message: "router is ready"
    })
})
const proxies={}



function getproxy(sandboxid){

    const target = `http://sandbox-service-${sandboxid}`;
   
    if(!proxies[sandboxid]){
        proxies[sandboxid] = createProxyMiddleware({
            target,
            changeOrigin: true,
            ws: true,
        });
    }
    
    return proxies[sandboxid];
}

const agentproxies={}
function getagentproxy(sandboxid){
       const target = `http://sandbox-service-${sandboxid}:3000`;

        if(!agentproxies[sandboxid]){
        agentproxies[sandboxid] = createProxyMiddleware({
            target,
            changeOrigin: true,
            ws: true,
        });
    }
    
    return proxies[sandboxid];
   
}

app.use((req, res, next) => {
    const host = req.headers.host

    const sandboxid = host.split('.')[0]


    if(host.split('.')[1]=="agent"){

        return getagentproxy(sandboxid)(req,res,next);
    }else{

        return getproxy(sandboxid)(req,res,next);
    }

})

export default app;


