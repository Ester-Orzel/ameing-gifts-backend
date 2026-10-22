import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { openApiDocument } from '../src/docs/openapi';
import { api, prisma } from './helpers';

afterAll(async () => {
  await prisma.$disconnect();
});

describe('בדיקת בריאות', () => {
  it('GET /api/health מחזיר ok כשמסד הנתונים זמין', async () => {
    const res = await api().get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok', database: 'ok' });
  });

  it('כתובת שלא קיימת מחזירה 404 בפורמט JSON', async () => {
    const res = await api().get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('ROUTE_NOT_FOUND');
  });
});

describe('CORS', () => {
  it('מאפשר את כתובת ה-React שהוגדרה', async () => {
    const res = await api().options('/api/products').set('Origin', 'http://localhost:5173').set('Access-Control-Request-Method', 'GET');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  it('לא מאשר כתובת שלא הוגדרה', async () => {
    const res = await api().get('/api/health').set('Origin', 'https://evil.example.com');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});

describe('Swagger', () => {
  it('GET /api-docs/ מחזיר את דף Swagger UI', async () => {
    const res = await api().get('/api-docs/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('swagger-ui');
  });

  it('GET /api-docs.json מחזיר OpenAPI 3 עם Bearer JWT', async () => {
    const res = await api().get('/api-docs.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\./);
    expect(res.body.components.securitySchemes.bearerAuth).toMatchObject({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' });
  });

  it('כל ה-Endpoints מתועדים', () => {
    const expected = [
      'GET /api/health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/me',
      'GET /api/products',
      'POST /api/products',
      'GET /api/products/{id}',
      'PATCH /api/products/{id}',
      'POST /api/orders',
      'GET /api/orders',
      'GET /api/orders/my',
      'GET /api/orders/{id}',
      'PATCH /api/orders/{id}/status',
      'GET /api/categories',
      'POST /api/categories',
      'PATCH /api/categories/{id}',
      'GET /api/fonts',
      'POST /api/fonts',
      'PATCH /api/fonts/{id}',
      'GET /api/colors',
      'POST /api/colors',
      'PATCH /api/colors/{id}',
    ];
    const documented = Object.entries(openApiDocument.paths as Record<string, Record<string, unknown>>).flatMap(
      ([path, ops]) => Object.keys(ops).map((method) => `${method.toUpperCase()} ${path}`),
    );
    expect(documented.sort()).toEqual([...expected].sort());
  });

  it('הקובץ docs/openapi.json מעודכן (אם נכשל: npm run docs:generate)', () => {
    const file = JSON.parse(readFileSync(join(__dirname, '..', 'docs', 'openapi.json'), 'utf8'));
    expect(file).toEqual(JSON.parse(JSON.stringify(openApiDocument)));
  });
});
