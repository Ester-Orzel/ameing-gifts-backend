import { z } from 'zod';
import './zodHebrew';

const catalogName = z
  .string()
  .trim()
  .min(2, 'שם חייב להכיל לפחות 2 תווים')
  .max(40, 'שם יכול להכיל עד 40 תווים');

const hexCode = z
  .string()
  .trim()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'קוד צבע חייב להיות בפורמט #RRGGBB, למשל #D4AF37')
  .transform((value) => value.toUpperCase());

const atLeastOneField = (data: Record<string, unknown>) =>
  Object.values(data).some((value) => value !== undefined);

export const categoryCreateSchema = z.object({ name: catalogName }).strict();
export const categoryUpdateSchema = categoryCreateSchema;

export const fontCreateSchema = z.object({ name: catalogName }).strict();
export const fontUpdateSchema = fontCreateSchema;

export const colorCreateSchema = z.object({ name: catalogName, hexCode }).strict();
export const colorUpdateSchema = z
  .object({ name: catalogName.optional(), hexCode: hexCode.optional() })
  .strict()
  .refine(atLeastOneField, { message: 'יש לשלוח לפחות שדה אחד לעדכון' });

export type CategoryInput = z.infer<typeof categoryCreateSchema>;
export type FontInput = z.infer<typeof fontCreateSchema>;
export type ColorCreateInput = z.infer<typeof colorCreateSchema>;
export type ColorUpdateInput = z.infer<typeof colorUpdateSchema>;
