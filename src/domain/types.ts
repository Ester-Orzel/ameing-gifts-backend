/**
 * ערכי הבחירה של המערכת. זהים ל-enums שב-prisma/schema.prisma.
 * הקובץ לא תלוי בשום ספרייה, כדי שאפשר יהיה לבדוק את הלוגיקה בנפרד.
 */
export const ROLES = ['CUSTOMER', 'ADMIN'] as const;
export type RoleValue = (typeof ROLES)[number];

export const PERSONALIZATION_TYPES = ['NAME_OR_INITIAL', 'INITIAL_ONLY'] as const;
export type PersonalizationTypeValue = (typeof PERSONALIZATION_TYPES)[number];

export const PERSONALIZATION_KINDS = ['NONE', 'NAME', 'INITIAL'] as const;
export type PersonalizationKindValue = (typeof PERSONALIZATION_KINDS)[number];

export const ORDER_STATUSES = ['RECEIVED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED'] as const;
export type OrderStatusValue = (typeof ORDER_STATUSES)[number];

export const DELIVERY_METHODS = ['DELIVERY', 'PICKUP'] as const;
export type DeliveryMethodValue = (typeof DELIVERY_METHODS)[number];

/** שמות בעברית להצגה ולתיעוד */
export const ORDER_STATUS_LABELS: Record<OrderStatusValue, string> = {
  RECEIVED: 'התקבלה',
  IN_PROGRESS: 'בהכנה',
  READY: 'מוכנה',
  DELIVERED: 'נמסרה',
  CANCELLED: 'בוטלה',
};
