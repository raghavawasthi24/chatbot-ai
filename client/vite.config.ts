import { defineConfig, loadEnv } from 'vite';
import { svelte }                from '@sveltejs/vite-plugin-svelte';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env        = loadEnv(mode, process.cwd(), '');
  const backendUrl = env.VITE_BACKEND_URL ?? 'http://localhost:3000';

  return {
    plugins: [svelte()],

    server: {
      port: 5173,
      proxy: {
        // Proxy API calls to the Express backend in dev
        '/chat':   { target: backendUrl, changeOrigin: true },
        '/health': { target: backendUrl, changeOrigin: true },
      },
    },

    build: {
      // Relative asset paths so the build can be served from any sub-path
      assetsDir: 'assets',
      sourcemap: true,
    },
  };
});
