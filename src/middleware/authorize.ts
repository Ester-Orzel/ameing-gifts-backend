import type { NextFunction, Request, Response } from 'express';
import type { RoleValue } from '../domain/types';
import { AppError } from '../utils/AppError';

/**
 * מאפשר גישה רק לתפקידים שברשימה. חייב לבוא אחרי authenticate.
 * משתמש מחובר בלי הרשאה מתאימה  =>  403
 */
export function authorize(...allowedRoles: RoleValue[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw AppError.unauthorized();
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw AppError.forbidden();
    }
    next();
  };
}
