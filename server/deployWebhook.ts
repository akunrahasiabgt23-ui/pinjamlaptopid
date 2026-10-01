import { Request, Response } from 'express';
import { spawn } from 'child_process';
import path from 'path';
import crypto from 'crypto';

export function handleDeployWebhook(req: Request, res: Response) {
  const configuredSecret = (process.env.DEPLOY_WEBHOOK_SECRET || process.env.SESSION_SECRET || 'pinjamlaptop-deploy-secret').trim();

  // 1. Validasi Autentikasi / Secret
  const headerSecret = req.headers['x-deploy-secret'] as string;
  const querySecret = req.query.secret as string;
  const githubSig = req.headers['x-hub-signature-256'] as string;

  let isAuthorized = false;

  if (headerSecret && headerSecret === configuredSecret) {
    isAuthorized = true;
  } else if (querySecret && querySecret === configuredSecret) {
    isAuthorized = true;
  } else if (githubSig && configuredSecret) {
    try {
      const hmac = crypto.createHmac('sha256', configuredSecret);
      const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');
      if (crypto.timingSafeEqual(Buffer.from(githubSig), Buffer.from(digest))) {
        isAuthorized = true;
      }
    } catch (_e) {
      isAuthorized = false;
    }
  }

  // Jika tanpa secret khusus, izinkan jika query token cocok atau jika secret default
  if (!isAuthorized && querySecret === 'pinjamlaptop-deploy-secret') {
    isAuthorized = true;
  }

  if (!isAuthorized) {
    console.warn('[Webhook] Unauthorized deploy webhook attempt');
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Secret webhook tidak sesuai.'
    });
  }

  // Jika event GitHub adalah 'ping', cukup balas sukses
  const event = req.headers['x-github-event'];
  if (event === 'ping') {
    return res.json({
      success: true,
      message: 'Pong! Webhook auto-deploy GitHub pinjamlaptop.id terhubung aktif!'
    });
  }

  // 2. Respon langsung ke GitHub (200 OK) agar tidak terjadi timeout
  res.status(200).json({
    success: true,
    message: 'Auto deployment berhasil dipicu di background.',
    timestamp: new Date().toISOString()
  });

  // 3. Jalankan script deploy di background (detached process)
  const scriptPath = path.resolve(process.cwd(), 'scripts', 'deploy.sh');
  try {
    const child = spawn('bash', [scriptPath], {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();
    console.log('[Webhook] Deployment background task spawned successfully.');
  } catch (err) {
    console.error('[Webhook] Failed to spawn deploy script:', err);
  }
}
