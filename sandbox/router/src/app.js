import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware';
import morgan from 'morgan';
import httpProxy from 'http-proxy';
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

const wsProxy = httpProxy.createProxyServer({
    changeOrigin: true,
    ws: true
});

wsProxy.on('error', (err, req, socket) => {
    console.error('[Router] WS Proxy error:', err.message);
    if (socket && socket.destroy) {
        socket.destroy();
    }
});

export async function setupWebSocketProxy(server) {
    server.on('upgrade', async (req, socket, head) => {
        const host = req.headers.host;
        console.log(`[Router] Received upgrade request for host: ${host}, url: ${req.url}`);
        if (!host) {
            console.log('[Router] Rejecting upgrade: No host header');
            socket.destroy();
            return;
        }
        const parts = host.split('.');
        const sandboxid = parts[0];
        await refreshTTL(sandboxid);
        let target;
        if (parts[1] === "agent") {
            target = `http://sandbox-service-${sandboxid}:3000`;
        } else {
            target = `http://sandbox-service-${sandboxid}:80`;
        }

        console.log(`[Router] Proxying websocket upgrade to target: ${target}`);
        wsProxy.ws(req, socket, head, { target });
    });
}

export default app;


