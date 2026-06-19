import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Warn if any single chunk exceeds 800kb
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // React core — must be loaded first, keep lean
          if (id.includes('react-dom') || id.includes('react-router-dom')) return 'vendor-react';
          if (id.includes('/react/') && !id.includes('react-dom')) return 'vendor-react';

          // Heavy AI/Code editor — only used in /app, lazy load
          if (id.includes('@codemirror') || id.includes('codemirror')) return 'chunk-editor';
          if (id.includes('@sandpack') || id.includes('sandpack')) return 'chunk-sandpack';

          // Mind map / graph — only used when a mindmap is rendered
          if (id.includes('@xyflow') || id.includes('reactflow')) return 'chunk-reactflow';
          if (id.includes('dagre')) return 'chunk-dagre';

          // Markdown rendering — only needed in ChatWindow
          if (id.includes('react-markdown') || id.includes('remark') || id.includes('rehype') || id.includes('react-syntax-highlighter')) return 'chunk-markdown';

          // Animations — framer-motion is large, isolate it
          if (id.includes('framer-motion')) return 'chunk-motion';

          // Icons — lucide is tree-shakable but still benefits from isolation
          if (id.includes('lucide-react')) return 'chunk-icons';

          // Everything else from node_modules
          return 'vendor-misc';
        }
      }
    }
  }
})