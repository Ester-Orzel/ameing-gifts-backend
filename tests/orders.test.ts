import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { api, bearer, createFixtures, EMAILS, type Fixtures, loginAs, prisma, resetDatabase } from './helpers';

let fx: Fixtures;
let adminToken: string;
let rachelToken: string;
let saraToken: string;

beforeAll(async () => {
  await resetDatabase();
  fx = await createFixtures();
  adminToken = await loginAs(EMAILS.admin);
  rachelToken = await loginAs(EMAILS.rachel);
  saraToken = await loginAs(EMAILS.sara);
});

afterAll(async () => {
  await prisma.$disconnect();
});

const deliveryOrder = () => ({
  deliveryMethod: 'DELIVERY',
  contactName: 'רחל בדיקה',
  contactPhone: '0521111111',
  deliveryAddress: 'רחוב הרצל 12, בני ברק',
  items: [
    {
      productId: fx.thermosId,
      personalizationKind: 'NAME',
      personalizationText: 'Miriam',
      fontId: fx.englishFontId,
      colorId: fx.goldId,
    },
    {
      productId: fx.keychainId,
      personalizationKind: 'INITIAL',
      personalizationText: 'B',
      fontId: fx.englishFontId,
      colorId: fx.silverId,
    },
    { productId: fx.bottleId, personalizationKind: 'NONE' },
  ],
});

