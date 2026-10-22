import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { getCorsOrigins } from './config/env';
import { openApiDocument } from './docs/openapi';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { apiRouter } from './routes';

/**
 * בניית אפליקציית Express. מופרד מ-server.ts כדי שהבדיקות יוכלו
 * להשתמש באפליקציה בלי להפעיל שרת אמיתי.
 */
export function createApp(): Express {
  const app = express();

  // Render ושירותי ענן אחרים עובדים מאחורי Proxy
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // כותרות אבטחה. CSP כבוי כי השרת מחזיר JSON, ו-Swagger UI צריך סקריפטים משלו
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

  app.use(
    cors({
      origin: getCorsOrigins(),
      methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 600,
    }),
  );

  app.use(express.json({ limit: '100kb' }));

  // דף הבית: הפניה לתיעוד
  app.get('/', (_req, res) => {
    res.json({
      name: 'Ameing Gifts API',
      docs: '/api-docs',
      health: '/api/health',
    });
  });

  // תיעוד Swagger
  app.get('/api-docs.json', (_req, res) => {
    res.json(openApiDocument);
  });
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      customSiteTitle: 'Ameing Gifts API',
      swaggerOptions: { persistAuthorization: true, displayRequestDuration: true },
    }),
  );

  app.use('/api', apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
