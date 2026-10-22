import 'dotenv/config';
import { z } from 'zod';

/**
 * קריאה ובדיקה של משתני הסביבה.
 * אם חסר משתנה חובה, השרת לא יעלה ויכתוב הודעה ברורה מה חסר.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z
    .string({ required_error: 'DATABASE_URL חסר - כתובת החיבור למסד הנתונים' })
    .min(1, 'DATABASE_URL חסר - כתובת החיבור למסד הנתונים'),
  JWT_SECRET: z
    .string({ required_error: 'JWT_SECRET חסר - מפתח סודי לחתימת Token' })
    .min(32, 'JWT_SECRET חייב להכיל לפחות 32 תווים'),
  JWT_EXPIRES_MINUTES: z.coerce.number().int().positive().max(60 * 24 * 7).default(120),
  CORS_ORIGINS: z.string().default('*'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(14).default(10),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const problems = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    // eslint-disable-next-line no-console
    console.error(`\n❌ הגדרות סביבה לא תקינות:\n${problems}\n\nבדקי את קובץ .env או את משתני הסביבה ב-Render.\n`);
    throw new Error('Invalid environment configuration');
  }
  return parsed.data;
}

export const env = loadEnv();

/** רשימת הכתובות המורשות ל-CORS. true = כל כתובת */
export function getCorsOrigins(): true | string[] {
  const raw = env.CORS_ORIGINS.trim();
  if (raw === '' || raw === '*') return true;
  return raw
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter((origin) => origin.length > 0);
}
