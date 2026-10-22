# 💻 מדריך API לכתיבת צד ה-React

המסמך מסביר **מה** לשלוח לשרת ו**מה** חוזר ממנו. את קוד ה-React את כותבת בעצמך: כאן אין קוד React, רק תיאור של הבקשות והתשובות.

את כל הכתובות אפשר גם לנסות בפועל ב-Swagger (`/api-docs`), לפני שכותבים קוד.

---

## 1. כתובת השרת (Base URL)

| סביבה | Base URL |
|---|---|
| במחשב שלך | `http://localhost:3000` |
| בענן (Render) | `https://ameing-gifts-api.onrender.com` (או השם שבחרת) |

כל הכתובות במסמך מתחילות ב-`/api`. לדוגמה, רשימת המוצרים בענן:
`https://ameing-gifts-api.onrender.com/api/products`

💡 כדאי לשמור את ה-Base URL במקום אחד בפרויקט (למשל משתנה סביבה של Vite בשם `VITE_API_URL`), כדי לעבור בקלות בין המחשב לענן.

⚠️ **CORS:** השרת מאשר רק כתובות שמופיעות ב-`CORS_ORIGINS`. בפיתוח עם Vite הכתובת היא בדרך כלל `http://localhost:5173`, והיא כבר מוגדרת ב-`.env.example`. אחרי שתעלי את ה-React לאוויר, הוסיפי את הכתובת שלו ב-Render.

⏳ **Render חינמי:** השרת נרדם אחרי 15 דקות בלי שימוש, והבקשה הראשונה לוקחת כחצי דקה עד דקה. כדאי להציג למשתמש מצב "טוען...".

---

## 2. התחברות (Authentication)

### איך זה עובד
1. המשתמש נרשם (`POST /api/auth/register`) או מתחבר (`POST /api/auth/login`).
2. השרת מחזיר `token` ואת פרטי המשתמש (`user`), כולל `role`.
3. צד ה-React שומר את ה-Token ואת פרטי המשתמש.
4. בכל בקשה לכתובת מוגנת, שולחים את ה-Token בכותרת:
   ```
   Authorization: Bearer <token>
   ```
5. ה-Token בתוקף לשעתיים (`expiresIn` בשניות). אחרי זה השרת מחזיר `401` עם `code: "TOKEN_EXPIRED"`, וצריך להעביר את המשתמש למסך ההתחברות.

### איך יודעים אם המשתמש מנהל או לקוח
לפי `user.role` בתשובה של login/register: `"ADMIN"` או `"CUSTOMER"`. כך מחליטים אילו מסכים להציג.

⚠️ ההסתרה ב-React היא רק לנוחות. **ההגנה האמיתית בשרת:** גם אם מישהו ינסה לפנות ישירות לכתובת של מנהל, הוא יקבל `403`.

### יציאה (Logout)
אין כתובת בשרת ליציאה. פשוט מוחקים את ה-Token ואת פרטי המשתמש מצד ה-React.

---

## 3. מבנה בקשה ותשובה

- בקשות עם גוף (POST, PATCH) נשלחות כ-JSON, עם הכותרת `Content-Type: application/json`.
- כל התשובות הן JSON.
- **מחירים** מוחזרים כמספר רגיל בשקלים: `89.9`.
- **תאריכים** מוחזרים כמחרוזת ISO: `"2026-10-21T10:15:00.000Z"`.
- **שולחים רק את השדות שמופיעים כאן.** שדה לא מוכר (למשל `confirmPassword`) יחזיר שגיאה `400`. אם בטופס יש שדה "אימות סיסמה", בדקי אותו ב-React ואל תשלחי אותו לשרת.

