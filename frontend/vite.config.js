import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBase = env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  return {
    plugins: [react()],
    define: {
      // make it available as import.meta.env.VITE_API_BASE_URL at build time
    },
    server: {
      watch: {
        usePolling: true,
        interval: 1000,
      },
      proxy: {
        '/health': apiBase,
        '/imaging-sites': apiBase,
        '/sample-pairs': apiBase,
        '/moon-texture': apiBase,
        '/register': apiBase,
        '/results': apiBase,
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
  };
});
