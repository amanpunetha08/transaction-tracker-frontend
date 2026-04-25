import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // All /api/ and /auth/ requests are forwarded to Django
      "/api": "http://127.0.0.1:8000",
      "/auth": "http://127.0.0.1:8000",
    },
  },
})