describe('POST /api/orders', () => {
  it('לקוחה יוצרת הזמנה עם כמה פריטים, והמחיר מחושב בשרת', async () => {
    const res = await api().post('/api/orders').set(bearer(rachelToken)).send(deliveryOrder());
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      customerId: fx.rachelId,
      status: 'RECEIVED',
      deliveryMethod: 'DELIVERY',
      totalPrice: 199.7, // 89.9 + 39.9 + 69.9
      itemsCount: 3,
    });
    expect(res.body.items[0]).toMatchObject({
      productName: 'תרמוס ורוד',
      unitPrice: 89.9,
      personalizationKind: 'NAME',
      personalizationText: 'Miriam',
      font: { id: fx.englishFontId, name: 'Great Vibes' },
      color: { id: fx.goldId, name: 'זהב', hexCode: '#D4AF37' },
    });
    expect(res.body.items[2]).toMatchObject({ personalizationKind: 'NONE', personalizationText: null, font: null, color: null });
  });

  it('מחיר ששונה אחרי ההזמנה לא משנה הזמנה קיימת', async () => {
    const created = await api().post('/api/orders').set(bearer(rachelToken)).send(deliveryOrder());
    await prisma.product.update({ where: { id: fx.thermosId }, data: { price: 120 } });
    const res = await api().get(`/api/orders/${created.body.id}`).set(bearer(rachelToken));
    expect(res.body.totalPrice).toBe(199.7);
    expect(res.body.items[0].unitPrice).toBe(89.9);
    await prisma.product.update({ where: { id: fx.thermosId }, data: { price: 89.9 } });
  });

  it('איסוף עצמי: הכתובת לא נשמרת גם אם נשלחה', async () => {
    const res = await api()
      .post('/api/orders')
      .set(bearer(saraToken))
      .send({ ...deliveryOrder(), contactName: 'שרה בדיקה', deliveryMethod: 'PICKUP' });
    expect(res.status).toBe(201);
    expect(res.body.deliveryAddress).toBeNull();
    expect(res.body.customerId).toBe(fx.saraId);
  });

  it('הלקוח נקבע לפי ה-Token: שדה customerId בגוף הבקשה נדחה', async () => {
    const res = await api()
      .post('/api/orders')
      .set(bearer(rachelToken))
      .send({ ...deliveryOrder(), customerId: fx.saraId });
    expect(res.status).toBe(400);
  });

  it('לא מאפשר לשלוח מחיר מהדפדפן', async () => {
    const order = deliveryOrder();
    const res = await api()
      .post('/api/orders')
      .set(bearer(rachelToken))
      .send({ ...order, items: [{ ...order.items[2], unitPrice: 1 }] });
    expect(res.status).toBe(400);
  });

  it('מחזיר 400 למשלוח בלי כתובת', async () => {
    const { deliveryAddress: _omit, ...withoutAddress } = deliveryOrder();
    const res = await api().post('/api/orders').set(bearer(rachelToken)).send(withoutAddress);
    expect(res.status).toBe(400);
    expect(res.body.error.details[0].field).toBe('deliveryAddress');
  });

  it('מחזיר 400 להדפסת שם על מוצר שמאפשר אות בלבד', async () => {
    const res = await api()
      .post('/api/orders')
      .set(bearer(rachelToken))
      .send({
        ...deliveryOrder(),
        items: [
          {
            productId: fx.keychainId,
            personalizationKind: 'NAME',
            personalizationText: 'Esty',
            fontId: fx.englishFontId,
            colorId: fx.goldId,
          },
        ],
      });
    expect(res.status).toBe(400);
    expect(res.body.error.details[0].field).toBe('items.0.personalizationKind');
  });

  it('מחזיר 400 לאות שהיא יותר מתו אחד', async () => {
    const res = await api()
      .post('/api/orders')
      .set(bearer(rachelToken))
      .send({
        ...deliveryOrder(),
        items: [
          {
            productId: fx.keychainId,
            personalizationKind: 'INITIAL',
            personalizationText: 'BM',
            fontId: fx.englishFontId,
            colorId: fx.goldId,
          },
        ],
      });
    expect(res.status).toBe(400);
    expect(res.body.error.details[0].field).toBe('items.0.personalizationText');
  });

  it('מחזיר 400 להדפסה בלי גופן וצבע', async () => {
    const res = await api()
      .post('/api/orders')
      .set(bearer(rachelToken))
      .send({ ...deliveryOrder(), items: [{ productId: fx.thermosId, personalizationKind: 'NAME', personalizationText: 'Esty' }] });
    expect(res.status).toBe(400);
    const fields = res.body.error.details.map((d: { field: string }) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['items.0.fontId', 'items.0.colorId']));
  });

  it('מחזיר 400 לפריט ללא הדפסה שכולל גופן', async () => {
    const res = await api()
      .post('/api/orders')
      .set(bearer(rachelToken))
      .send({ ...deliveryOrder(), items: [{ productId: fx.bottleId, personalizationKind: 'NONE', fontId: fx.englishFontId }] });
    expect(res.status).toBe(400);
  });

  it('מחזיר 400 למוצר, גופן או צבע שלא קיימים', async () => {
    const res = await api()
      .post('/api/orders')
      .set(bearer(rachelToken))
      .send({
        ...deliveryOrder(),
        items: [{ productId: 9999, personalizationKind: 'INITIAL', personalizationText: 'A', fontId: 9999, colorId: 9999 }],
      });
    expect(res.status).toBe(400);
    const fields = res.body.error.details.map((d: { field: string }) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['items.0.productId', 'items.0.fontId', 'items.0.colorId']));
  });

  it('מחזיר 400 לסל ריק', async () => {
    const res = await api().post('/api/orders').set(bearer(rachelToken)).send({ ...deliveryOrder(), items: [] });
    expect(res.status).toBe(400);
  });

  it('מחזיר 401 בלי Token', async () => {
    const res = await api().post('/api/orders').send(deliveryOrder());
    expect(res.status).toBe(401);
  });

  it('מחזיר 403 למנהל (רק לקוחות מזמינים)', async () => {
    const res = await api().post('/api/orders').set(bearer(adminToken)).send(deliveryOrder());
    expect(res.status).toBe(403);
  });
});

