import bcrypt from 'bcryptjs';
import { env } from '../config/env';

/** הצפנה חד-כיוונית של סיסמה. את הסיסמה המקורית אי אפשר לשחזר מה-Hash */
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, env.BCRYPT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Hash קבוע שמשמש להשוואה כשהאימייל לא קיים,
 * כדי שזמן התגובה יהיה דומה ולא יחשוף אילו כתובות רשומות במערכת.
 */
let dummyHashPromise: Promise<string> | undefined;
export function getDummyHash(): Promise<string> {
  const promise = dummyHashPromise ?? bcrypt.hash('dummy-password-for-timing', env.BCRYPT_ROUNDS);
  dummyHashPromise = promise;
  return promise;
}
