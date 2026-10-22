import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { verifyAccessToken } from '../auth/tokens';
import { AppError } from '../utils/AppError';

/**
 * דורש Bearer Token תקין.
 * המשתמש המזוהה נקבע רק לפי ה-Token, ונבדק מול מסד הנתונים
 * (כך שמשתמש שנמחק או שתפקידו השתנה לא ימשיך לעבוד עם Token ישן).
 *
 * ללא Token / Token לא תקין / פג תוקף  =>  401
 */
export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header) {
    throw AppError.unauthorized('נדרשת התחברות. יש לשלוח Authorization: Bearer <token>');
  }

  const [scheme, token, ...rest] = header.trim().split(/\s+/);
  if (scheme?.toLowerCase() !== 'bearer' || !token || rest.length > 0) {
    throw AppError.unauthorized('פורמט Authorization לא תקין. יש לשלוח: Bearer <token>');
  }

  const result = verifyAccessToken(token);
  if (!result.ok) {
    throw new AppError(
      401,
      result.reason === 'expired' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
      result.reason === 'expired' ? 'תוקף ההתחברות פג. יש להתחבר מחדש' : 'Token לא תקין',
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: result.payload.userId },
    select: { id: true, role: true },
  });
  if (!user) {
    throw new AppError(401, 'INVALID_TOKEN', 'המשתמש של ה-Token לא קיים. יש להתחבר מחדש');
  }

  req.user = { id: user.id, role: user.role };
  next();
}
