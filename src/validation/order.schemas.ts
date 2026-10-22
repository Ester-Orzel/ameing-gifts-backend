import { z } from 'zod';
import { DELIVERY_METHODS, ORDER_STATUSES, PERSONALIZATION_KINDS } from '../domain/types';
import { normalizePersonalizationText, validatePersonalization } from '../domain/personalization';
import {
  optionalSearchQuery,
  optionalTrimmedString,
  paginationQuerySchema,
  personNameSchema,
  phoneSchema,
} from './common';

export const MAX_ITEMS_PER_ORDER = 20;

const optionalId = z.preprocess(
  (value) => (value === null ? undefined : value),
  z.number().int('מזהה לא תקין').positive('מזהה לא תקין').optional(),
);

const orderItemSchema = z
  .object({
    productId: z.number({ required_error: 'יש לבחור מוצר' }).int('מזהה מוצר לא תקין').positive('מזהה מוצר לא תקין'),
    personalizationKind: z.enum(PERSONALIZATION_KINDS),
    personalizationText: z.preprocess(
      (value) => (value === null ? undefined : value),
      z.string().max(40).optional(),
    ),
    fontId: optionalId,
    colorId: optionalId,
  })
  .strict()
  .superRefine((item, ctx) => {
    for (const issue of validatePersonalization(item)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [issue.field], message: issue.message });
    }
  })
  .transform((item) => {
    if (item.personalizationKind === 'NONE') {
      return {
        productId: item.productId,
        personalizationKind: item.personalizationKind,
        personalizationText: null,
        fontId: null,
        colorId: null,
      };
    }
    return {
      productId: item.productId,
      personalizationKind: item.personalizationKind,
      personalizationText: normalizePersonalizationText(item.personalizationText ?? ''),
      fontId: item.fontId ?? null,
      colorId: item.colorId ?? null,
    };
  });

export const orderCreateSchema = z
  .object({
    deliveryMethod: z.enum(DELIVERY_METHODS),
    contactName: personNameSchema,
    contactPhone: phoneSchema,
    deliveryAddress: optionalTrimmedString(200),
    notes: optionalTrimmedString(500),
    items: z
      .array(orderItemSchema, { required_error: 'יש לשלוח לפחות פריט אחד' })
      .min(1, 'יש לשלוח לפחות פריט אחד')
      .max(MAX_ITEMS_PER_ORDER, `ניתן להזמין עד ${MAX_ITEMS_PER_ORDER} פריטים בהזמנה אחת`),
  })
  .strict()
  .superRefine((order, ctx) => {
    if (order.deliveryMethod === 'DELIVERY') {
      if (!order.deliveryAddress || order.deliveryAddress.length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['deliveryAddress'],
          message: 'במשלוח יש להזין כתובת מלאה (לפחות 5 תווים)',
        });
      }
    }
  })
  .transform((order) => ({
    ...order,
    // באיסוף עצמי הכתובת לא נשמרת, גם אם נשלחה
    deliveryAddress: order.deliveryMethod === 'DELIVERY' ? (order.deliveryAddress ?? null) : null,
    notes: order.notes ?? null,
  }));

export const orderStatusUpdateSchema = z
  .object({ status: z.enum(ORDER_STATUSES) })
  .strict();

export const ORDER_SORTS = ['newest', 'oldest'] as const;

const orderSort = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.enum(ORDER_SORTS).default('newest'),
);

const optionalStatus = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.enum(ORDER_STATUSES).optional(),
);

/** פרמטרים לרשימת כל ההזמנות (מנהל) */
export const adminOrderListQuerySchema = paginationQuerySchema.extend({
  status: optionalStatus,
  search: optionalSearchQuery,
  sort: orderSort,
});

/** פרמטרים לרשימת ההזמנות שלי (לקוח) */
export const myOrderListQuerySchema = paginationQuerySchema.extend({
  status: optionalStatus,
  sort: orderSort,
});

export type OrderCreateInput = z.infer<typeof orderCreateSchema>;
export type OrderItemInput = OrderCreateInput['items'][number];
export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>;
export type AdminOrderListQuery = z.infer<typeof adminOrderListQuerySchema>;
export type MyOrderListQuery = z.infer<typeof myOrderListQuerySchema>;
