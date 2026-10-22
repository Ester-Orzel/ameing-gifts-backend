import './zodHebrew';
import { z } from 'zod';

/** ממיר מחרוזת ריקה ל-undefined, כדי שפרמטר ריק בכתובת ייחשב כלא נשלח */
const emptyToUndefined = (value: unknown): unknown =>
  value === '' || value === null ? undefined : value;

/** מזהה מספרי חיובי מתוך הכתובת, למשל /api/products/:id */
export const idParamSchema = z.object({
  id: z.coerce
    .number({ invalid_type_error: 'מזהה לא תקין' })
    .int('מזהה לא תקין')
    .positive('מזהה לא תקין'),
});

/** מספר שלם חיובי אופציונלי מתוך פרמטר בכתובת (query string) */
export const optionalPositiveIntQuery = z.preprocess(
  emptyToUndefined,
  z.coerce.number().int('יש להזין מספר שלם').positive('יש להזין מספר חיובי').optional(),
);

/** מחרוזת חיפוש אופציונלית */
export const optionalSearchQuery = z.preprocess(
  emptyToUndefined,
  z.string().trim().max(80).optional(),
);

/** עמוד וגודל עמוד */
export const paginationQuerySchema = z.object({
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).default(1)),
  limit: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(50).default(12)),
});

/** מספר טלפון ישראלי: 9-10 ספרות שמתחילות ב-0. מקפים ורווחים מוסרים אוטומטית */
export const phoneSchema = z
  .string()
  .transform((value) => value.replace(/[\s-]/g, ''))
  .pipe(z.string().regex(/^0\d{8,9}$/, 'מספר טלפון לא תקין (9-10 ספרות שמתחילות ב-0)'));

/** שם של אדם */
export const personNameSchema = z
  .string()
  .trim()
  .min(2, 'שם חייב להכיל לפחות 2 תווים')
  .max(60, 'שם יכול להכיל עד 60 תווים');

/** מחרוזת אופציונלית: ריקה הופכת ל-undefined */
export function optionalTrimmedString(max: number) {
  return z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().max(max).optional(),
  );
}
