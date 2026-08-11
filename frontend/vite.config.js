import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig(({ command }) => {
  const keyPath = path.resolve(__dirname, '../cert/key.pem')
  const certPath = path.resolve(__dirname, '../cert/cert.pem')
  const hasCerts = fs.existsSync(keyPath) && fs.existsSync(certPath)

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      ...(command === 'serve' && hasCerts
        ? {
            https: {
              key: fs.readFileSync(keyPath),
              cert: fs.readFileSync(certPath),
            },
          }
        : {}),
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
