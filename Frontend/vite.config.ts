import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'lucide-react',
      '@monaco-editor/react',
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'axios',
    ],
    exclude: ['monaco-editor'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Group all node_modules into fewer chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('monaco-editor')) {
              return 'monaco';
            }
            if (id.includes('framer-motion') || id.includes('recharts')) {
              return 'ui-libs';
            }
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    target: 'esnext',
    minify: 'esbuild',
  },
  server: {
    hmr: {
      overlay: false,
    },
  },
});
