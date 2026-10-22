# 🚀 מתחילים כאן: העלאת השרת לאינטרנט

המדריך הזה מיועד למי שמעולם לא העלתה שרת לאינטרנט. עוברים עליו לפי הסדר, שלב אחרי שלב.

**מה נעשה:**
1. **GitHub:** נשמור את קובצי הפרויקט באינטרנט.
2. **Neon:** ניצור מסד נתונים PostgreSQL חינמי.
3. **Render:** נריץ את השרת, והוא יתחבר למסד הנתונים ויקבל כתובת באינטרנט.
4. **בדיקה:** נוודא שהכל עובד דרך Swagger.

**זמן משוער:** 30-45 דקות בפעם הראשונה.

> ⚠️ **חשוב לדעת:** אתרי האינטרנט משנים מדי פעם את העיצוב ואת שמות הכפתורים. כתבתי את שמות הכפתורים כפי שהם מוכרים לי, אבל לא יכולתי לבדוק את הממשק העדכני בזמן הכתיבה. אם כפתור נקרא קצת אחרת, חפשי משהו עם משמעות דומה.

> 🔒 **כלל זהב:** סיסמאות, `DATABASE_URL` ו-`JWT_SECRET` **לעולם לא** נכנסים לקבצים שמעלים ל-GitHub, ולא נשלחים לאף אחד. הם נשמרים רק בהגדרות של Render.

---

## חלק א: GitHub

### 1. פתיחת חשבון
1. היכנסי ל-https://github.com
2. לחצי **Sign up**.
3. הזיני אימייל, סיסמה ושם משתמש, ואשרי את האימייל שתקבלי.

### 2. יצירת Repository (מאגר)
1. אחרי ההתחברות, לחצי על **+** בפינה הימנית העליונה, ואז **New repository**.
2. מלאי:
   - **Repository name:** `ameing-gifts-backend`
   - **Public** או **Private:** שתיהן עובדות עם Render. Private שומר על הקוד שלך פרטי.
   - **אל תסמני** את "Add a README file" ואל תוסיפי `.gitignore`. כבר יש לנו כאלה.
3. לחצי **Create repository**.

### 3. חילוץ קובץ ה-ZIP
1. מצאי את קובץ ה-ZIP שהורדת.
2. **Windows:** קליק ימני ← **Extract All** (חלץ הכל) ← **Extract**.
   **Mac:** לחיצה כפולה על הקובץ.
3. תיווצר תיקייה בשם `backend-project`. בתוכה יש `src`, `prisma`, `package.json` ועוד.