### מבנה שגיאה (תמיד אותו מבנה)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "נתונים לא תקינים",
    "details": [
      { "field": "deliveryAddress", "message": "במשלוח יש להזין כתובת מלאה (לפחות 5 תווים)" }
    ]
  }
}
```
- `message`: הודעה בעברית, אפשר להציג למשתמש.
- `details` (רק בחלק מהשגיאות): רשימה של שדות עם בעיה. `field` הוא שם השדה בטופס, כך שאפשר להציג את ההודעה ליד השדה הנכון.
- בפריטי הזמנה השדה נראה כך: `items.1.personalizationText`, כלומר פריט מספר 2 בסל (הספירה מתחילה מ-0).

### קודי תשובה

| קוד | משמעות | מה לעשות ב-React |
|---|---|---|
| `200` | הצלחה | |
| `201` | נוצר בהצלחה | |
| `400` | נתונים לא תקינים | להציג את `details` ליד השדות |
| `401` | לא מחובר / Token לא תקין / פג תוקף | למחוק Token ולעבור למסך התחברות |
| `403` | אין הרשאה | להציג "אין לך הרשאה" |
| `404` | לא נמצא | להציג "לא נמצא" |
| `409` | התנגשות (אימייל קיים, שם קיים, הזמנה סופית) | להציג את `message` |
| `500` | שגיאת שרת | להציג "משהו השתבש, נסי שוב" |

---

## 4. ערכי בחירה (Enums)

השרת עובד עם ערכים באנגלית. את הטקסט בעברית מציגים בצד ה-React.

**סטטוס הזמנה (`status`)**
| ערך | להצגה |
|---|---|
| `RECEIVED` | התקבלה |
| `IN_PROGRESS` | בהכנה |
| `READY` | מוכנה |
| `DELIVERED` | נמסרה |
| `CANCELLED` | בוטלה |

**אופן קבלה (`deliveryMethod`)**
| ערך | להצגה |
|---|---|
| `DELIVERY` | משלוח |
| `PICKUP` | איסוף עצמי |

**סוג התאמה אישית של מוצר (`personalizationType`)**
| ערך | משמעות |
|---|---|
| `NAME_OR_INITIAL` | הלקוח יכול לבחור שם או אות |
| `INITIAL_ONLY` | הלקוח יכול לבחור אות בלבד |

**הדפסה שהלקוח בחר לפריט (`personalizationKind`)**
| ערך | משמעות |
|---|---|
| `NONE` | בלי הדפסה |
| `NAME` | שם (רק אם המוצר `NAME_OR_INITIAL`) |
| `INITIAL` | אות אחת |

**תפקיד (`role`):** `CUSTOMER` (לקוח), `ADMIN` (מנהל).

---

## 5. מבני הנתונים

### User
```json
{
  "id": 2,
  "fullName": "רחל כהן",
  "email": "rachel.cohen@example.com",
  "phone": "0521234567",
  "role": "CUSTOMER",
  "createdAt": "2026-10-01T09:30:00.000Z"
}
```

### Product
```json
{
  "id": 1,
  "name": "תרמוס צבעוני חכם",
  "description": "תרמוס נירוסטה בצבעי מעבר עדינים...",
  "price": 89.9,
  "imageUrl": "https://placehold.co/600x600/f3e5e1/8a5a44?text=Thermos",
  "personalizationType": "NAME_OR_INITIAL",
  "categoryId": 1,
  "category": { "id": 1, "name": "בקבוקים ותרמוסים" },
  "createdAt": "2026-10-01T09:00:00.000Z",
  "updatedAt": "2026-10-01T09:00:00.000Z"
}
```

### Category / Font / Color
```json
{ "id": 1, "name": "בקבוקים ותרמוסים", "productsCount": 3 }
{ "id": 5, "name": "Great Vibes" }
{ "id": 1, "name": "זהב", "hexCode": "#D4AF37" }
```
💡 `hexCode` אפשר להציג כריבוע צבע ליד שם הצבע. שמות הגופנים הם גופנים אמיתיים מ-Google Fonts, כך שאפשר לטעון אותם ולהציג תצוגה מקדימה של הטקסט בגופן שנבחר.

### Order
```json
{
  "id": 31,
  "customerId": 2,
  "status": "RECEIVED",
  "deliveryMethod": "DELIVERY",
  "contactName": "רחל כהן",
  "contactPhone": "0521234567",
  "deliveryAddress": "רחוב הרצל 12, בני ברק",
  "notes": null,
  "totalPrice": 214.7,
  "itemsCount": 3,
  "createdAt": "2026-10-21T10:15:00.000Z",
  "updatedAt": "2026-10-21T10:15:00.000Z",
  "items": [
    {
      "id": 81,
      "productId": 1,
      "productName": "תרמוס צבעוני חכם",
      "productImageUrl": "https://...",
      "unitPrice": 89.9,
      "personalizationKind": "NAME",
      "personalizationText": "Miriam",
      "font": { "id": 5, "name": "Great Vibes" },
      "color": { "id": 1, "name": "זהב", "hexCode": "#D4AF37" }
    },
    {
      "id": 83,
      "productId": 9,
      "productName": "מנורת לילה כוכב",
      "productImageUrl": "https://...",
      "unitPrice": 84.9,
      "personalizationKind": "NONE",
      "personalizationText": null,
      "font": null,
      "color": null
    }
  ]
}
```
- `unitPrice` הוא המחיר **ברגע ההזמנה**. אם המנהל ישנה מחיר אחר כך, ההזמנה לא משתנה.
- בתשובות **למנהל** יש גם `customer`: `{ "id", "fullName", "email", "phone" }`.

### רשימה עם עמודים (מוצרים והזמנות)
```json
{
  "items": [ ... ],
  "page": 1,
  "limit": 12,
  "total": 16,
  "totalPages": 2
}
```

---

## 6. ה-Endpoints לפי מסכים

### מסך 1: התחברות
**`POST /api/auth/login`** 🔓
```json
{ "email": "rachel.cohen@example.com", "password": "Demo1234!" }
```
**200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "Bearer",
  "expiresIn": 7200,
  "user": { "id": 2, "fullName": "רחל כהן", "email": "rachel.cohen@example.com", "phone": "0521234567", "role": "CUSTOMER", "createdAt": "..." }
}
```
**401:** `INVALID_CREDENTIALS`, "אימייל או סיסמה שגויים".

