import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true, // This will fail if port 5173 is already in use
    host: true, // Listen on all addresses
    open: true, // Automatically opens the browser on dev start
  },
  preview: {
    port: 5173,
  }
})