### 4. העלאת הקבצים דרך הדפדפן
1. בדף ה-Repository החדש, לחצי על הקישור **uploading an existing file**. אם הוא לא מופיע: **Add file** ← **Upload files**.
2. פתחי את התיקייה `backend-project` במחשב.
3. **סמני את כל מה שבתוכה** (Ctrl+A ב-Windows, Cmd+A ב-Mac), וגררי לחלון הדפדפן.
   - ⚠️ גוררים את **התוכן** של התיקייה, ולא את התיקייה עצמה. כך `package.json` יהיה ישירות בדף הראשי של ה-Repository.
   - ✅ התיקיות (`src`, `prisma` וכו') נגררות עם כל מה שבתוכן.
4. חכי שכל הקבצים יסיימו לעלות.
5. למטה, ב-**Commit changes**, לחצי על הכפתור הירוק **Commit changes**.

> 💡 **Mac:** קבצים ששמם מתחיל בנקודה (`.gitignore`, `.env.example`, `.node-version`) מוסתרים כברירת מחדל. לחצי Cmd+Shift+. (נקודה) בחלון Finder כדי להציג אותם לפני הגרירה. השרת יעבוד גם בלעדיהם, אבל עדיף שיעלו.

### 5. בדיקה שהקבצים נמצאים ב-GitHub
בדף הראשי של ה-Repository את אמורה לראות:
- ✅ התיקיות `src`, `prisma`, `tests`, `docs`
- ✅ הקבצים `package.json`, `render.yaml`, `README.md`, `START-HERE.md`
- ✅ לחיצה על `prisma` ← `migrations` ← תיקייה עם תאריך ← `migration.sql`
- ❌ **אין** תיקייה בשם `node_modules` ו**אין** קובץ בשם `.env`. אם העלית אותם בטעות: פתחי את הקובץ ← סמל שלוש הנקודות (או הפח) ← **Delete file** ← **Commit changes**.

---

## חלק ב: מסד נתונים (Neon, חינם)

בחרתי ב-Neon כי יש בו מסלול חינמי קבוע, בלי כרטיס אשראי, והוא עובד טוב עם Prisma. (מסד הנתונים החינמי של Render עצמו נמחק אחרי 30 יום, ולכן הוא לא מתאים לפרויקט גמר.)

**מה כולל המסלול החינמי של Neon:** מסד נתונים של עד 1GB, והוא "נרדם" אחרי 5 דקות בלי שימוש ומתעורר לבד בבקשה הבאה. לפרויקט גמר זה יותר ממספיק. המגבלות עשויות להשתנות, אז כדאי להציץ ב-https://neon.com/pricing

### 1. פתיחת חשבון
1. היכנסי ל-https://neon.com
2. לחצי **Sign up**. הכי פשוט: **Continue with GitHub** עם החשבון שפתחת בחלק א.

### 2. יצירת מסד נתונים
1. אחרי ההרשמה תתבקשי ליצור פרויקט (אם לא: **New Project**).
2. מלאי:
   - **Project name:** `ameing-gifts`
   - **Postgres version:** השאירי את ברירת המחדל.
   - **Region:** בחרי **Europe (Frankfurt)** אם יש. זה קרוב לישראל, ונבחר את אותו אזור גם ב-Render.
3. לחצי **Create project**.

### 3. קבלת כתובת החיבור (Connection String)
1. בדף הפרויקט, לחצי **Connect** (או חפשי **Connection string**).
2. ודאי ש-**Connection pooling** **כבוי**. כך הכתובת לא תכיל את המילה `-pooler`. (הכתובת הישירה מתאימה גם להפעלת ה-Migrations.)
3. העתיקי את הכתובת. היא נראית בערך כך:
   ```
   postgresql://neondb_owner:abc123XYZ@ep-cool-name-123456.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
4. ודאי שבסוף מופיע `?sslmode=require`. אם לא, הוסיפי אותו.

### 4. שמירה בטוחה
- שמרי את הכתובת **רק** במקום פרטי (למשל קובץ פתקים במחשב שלך). זו בעצם הסיסמה למסד הנתונים.
- **לא** להכניס אותה לשום קובץ בפרויקט שעולה ל-GitHub.
- אם היא נחשפה בטעות: ב-Neon אפשר לאפס את הסיסמה (בהגדרות התפקיד/Role), ואז להעתיק כתובת חדשה.

### 5. חיבור השרת למסד הנתונים
לא צריך לעשות כאן כלום. את הכתובת נדביק ב-Render בחלק ג (שלב 6), כמשתנה בשם `DATABASE_URL`. בזמן ה-Deploy, Render ייצור את הטבלאות וימלא את נתוני ההדגמה.

---

## חלק ג: Render (שרת חינמי)

**מה כולל המסלול החינמי של Render:** השרת "נרדם" אחרי 15 דקות בלי בקשות, והבקשה הראשונה אחרי זה לוקחת בערך דקה. זה תקין, פשוט צריך לחכות. אין גישה ל-Shell במסלול החינמי, ולכן ה-Migrations ונתוני ההדגמה רצים בתוך פקודת הבנייה. פרטים עדכניים: https://render.com/docs/free

### 1. פתיחת חשבון
1. היכנסי ל-https://render.com
2. לחצי **Get Started** / **Sign up**, ובחרי **GitHub**. כך החשבונות מתחברים אוטומטית.

### 2. חיבור GitHub
1. ב-Dashboard לחצי **+ New** ← **Web Service**.
2. אם ה-Repository לא מופיע ברשימה: לחצי **Configure account** / **Connect GitHub**, ותני ל-Render גישה ל-Repository `ameing-gifts-backend` (או לכל ה-Repositories).

### 3. יצירת Web Service ובחירת ה-Repository
1. ברשימה, ליד `ameing-gifts-backend`, לחצי **Connect**.

### 4. מילוי ההגדרות

| שדה | ערך |
|---|---|
| **Name** | `ameing-gifts-api` (השם יופיע בכתובת האתר) |
| **Language / Runtime** | `Node` |
| **Branch** | `main` |
| **Region** | `Frankfurt (EU Central)`, כמו ב-Neon |
| **Root Directory** | להשאיר **ריק** |
| **Build Command** | `npm run render-build` |
| **Start Command** | `npm start` |
| **Instance Type** | **Free** |

> 💡 **מה עושה `npm run render-build`?** מתקין את הספריות, בונה את הקוד, יוצר את הטבלאות במסד הנתונים (Prisma Migrations), ומוסיף נתוני הדגמה רק אם הם חסרים. אפשר להריץ אותו שוב ושוב בלי לשכפל נתונים.

### 5. משתני סביבה (Environment Variables)
גללי ל-**Environment Variables** והוסיפי כל שורה עם **Add Environment Variable**:

| Key | Value | הסבר |
|---|---|---|
| `NODE_ENV` | `production` | |
| `NODE_VERSION` | `22` | גרסת Node.js |
| `DATABASE_URL` | הכתובת שהעתקת מ-Neon | |
| `JWT_SECRET` | לחצי **Generate** (אם יש), או הדביקי 64 תווים אקראיים | מפתח סודי לחתימת Token |
| `JWT_EXPIRES_MINUTES` | `120` | תוקף ההתחברות: שעתיים |
| `CORS_ORIGINS` | `*` | בהמשך תחליפי לכתובת של אתר ה-React |
| `SEED_ADMIN_EMAIL` | האימייל שלך, למשל `admin@ameing.co.il` | חשבון המנהל |
| `SEED_ADMIN_PASSWORD` | סיסמה חזקה שתבחרי (לפחות 8 תווים) | **שמרי אותה!** |
| `SEED_DEMO_DATA` | `true` | ליצור לקוחות והזמנות לדוגמה |
| `SEED_DEMO_PASSWORD` | סיסמה שתבחרי (לפחות 8 תווים) | הסיסמה של כל 15 הלקוחות לדוגמה |

> 💡 **אין לך כפתור Generate ל-JWT_SECRET?** במחשב עם Node.js אפשר להריץ:
> `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
> או פשוט להקליד 64 אותיות וספרות אקראיות באנגלית.

### 6. בדיקת בריאות
אם יש **Advanced** (או **Health Check Path**): הזיני `/api/health`.

### 7. הפעלת Prisma Migrations
לא צריך לעשות שום דבר נוסף. ה-Migrations רצים אוטומטית בתוך ה-Build Command (`prisma migrate deploy`). ביומן (Logs) של ה-Build תראי שורה כמו `All migrations have been successfully applied` או `1 migration found`.

### 8. Deploy
1. לחצי **Deploy Web Service** (או **Create Web Service**).
2. יפתח מסך עם יומן (**Logs**). הבנייה הראשונה לוקחת כמה דקות.
3. סימנים טובים ביומן:
   - `✔ נוצרו 16 מוצרים`
   - `✔ נוצר מנהל: ...`
   - `✔ נוצרו 30 הזמנות לדוגמה`
   - `✅ Server running on port ...`
4. כשמופיע **Live** (בירוק), השרת באוויר.

### 9. בדיקה שהשרת פעיל
למעלה בדף השירות מופיעה הכתובת שלך, למשל:
```
https://ameing-gifts-api.onrender.com
```
פתחי בדפדפן:
```
https://ameing-gifts-api.onrender.com/api/health
```
אמור להופיע:
```json
{ "status": "ok", "database": "ok", ... }
```

> **כל שינוי עתידי:** מעלים קובץ מעודכן ל-GitHub (**Add file** ← **Upload files** ← **Commit changes**), ו-Render בונה ומעלה מחדש לבד.

---

## חלק ד: בדיקה מלאה דרך Swagger

החליפי את `ameing-gifts-api` בשם שלך, אם בחרת שם אחר.

### 1. פתיחת `/api/health`
`https://ameing-gifts-api.onrender.com/api/health` ← `"status": "ok"`.

### 2. פתיחת `/api-docs`
`https://ameing-gifts-api.onrender.com/api-docs` ← יופיע דף Swagger עם כל ה-Endpoints, מחולקים לקבוצות.

### 3. התחברות מתוך Swagger
1. פתחי את **Auth** ← `POST /api/auth/login`.
2. לחצי **Try it out**.
3. בתיבה, כתבי את פרטי המנהל שהגדרת ב-Render:
   ```json
   { "email": "admin@ameing.co.il", "password": "הסיסמה-שבחרת" }
   ```
4. לחצי **Execute**.

### 4. קבלת JWT
בתשובה (Code `200`) יש שדה `token`. העתיקי את הערך שלו, **בלי** המירכאות.

### 5. שימוש ב-Authorize
1. גללי למעלה ולחצי על הכפתור **Authorize** 🔓.
2. הדביקי את ה-Token (**בלי** המילה Bearer, Swagger מוסיף אותה לבד).
3. לחצי **Authorize** ואז **Close**. המנעולים יופיעו סגורים 🔒.

### 6. קריאה ל-Endpoint מוגן
1. **Orders** ← `GET /api/orders` ← **Try it out** ← **Execute**.
2. תקבלי `200` עם רשימת 30 ההזמנות לדוגמה.
3. 🧪 **בדיקת 401:** לחצי **Authorize** ← **Logout**, והריצי שוב. תקבלי `401`.
4. 🧪 **בדיקת 403:** התחברי כלקוחה (`rachel.cohen@example.com` עם הסיסמה מ-`SEED_DEMO_PASSWORD`), שימי את ה-Token שלה ב-Authorize, והריצי `GET /api/orders`. תקבלי `403`, כי רק מנהל רואה את כל ההזמנות.

### 7. הוספת רשומה
מחוברת כמנהל:
1. **Products** ← `POST /api/products` ← **Try it out**.
2. יש כבר דוגמה מוכנה בתיבה (ספל קרמיקה). לחצי **Execute**.
3. תקבלי `201` ואת המוצר החדש עם `id`.

### 8. שליפת הרשומה ממסד הנתונים
1. `GET /api/products/{id}` ← **Try it out** ← הזיני את ה-`id` שקיבלת ← **Execute**.
2. תקבלי את המוצר שיצרת. הוא נשמר במסד הנתונים ב-Neon.
3. אפשר לראות אותו גם ב-Neon: **Tables** ← `products`.

---

## חלק ה: פתרון תקלות

| התקלה | איך זה נראה | מה לעשות |
|---|---|---|
| **Build Failed** | ב-Logs: `npm error` או `Build failed` | קראי את 20 השורות האחרונות ב-Logs. בדקי ש-`package.json` נמצא בדף הראשי של ה-Repository (ולא בתוך תיקייה נוספת). אם הוא בתוך תיקייה, הגדירי את שמה ב-**Root Directory**. |
| **DATABASE_URL שגוי** | `P1001: Can't reach database server` או `P1000: Authentication failed` | העתיקי שוב את הכתובת מ-Neon, בלי רווחים בהתחלה ובסוף, עם `?sslmode=require` בסוף. ב-Render: **Environment** ← עריכה ← **Save Changes**, ואז **Manual Deploy** ← **Deploy latest commit**. |
| **בעיית Prisma** | `Prisma schema validation`, `P3009` (migration נכשל), או התקיעה ב-`migrate deploy` | ודאי שהתיקייה `prisma/migrations` הועלתה ל-GitHub. אם הכתובת מכילה `-pooler`, השתמשי בכתובת בלי Pooling. ב-`P3009` אחרי ניסיון כושל: הכי פשוט ליצור ב-Neon מסד נתונים חדש (ריק) ולעדכן את `DATABASE_URL`. |
| **JWT_SECRET חסר** | ב-Logs: `הגדרות סביבה לא תקינות` ו-`JWT_SECRET` | הוסיפי `JWT_SECRET` עם לפחות 32 תווים, ושמרי. |
| **לא נוצר מנהל** | ב-Logs: `לא נוצר מנהל` | הגדירי `SEED_ADMIN_PASSWORD` (לפחות 8 תווים) ועשי Deploy מחדש. |
| **שגיאת CORS** | בדפדפן, בצד ה-React: `blocked by CORS policy` | ב-`CORS_ORIGINS` הכניסי את כתובת אתר ה-React בדיוק, בלי `/` בסוף. כמה כתובות: מופרדות בפסיק, למשל `http://localhost:5173,https://my-site.vercel.app`. |
| **401** | `UNAUTHORIZED`, `INVALID_TOKEN` או `TOKEN_EXPIRED` | לא נשלח Token, הוא הודבק לא נכון, או שפג תוקפו (אחרי שעתיים). התחברי שוב וקבלי Token חדש. ב-Swagger: בלי המילה Bearer. |
| **403** | `FORBIDDEN` | את מחוברת, אבל לחשבון אין הרשאה. למשל לקוחה שמנסה להוסיף מוצר, או מנהל שמנסה לשלוח הזמנה. התחברי עם החשבון המתאים. |
| **Swagger לא נפתח** | דף ריק או שגיאה ב-`/api-docs` | ודאי שהשרת Live ושה-`/api/health` עובד. נסי `/api-docs/` (עם `/` בסוף). רענני עם Ctrl+F5. |
| **השרת לא עולה** | Deploy נכשל אחרי Build מוצלח, או `Exited with status 1` | ב-Logs חפשי את השורה עם ❌. בדרך כלל זה משתנה סביבה חסר (`DATABASE_URL` או `JWT_SECRET`). ודאי ש-Start Command הוא `npm start`. |
| **הבקשה הראשונה איטית מאוד** | לוקח כ-50 שניות | זה תקין במסלול החינמי: השרת התעורר משינה. |
| **שינוי בקוד לא מופיע** | | ב-Render: **Manual Deploy** ← **Deploy latest commit**. |

---

## הרצת הבדיקות האוטומטיות (במחשב)

אם יש לך Node.js 22 במחשב:
1. ב-Neon צרי מסד נתונים **נוסף** לבדיקות: **Databases** ← **New Database** ← שם: `gifts_test`. הבדיקות מוחקות בו הכל, ולכן חייב להיות מסד נפרד!
2. בתיקיית הפרויקט צרי קובץ `.env` (העתק של `.env.example`) ומלאי `DATABASE_URL`, `TEST_DATABASE_URL` (המסד החדש) ו-`JWT_SECRET`.
3. בטרמינל, בתיקיית הפרויקט:
   ```bash
   npm install
   npm run check
   ```
   הפקודה בודקת טיפוסים, בונה, ומריצה את כל הבדיקות. בסוף אמור להופיע `Test Files 6 passed`.

---

## מה נבדק ומה עדיין לא

בסביבה שבה הפרויקט נבנה, **הגישה לאתר החבילות npm הייתה חסומה**, ולכן לא היה אפשר להתקין את Express, Prisma ושאר הספריות.

**✅ נבדק בפועל:**
- קובץ ה-Migration הורץ על PostgreSQL 16 אמיתי: כל 7 הטבלאות, הקשרים והאינדקסים נוצרו בהצלחה.
- כל נתוני ההדגמה (5 קטגוריות, 8 גופנים, 7 צבעים, 16 מוצרים, 16 משתמשים, 30 הזמנות עם 77 פריטים) הוכנסו למסד הנתונים בלי אף הפרה של אילוץ, והסכום של כל הזמנה תואם לסכום הפריטים.
- 7 ניסיונות להכניס נתונים לא תקינים נחסמו על ידי מסד הנתונים, כמצופה.
- 26 בדיקות של הלוגיקה העסקית (כללי שם ואות, מחירים, מעברי סטטוס) עברו.
- מסמך Swagger: כל 22 ה-Endpoints בקוד מתועדים, וכל ההפניות הפנימיות תקינות.
- בדיקת טיפוסים (TypeScript strict) של הקבצים שלא תלויים בספריות.

**⚠️ לא נבדק, כי דורש התקנת ספריות:**
- הפעלת השרת עצמו, `npm run build` ו-`npm run typecheck` המלאים.
- 109 הבדיקות האוטומטיות (Vitest) שבתיקייה `tests`. הן נכתבו מול הקוד, אבל לא הורצו.
- הקובץ `package-lock.json` לא קיים. הוא ייווצר אוטומטית בפעם הראשונה שמריצים `npm install`.

**ההמלצה:** הריצי `npm run check` במחשב לפני ההגשה (ראי הסעיף הקודם), או לפחות בצעי את חלק ד אחרי העלייה ל-Render. אם משהו נכשל, העתיקי את הודעת השגיאה ואעזור לתקן.
