import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import { AppError } from '../utils/AppError';
import type {
  CategoryInput,
  ColorCreateInput,
  ColorUpdateInput,
  FontInput,
} from '../validation/catalog.schemas';

/**
 * ניהול רשימות הבחירה: קטגוריות, גופנים וצבעים.
 * אין מחיקה, כדי לא לפגוע במוצרים ובהזמנות שכבר משתמשים בהם.
 */

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

async function withUniqueName<T>(action: () => Promise<T>, message: string): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (isUniqueViolation(error)) throw AppError.conflict(message);
    throw error;
  }
}

// ---------- קטגוריות ----------

export async function listCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { id: 'asc' },
    include: { _count: { select: { products: true } } },
  });
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    productsCount: category._count.products,
  }));
}

export async function createCategory(input: CategoryInput) {
  return withUniqueName(() => prisma.category.create({ data: input }), 'קטגוריה בשם זה כבר קיימת');
}

export async function updateCategory(id: number, input: CategoryInput) {
  const existing = await prisma.category.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw AppError.notFound('הקטגוריה לא נמצאה');
  return withUniqueName(() => prisma.category.update({ where: { id }, data: input }), 'קטגוריה בשם זה כבר קיימת');
}

// ---------- גופנים ----------

export async function listFonts() {
  return prisma.font.findMany({ orderBy: { id: 'asc' } });
}

export async function createFont(input: FontInput) {
  return withUniqueName(() => prisma.font.create({ data: input }), 'גופן בשם זה כבר קיים');
}

export async function updateFont(id: number, input: FontInput) {
  const existing = await prisma.font.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw AppError.notFound('הגופן לא נמצא');
  return withUniqueName(() => prisma.font.update({ where: { id }, data: input }), 'גופן בשם זה כבר קיים');
}

// ---------- צבעים ----------

export async function listColors() {
  return prisma.color.findMany({ orderBy: { id: 'asc' } });
}

export async function createColor(input: ColorCreateInput) {
  return withUniqueName(() => prisma.color.create({ data: input }), 'צבע בשם זה כבר קיים');
}

export async function updateColor(id: number, input: ColorUpdateInput) {
  const existing = await prisma.color.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw AppError.notFound('הצבע לא נמצא');
  return withUniqueName(() => prisma.color.update({ where: { id }, data: input }), 'צבע בשם זה כבר קיים');
}
