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

describe('קטגוריות', () => {
  it('רשימה ציבורית עם מספר מוצרים בכל קטגוריה', async () => {
    const res = await api().get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: fx.bottlesCategoryId, name: 'בקבוקים', productsCount: 2 },
      { id: fx.accessoriesCategoryId, name: 'אביזרים', productsCount: 1 },
    ]);
  });

  it('מנהל מוסיף ומשנה שם', async () => {
    const created = await api().post('/api/categories').set(bearer(adminToken)).send({ name: 'מוצרים לבית' });
    expect(created.status).toBe(201);
    const renamed = await api()
      .patch(`/api/categories/${created.body.id}`)
      .set(bearer(adminToken))
      .send({ name: 'לבית' });
    expect(renamed.status).toBe(200);
    expect(renamed.body.name).toBe('לבית');
  });

  it('מחזיר 409 לשם שכבר קיים', async () => {
    const res = await api().post('/api/categories').set(bearer(adminToken)).send({ name: 'בקבוקים' });
    expect(res.status).toBe(409);
  });

  it('מחזיר 403 ללקוח ו-401 בלי Token', async () => {
    expect((await api().post('/api/categories').set(bearer(customerToken)).send({ name: 'חדשה' })).status).toBe(403);
    expect((await api().post('/api/categories').send({ name: 'חדשה' })).status).toBe(401);
  });

  it('מחזיר 404 לקטגוריה שלא קיימת', async () => {
    const res = await api().patch('/api/categories/9999').set(bearer(adminToken)).send({ name: 'כלשהו' });
    expect(res.status).toBe(404);
  });
});

describe('גופנים', () => {
  it('רשימה ציבורית', async () => {
    const res = await api().get('/api/fonts');
    expect(res.status).toBe(200);
    expect(res.body.map((f: { name: string }) => f.name)).toEqual(['Assistant', 'Great Vibes']);
  });

  it('מנהל מוסיף גופן', async () => {
    const res = await api().post('/api/fonts').set(bearer(adminToken)).send({ name: 'Pacifico' });
    expect(res.status).toBe(201);
  });

  it('לקוח לא יכול להוסיף גופן', async () => {
    expect((await api().post('/api/fonts').set(bearer(customerToken)).send({ name: 'Lobster' })).status).toBe(403);
  });
});

describe('צבעים', () => {
  it('רשימה ציבורית', async () => {
    const res = await api().get('/api/colors');
    expect(res.status).toBe(200);
    expect(res.body[0]).toEqual({ id: fx.goldId, name: 'זהב', hexCode: '#D4AF37' });
  });

  it('מנהל מוסיף צבע, וקוד הצבע נשמר באותיות גדולות', async () => {
    const res = await api().post('/api/colors').set(bearer(adminToken)).send({ name: 'טורקיז', hexCode: '#40e0d0' });
    expect(res.status).toBe(201);
    expect(res.body.hexCode).toBe('#40E0D0');
  });

  it('מחזיר 400 לקוד צבע לא תקין', async () => {
    const res = await api().post('/api/colors').set(bearer(adminToken)).send({ name: 'אדום', hexCode: 'red' });
    expect(res.status).toBe(400);
    expect(res.body.error.details[0].field).toBe('hexCode');
  });

  it('מנהל מעדכן רק את קוד הצבע', async () => {
    const res = await api().patch(`/api/colors/${fx.silverId}`).set(bearer(adminToken)).send({ hexCode: '#BFBFBF' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name: 'כסף', hexCode: '#BFBFBF' });
  });
});
