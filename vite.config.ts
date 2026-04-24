import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import crypto from 'crypto';
import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const devSessions = new Set<string>();

  const readJsonBody = (req: import('http').IncomingMessage) =>
    new Promise<Record<string, unknown>>((resolve) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch {
          resolve({});
        }
      });
      req.on('error', () => resolve({}));
    });

  const sendJson = (res: import('http').ServerResponse, status: number, payload: Record<string, unknown>) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(payload));
  };

  const localAuthPlugin: Plugin = {
    name: 'local-admin-auth-fallback',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] || '';
        if (!url.startsWith('/api/auth/')) {
          next();
          return;
        }

        if (url === '/api/auth/login' && req.method === 'POST') {
          const body = await readJsonBody(req);
          const expectedUser = env.ADMIN_USERNAME || 'admin';
          const expectedPass = env.ADMIN_PASSWORD || '';

          if (!expectedPass) {
            sendJson(res, 500, { error: 'Admin credentials not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD in .env' });
            return;
          }

          if (body.username === expectedUser && body.password === expectedPass) {
            const token = crypto.randomBytes(24).toString('hex');
            devSessions.add(token);
            sendJson(res, 200, { success: true, token });
            return;
          }

          sendJson(res, 401, { error: 'Invalid username or password.' });
          return;
        }

        if (url === '/api/auth/verify' && req.method === 'GET') {
          const authHeader = req.headers.authorization || '';
          const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
          if (token && devSessions.has(token)) {
            sendJson(res, 200, { valid: true });
            return;
          }
          sendJson(res, 401, { valid: false });
          return;
        }

        if (url === '/api/auth/logout' && req.method === 'POST') {
          const authHeader = req.headers.authorization || '';
          const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
          devSessions.delete(token);
          sendJson(res, 200, { success: true });
          return;
        }

        next();
      });
    },
  };

  return {
    plugins: [localAuthPlugin, react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api': {
          target: 'http://localhost:10000',
          changeOrigin: true,
        },
        '/uploads': {
          target: 'http://localhost:10000',
          changeOrigin: true,
        },
      },
    },
  };
});
