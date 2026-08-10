import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '../cert/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '../cert/cert.pem')),
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
