import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-markdown') || id.includes('react-syntax-highlighter') || id.includes('remark-gfm')) return 'markdown';
            if (id.includes('lucide-react') || id.includes('framer-motion')) return 'ui';
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom') || id.includes('@tanstack')) return 'vendor';
          }
        }
      }
    }
  }
})