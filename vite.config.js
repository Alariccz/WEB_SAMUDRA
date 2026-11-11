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
  },
  plugins: [
    {
      name: 'admin-spa-rewrite',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const path = (req.url || '').split('?')[0];
          if (
            path === '/auth/callback' ||
            path.startsWith('/auth/callback') ||
            path === '/dashboard' ||
            path.startsWith('/dashboard') ||
            path === '/login' ||
            path.startsWith('/login')
          ) {
            req.url = '/admin.html' + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '');
          }
          next();
        });
      }
    }
  ]
});
