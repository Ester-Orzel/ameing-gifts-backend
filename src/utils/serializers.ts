import type { Prisma } from '@prisma/client';

/**
 * המרת רשומות ממסד הנתונים לתשובות API.
 * כאן מוודאים שלעולם לא נחשפים שדות רגישים (כמו passwordHash),
 * ושמחירים מוחזרים כמספר רגיל (49.9) ולא כאובייקט Decimal.
 */

type DecimalLike = Prisma.Decimal | number | string;

export function toNumber(value: DecimalLike): number {
  return typeof value === 'number' ? value : Number(value.toString());
}

interface UserRecord {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  createdAt: Date;
}

export function serializeUser(user: UserRecord) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}

interface ProductRecord {
  id: number;
  name: string;
  description: string;
  price: DecimalLike;
  imageUrl: string;
  personalizationType: string;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
  category: { id: number; name: string };
}

export function serializeProduct(product: ProductRecord) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: toNumber(product.price),
    imageUrl: product.imageUrl,
    personalizationType: product.personalizationType,
    categoryId: product.categoryId,
    category: { id: product.category.id, name: product.category.name },
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

interface OrderItemRecord {
  id: number;
  productId: number;
  unitPrice: DecimalLike;
  personalizationKind: string;
  personalizationText: string | null;
  fontId: number | null;
  colorId: number | null;
  product: { id: number; name: string; imageUrl: string };
  font: { id: number; name: string } | null;
  color: { id: number; name: string; hexCode: string } | null;
}

interface OrderRecord {
  id: number;
  customerId: number;
  status: string;
  deliveryMethod: string;
  contactName: string;
  contactPhone: string;
  deliveryAddress: string | null;
  notes: string | null;
  totalPrice: DecimalLike;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItemRecord[];
  customer?: { id: number; fullName: string; email: string; phone: string };
}

export function serializeOrder(order: OrderRecord) {
  return {
    id: order.id,
    customerId: order.customerId,
    status: order.status,
    deliveryMethod: order.deliveryMethod,
    contactName: order.contactName,
    contactPhone: order.contactPhone,
    deliveryAddress: order.deliveryAddress,
    notes: order.notes,
    totalPrice: toNumber(order.totalPrice),
    itemsCount: order.items.length,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    ...(order.customer
      ? {
          customer: {
            id: order.customer.id,
            fullName: order.customer.fullName,
            email: order.customer.email,
            phone: order.customer.phone,
          },
        }
      : {}),
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      productImageUrl: item.product.imageUrl,
      unitPrice: toNumber(item.unitPrice),
      personalizationKind: item.personalizationKind,
      personalizationText: item.personalizationText,
      font: item.font ? { id: item.font.id, name: item.font.name } : null,
      color: item.color ? { id: item.color.id, name: item.color.name, hexCode: item.color.hexCode } : null,
    })),
  };
}

/** מבנה אחיד לתשובה של רשימה עם עמודים */
export function paginated<T>(items: T[], total: number, page: number, limit: number) {
  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
