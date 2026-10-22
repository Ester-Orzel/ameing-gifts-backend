import { z, ZodIssueCode, type ZodErrorMap } from 'zod';

/**
 * הודעות שגיאה בעברית לבדיקות של Zod.
 * הודעה שנכתבה ידנית בסכמה (למשל .min(2, 'הודעה')) תמיד גוברת על המפה הזו.
 */
export const hebrewErrorMap: ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === 'undefined' || issue.received === 'null') {
        return { message: 'שדה חובה' };
      }
      if (issue.expected === 'number' || issue.expected === 'integer') {
        return { message: 'יש להזין מספר' };
      }
      if (issue.expected === 'string') return { message: 'יש להזין טקסט' };
      if (issue.expected === 'array') return { message: 'יש לשלוח רשימה' };
      if (issue.expected === 'object') return { message: 'יש לשלוח אובייקט JSON' };
      return { message: 'סוג ערך לא תקין' };
    case ZodIssueCode.invalid_enum_value:
      return { message: `ערך לא תקין. ערכים אפשריים: ${issue.options.join(', ')}` };
    case ZodIssueCode.invalid_string:
      if (issue.validation === 'email') return { message: 'כתובת אימייל לא תקינה' };
      if (issue.validation === 'url') return { message: 'כתובת URL לא תקינה' };
      return { message: 'פורמט לא תקין' };
    case ZodIssueCode.too_small:
      if (issue.type === 'string') return { message: `יש להזין לפחות ${String(issue.minimum)} תווים` };
      if (issue.type === 'array') return { message: `יש לשלוח לפחות ${String(issue.minimum)} פריטים` };
      if (issue.type === 'number') return { message: `הערך חייב להיות לפחות ${String(issue.minimum)}` };
      return { message: 'ערך קטן מדי' };
    case ZodIssueCode.too_big:
      if (issue.type === 'string') return { message: `ניתן להזין עד ${String(issue.maximum)} תווים` };
      if (issue.type === 'array') return { message: `ניתן לשלוח עד ${String(issue.maximum)} פריטים` };
      if (issue.type === 'number') return { message: `הערך יכול להיות לכל היותר ${String(issue.maximum)}` };
      return { message: 'ערך גדול מדי' };
    case ZodIssueCode.unrecognized_keys:
      return { message: `שדות לא מוכרים: ${issue.keys.join(', ')}` };
    case ZodIssueCode.not_finite:
      return { message: 'יש להזין מספר תקין' };
    default:
      return { message: ctx.defaultError };
  }
};

z.setErrorMap(hebrewErrorMap);
