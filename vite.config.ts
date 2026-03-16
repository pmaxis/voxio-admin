import path from 'path';
import type { Connect } from 'vite';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import http from 'node:http';
import https from 'node:https';

const API_TARGET = process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:3000';
const SERVICE_UNAVAILABLE = JSON.stringify({
  message: 'Сервер тимчасово недоступний',
});

function rewriteSetCookiePaths(cookies: string | string[] | undefined): string[] | undefined {
  if (!cookies) return undefined;
  const list = Array.isArray(cookies) ? cookies : [cookies];
  return list.map((cookie) => cookie.replace(/(;\s*[Pp]ath=)(\/)/g, '$1/api/'));
}

function silentApiProxy(): import('vite').Plugin {
  return {
    name: 'silent-api-proxy',
    configureServer(server) {
      server.middlewares.use((req: Connect.IncomingMessage, res, next) => {
        const url = req.url;
        if (!url?.startsWith('/api')) return next();

        const target = new URL(API_TARGET);
        const pathname = url.replace(/^\/api/, '') || '/';
        const search = url.includes('?') ? url.slice(url.indexOf('?')) : '';
        const mod = target.protocol === 'https:' ? https : http;

        const opts = {
          hostname: target.hostname,
          port: target.port || (target.protocol === 'https:' ? 443 : 80),
          path: pathname + search,
          method: req.method ?? 'GET',
          headers: {
            ...req.headers,
            host: target.host,
            'x-forwarded-for': req.socket.remoteAddress ?? '127.0.0.1',
            'x-forwarded-proto': 'http',
          },
        };

        const proxyReq = mod.request(opts, (proxyRes) => {
          const headers = { ...proxyRes.headers };
          const rewritten = rewriteSetCookiePaths(headers['set-cookie']);
          if (rewritten) headers['set-cookie'] = rewritten;
          res.writeHead(proxyRes.statusCode ?? 500, headers as Record<string, string>);
          proxyRes.pipe(res);
        });

        proxyReq.on('error', () => {
          if (!res.headersSent) {
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(SERVICE_UNAVAILABLE);
          }
        });

        req.pipe(proxyReq);
      });
    },
  };
}

export default defineConfig({
  plugins: [silentApiProxy(), vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
