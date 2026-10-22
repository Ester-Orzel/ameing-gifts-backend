import { prisma } from '../db/prisma';
import { getDummyHash, hashPassword, verifyPassword } from '../auth/passwords';
import { signAccessToken } from '../auth/tokens';
import { AppError } from '../utils/AppError';
import { serializeUser } from '../utils/serializers';
import type { LoginInput, RegisterInput } from '../validation/auth.schemas';

function buildAuthResponse(user: Parameters<typeof serializeUser>[0]) {
  const { token, expiresIn } = signAccessToken({ userId: user.id, role: user.role as 'CUSTOMER' | 'ADMIN' });
  return { token, tokenType: 'Bearer' as const, expiresIn, user: serializeUser(user) };
}

/** הרשמה: תמיד יוצרת לקוח. אי אפשר להירשם כמנהל */
export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } });
  if (existing) {
    throw AppError.conflict('כתובת האימייל כבר רשומה במערכת');
  }

  const user = await prisma.user.create({
    data: {
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      passwordHash: await hashPassword(input.password),
      role: 'CUSTOMER',
    },
  });
  return buildAuthResponse(user);
}

/** התחברות. אותה הודעה לאימייל לא קיים ולסיסמה שגויה, כדי לא לחשוף מי רשום */
export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const hash = user?.passwordHash ?? (await getDummyHash());
  const passwordOk = await verifyPassword(input.password, hash);

  if (!user || !passwordOk) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'אימייל או סיסמה שגויים');
  }
  return buildAuthResponse(user);
}

export async function getMe(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw AppError.unauthorized('המשתמש לא נמצא. יש להתחבר מחדש');
  }
  return serializeUser(user);
}
