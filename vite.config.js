import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        admin: resolve(import.meta.dirname, 'admin.html')
      }
    }
  },
  server: {
    port: 3001,
    host: '0.0.0.0',
    strictPort: true,
    proxy: {
      '/api/seismicid': {
        target: 'https://www.seismicid.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/seismicid/, '/api'),
        secure: false
      }
    }
  },
  preview: {
    port: 3001,
    host: '0.0.0.0',
    strictPort: true
  }
});
