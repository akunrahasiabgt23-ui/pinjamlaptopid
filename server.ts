import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { initDatabase } from './server/db';
import { attachSessionMiddleware, cleanExpiredSessions } from './server/auth';
import { apiRouter } from './server/routes';

const app = express();
function resolvePort(): number {
  const portArgIdx = process.argv.indexOf('--port');
  if (portArgIdx !== -1 && process.argv[portArgIdx + 1]) {
    const parsed = parseInt(process.argv[portArgIdx + 1], 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  if (process.env.DEFAULT_APP_PORT) {
    const parsed = parseInt(process.env.DEFAULT_APP_PORT, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  if (process.env.PORT && process.env.PORT !== '8080') {
    const parsed = parseInt(process.env.PORT, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return 3000;
}

const PORT = resolvePort();
const isProduction = process.env.NODE_ENV === 'production';

// Trust proxy for reverse proxy setups (Nginx, Webuzo, Cloud Run)
app.set('trust proxy', 1);

// Initialize SQLite database and tables
initDatabase();

// Clean expired sessions periodically (every 1 hour)
setInterval(() => {
  try {
    cleanExpiredSessions();
  } catch (e) {
    console.error('Error cleaning expired sessions:', e);
  }
}, 60 * 60 * 1000);

// Basic security headers via helmet (frameguard and cross-origin policies disabled for AI Studio iframe & preview support)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    frameguard: false
  })
);

app.use((_req, res, next) => {
  res.removeHeader('X-Frame-Options');
  next();
});

// CORS configuration
app.use(
  cors({
    origin: true,
    credentials: true
  })
);

// Cookie parser and body parsers
app.use(cookieParser(process.env.SESSION_SECRET || 'pinjamlaptop-secret-key-v1'));
app.use(
  express.json({
    limit: '15mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Attach authenticated user session
app.use(attachSessionMiddleware);

// Mount REST API routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    } else {
      console.warn('[Server] Warning: dist folder not found. Please run "npm run build" first.');
    }
  }

  const server = app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Server] Pinjamlaptop Server running on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://0.0.0.0:${PORT}/`);
  });

  const handleShutdown = (signal: string) => {
    console.log(`[Server] Received ${signal}, shutting down gracefully...`);
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('[Server] Failed to start server:', err);
  process.exit(1);
});
