import jwt from 'jsonwebtoken';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { api, bearer, createFixtures, EMAILS, type Fixtures, loginAs, PASSWORD, prisma, resetDatabase } from './helpers';

const SECRET = process.env.JWT_SECRET!;
let fx: Fixtures;

beforeAll(async () => {
  await resetDatabase();
  fx = await createFixtures();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/auth/login', () => {
  it('מחזיר Token ופרטי משתמש בהתחברות תקינה', async () => {
    const res = await api().post('/api/auth/login').send({ email: EMAILS.rachel, password: PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.tokenType).toBe('Bearer');
    expect(res.body.expiresIn).toBe(60 * 60);
    expect(res.body.user).toMatchObject({ id: fx.rachelId, email: EMAILS.rachel, role: 'CUSTOMER' });
  });

  it('לעולם לא מחזיר סיסמה או Hash', async () => {
    const res = await api().post('/api/auth/login').send({ email: EMAILS.rachel, password: PASSWORD });
    const text = JSON.stringify(res.body);
    expect(text).not.toContain('passwordHash');
    expect(text).not.toContain(PASSWORD);
    expect(text).not.toContain('$2'); // תחילית של bcrypt hash
  });

  it('מתעלם מאותיות גדולות ורווחים באימייל', async () => {
    const res = await api().post('/api/auth/login').send({ email: '  RACHEL@test.local ', password: PASSWORD });
    expect(res.status).toBe(200);
  });

  it('מחזיר 401 לסיסמה שגויה', async () => {
    const res = await api().post('/api/auth/login').send({ email: EMAILS.rachel, password: 'Wrong1234' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('מחזיר 401 עם אותה הודעה לאימייל שלא קיים', async () => {
    const wrongPassword = await api().post('/api/auth/login').send({ email: EMAILS.rachel, password: 'Wrong1234' });
    const unknownEmail = await api().post('/api/auth/login').send({ email: 'nobody@test.local', password: 'Wrong1234' });
    expect(unknownEmail.status).toBe(401);
    expect(unknownEmail.body.error.message).toBe(wrongPassword.body.error.message);
  });

  it('מחזיר 400 כשחסרים שדות', async () => {
    const res = await api().post('/api/auth/login').send({ email: EMAILS.rachel });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details[0].field).toBe('password');
  });

  it('מחזיר 400 ל-JSON לא תקין', async () => {
    const res = await api().post('/api/auth/login').set('Content-Type', 'application/json').send('{bad json');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_JSON');
  });
});

describe('POST /api/auth/register', () => {
  it('יוצר לקוח חדש ומחזיר Token', async () => {
    const res = await api().post('/api/auth/register').send({
      fullName: 'לקוחה חדשה',
      email: 'New.Customer@Test.local',
      phone: '052-333-4444',
      password: 'Secret123',
    });
    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ email: 'new.customer@test.local', phone: '0523334444', role: 'CUSTOMER' });
    expect(res.body.token).toEqual(expect.any(String));

    const saved = await prisma.user.findUnique({ where: { email: 'new.customer@test.local' } });
    expect(saved?.passwordHash).not.toBe('Secret123');
  });

  it('לא מאפשר להירשם כמנהל (שדה role נדחה)', async () => {
    const res = await api().post('/api/auth/register').send({
      fullName: 'מנסה להיות מנהל',
      email: 'hacker@test.local',
      phone: '0524445555',
      password: 'Secret123',
      role: 'ADMIN',
    });
    expect(res.status).toBe(400);
    expect(await prisma.user.findUnique({ where: { email: 'hacker@test.local' } })).toBeNull();
  });

  it('מחזיר 409 לאימייל שכבר רשום', async () => {
    const res = await api().post('/api/auth/register').send({
      fullName: 'רחל שוב',
      email: EMAILS.rachel,
      phone: '0521111111',
      password: 'Secret123',
    });
    expect(res.status).toBe(409);
  });

  it('מחזיר 400 לסיסמה חלשה, טלפון ואימייל לא תקינים', async () => {
    const res = await api().post('/api/auth/register').send({
      fullName: 'א',
      email: 'not-an-email',
      phone: '123',
      password: 'short',
    });
    expect(res.status).toBe(400);
    const fields = res.body.error.details.map((d: { field: string }) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['fullName', 'email', 'phone', 'password']));
  });
});

describe('GET /api/auth/me', () => {
  it('מחזיר את המשתמש לפי ה-Token', async () => {
    const token = await loginAs(EMAILS.sara);
    const res = await api().get('/api/auth/me').set(bearer(token));
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: fx.saraId, fullName: 'שרה בדיקה', phone: '0532222222' });
    expect(res.body.passwordHash).toBeUndefined();
  });

  it('מחזיר 401 ללא Token', async () => {
    const res = await api().get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('מחזיר 401 לכותרת Authorization בפורמט שגוי', async () => {
    const token = await loginAs(EMAILS.sara);
    const res = await api().get('/api/auth/me').set('Authorization', token);
    expect(res.status).toBe(401);
  });

  it('מחזיר 401 ל-Token לא תקין', async () => {
    const res = await api().get('/api/auth/me').set(bearer('not.a.token'));
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  it('מחזיר 401 ל-Token שנחתם במפתח אחר', async () => {
    const forged = jwt.sign({ role: 'ADMIN' }, 'some-other-secret-that-is-also-long-enough', {
      subject: String(fx.adminId),
      expiresIn: 600,
    });
    const res = await api().get('/api/auth/me').set(bearer(forged));
    expect(res.status).toBe(401);
  });

  it('מחזיר 401 ל-Token בלי חתימה (alg none)', async () => {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ sub: String(fx.adminId), role: 'ADMIN' })).toString('base64url');
    const res = await api().get('/api/auth/me').set(bearer(`${header}.${payload}.`));
    expect(res.status).toBe(401);
  });

  it('מחזיר 401 עם TOKEN_EXPIRED ל-Token שפג תוקפו', async () => {
    const expired = jwt.sign(
      { role: 'CUSTOMER', exp: Math.floor(Date.now() / 1000) - 60 },
      SECRET,
      { subject: String(fx.rachelId) },
    );
    const res = await api().get('/api/auth/me').set(bearer(expired));
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('TOKEN_EXPIRED');
  });

  it('מחזיר 401 ל-Token של משתמש שלא קיים', async () => {
    const ghost = jwt.sign({ role: 'CUSTOMER' }, SECRET, { subject: '999999', expiresIn: 600 });
    const res = await api().get('/api/auth/me').set(bearer(ghost));
    expect(res.status).toBe(401);
  });
});
