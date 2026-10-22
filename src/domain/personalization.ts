import type { PersonalizationKindValue, PersonalizationTypeValue } from './types';

/**
 * כללי ההדפסה האישית. לוגיקה טהורה, ללא מסד נתונים, כדי שיהיה קל לבדוק אותה.
 */

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 20;

const LETTER = '[A-Za-z\\u05D0-\\u05EA]';
/** אות אחת בעברית או באנגלית */
const INITIAL_REGEX = new RegExp(`^${LETTER}$`);
/** שם: אותיות בעברית או באנגלית, רווח בודד בין מילים, מקף או גרש בתוך מילה */
const NAME_REGEX = new RegExp(`^${LETTER}+(?:['\\-\\u05F3]${LETTER}+)*(?: ${LETTER}+(?:['\\-\\u05F3]${LETTER}+)*)*$`);

export interface PersonalizationInput {
  personalizationKind: PersonalizationKindValue;
  personalizationText?: string | null;
  fontId?: number | null;
  colorId?: number | null;
}

export interface PersonalizationIssue {
  field: 'personalizationText' | 'fontId' | 'colorId' | 'personalizationKind';
  message: string;
}

/** מסיר רווחים מיותרים: בהתחלה, בסוף, וכפולים באמצע */
export function normalizePersonalizationText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

function hasValue<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * בודק שפרטי ההדפסה של פריט אחד תקינים מבחינת מבנה.
 * מחזיר רשימת בעיות. רשימה ריקה = תקין.
 */
export function validatePersonalization(input: PersonalizationInput): PersonalizationIssue[] {
  const issues: PersonalizationIssue[] = [];
  const text = hasValue(input.personalizationText)
    ? normalizePersonalizationText(input.personalizationText)
    : '';

  if (input.personalizationKind === 'NONE') {
    if (text.length > 0) {
      issues.push({ field: 'personalizationText', message: 'פריט ללא הדפסה לא יכול לכלול טקסט' });
    }
    if (hasValue(input.fontId)) {
      issues.push({ field: 'fontId', message: 'פריט ללא הדפסה לא יכול לכלול גופן' });
    }
    if (hasValue(input.colorId)) {
      issues.push({ field: 'colorId', message: 'פריט ללא הדפסה לא יכול לכלול צבע' });
    }
    return issues;
  }

  if (!hasValue(input.fontId)) {
    issues.push({ field: 'fontId', message: 'יש לבחור גופן להדפסה' });
  }
  if (!hasValue(input.colorId)) {
    issues.push({ field: 'colorId', message: 'יש לבחור צבע להדפסה' });
  }

  if (text.length === 0) {
    issues.push({ field: 'personalizationText', message: 'יש לכתוב את הטקסט להדפסה' });
    return issues;
  }

  if (input.personalizationKind === 'INITIAL') {
    if (!INITIAL_REGEX.test(text)) {
      issues.push({
        field: 'personalizationText',
        message: 'בהדפסת אות יש לכתוב אות אחת בלבד, בעברית או באנגלית',
      });
    }
    return issues;
  }

  // NAME
  if (text.length < NAME_MIN_LENGTH || text.length > NAME_MAX_LENGTH) {
    issues.push({
      field: 'personalizationText',
      message: `שם להדפסה חייב להכיל בין ${NAME_MIN_LENGTH} ל-${NAME_MAX_LENGTH} תווים`,
    });
  } else if (!NAME_REGEX.test(text)) {
    issues.push({
      field: 'personalizationText',
      message: 'שם להדפסה יכול להכיל רק אותיות בעברית או באנגלית, רווחים, מקף או גרש',
    });
  }
  return issues;
}

/**
 * בודק שסוג ההדפסה שהלקוח בחר מותר עבור המוצר.
 */
export function isKindAllowedForProduct(
  kind: PersonalizationKindValue,
  productType: PersonalizationTypeValue,
): boolean {
  if (kind === 'NAME') return productType === 'NAME_OR_INITIAL';
  return true; // NONE ו-INITIAL מותרים בכל מוצר
}
