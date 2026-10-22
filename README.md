# Ameing: מתנות במיתוג אישי (Backend)

שרת API לאתר מתנות במיתוג אישי. לקוחות בוחרים מתנות, מתאימים הדפסה אישית (שם או אות, גופן וצבע) ושולחים הזמנה עם כמה פריטים. המנהל מנהל מוצרים, קטגוריות, גופנים, צבעים והזמנות.

> 🚀 **רוצה להעלות את השרת לאינטרנט?** התחילי בקובץ [`START-HERE.md`](START-HERE.md).
> 💻 **כותבת את צד ה-React?** כל מה שצריך נמצא ב-[`FRONTEND-API-GUIDE.md`](FRONTEND-API-GUIDE.md).
> 📋 **האפיון המאושר:** [`docs/SPEC.md`](docs/SPEC.md).

---

## טכנולוגיות

| תחום | טכנולוגיה |
|---|---|
| שפה וסביבה | Node.js 20+ (מומלץ 22), TypeScript במצב strict |
| שרת | Express 5 |
| מסד נתונים | PostgreSQL + Prisma ORM 6 |
| בדיקת קלט | Zod |
| אימות | JWT (Access Token) + bcrypt להצפנת סיסמאות |
| תיעוד | Swagger UI / OpenAPI 3 בכתובת `/api-docs` |
| בדיקות | Vitest + Supertest מול PostgreSQL אמיתי |

---

## מבנה הפרויקט

```
backend-project/
├── src/
│   ├── app.ts                 בניית אפליקציית Express (CORS, אבטחה, Swagger, ניתוב)
│   ├── server.ts              הפעלת השרת
│   ├── config/env.ts          קריאה ובדיקה של משתני סביבה
│   ├── db/
│   │   ├── prisma.ts          חיבור למסד הנתונים
│   │   └── seed/              נתוני הדגמה (data.ts) והרצתם (run.ts)
│   ├── domain/                לוגיקה עסקית טהורה: כללי הדפסה, מחירים, סטטוסים
│   ├── auth/                  JWT וסיסמאות
│   ├── middleware/            authenticate (401), authorize (403), טיפול בשגיאות
│   ├── validation/            סכמות Zod לכל קלט
│   ├── routes/                הגדרת הכתובות
│   ├── controllers/           קבלת בקשה והחזרת תשובה
│   ├── services/              העבודה מול מסד הנתונים
│   ├── utils/                 שגיאות, המרות לתשובות API
│   └── docs/openapi.ts        מסמך Swagger
├── prisma/
│   ├── schema.prisma          תכנון הטבלאות
│   └── migrations/            יצירת הטבלאות במסד הנתונים
├── tests/                     בדיקות אוטומטיות
├── docs/
│   ├── openapi.json           קובץ OpenAPI (נוצר מ-src/docs/openapi.ts)
│   └── SPEC.md                מסמך האפיון
├── render.yaml                הגדרות פריסה ל-Render
├── START-HERE.md              מדריך העלאה לאינטרנט
└── FRONTEND-API-GUIDE.md      מדריך לחיבור צד ה-React
```

---

## הרצה במחשב

