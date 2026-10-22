import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sumPrices } from '../../domain/pricing';
import { buildDemoOrders, CATEGORIES, COLORS, CUSTOMERS, FONTS, PRODUCTS } from './data';

/**
 * מילוי מסד הנתונים בנתוני הדגמה.
 *
 * אפשר להריץ שוב ושוב בבטחה: מה שכבר קיים לא נוצר פעם שנייה.
 *
 * פיתוח (NODE_ENV שאינו production):
 *   - מנהל: SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD, ואם לא הוגדרו: admin@example.com / Admin1234!
 *   - לקוחות והזמנות לדוגמה נוצרים, אלא אם SEED_DEMO_DATA=false. סיסמת הלקוחות: Demo1234!
 *
 * פרודקשן (NODE_ENV=production):
 *   - מנהל נוצר רק אם הוגדרה SEED_ADMIN_PASSWORD (לפחות 8 תווים).
 *   - לקוחות והזמנות לדוגמה נוצרים רק אם SEED_DEMO_DATA=true וגם הוגדרה SEED_DEMO_PASSWORD.
 *   כך לא נוצרים באינטרנט חשבונות עם סיסמאות ידועות לציבור.
 */

const prisma = new PrismaClient();
const isProduction = process.env.NODE_ENV === 'production';
const rounds = Number(process.env.BCRYPT_ROUNDS) || 10;

const log = (message: string): void => {
  // eslint-disable-next-line no-console
  console.log(message);
};

function readSetting(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

async function seedCatalog(): Promise<{
  categoryIds: number[];
  fontIds: number[];
  colorIds: number[];
  productIds: number[];
}> {
  const categoryIds: number[] = [];
  for (const name of CATEGORIES) {
    const category = await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
    categoryIds.push(category.id);
  }

  const fontIds: number[] = [];
  for (const name of FONTS) {
    const font = await prisma.font.upsert({ where: { name }, update: {}, create: { name } });
    fontIds.push(font.id);
  }

  const colorIds: number[] = [];
  for (const color of COLORS) {
    const saved = await prisma.color.upsert({ where: { name: color.name }, update: {}, create: color });
    colorIds.push(saved.id);
  }

  const existingProducts = await prisma.product.count();
  if (existingProducts === 0) {
    for (const product of PRODUCTS) {
      await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          imageUrl: product.imageUrl,
          personalizationType: product.personalizationType,
          categoryId: categoryIds[product.category]!,
        },
      });
    }
    log(`✔ נוצרו ${PRODUCTS.length} מוצרים`);
  } else {
    log(`• מוצרים כבר קיימים (${existingProducts}) - לא נוספו`);
  }

  const products = await prisma.product.findMany({ orderBy: { id: 'asc' }, select: { id: true } });
  return { categoryIds, fontIds, colorIds, productIds: products.map((product) => product.id) };
}

async function seedAdmin(): Promise<void> {
  const email = (readSetting('SEED_ADMIN_EMAIL') ?? 'admin@example.com').toLowerCase();
  const password = readSetting('SEED_ADMIN_PASSWORD') ?? (isProduction ? undefined : 'Admin1234!');

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    log(`• המנהל ${email} כבר קיים - לא שונה`);
    return;
  }
  if (!password || password.length < 8) {
    log('⚠ לא נוצר מנהל: בפרודקשן יש להגדיר SEED_ADMIN_PASSWORD (לפחות 8 תווים)');
    return;
  }

  await prisma.user.create({
    data: {
      fullName: readSetting('SEED_ADMIN_NAME') ?? 'מנהל החנות',
      email,
      phone: readSetting('SEED_ADMIN_PHONE') ?? '0500000000',
      passwordHash: await bcrypt.hash(password, rounds),
      role: 'ADMIN',
    },
  });
  log(`✔ נוצר מנהל: ${email}`);
}

async function seedDemo(catalog: Awaited<ReturnType<typeof seedCatalog>>): Promise<void> {
  const flag = readSetting('SEED_DEMO_DATA');
  const demoPassword = readSetting('SEED_DEMO_PASSWORD') ?? (isProduction ? undefined : 'Demo1234!');

  const enabled = isProduction ? flag === 'true' : flag !== 'false';
  if (!enabled) {
    log('• נתוני הדגמה (לקוחות והזמנות) כבויים');
    return;
  }
  if (!demoPassword || demoPassword.length < 8) {
    log('⚠ לא נוצרו לקוחות לדוגמה: יש להגדיר SEED_DEMO_PASSWORD (לפחות 8 תווים)');
    return;
  }

  const passwordHash = await bcrypt.hash(demoPassword, rounds);
  const customerIds: number[] = [];
  for (const customer of CUSTOMERS) {
    const saved = await prisma.user.upsert({
      where: { email: customer.email },
      update: {},
      create: {
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        passwordHash,
        role: 'CUSTOMER',
      },
    });
    customerIds.push(saved.id);
  }
  log(`✔ ${CUSTOMERS.length} לקוחות לדוגמה מוכנים`);

  const existingOrders = await prisma.order.count();
  if (existingOrders > 0) {
    log(`• הזמנות כבר קיימות (${existingOrders}) - לא נוספו`);
    return;
  }
  if (catalog.productIds.length < PRODUCTS.length) {
    log('⚠ לא נוצרו הזמנות: רשימת המוצרים שונה מנתוני ההדגמה');
    return;
  }

  const productRows = await prisma.product.findMany({ select: { id: true, price: true } });
  const prices = new Map<number, number>(
    productRows.map((product) => [product.id, Number(product.price.toString())] as const),
  );

  const orders = buildDemoOrders(new Date());
  for (const order of orders) {
    const items = order.items.map((item) => {
      const productId = catalog.productIds[item.product]!;
      return {
        productId,
        unitPrice: prices.get(productId)!,
        personalizationKind: item.personalizationKind,
        personalizationText: item.personalizationText,
        fontId: item.font === null ? null : catalog.fontIds[item.font]!,
        colorId: item.color === null ? null : catalog.colorIds[item.color]!,
      };
    });

    await prisma.order.create({
      data: {
        customerId: customerIds[order.customer]!,
        status: order.status,
        deliveryMethod: order.deliveryMethod,
        contactName: order.contactName,
        contactPhone: order.contactPhone,
        deliveryAddress: order.deliveryAddress,
        notes: order.notes,
        totalPrice: sumPrices(items.map((item) => item.unitPrice)),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: { create: items },
      },
    });
  }
  log(`✔ נוצרו ${orders.length} הזמנות לדוגמה`);
}

async function main(): Promise<void> {
  log('🌱 מילוי נתונים...');
  const catalog = await seedCatalog();
  await seedAdmin();
  await seedDemo(catalog);
  log('✅ סיום');
}

main()
  .catch((error: unknown) => {
    // eslint-disable-next-line no-console
    console.error('❌ שגיאה במילוי הנתונים:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
