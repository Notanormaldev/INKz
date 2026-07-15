import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      // Proxy /api/* to the nginx ingress controller on localhost (using IPv4 loopback)
      '/api': {
        target: 'http://127.0.0.1',
        changeOrigin: true,
      }
    }
  }
})
