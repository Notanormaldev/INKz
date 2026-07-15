import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
    hmr: {
      clientPort: 80
    }
  },
  watch:{
    usePolling: true,
    interval:300,
    ignored:["node_modules"] 
  }
})
