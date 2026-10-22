import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ROLES, type RoleValue } from '../domain/types';

/**
 * יצירה ובדיקה של JWT Access Token.
 * ה-Token חתום במפתח JWT_SECRET ובעל תוקף מוגבל (JWT_EXPIRES_MINUTES).
 */

const ALGORITHM = 'HS256' as const;

export interface TokenPayload {
  userId: number;
  role: RoleValue;
}

export function signAccessToken(payload: TokenPayload): { token: string; expiresIn: number } {
  const expiresIn = env.JWT_EXPIRES_MINUTES * 60; // בשניות
  const token = jwt.sign({ role: payload.role }, env.JWT_SECRET, {
    algorithm: ALGORITHM,
    subject: String(payload.userId),
    expiresIn,
  });
  return { token, expiresIn };
}

export type VerifyResult =
  | { ok: true; payload: TokenPayload }
  | { ok: false; reason: 'expired' | 'invalid' };

export function verifyAccessToken(token: string): VerifyResult {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: [ALGORITHM] });
    if (typeof decoded === 'string') return { ok: false, reason: 'invalid' };

    const userId = Number(decoded.sub);
    const role = decoded.role as unknown;
    if (!Number.isInteger(userId) || userId <= 0) return { ok: false, reason: 'invalid' };
    if (typeof role !== 'string' || !(ROLES as readonly string[]).includes(role)) {
      return { ok: false, reason: 'invalid' };
    }
    return { ok: true, payload: { userId, role: role as RoleValue } };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) return { ok: false, reason: 'expired' };
    return { ok: false, reason: 'invalid' };
  }
}
