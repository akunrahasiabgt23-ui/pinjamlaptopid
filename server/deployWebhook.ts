import { Request, Response } from 'express';
import { spawn } from 'child_process';
import path from 'path';
import crypto from 'crypto';

export function handleDeployWebhook(req: Request, res: Response) {
  // Accepted secrets list
  const allowedSecrets = new Set<string>([
    'pinjamlaptop-deploy-secret',
    'pinjamlaptop',
    (process.env.DEPLOY_WEBHOOK_SECRET || '').trim(),
    (process.env.SESSION_SECRET || '').trim()
  ].filter(Boolean));

  // 1. Ekstrak kredensial dari request
  const headerSecret = ((req.headers['x-deploy-secret'] as string) || '').trim();
  const querySecret = ((req.query.secret as string) || '').trim();
  const githubSig = ((req.headers['x-hub-signature-256'] as string) || '').trim();
  const userAgent = ((req.headers['user-agent'] as string) || '').toLowerCase();
  const githubEvent = (req.headers['x-github-event'] as string) || '';

  let isAuthorized = false;

  // Cek token dari header atau query parameter (?secret=pinjamlaptop-deploy-secret)
  if (headerSecret && allowedSecrets.has(headerSecret)) {
    isAuthorized = true;
  } else if (querySecret && allowedSecrets.has(querySecret)) {
    isAuthorized = true;
  }

  // Cek GitHub Signature (HMAC-SHA256) jika disediakan
  if (!isAuthorized && githubSig) {
    const rawPayload = (req as any).rawBody || Buffer.from(JSON.stringify(req.body || {}));
    for (const secret of allowedSecrets) {
      try {
        const hmac = crypto.createHmac('sha256', secret);
        const digest = 'sha256=' + hmac.update(rawPayload).digest('hex');
        if (crypto.timingSafeEqual(Buffer.from(githubSig), Buffer.from(digest))) {
          isAuthorized = true;
          break;
        }
      } catch (_e) {}
    }
  }

  // Jika dipanggil dari GitHub (ping atau push) dan menyertakan query secret atau tanpa signature ketat
  if (!isAuthorized && userAgent.includes('github-hookshot')) {
    if (querySecret === 'pinjamlaptop-deploy-secret' || querySecret === 'pinjamlaptop') {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    console.warn(`[Webhook] 401 Unauthorized deploy attempt. Event: ${githubEvent}, User-Agent: ${userAgent}`);
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Secret webhook tidak sesuai. Gunakan parameter ?secret=pinjamlaptop-deploy-secret pada Payload URL di GitHub.'
    });
  }

  // Jika event GitHub adalah 'ping', cukup balas sukses 200 OK
  if (githubEvent === 'ping') {
    return res.status(200).json({
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
    console.log('[Webhook] Deployment background task spawned successfully via GitHub Webhook.');
  } catch (err) {
    console.error('[Webhook] Failed to spawn deploy script:', err);
  }
}
