import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Esto permitirá que se acceda desde otras IPs en la red local
    port: 5173,      // puerto 
  }
})
