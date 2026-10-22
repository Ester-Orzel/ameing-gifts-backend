import { describe, expect, it } from 'vitest';
import { canChangeStatus } from '../../src/domain/orderStatus';
import { isKindAllowedForProduct, validatePersonalization } from '../../src/domain/personalization';
import { hasAtMostTwoDecimals, sumPrices } from '../../src/domain/pricing';
import { buildDemoOrders, CUSTOMERS, PRODUCTS } from '../../src/db/seed/data';

describe('כללי הדפסה אישית', () => {
  const ok = { fontId: 1, colorId: 1 };

  it.each(['Miriam', 'רחל כהן', 'בת-שבע', 'Esty'])('שם תקין: %s', (text) => {
    expect(validatePersonalization({ personalizationKind: 'NAME', personalizationText: text, ...ok })).toEqual([]);
  });

  it.each(['A', 'Esty1', 'Esty 😀', 'A'.repeat(21)])('שם לא תקין: %s', (text) => {
    expect(validatePersonalization({ personalizationKind: 'NAME', personalizationText: text, ...ok })).toHaveLength(1);
  });

  it.each(['B', 'מ'])('אות תקינה: %s', (text) => {
    expect(validatePersonalization({ personalizationKind: 'INITIAL', personalizationText: text, ...ok })).toEqual([]);
  });

  it.each(['BM', '7', ''])('אות לא תקינה: "%s"', (text) => {
    expect(validatePersonalization({ personalizationKind: 'INITIAL', personalizationText: text, ...ok })).not.toEqual([]);
  });

  it('בלי הדפסה: אסור טקסט, גופן וצבע', () => {
    expect(validatePersonalization({ personalizationKind: 'NONE' })).toEqual([]);
    expect(
      validatePersonalization({ personalizationKind: 'NONE', personalizationText: 'x', fontId: 1, colorId: 1 }),
    ).toHaveLength(3);
  });

  it('שם מותר רק במוצר NAME_OR_INITIAL', () => {
    expect(isKindAllowedForProduct('NAME', 'NAME_OR_INITIAL')).toBe(true);
    expect(isKindAllowedForProduct('NAME', 'INITIAL_ONLY')).toBe(false);
    expect(isKindAllowedForProduct('INITIAL', 'INITIAL_ONLY')).toBe(true);
  });
});

describe('מחירים', () => {
  it('סכום מדויק לאגורה', () => {
    expect(sumPrices([0.1, 0.2])).toBe(0.3);
    expect(sumPrices([89.9, 39.9, 69.9])).toBe(199.7);
  });

  it('עד שתי ספרות אחרי הנקודה', () => {
    expect(hasAtMostTwoDecimals(49.9)).toBe(true);
    expect(hasAtMostTwoDecimals(10.123)).toBe(false);
  });
});

describe('סטטוס הזמנה', () => {
  it('נמסרה ובוטלה הם סופיים', () => {
    expect(canChangeStatus('RECEIVED', 'READY')).toBe(true);
    expect(canChangeStatus('DELIVERED', 'READY')).toBe(false);
    expect(canChangeStatus('CANCELLED', 'RECEIVED')).toBe(false);
  });
});

describe('נתוני הדגמה', () => {
  const orders = buildDemoOrders(new Date('2026-10-21T12:00:00Z'));

  it('30 הזמנות, וכל הפריטים עומדים בכללי ההדפסה', () => {
    expect(orders).toHaveLength(30);
    for (const order of orders) {
      expect(order.customer).toBeLessThan(CUSTOMERS.length);
      if (order.deliveryMethod === 'DELIVERY') expect(order.deliveryAddress).toBeTruthy();
      for (const item of order.items) {
        const product = PRODUCTS[item.product]!;
        expect(isKindAllowedForProduct(item.personalizationKind, product.personalizationType)).toBe(true);
        expect(
          validatePersonalization({
            personalizationKind: item.personalizationKind,
            personalizationText: item.personalizationText,
            fontId: item.font === null ? null : item.font + 1,
            colorId: item.color === null ? null : item.color + 1,
          }),
        ).toEqual([]);
      }
    }
  });

  it('אותו פלט בכל הרצה', () => {
    expect(buildDemoOrders(new Date('2026-10-21T12:00:00Z'))).toEqual(orders);
  });
});
