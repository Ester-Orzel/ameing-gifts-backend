import type { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import { AppError } from '../utils/AppError';
import { paginated, serializeProduct } from '../utils/serializers';
import type { ProductCreateInput, ProductListQuery, ProductUpdateInput } from '../validation/product.schemas';

const productInclude = {
  category: { select: { id: true, name: true } },
} satisfies Prisma.ProductInclude;

function orderByFor(sort: ProductListQuery['sort']): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case 'price_asc':
      return [{ price: 'asc' }, { id: 'asc' }];
    case 'price_desc':
      return [{ price: 'desc' }, { id: 'asc' }];
    case 'name':
      return [{ name: 'asc' }, { id: 'asc' }];
    case 'newest':
    default:
      return [{ createdAt: 'desc' }, { id: 'desc' }];
  }
}

async function ensureCategoryExists(categoryId: number): Promise<void> {
  const category = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } });
  if (!category) {
    throw AppError.badRequest('נתונים לא תקינים', [{ field: 'categoryId', message: 'הקטגוריה לא קיימת' }]);
  }
}

/** רשימת מוצרים עם חיפוש לפי שם, סינון לפי קטגוריה, מיון ועמודים */
export async function listProducts(query: ProductListQuery) {
  const where: Prisma.ProductWhereInput = {
    ...(query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {}),
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
  };

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: orderByFor(query.sort),
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.product.count({ where }),
  ]);

  return paginated(products.map(serializeProduct), total, query.page, query.limit);
}

export async function getProduct(id: number) {
  const product = await prisma.product.findUnique({ where: { id }, include: productInclude });
  if (!product) {
    throw AppError.notFound('המוצר לא נמצא');
  }
  return serializeProduct(product);
}

export async function createProduct(input: ProductCreateInput) {
  await ensureCategoryExists(input.categoryId);
  const product = await prisma.product.create({ data: input, include: productInclude });
  return serializeProduct(product);
}

export async function updateProduct(id: number, input: ProductUpdateInput) {
  const existing = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    throw AppError.notFound('המוצר לא נמצא');
  }
  if (input.categoryId !== undefined) {
    await ensureCategoryExists(input.categoryId);
  }
  const product = await prisma.product.update({ where: { id }, data: input, include: productInclude });
  return serializeProduct(product);
}
