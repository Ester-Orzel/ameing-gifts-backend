import request from 'supertest';
import { createApp } from '../src/app';
import { hashPassword } from '../src/auth/passwords';
import { prisma } from '../src/db/prisma';

export const app = createApp();
export const api = () => request(app);

export const PASSWORD = 'Test1234!';

export const EMAILS = {
  admin: 'admin@test.local',
  rachel: 'rachel@test.local',
  sara: 'sara@test.local',
} as const;

/** מוחק את כל הנתונים ומאפס את המונים */
export async function resetDatabase(): Promise<void> {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "order_items", "orders", "products", "categories", "fonts", "colors", "users" RESTART IDENTITY CASCADE',
  );
}

export interface Fixtures {
  adminId: number;
  rachelId: number;
  saraId: number;
  bottlesCategoryId: number;
  accessoriesCategoryId: number;
  thermosId: number; // 89.90, NAME_OR_INITIAL
  bottleId: number; // 69.90, NAME_OR_INITIAL
  keychainId: number; // 39.90, INITIAL_ONLY
  hebrewFontId: number;
  englishFontId: number;
  goldId: number;
  silverId: number;
}

/** נתוני בסיס קטנים וקבועים לבדיקות */
export async function createFixtures(): Promise<Fixtures> {
  const passwordHash = await hashPassword(PASSWORD);

  const admin = await prisma.user.create({
    data: { fullName: 'מנהלת בדיקות', email: EMAILS.admin, phone: '0500000001', passwordHash, role: 'ADMIN' },
  });
  const rachel = await prisma.user.create({
    data: { fullName: 'רחל בדיקה', email: EMAILS.rachel, phone: '0521111111', passwordHash },
  });
  const sara = await prisma.user.create({
    data: { fullName: 'שרה בדיקה', email: EMAILS.sara, phone: '0532222222', passwordHash },
  });

  const bottles = await prisma.category.create({ data: { name: 'בקבוקים' } });
  const accessories = await prisma.category.create({ data: { name: 'אביזרים' } });

  const thermos = await prisma.product.create({
    data: {
      name: 'תרמוס ורוד',
      description: 'תרמוס לבדיקות',
      price: 89.9,
      imageUrl: 'https://example.com/thermos.png',
      personalizationType: 'NAME_OR_INITIAL',
      categoryId: bottles.id,
    },
  });
  const bottle = await prisma.product.create({
    data: {
      name: 'בקבוק שחור',
      description: 'בקבוק לבדיקות',
      price: 69.9,
      imageUrl: 'https://example.com/bottle.png',
      personalizationType: 'NAME_OR_INITIAL',
      categoryId: bottles.id,
    },
  });
  const keychain = await prisma.product.create({
    data: {
      name: 'מחזיק מפתחות לב',
      description: 'מחזיק לבדיקות',
      price: 39.9,
      imageUrl: 'https://example.com/keychain.png',
      personalizationType: 'INITIAL_ONLY',
      categoryId: accessories.id,
    },
  });

  const hebrewFont = await prisma.font.create({ data: { name: 'Assistant' } });
  const englishFont = await prisma.font.create({ data: { name: 'Great Vibes' } });
  const gold = await prisma.color.create({ data: { name: 'זהב', hexCode: '#D4AF37' } });
  const silver = await prisma.color.create({ data: { name: 'כסף', hexCode: '#C0C0C0' } });

  return {
    adminId: admin.id,
    rachelId: rachel.id,
    saraId: sara.id,
    bottlesCategoryId: bottles.id,
    accessoriesCategoryId: accessories.id,
    thermosId: thermos.id,
    bottleId: bottle.id,
    keychainId: keychain.id,
    hebrewFontId: hebrewFont.id,
    englishFontId: englishFont.id,
    goldId: gold.id,
    silverId: silver.id,
  };
}

/** התחברות אמיתית דרך ה-API, מחזיר Token */
export async function loginAs(email: string): Promise<string> {
  const res = await api().post('/api/auth/login').send({ email, password: PASSWORD });
  if (res.status !== 200) {
    throw new Error(`login failed for ${email}: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.token as string;
}

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

export { prisma };
