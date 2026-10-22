import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './db/prisma';

const app = createApp();

// 0.0.0.0 כדי שהשרת יהיה נגיש גם בענן (Render)
const server = app.listen(env.PORT, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`✅ Server running on port ${env.PORT}`);
  // eslint-disable-next-line no-console
  console.log(`📚 Swagger: http://localhost:${env.PORT}/api-docs`);
});

async function shutdown(signal: string): Promise<void> {
  // eslint-disable-next-line no-console
  console.log(`${signal} received, shutting down...`);
  server.close(() => {
    void prisma.$disconnect().finally(() => process.exit(0));
  });
  // אם הסגירה נתקעת - יציאה בכוח אחרי 10 שניות
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
