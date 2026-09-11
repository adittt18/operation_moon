import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
      interval: 1000,
    },
    proxy: {
      '/health': 'http://127.0.0.1:8000',
      '/imaging-sites': 'http://127.0.0.1:8000',
      '/sample-pairs': 'http://127.0.0.1:8000',
      '/moon-texture': 'http://127.0.0.1:8000',
      '/register': 'http://127.0.0.1:8000',
      '/results': 'http://127.0.0.1:8000',
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          three: ['three'],
          icons: ['lucide-react'],
        },
      },
    },
  },
});