| שדה | חובה | כללים |
|---|---|---|
| `email` | ✅ | אימייל תקין. אותיות גדולות ורווחים מסביב לא משנים |
| `password` | ✅ | |

אחרי התחברות: לקוח עובר לרשימת המוצרים, מנהל עובר לניהול הזמנות (לפי `user.role`).

### מסך 2: הרשמה
**`POST /api/auth/register`** 🔓
```json
{ "fullName": "רחל כהן", "email": "rachel@example.com", "phone": "052-1234567", "password": "MyPass123" }
```
**201:** אותו מבנה כמו login. המשתמש מחובר מיד, אין צורך בהתחברות נוספת.
**409:** האימייל כבר רשום.

| שדה | חובה | כללים |
|---|---|---|
| `fullName` | ✅ | 2-60 תווים |
| `email` | ✅ | אימייל תקין, עד 120 תווים |
| `phone` | ✅ | 9-10 ספרות שמתחילות ב-0. מקפים ורווחים מותרים (השרת מסיר אותם) |
| `password` | ✅ | 8-72 תווים, לפחות אות אחת ולפחות ספרה אחת |

### מסך 3: רשימת מוצרים 🔓 (גם בלי התחברות)
**`GET /api/products`**, עם פרמטרים בכתובת (כולם אופציונליים):

| פרמטר | ערכים | ברירת מחדל |
|---|---|---|
| `search` | טקסט לחיפוש בשם המוצר | |
| `categoryId` | מזהה קטגוריה | כל הקטגוריות |
| `sort` | `newest` / `price_asc` / `price_desc` / `name` | `newest` |
| `page` | 1, 2, 3... | `1` |
| `limit` | 1-50 | `12` |

דוגמה: `GET /api/products?search=מגבת&categoryId=5&sort=price_asc&page=1`

**200:** רשימה עם עמודים של `Product`.

לתפריט הקטגוריות: **`GET /api/categories`** 🔓 ← מערך של `Category`.

💡 פרמטר ריק (`search=`) נחשב כלא נשלח, כך שאפשר לשלוח את כל הפרמטרים תמיד.

### מסך 4: פרטי מוצר + טופס התאמה אישית 🔓
- **`GET /api/products/:id`** ← `Product` (או 404).
- **`GET /api/fonts`** ← רשימת גופנים לבחירה.
- **`GET /api/colors`** ← רשימת צבעים לבחירה.

