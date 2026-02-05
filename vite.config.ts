import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Provide default API URL if env var is not set
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL || 'https://bitcoin-ordinals-backend-production.up.railway.app'
    ),
  },
  server: {
    port: 5174, // Different port than main project
  },
})
