import type { RoleValue } from '../domain/types';

/** המשתמש המחובר, כפי שנקבע לפי ה-Token */
export interface AuthUser {
  id: number;
  role: RoleValue;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** קיים רק אחרי middleware בשם authenticate */
      user?: AuthUser;
    }
  }
}

export {};