**כללים לטופס ההתאמה האישית:**
| בחירת הלקוח | מה נדרש |
|---|---|
| בלי הדפסה (`NONE`) | לא שולחים טקסט, גופן או צבע |
| שם (`NAME`) | **רק** אם `personalizationType` של המוצר הוא `NAME_OR_INITIAL`. טקסט של 2-20 תווים: אותיות בעברית או באנגלית, רווחים, מקף או גרש. גופן וצבע חובה |
| אות (`INITIAL`) | אות אחת בדיוק, בעברית או באנגלית. גופן וצבע חובה |

💡 אם `personalizationType` הוא `INITIAL_ONLY`, אל תציגי בכלל את האפשרות "שם".

כפתור "הוספה לסל": אם המשתמש לא מחובר, העבירי אותו למסך ההתחברות. הסל עצמו נשמר בצד ה-React (רשימה בזיכרון) עד שליחת ההזמנה. השרת לא שומר סל.

### מסך 5: סל קניות ושליחת הזמנה 👤
לפני הצגת הטופס, למילוי מראש של שם וטלפון: **`GET /api/auth/me`** 👤 ← `User`.

**`POST /api/orders`** 👤 (לקוח בלבד; מנהל יקבל 403)
```json
{
  "deliveryMethod": "DELIVERY",
  "contactName": "רחל כהן",
  "contactPhone": "0521234567",
  "deliveryAddress": "רחוב הרצל 12, בני ברק",
  "notes": "בבקשה לעטוף כמתנה",
  "items": [
    { "productId": 1, "personalizationKind": "NAME", "personalizationText": "Miriam", "fontId": 5, "colorId": 1 },
    { "productId": 4, "personalizationKind": "INITIAL", "personalizationText": "B", "fontId": 5, "colorId": 2 },
    { "productId": 9, "personalizationKind": "NONE" }
  ]
}
```
**201:** `Order` מלא, כולל `id`, `totalPrice` שחושב בשרת, וסטטוס `RECEIVED`. אחרי הצלחה: לרוקן את הסל.

| שדה | חובה | כללים |
|---|---|---|
| `deliveryMethod` | ✅ | `DELIVERY` או `PICKUP` |
| `contactName` | ✅ | 2-60 תווים |
| `contactPhone` | ✅ | 9-10 ספרות שמתחילות ב-0 |
| `deliveryAddress` | רק ב-`DELIVERY` | 5-200 תווים. ב-`PICKUP` אפשר לא לשלוח (ואם נשלח, לא נשמר) |
| `notes` | ❌ | עד 500 תווים |
| `items` | ✅ | 1-20 פריטים, לפי כללי ההדפסה ממסך 4 |

⚠️ **לא שולחים** מחיר ולא מזהה לקוח. השרת מחשב את המחיר לבד, ויודע מי הלקוח לפי ה-Token.

💡 את הסכום בסל אפשר להציג ב-React לפי `price` של כל מוצר. הסכום הקובע הוא `totalPrice` שהשרת מחזיר.

### מסך 6: ההזמנות שלי 👤
**`GET /api/orders/my`** 👤, עם פרמטרים אופציונליים: `status`, `sort` (`newest`/`oldest`), `page`, `limit`.
**200:** רשימה עם עמודים של `Order`. רק ההזמנות של הלקוח המחובר.

פרטי הזמנה אחת: **`GET /api/orders/:id`** 👤 ← `Order`. הזמנה של לקוח אחר מחזירה 404.

### מסך 7: ניהול מוצרים 👑
- רשימה: **`GET /api/products`** (אותה כתובת כמו במסך 3).

### מסך 8: הוספה / עריכת מוצר 👑
**`POST /api/products`** 👑
```json
{
  "name": "ספל קרמיקה לבן",
  "description": "ספל קרמיקה קלאסי בנפח 330 מ\"ל, מתאים למדיח.",
  "price": 45,
  "imageUrl": "https://example.com/mug.jpg",
  "personalizationType": "NAME_OR_INITIAL",
  "categoryId": 5
}
```
**201:** `Product`.

**`PATCH /api/products/:id`** 👑. שולחים **רק את השדות שהשתנו**, לפחות אחד:
```json
{ "price": 49.9 }
```
**200:** `Product` מעודכן.

