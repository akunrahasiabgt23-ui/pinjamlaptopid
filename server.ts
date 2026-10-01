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
const PORT = process.env.NODE_ENV === 'production' && process.env.PORT && process.env.PORT !== '8080' 
  ? process.env.PORT 
  : 3000;
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
app.use(express.json({ limit: '15mb' }));
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
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined
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

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Server] Pinjamlaptop Full-Stack Server running on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Failed to start server:', err);
  process.exit(1);
});