describe('צפייה בהזמנות והרשאות', () => {
  it('GET /api/orders/my מחזיר רק את ההזמנות של הלקוחה המחוברת', async () => {
    const rachel = await api().get('/api/orders/my').set(bearer(rachelToken));
    expect(rachel.status).toBe(200);
    expect(rachel.body.total).toBe(2);
    expect(rachel.body.items.every((o: { customerId: number }) => o.customerId === fx.rachelId)).toBe(true);
    // ללקוח לא מוחזרים פרטי לקוח נוספים
    expect(rachel.body.items[0].customer).toBeUndefined();

    const sara = await api().get('/api/orders/my').set(bearer(saraToken));
    expect(sara.body.total).toBe(1);
  });

  it('לקוחה לא יכולה לראות הזמנה של לקוחה אחרת (404)', async () => {
    const saraOrder = await prisma.order.findFirstOrThrow({ where: { customerId: fx.saraId } });
    const res = await api().get(`/api/orders/${saraOrder.id}`).set(bearer(rachelToken));
    expect(res.status).toBe(404);
  });

  it('לקוחה רואה הזמנה שלה', async () => {
    const own = await prisma.order.findFirstOrThrow({ where: { customerId: fx.rachelId } });
    const res = await api().get(`/api/orders/${own.id}`).set(bearer(rachelToken));
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(own.id);
  });

  it('מנהל רואה כל הזמנה, כולל פרטי הלקוח', async () => {
    const saraOrder = await prisma.order.findFirstOrThrow({ where: { customerId: fx.saraId } });
    const res = await api().get(`/api/orders/${saraOrder.id}`).set(bearer(adminToken));
    expect(res.status).toBe(200);
    expect(res.body.customer).toMatchObject({ id: fx.saraId, email: EMAILS.sara });
  });

  it('GET /api/orders (כל ההזמנות) - מנהל בלבד', async () => {
    const asCustomer = await api().get('/api/orders').set(bearer(rachelToken));
    expect(asCustomer.status).toBe(403);

    const asAdmin = await api().get('/api/orders').set(bearer(adminToken));
    expect(asAdmin.status).toBe(200);
    expect(asAdmin.body.total).toBe(3);
  });

  it('GET /api/orders/my - מנהל מקבל 403', async () => {
    const res = await api().get('/api/orders/my').set(bearer(adminToken));
    expect(res.status).toBe(403);
  });

  it('מנהל מחפש לפי טלפון ולפי שם', async () => {
    const byPhone = await api().get('/api/orders').query({ search: '053-222' }).set(bearer(adminToken));
    expect(byPhone.body.total).toBe(1);
    expect(byPhone.body.items[0].customerId).toBe(fx.saraId);

    const byName = await api().get('/api/orders').query({ search: 'רחל' }).set(bearer(adminToken));
    expect(byName.body.total).toBe(2);
  });

  it('מנהל ממיין מהישנה לחדשה', async () => {
    const res = await api().get('/api/orders').query({ sort: 'oldest' }).set(bearer(adminToken));
    const ids = res.body.items.map((o: { id: number }) => o.id);
    expect(ids).toEqual([...ids].sort((a: number, b: number) => a - b));
  });
});

describe('PATCH /api/orders/:id/status', () => {
  it('מנהל מעדכן סטטוס, והסינון לפי סטטוס עובד', async () => {
    const order = await prisma.order.findFirstOrThrow({ where: { customerId: fx.saraId } });
    const res = await api().patch(`/api/orders/${order.id}/status`).set(bearer(adminToken)).send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('IN_PROGRESS');

    const filtered = await api().get('/api/orders').query({ status: 'IN_PROGRESS' }).set(bearer(adminToken));
    expect(filtered.body.items.map((o: { id: number }) => o.id)).toEqual([order.id]);

    const mine = await api().get('/api/orders/my').query({ status: 'IN_PROGRESS' }).set(bearer(saraToken));
    expect(mine.body.total).toBe(1);
  });

  it('לקוחה לא יכולה לעדכן סטטוס (403)', async () => {
    const own = await prisma.order.findFirstOrThrow({ where: { customerId: fx.rachelId } });
    const res = await api().patch(`/api/orders/${own.id}/status`).set(bearer(rachelToken)).send({ status: 'CANCELLED' });
    expect(res.status).toBe(403);
  });

  it('מחזיר 400 לסטטוס לא קיים', async () => {
    const own = await prisma.order.findFirstOrThrow({ where: { customerId: fx.rachelId } });
    const res = await api().patch(`/api/orders/${own.id}/status`).set(bearer(adminToken)).send({ status: 'LOST' });
    expect(res.status).toBe(400);
  });

  it('הזמנה שבוטלה היא סופית (409)', async () => {
    const own = await prisma.order.findFirstOrThrow({ where: { customerId: fx.rachelId } });
    const cancel = await api().patch(`/api/orders/${own.id}/status`).set(bearer(adminToken)).send({ status: 'CANCELLED' });
    expect(cancel.status).toBe(200);
    const again = await api().patch(`/api/orders/${own.id}/status`).set(bearer(adminToken)).send({ status: 'READY' });
    expect(again.status).toBe(409);
    expect(again.body.error.code).toBe('ORDER_FINALIZED');
  });

  it('מחזיר 404 להזמנה שלא קיימת', async () => {
    const res = await api().patch('/api/orders/99999/status').set(bearer(adminToken)).send({ status: 'READY' });
    expect(res.status).toBe(404);
  });
});
