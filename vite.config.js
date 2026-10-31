import { defineConfig } from 'vite';

export default defineConfig({
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
