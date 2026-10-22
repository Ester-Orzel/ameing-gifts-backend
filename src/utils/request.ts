import type { Request } from 'express';
import type { AuthUser } from '../types/express';
import { idParamSchema } from '../validation/common';
import { AppError } from './AppError';

/** המשתמש המחובר. זמין רק ב-route שעובר דרך authenticate */
export function requireUser(req: Request): AuthUser {
  if (!req.user) throw AppError.unauthorized();
  return req.user;
}

/** מזהה מספרי מהכתובת (:id). מזהה לא תקין => 400 */
export function parseIdParam(req: Request): number {
  return idParamSchema.parse(req.params).id;
}
