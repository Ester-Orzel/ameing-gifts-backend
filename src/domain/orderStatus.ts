import type { OrderStatusValue } from './types';

/** סטטוסים סופיים: אחרי שהזמנה הגיעה אליהם אי אפשר לשנות אותה */
export const FINAL_STATUSES: readonly OrderStatusValue[] = ['DELIVERED', 'CANCELLED'];

export function isFinalStatus(status: OrderStatusValue): boolean {
  return FINAL_STATUSES.includes(status);
}

/**
 * האם מותר לשנות סטטוס מ-from ל-to.
 * כלל פשוט: כל שינוי מותר, חוץ משינוי של הזמנה שכבר בסטטוס סופי.
 */
export function canChangeStatus(from: OrderStatusValue, _to: OrderStatusValue): boolean {
  return !isFinalStatus(from);
}
