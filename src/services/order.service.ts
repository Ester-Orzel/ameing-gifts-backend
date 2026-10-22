import type { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import { isKindAllowedForProduct } from '../domain/personalization';
import { canChangeStatus } from '../domain/orderStatus';
import { sumPrices } from '../domain/pricing';
import { ORDER_STATUS_LABELS, type OrderStatusValue } from '../domain/types';
import type { AuthUser } from '../types/express';
import { AppError, type ErrorDetail } from '../utils/AppError';
import { paginated, serializeOrder, toNumber } from '../utils/serializers';
import type {
  AdminOrderListQuery,
  MyOrderListQuery,
  OrderCreateInput,
} from '../validation/order.schemas';

const itemsInclude = {
  include: {
    product: { select: { id: true, name: true, imageUrl: true } },
    font: { select: { id: true, name: true } },
    color: { select: { id: true, name: true, hexCode: true } },
  },
  orderBy: { id: 'asc' },
} satisfies Prisma.OrderItemFindManyArgs;

const customerSelect = {
  select: { id: true, fullName: true, email: true, phone: true },
} satisfies Prisma.UserDefaultArgs;

/** הזמנה מלאה, כולל פרטי הלקוח (למנהל) */
const fullOrderInclude = { items: itemsInclude, customer: customerSelect } satisfies Prisma.OrderInclude;
/** הזמנה ללא פרטי לקוח (ללקוח עצמו - הוא כבר יודע מי הוא) */
const customerOrderInclude = { items: itemsInclude } satisfies Prisma.OrderInclude;

function orderByFor(sort: 'newest' | 'oldest'): Prisma.OrderOrderByWithRelationInput[] {
  return sort === 'oldest'
    ? [{ createdAt: 'asc' }, { id: 'asc' }]
    : [{ createdAt: 'desc' }, { id: 'desc' }];
}

/**
 * יצירת הזמנה עם כל פריטי הסל.
 * - הלקוח נקבע לפי ה-Token (customerId), לא לפי מה שנשלח.
 * - המחיר נלקח ממסד הנתונים, לא ממה שנשלח מהדפדפן.
 */
export async function createOrder(customerId: number, input: OrderCreateInput) {
  const productIds = [...new Set(input.items.map((item) => item.productId))];
  const fontIds = [...new Set(input.items.flatMap((item) => (item.fontId ? [item.fontId] : [])))];
  const colorIds = [...new Set(input.items.flatMap((item) => (item.colorId ? [item.colorId] : [])))];

  const [products, fonts, colors] = await Promise.all([
    prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true, personalizationType: true, name: true },
    }),
    prisma.font.findMany({ where: { id: { in: fontIds } }, select: { id: true } }),
    prisma.color.findMany({ where: { id: { in: colorIds } }, select: { id: true } }),
  ]);

  const productById = new Map(products.map((product) => [product.id, product] as const));
  const fontExists = new Set(fonts.map((font) => font.id));
  const colorExists = new Set(colors.map((color) => color.id));

  const details: ErrorDetail[] = [];
  input.items.forEach((item, index) => {
    const product = productById.get(item.productId);
    if (!product) {
      details.push({ field: `items.${index}.productId`, message: 'המוצר לא קיים' });
    } else if (!isKindAllowedForProduct(item.personalizationKind, product.personalizationType)) {
      details.push({
        field: `items.${index}.personalizationKind`,
        message: `המוצר "${product.name}" מאפשר הדפסת אות בלבד`,
      });
    }
    if (item.fontId && !fontExists.has(item.fontId)) {
      details.push({ field: `items.${index}.fontId`, message: 'הגופן לא קיים' });
    }
    if (item.colorId && !colorExists.has(item.colorId)) {
      details.push({ field: `items.${index}.colorId`, message: 'הצבע לא קיים' });
    }
  });
  if (details.length > 0) {
    throw AppError.badRequest('נתונים לא תקינים', details);
  }

  const itemsData = input.items.map((item) => {
    const product = productById.get(item.productId)!;
    return {
      productId: item.productId,
      unitPrice: product.price,
      personalizationKind: item.personalizationKind,
      personalizationText: item.personalizationText,
      fontId: item.fontId,
      colorId: item.colorId,
    };
  });
  const totalPrice = sumPrices(itemsData.map((item) => toNumber(item.unitPrice)));

  const order = await prisma.order.create({
    data: {
      customerId,
      deliveryMethod: input.deliveryMethod,
      contactName: input.contactName,
      contactPhone: input.contactPhone,
      deliveryAddress: input.deliveryAddress,
      notes: input.notes,
      totalPrice,
      items: { create: itemsData },
    },
    include: customerOrderInclude,
  });
  return serializeOrder(order);
}

/** ההזמנות של הלקוח המחובר בלבד */
export async function listMyOrders(customerId: number, query: MyOrderListQuery) {
  const where: Prisma.OrderWhereInput = {
    customerId,
    ...(query.status ? { status: query.status } : {}),
  };
  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      include: customerOrderInclude,
      orderBy: orderByFor(query.sort),
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.order.count({ where }),
  ]);
  return paginated(orders.map(serializeOrder), total, query.page, query.limit);
}

/** כל ההזמנות (מנהל), עם סינון לפי סטטוס וחיפוש לפי שם או טלפון */
export async function listAllOrders(query: AdminOrderListQuery) {
  const search = query.search;
  const where: Prisma.OrderWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(search
      ? {
          OR: [
            { contactName: { contains: search, mode: 'insensitive' } },
            { contactPhone: { contains: search.replace(/[\s-]/g, '') } },
            { customer: { fullName: { contains: search, mode: 'insensitive' } } },
            { customer: { phone: { contains: search.replace(/[\s-]/g, '') } } },
          ],
        }
      : {}),
  };
  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      include: fullOrderInclude,
      orderBy: orderByFor(query.sort),
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.order.count({ where }),
  ]);
  return paginated(orders.map(serializeOrder), total, query.page, query.limit);
}

/**
 * הזמנה אחת. לקוח רואה רק הזמנה שלו.
 * להזמנה של לקוח אחר מוחזר 404 (ולא 403), כדי לא לחשוף שהיא קיימת.
 */
export async function getOrder(id: number, user: AuthUser) {
  if (user.role === 'ADMIN') {
    const order = await prisma.order.findUnique({ where: { id }, include: fullOrderInclude });
    if (!order) throw AppError.notFound('ההזמנה לא נמצאה');
    return serializeOrder(order);
  }

  const order = await prisma.order.findFirst({
    where: { id, customerId: user.id },
    include: customerOrderInclude,
  });
  if (!order) throw AppError.notFound('ההזמנה לא נמצאה');
  return serializeOrder(order);
}

/** עדכון סטטוס (מנהל). הזמנה שנמסרה או בוטלה היא סופית */
export async function updateOrderStatus(id: number, status: OrderStatusValue) {
  const existing = await prisma.order.findUnique({ where: { id }, select: { status: true } });
  if (!existing) throw AppError.notFound('ההזמנה לא נמצאה');

  if (!canChangeStatus(existing.status, status)) {
    throw new AppError(
      409,
      'ORDER_FINALIZED',
      `לא ניתן לשנות הזמנה בסטטוס "${ORDER_STATUS_LABELS[existing.status]}"`,
    );
  }

  const order = await prisma.order.update({ where: { id }, data: { status }, include: fullOrderInclude });
  return serializeOrder(order);
}
