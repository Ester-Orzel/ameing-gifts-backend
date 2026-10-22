import jwt from 'jsonwebtoken';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { api, bearer, createFixtures, EMAILS, type Fixtures, loginAs, prisma, resetDatabase } from './helpers';

let fx: Fixtures;
let adminToken: string;
let customerToken: string;

beforeAll(async () => {
  await resetDatabase();
  fx = await createFixtures();
  adminToken = await loginAs(EMAILS.admin);
  customerToken = await loginAs(EMAILS.rachel);
});

afterAll(async () => {
  await prisma.$disconnect();
});

const validProduct = () => ({
  name: 'ספל קרמיקה',
  description: 'ספל קרמיקה לבן לבדיקה',
  price: 45.5,
  imageUrl: 'https://example.com/mug.png',
  personalizationType: 'NAME_OR_INITIAL',
  categoryId: fx.bottlesCategoryId,
});

describe('GET /api/products (ציבורי)', () => {
  it('מחזיר רשימה עם עמודים, בלי התחברות', async () => {
    const res = await api().get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ page: 1, limit: 12, total: 3, totalPages: 1 });
    expect(res.body.items).toHaveLength(3);
    expect(res.body.items[0]).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        price: expect.any(Number),
        category: expect.objectContaining({ name: expect.any(String) }),
      }),
    );
  });

  it('מחפש לפי חלק מהשם', async () => {
    const res = await api().get('/api/products').query({ search: 'בקבוק' });
    expect(res.status).toBe(200);
    expect(res.body.items.map((p: { id: number }) => p.id)).toEqual([fx.bottleId]);
  });

  it('מסנן לפי קטגוריה', async () => {
    const res = await api().get('/api/products').query({ categoryId: fx.accessoriesCategoryId });
    expect(res.body.items.map((p: { id: number }) => p.id)).toEqual([fx.keychainId]);
  });

  it('ממיין לפי מחיר בשני הכיוונים', async () => {
    const asc = await api().get('/api/products').query({ sort: 'price_asc' });
    expect(asc.body.items.map((p: { price: number }) => p.price)).toEqual([39.9, 69.9, 89.9]);
    const desc = await api().get('/api/products').query({ sort: 'price_desc' });
    expect(desc.body.items.map((p: { price: number }) => p.price)).toEqual([89.9, 69.9, 39.9]);
  });

  it('מחלק לעמודים', async () => {
    const res = await api().get('/api/products').query({ sort: 'price_asc', limit: 2, page: 2 });
    expect(res.body).toMatchObject({ page: 2, limit: 2, total: 3, totalPages: 2 });
    expect(res.body.items.map((p: { price: number }) => p.price)).toEqual([89.9]);
  });

  it('מתעלם מפרמטרים ריקים', async () => {
    const res = await api().get('/api/products?search=&categoryId=&sort=');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
  });

  it('מחזיר 400 לפרמטרים לא תקינים', async () => {
    expect((await api().get('/api/products').query({ sort: 'cheapest' })).status).toBe(400);
    expect((await api().get('/api/products').query({ categoryId: 'abc' })).status).toBe(400);
    expect((await api().get('/api/products').query({ limit: 500 })).status).toBe(400);
  });
});

describe('GET /api/products/:id', () => {
  it('מחזיר מוצר', async () => {
    const res = await api().get(`/api/products/${fx.keychainId}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: fx.keychainId, price: 39.9, personalizationType: 'INITIAL_ONLY' });
  });

  it('מחזיר 404 למוצר שלא קיים', async () => {
    expect((await api().get('/api/products/99999')).status).toBe(404);
  });

  it('מחזיר 400 למזהה לא מספרי', async () => {
    expect((await api().get('/api/products/abc')).status).toBe(400);
  });
});

describe('POST /api/products (מנהל)', () => {
  it('מנהל מוסיף מוצר', async () => {
    const res = await api().post('/api/products').set(bearer(adminToken)).send(validProduct());
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'ספל קרמיקה', price: 45.5, categoryId: fx.bottlesCategoryId });
    expect(await prisma.product.count()).toBe(4);
  });

  it('מחזיר 401 בלי Token', async () => {
    const res = await api().post('/api/products').send(validProduct());
    expect(res.status).toBe(401);
  });

  it('מחזיר 403 ללקוח', async () => {
    const res = await api().post('/api/products').set(bearer(customerToken)).send(validProduct());
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('התפקיד נקבע לפי מסד הנתונים ולא לפי מה שכתוב ב-Token', async () => {
    // Token חתום נכון, אבל עם role=ADMIN עבור לקוחה רגילה
    const tampered = jwt.sign({ role: 'ADMIN' }, process.env.JWT_SECRET!, {
      subject: String(fx.rachelId),
      expiresIn: 600,
    });
    const res = await api().post('/api/products').set(bearer(tampered)).send(validProduct());
    expect(res.status).toBe(403);
  });

  it('מחזיר 400 לנתונים לא תקינים', async () => {
    const res = await api()
      .post('/api/products')
      .set(bearer(adminToken))
      .send({ ...validProduct(), price: -5, imageUrl: 'not a url', personalizationType: 'ANY' });
    expect(res.status).toBe(400);
    const fields = res.body.error.details.map((d: { field: string }) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['price', 'imageUrl', 'personalizationType']));
  });

  it('מחזיר 400 למחיר עם יותר מ-2 ספרות אחרי הנקודה', async () => {
    const res = await api().post('/api/products').set(bearer(adminToken)).send({ ...validProduct(), price: 10.123 });
    expect(res.status).toBe(400);
  });

  it('מחזיר 400 לקטגוריה שלא קיימת', async () => {
    const res = await api().post('/api/products').set(bearer(adminToken)).send({ ...validProduct(), categoryId: 9999 });
    expect(res.status).toBe(400);
    expect(res.body.error.details[0].field).toBe('categoryId');
  });

  it('מחזיר 400 כשחסרים שדות חובה', async () => {
    const res = await api().post('/api/products').set(bearer(adminToken)).send({ name: 'רק שם' });
    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/products/:id (מנהל)', () => {
  it('מנהל מעדכן מחיר בלבד', async () => {
    const res = await api().patch(`/api/products/${fx.bottleId}`).set(bearer(adminToken)).send({ price: 74.9 });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: fx.bottleId, price: 74.9, name: 'בקבוק שחור' });
  });

  it('מנהל מעביר מוצר לקטגוריה אחרת', async () => {
    const res = await api()
      .patch(`/api/products/${fx.bottleId}`)
      .set(bearer(adminToken))
      .send({ categoryId: fx.accessoriesCategoryId });
    expect(res.status).toBe(200);
    expect(res.body.category.id).toBe(fx.accessoriesCategoryId);
  });

  it('מחזיר 400 לגוף ריק', async () => {
    const res = await api().patch(`/api/products/${fx.bottleId}`).set(bearer(adminToken)).send({});
    expect(res.status).toBe(400);
  });

  it('מחזיר 404 למוצר שלא קיים', async () => {
    const res = await api().patch('/api/products/99999').set(bearer(adminToken)).send({ price: 10 });
    expect(res.status).toBe(404);
  });

  it('מחזיר 403 ללקוח', async () => {
    const res = await api().patch(`/api/products/${fx.bottleId}`).set(bearer(customerToken)).send({ price: 1 });
    expect(res.status).toBe(403);
  });
});
