import { z } from 'zod';
import { PERSONALIZATION_TYPES } from '../domain/types';
import { hasAtMostTwoDecimals } from '../domain/pricing';
import { optionalPositiveIntQuery, optionalSearchQuery, paginationQuerySchema } from './common';

const name = z.string().trim().min(2, 'שם מוצר חייב להכיל לפחות 2 תווים').max(80, 'שם מוצר יכול להכיל עד 80 תווים');
const description = z.string().trim().min(5, 'תיאור חייב להכיל לפחות 5 תווים').max(1000, 'תיאור יכול להכיל עד 1000 תווים');
const price = z
  .number({ invalid_type_error: 'מחיר חייב להיות מספר' })
  .positive('מחיר חייב להיות גדול מ-0')
  .max(100000, 'מחיר גבוה מדי')
  .refine(hasAtMostTwoDecimals, 'מחיר יכול לכלול עד 2 ספרות אחרי הנקודה');
const imageUrl = z
  .string()
  .trim()
  .url('כתובת תמונה לא תקינה')
  .max(500)
  .refine((value) => /^https?:\/\//i.test(value), 'כתובת התמונה חייבת להתחיל ב-http או https');
const personalizationType = z.enum(PERSONALIZATION_TYPES);
const categoryId = z.number().int('מזהה קטגוריה לא תקין').positive('מזהה קטגוריה לא תקין');

export const productCreateSchema = z
  .object({ name, description, price, imageUrl, personalizationType, categoryId })
  .strict();

export const productUpdateSchema = z
  .object({
    name: name.optional(),
    description: description.optional(),
    price: price.optional(),
    imageUrl: imageUrl.optional(),
    personalizationType: personalizationType.optional(),
    categoryId: categoryId.optional(),
  })
  .strict()
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'יש לשלוח לפחות שדה אחד לעדכון',
  });

export const PRODUCT_SORTS = ['newest', 'price_asc', 'price_desc', 'name'] as const;

export const productListQuerySchema = paginationQuerySchema.extend({
  search: optionalSearchQuery,
  categoryId: optionalPositiveIntQuery,
  sort: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.enum(PRODUCT_SORTS).default('newest'),
  ),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type ProductListQuery = z.infer<typeof productListQuerySchema>;
