import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/history-points-tracker/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  server: {
    port: 3000,
    open: true
  }
})
