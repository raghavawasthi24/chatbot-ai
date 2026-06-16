import { defineConfig } from 'vite';
import { svelte }       from '@sveltejs/vite-plugin-svelte';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],

  server: {
    port: 5173,
    proxy: {
      // Proxy API calls to the Express backend in dev
      '/chat':   { target: 'http://localhost:3000', changeOrigin: true },
      '/health': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },

  build: {
    // Relative asset paths so the build can be served from any sub-path
    assetsDir: 'assets',
    sourcemap: true,
  },
});
