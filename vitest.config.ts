import 'dotenv/config';
import { defineConfig } from 'vitest/config';

/**
 * הבדיקות רצות מול מסד נתונים PostgreSQL אמיתי ונפרד (TEST_DATABASE_URL).
 * הבדיקות מוחקות את כל הנתונים במסד הזה! לעולם לא להפנות אותו למסד האמיתי.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    globalSetup: ['./tests/setup/global-setup.ts'],
    // קבצי בדיקה רצים אחד אחרי השני, כי כולם משתמשים באותו מסד נתונים
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 60_000,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? '',
      JWT_SECRET: 'test-only-secret-not-for-production-0123456789abcdef',
      JWT_EXPIRES_MINUTES: '60',
      BCRYPT_ROUNDS: '4',
      CORS_ORIGINS: 'http://localhost:5173',
    },
  },
});