### 1. דרישות מוקדמות
- [Node.js](https://nodejs.org) גרסה 22 (LTS).
- מסד נתונים PostgreSQL. הכי פשוט: חשבון חינמי ב-[Neon](https://neon.com) (הסבר ב-START-HERE.md, חלק ב). אפשר גם PostgreSQL מקומי.

### 2. התקנה
```bash
npm install
```

### 3. הגדרות
העתיקי את `.env.example` לקובץ חדש בשם `.env`, ומלאי:
- `DATABASE_URL`: כתובת מסד הנתונים.
- `JWT_SECRET`: מחרוזת אקראית של לפחות 32 תווים. אפשר ליצור כך:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```
- `TEST_DATABASE_URL`: מסד נתונים **נפרד** לבדיקות (הבדיקות מוחקות בו הכל).

### 4. יצירת הטבלאות ומילוי נתוני הדגמה
```bash
npx prisma migrate deploy
npm run db:seed
```

### 5. הפעלה
```bash
npm run dev
```
- בדיקת בריאות: http://localhost:3000/api/health
- Swagger: http://localhost:3000/api-docs

### חשבונות לדוגמה (פיתוח בלבד)
| תפקיד | אימייל | סיסמה |
|---|---|---|
| מנהל | `admin@example.com` | `Admin1234!` |
| לקוחה (עם 4 הזמנות) | `rachel.cohen@example.com` | `Demo1234!` |
| עוד 14 לקוחות | ראי `src/db/seed/data.ts` | `Demo1234!` |

בפרודקשן הסיסמאות האלה **לא** משמשות. שם הן נקבעות במשתני הסביבה `SEED_ADMIN_PASSWORD` ו-`SEED_DEMO_PASSWORD`.

---

## פקודות

| פקודה | מה היא עושה |
|---|---|
| `npm run dev` | שרת פיתוח שמתעדכן אוטומטית בשמירה |
| `npm run build` | בנייה לתיקייה `dist` |
| `npm start` | הפעלת הגרסה הבנויה |
| `npm run typecheck` | בדיקת טיפוסים של TypeScript |
| `npm test` | הרצת כל הבדיקות האוטומטיות |
| `npm run check` | typecheck + build + בדיקות, ברצף |
| `npm run db:deploy` | הרצת Migrations |
| `npm run db:seed` | מילוי נתוני הדגמה (בטוח להריץ שוב) |
| `npm run db:migrate` | יצירת Migration חדש אחרי שינוי ב-schema.prisma |
| `npm run db:studio` | צפייה בטבלאות בדפדפן |
| `npm run docs:generate` | עדכון `docs/openapi.json` |
| `npm run render-build` | פקודת הבנייה של Render (התקנה, בנייה, Migrations, נתוני הדגמה) |

---

## תכנון מסד הנתונים

| טבלה | תפקיד | קשרים |
|---|---|---|
| `users` | לקוחות ומנהלים (`role`: `CUSTOMER` / `ADMIN`) | ← הזמנות |
| `categories` | קטגוריות מוצרים | ← מוצרים |
| `products` | **האובייקט המרכזי**: שם, תיאור, מחיר, תמונה, קטגוריה, סוג התאמה אישית | → קטגוריה |
| `fonts` | גופנים להדפסה | ← פריטי הזמנה |
| `colors` | צבעי הדפסה (`hexCode`) | ← פריטי הזמנה |
| `orders` | הזמנות: סטטוס, משלוח/איסוף, פרטי קשר, סכום | → לקוח, ← פריטים |
| `order_items` | פריט בהזמנה: מוצר, מחיר ברגע ההזמנה, טקסט, גופן, צבע | → הזמנה, מוצר, גופן, צבע |

**אילוצי תקינות במסד הנתונים** (בנוסף לבדיקות בשרת): מחיר מוצר חיובי, משלוח מחייב כתובת, פריט עם הדפסה מחייב טקסט + גופן + צבע ופריט בלי הדפסה אסור שיכלול אותם, קוד צבע בפורמט `#RRGGBB`, אימייל ייחודי, ואי אפשר למחוק קטגוריה/מוצר/גופן/צבע שנמצאים בשימוש.

---

## Endpoints

🔓 ציבורי · 👤 לקוח · 👑 מנהל

| Method | URL | הרשאה |
|---|---|---|
| GET | `/api/health` | 🔓 |
| POST | `/api/auth/register` | 🔓 |
| POST | `/api/auth/login` | 🔓 |
| GET | `/api/auth/me` | 👤👑 |
| GET | `/api/products` | 🔓 (חיפוש, סינון, מיון, עמודים) |
| GET | `/api/products/:id` | 🔓 |
| POST | `/api/products` | 👑 |
| PATCH | `/api/products/:id` | 👑 |
| POST | `/api/orders` | 👤 |
| GET | `/api/orders/my` | 👤 |
| GET | `/api/orders/:id` | 👤 (רק שלו) 👑 |
| GET | `/api/orders` | 👑 (חיפוש, סינון, מיון, עמודים) |
| PATCH | `/api/orders/:id/status` | 👑 |
| GET / POST / PATCH | `/api/categories`, `/api/categories/:id` | קריאה 🔓, שינוי 👑 |
| GET / POST / PATCH | `/api/fonts`, `/api/fonts/:id` | קריאה 🔓, שינוי 👑 |
| GET / POST / PATCH | `/api/colors`, `/api/colors/:id` | קריאה 🔓, שינוי 👑 |

---

## אבטחה

- סיסמאות נשמרות כ-Hash של bcrypt, ולעולם לא מוחזרות בתשובות.
- JWT חתום ב-HS256 עם `JWT_SECRET`, בתוקף מוגבל (`JWT_EXPIRES_MINUTES`).
- המשתמש והתפקיד נקבעים לפי ה-Token **ונבדקים מול מסד הנתונים** בכל בקשה.
- 401: אין Token, Token לא תקין או שפג תוקפו. 403: מחובר בלי הרשאה.
- לקוח רואה רק את ההזמנות שלו. הזמנה של לקוח אחר מחזירה 404, כדי לא לחשוף שהיא קיימת.
- המחיר מחושב בשרת לפי מסד הנתונים, ולא לפי מה שהדפדפן שולח.
- שדות לא מוכרים בגוף הבקשה נדחים (למשל `role` בהרשמה או `customerId` בהזמנה).
- CORS ניתן להגדרה (`CORS_ORIGINS`), וכותרות אבטחה עם Helmet.
- הרשמה תמיד יוצרת לקוח. מנהל נוצר רק דרך נתוני ההדגמה או ישירות במסד הנתונים.

---

## סטטוס בדיקות

ראי את הסעיף "מה נבדק" בסוף [`START-HERE.md`](START-HERE.md#מה-נבדק-ומה-עדיין-לא).
