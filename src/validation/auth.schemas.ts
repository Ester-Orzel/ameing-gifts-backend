import { z } from 'zod';
import { personNameSchema, phoneSchema } from './common';

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('כתובת אימייל לא תקינה')
  .max(120);

export const registerSchema = z
  .object({
    fullName: personNameSchema,
    email: emailSchema,
    phone: phoneSchema,
    password: z
      .string()
      .min(8, 'סיסמה חייבת להכיל לפחות 8 תווים')
      .max(72, 'סיסמה יכולה להכיל עד 72 תווים')
      .regex(/[A-Za-zא-ת]/, 'סיסמה חייבת להכיל לפחות אות אחת')
      .regex(/\d/, 'סיסמה חייבת להכיל לפחות ספרה אחת'),
  })
  .strict();

export const loginSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1, 'יש להזין סיסמה').max(72),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
