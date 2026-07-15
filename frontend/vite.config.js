import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      // Proxy /api/* to the nginx ingress controller's external IP
      // (ingress-nginx LoadBalancer EXTERNAL-IP from: kubectl get svc -n ingress-nginx)
      '/api': {
        target: 'http://172.18.0.2',
        changeOrigin: true,
      }
    }
  }
})
