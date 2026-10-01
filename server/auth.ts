import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { AdminUserSession, CustomerMember } from '../src/types';

export const COOKIE_NAME = 'pl_session';
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface AuthenticatedUser {
  type: 'admin' | 'customer';
  id: string;
  adminSession?: AdminUserSession;
  customer?: CustomerMember;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function createSession(userType: 'admin' | 'customer', userId: string, data: any): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + SESSION_DURATION_MS;

  const insert = db.prepare(`
    INSERT INTO sessions (token, user_type, user_id, expires_at, data_json)
    VALUES (?, ?, ?, ?, ?)
  `);

  insert.run(token, userType, userId, expiresAt, JSON.stringify(data));
  return token;
}

export function deleteSession(token: string): void {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export function cleanExpiredSessions(): void {
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now());
}

export function attachSessionMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    return next();
  }

  try {
    const row = db.prepare(`
      SELECT * FROM sessions WHERE token = ? AND expires_at > ?
    `).get(token, Date.now()) as {
      token: string;
      user_type: string;
      user_id: string;
      expires_at: number;
      data_json: string;
    } | undefined;

    if (!row) {
      // Clear invalid cookie
      res.clearCookie(COOKIE_NAME);
      return next();
    }

    const data = JSON.parse(row.data_json);

    if (row.user_type === 'admin') {
      req.user = {
        type: 'admin',
        id: row.user_id,
        adminSession: data as AdminUserSession
      };
    } else if (row.user_type === 'customer') {
      req.user = {
        type: 'customer',
        id: row.user_id,
        customer: data as CustomerMember
      };
    }
  } catch (err) {
    console.error('Error attaching session:', err);
  }

  next();
}

export function requireAdmin(allowedRoles?: ('super_admin' | 'finance_admin' | 'ops_admin')[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.type !== 'admin' || !req.user.adminSession) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak: Diperlukan login akun Administrator / Petugas'
      });
    }

    const currentRole = req.user.adminSession.role;

    // Super Admin has access to all roles
    if (currentRole === 'super_admin') {
      return next();
    }

    if (allowedRoles && !allowedRoles.includes(currentRole)) {
      return res.status(403).json({
        success: false,
        message: `Akses terlarang: Role "${currentRole}" tidak memiliki izin untuk fitur ini`
      });
    }

    next();
  };
}

export function requireCustomer(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.type !== 'customer' || !req.user.customer) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak: Silakan masuk sebagai Penyewa terlebih dahulu'
    });
  }
  next();
}

export function setSessionCookie(res: Response, token: string) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: SESSION_DURATION_MS,
    path: '/'
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    path: '/'
  });
}
