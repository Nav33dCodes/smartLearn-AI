import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          markdown: ['react-markdown', 'react-syntax-highlighter', 'remark-gfm'],
          ui: ['lucide-react', 'framer-motion'],
          vendor: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
        }
      }
    }
  }
})