| שדה | חובה ביצירה | כללים |
|---|---|---|
| `name` | ✅ | 2-80 תווים |
| `description` | ✅ | 5-1000 תווים |
| `price` | ✅ | מספר (לא מחרוזת!) גדול מ-0, עד 2 ספרות אחרי הנקודה |
| `imageUrl` | ✅ | כתובת שמתחילה ב-`http://` או `https://` |
| `personalizationType` | ✅ | `NAME_OR_INITIAL` או `INITIAL_ONLY` |
| `categoryId` | ✅ | מספר, מזהה של קטגוריה קיימת |

⚠️ שדות `<input>` מחזירים מחרוזת. את `price` ואת `categoryId` צריך להמיר למספר לפני השליחה.

### מסך 9: ניהול הזמנות 👑
**`GET /api/orders`** 👑

| פרמטר | ערכים |
|---|---|
| `status` | אחד מהסטטוסים, או ריק לכולם |
| `search` | שם הלקוח או מספר טלפון (גם חלקי) |
| `sort` | `newest` (ברירת מחדל) / `oldest` |
| `page`, `limit` | כמו במוצרים |

**200:** רשימה עם עמודים של `Order`, כולל `customer`.

עדכון סטטוס: **`PATCH /api/orders/:id/status`** 👑
```json
{ "status": "IN_PROGRESS" }
```
**200:** `Order` מעודכן. **409:** ההזמנה כבר `DELIVERED` או `CANCELLED`, ואי אפשר לשנות אותה. 💡 כדאי לא להציג כפתור שינוי להזמנות כאלה.

### מסך 10: הגדרות (קטגוריות, גופנים, צבעים) 👑
| פעולה | כתובת | גוף |
|---|---|---|
| רשימה 🔓 | `GET /api/categories` · `GET /api/fonts` · `GET /api/colors` | |
| הוספת קטגוריה | `POST /api/categories` | `{ "name": "ספלים" }` |
| שינוי שם קטגוריה | `PATCH /api/categories/:id` | `{ "name": "ספלים וכוסות" }` |
| הוספת גופן | `POST /api/fonts` | `{ "name": "Pacifico" }` |
| שינוי גופן | `PATCH /api/fonts/:id` | `{ "name": "Lobster" }` |
| הוספת צבע | `POST /api/colors` | `{ "name": "טורקיז", "hexCode": "#40E0D0" }` |
| שינוי צבע | `PATCH /api/colors/:id` | `{ "hexCode": "#3FD0C0" }` (שדה אחד או שניהם) |

- `name`: 2-40 תווים, ייחודי (שם קיים מחזיר 409).
- `hexCode`: בפורמט `#RRGGBB`.
- אין מחיקה, כדי לא לפגוע במוצרים ובהזמנות קיימים.

---

## 7. טבלת הרשאות מלאה

| פעולה | אורח | לקוח | מנהל |
|---|---|---|---|
| צפייה במוצרים, קטגוריות, גופנים, צבעים | ✅ | ✅ | ✅ |
| הרשמה / התחברות | ✅ | | |
| `GET /api/auth/me` | 401 | ✅ | ✅ |
| שליחת הזמנה | 401 | ✅ | 403 |
| ההזמנות שלי | 401 | ✅ | 403 |
| הזמנה לפי מזהה | 401 | ✅ רק שלו (אחרת 404) | ✅ כל הזמנה |
| כל ההזמנות | 401 | 403 | ✅ |
| עדכון סטטוס | 401 | 403 | ✅ |
| הוספה/עריכה של מוצרים, קטגוריות, גופנים, צבעים | 401 | 403 | ✅ |

---

## 8. חשבונות לבדיקה

| תפקיד | אימייל | סיסמה |
|---|---|---|
| מנהל | `admin@example.com` (במחשב) / מה שהגדרת ב-`SEED_ADMIN_EMAIL` (בענן) | `Admin1234!` (במחשב) / `SEED_ADMIN_PASSWORD` (בענן) |
| לקוחה עם 4 הזמנות בסטטוסים שונים | `rachel.cohen@example.com` | `Demo1234!` (במחשב) / `SEED_DEMO_PASSWORD` (בענן) |
| עוד לקוחות | `sara.levi@example.com`, `miriam.friedman@example.com` ועוד | כמו למעלה |
