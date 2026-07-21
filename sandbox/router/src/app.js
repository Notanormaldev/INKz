import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware';
import morgan from 'morgan';
const app = express();
import { refreshTTL } from './config/redis.js';
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
const proxies = {}



function getproxy(sandboxid) {

    const target = `http://sandbox-service-${sandboxid}:80`;

    if (!proxies[sandboxid]) {
        proxies[sandboxid] = createProxyMiddleware({
            target,
            changeOrigin: true,
            ws: true,
        });
    }

    return proxies[sandboxid];
}

const agentproxies = {}
function getagentproxy(sandboxid) {
    const target = `http://sandbox-service-${sandboxid}:3000`;

    if (!agentproxies[sandboxid]) {
        agentproxies[sandboxid] = createProxyMiddleware({
            target,
            changeOrigin: true,
            ws: true,
        });
    }

    return agentproxies[sandboxid];

}

app.use((req, res, next) => {
    const host = req.headers.host

    const sandboxid = host.split('.')[0]


    if (host.split('.')[1] == "agent") {
        return getagentproxy(sandboxid)(req, res, next);
    } else {

        return getproxy(sandboxid)(req, res, next);
    }

})

import httpProxy from 'http-proxy';
import { refreshTTL } from './config/redis';

export async function setupWebSocketProxy(server) {
    server.on('upgrade',async (req, socket, head) => {
        const host = req.headers.host;
        console.log(`[Router] Received upgrade request for host: ${host}, url: ${req.url}`);
        if (!host) {
            console.log('[Router] Rejecting upgrade: No host header');
            socket.destroy();
            return;
        }
        const parts = host.split('.');
        const sandboxid = parts[0];
        await refreshTTL(sandboxid)
        let target;
        if (parts[1] === "agent") {
            target = `http://sandbox-service-${sandboxid}:3000`;
        } else {
            target = `http://sandbox-service-${sandboxid}:80`;
        }

        console.log(`[Router] Proxying websocket upgrade to target: ${target}`);
        
        const proxy = httpProxy.createProxyServer({
            target,
            changeOrigin: true,
            ws: true
        });

        proxy.ws(req, socket, head, {}, (err) => {
            console.error('[Router] WS Proxy error:', err);
            socket.destroy();
            proxy.close();
        });

        socket.on('close', () => {
            proxy.close();
        });
    });
}

export default app;


