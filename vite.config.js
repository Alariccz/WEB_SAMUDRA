import { defineConfig } from 'vite';
import { resolve } from 'path';
import os from 'os';

const VIRTUAL_IFACE_PATTERN = /vmware|vmnet|virtualbox|vbox|vethernet|hyper-v|wsl|docker|loopback|tailscale|zerotier/i;

/**
 * Returns the machine's primary physical LAN IPv4 address so mobile devices on
 * the same network can resolve QR download links opened from localhost.
 */
function getLanIpv4() {
  const interfaces = os.networkInterfaces();
  const candidates = [];
  for (const [name, addrs] of Object.entries(interfaces)) {
    for (const addr of addrs || []) {
      if (addr.family === 'IPv4' && !addr.internal) {
        candidates.push({
          address: addr.address,
          isVirtual: VIRTUAL_IFACE_PATTERN.test(name)
        });
      }
    }
  }
  const physical = candidates.find((c) => !c.isVirtual);
  return (physical || candidates[0])?.address || null;
}

function attachLanOriginMiddleware(middlewares) {
  middlewares.use('/downloads', (req, res, next) => {
    const cleanPath = (req.url || '').split('?')[0];
    if (cleanPath.toLowerCase().endsWith('.apk')) {
      const filename = decodeURIComponent(cleanPath.split('/').pop() || 'app.apk').replace(/"/g, '');
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    }
    next();
  });

  middlewares.use('/__lan-origin.json', (req, res) => {
    const lanIp = getLanIpv4();
    const hostHeader = req.headers.host || 'localhost:3001';
    const portMatch = hostHeader.match(/:(\d+)$/);
    const port = portMatch ? portMatch[1] : '3001';
    const proto = req.socket?.encrypted ? 'https' : 'http';
    const origin = lanIp ? `${proto}://${lanIp}:${port}` : null;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify({ origin, ip: lanIp }));
  });
}

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
        attachLanOriginMiddleware(server.middlewares);
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
      },
      configurePreviewServer(server) {
        attachLanOriginMiddleware(server.middlewares);
      }
    }
  ]
});
