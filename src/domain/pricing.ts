/**
 * חישובי מחיר בעזרת אגורות (מספרים שלמים), כדי להימנע משגיאות עיגול של JavaScript
 * כמו 0.1 + 0.2 = 0.30000000000000004.
 */

/** ממיר מחיר בשקלים (למשל 49.9) לאגורות (4990) */
export function toAgorot(shekels: number): number {
  return Math.round(shekels * 100);
}

/** ממיר אגורות לשקלים */
export function fromAgorot(agorot: number): number {
  return agorot / 100;
}

/** סכום מחירים בשקלים, בדיוק של אגורה */
export function sumPrices(prices: readonly number[]): number {
  const totalAgorot = prices.reduce((sum, price) => sum + toAgorot(price), 0);
  return fromAgorot(totalAgorot);
}

/** האם המספר כולל לכל היותר שתי ספרות אחרי הנקודה */
export function hasAtMostTwoDecimals(value: number): boolean {
  return Math.abs(value * 100 - Math.round(value * 100)) < 1e-6;
}
