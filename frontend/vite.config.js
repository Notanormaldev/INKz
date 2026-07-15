import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      // 1. Proxy agent API requests (e.g., /agent-api/{sandboxId}/list-files)
      '/agent-api': {
        target: 'http://127.0.0.1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/agent-api\/[^/]+/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            const originalUrl = req.originalUrl || req.url;
            const match = originalUrl.match(/^\/agent-api\/([^/]+)/);
            if (match && match[1]) {
              proxyReq.setHeader('Host', `${match[1]}.agent.localhost`);
            }
          });
        }
      },
      // 2. Proxy standard /api/sandbox requests
      '/api': {
        target: 'http://127.0.0.1',
        changeOrigin: true,
      },
      // 3. Proxy Socket.IO websocket terminal requests
      '/socket.io': {
        target: 'http://127.0.0.1',
        changeOrigin: true,
        ws: true,
        configure: (proxy, _options) => {
          const setHostHeader = (proxyReq, req) => {
            const url = new URL(req.url, 'http://localhost');
            const sandboxId = url.searchParams.get('sandboxId');
            if (sandboxId) {
              proxyReq.setHeader('Host', `${sandboxId}.agent.localhost`);
            }
          };
          proxy.on('proxyReq', setHostHeader);
          proxy.on('proxyReqWs', setHostHeader);
        }
      }
    }
  }
})
