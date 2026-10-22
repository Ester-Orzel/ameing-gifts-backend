import { execSync } from 'node:child_process';

/**
 * רץ פעם אחת לפני כל הבדיקות: מוודא שיש מסד בדיקות נפרד, ומריץ עליו את ה-Migrations.
 */
export default function setup(): void {
  const testUrl = process.env.TEST_DATABASE_URL;
  if (!testUrl) {
    throw new Error(
      'חסר TEST_DATABASE_URL בקובץ .env. צרי מסד נתונים נפרד לבדיקות (למשל gifts_test) והגדירי את הכתובת שלו.',
    );
  }
  if (process.env.DATABASE_URL && testUrl === process.env.DATABASE_URL) {
    throw new Error(
      'TEST_DATABASE_URL זהה ל-DATABASE_URL. הבדיקות מוחקות נתונים, ולכן חייבים מסד נתונים נפרד לבדיקות.',
    );
  }

  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: testUrl },
  });
}
