/**
 * מסמך OpenAPI 3 של השרת. משמש גם את Swagger UI (/api-docs)
 * וגם את הקובץ docs/openapi.json (נוצר בפקודה npm run docs:generate).
 *
 * הקובץ לא תלוי בשום ספרייה, כדי שאפשר יהיה לבדוק אותו בנפרד.
 */

import {
  DELIVERY_METHODS,
  ORDER_STATUSES,
  PERSONALIZATION_KINDS,
  PERSONALIZATION_TYPES,
} from '../domain/types';

type Json = Record<string, unknown>;

const ref = (name: string): Json => ({ $ref: `#/components/schemas/${name}` });
const resRef = (name: string): Json => ({ $ref: `#/components/responses/${name}` });

const jsonContent = (schema: Json, example?: unknown): Json => ({
  'application/json': { schema, ...(example !== undefined ? { example } : {}) },
});

const bearer = [{ bearerAuth: [] }];

const idParam = (what: string): Json => ({
  name: 'id',
  in: 'path',
  required: true,
  description: `מזהה ה${what}`,
  schema: { type: 'integer', minimum: 1 },
  example: 1,
});

const pageParams: Json[] = [
  { name: 'page', in: 'query', description: 'מספר עמוד (מתחיל ב-1)', schema: { type: 'integer', minimum: 1, default: 1 } },
  { name: 'limit', in: 'query', description: 'כמה רשומות בעמוד (1-50)', schema: { type: 'integer', minimum: 1, maximum: 50, default: 12 } },
];

// ---------- דוגמאות ----------

const exampleUser = {
  id: 2,
  fullName: 'רחל כהן',
  email: 'rachel.cohen@example.com',
  phone: '0521234567',
  role: 'CUSTOMER',
  createdAt: '2026-10-01T09:30:00.000Z',
};

const exampleProduct = {
  id: 1,
  name: 'תרמוס צבעוני חכם',
  description: 'תרמוס נירוסטה בצבעי מעבר עדינים, שומר על חום וקור עד 12 שעות. מגיע עם הדפסת שם לבחירה.',
  price: 89.9,
  imageUrl: 'https://placehold.co/600x600/f3e5e1/8a5a44?text=Thermos',
  personalizationType: 'NAME_OR_INITIAL',
  categoryId: 1,
  category: { id: 1, name: 'בקבוקים ותרמוסים' },
  createdAt: '2026-10-01T09:00:00.000Z',
  updatedAt: '2026-10-01T09:00:00.000Z',
};

const exampleOrder = {
  id: 31,
  customerId: 2,
  status: 'RECEIVED',
  deliveryMethod: 'DELIVERY',
  contactName: 'רחל כהן',
  contactPhone: '0521234567',
  deliveryAddress: 'רחוב הרצל 12, בני ברק',
  notes: null,
  totalPrice: 214.7,
  itemsCount: 3,
  createdAt: '2026-10-21T10:15:00.000Z',
  updatedAt: '2026-10-21T10:15:00.000Z',
  items: [
    {
      id: 81,
      productId: 1,
      productName: 'תרמוס צבעוני חכם',
      productImageUrl: 'https://placehold.co/600x600/f3e5e1/8a5a44?text=Thermos',
      unitPrice: 89.9,
      personalizationKind: 'NAME',
      personalizationText: 'Miriam',
      font: { id: 5, name: 'Great Vibes' },
      color: { id: 1, name: 'זהב', hexCode: '#D4AF37' },
    },
    {
      id: 82,
      productId: 4,
      productName: 'מחזיק מפתחות לב מעור',
      productImageUrl: 'https://placehold.co/600x600/f3e5e1/8a5a44?text=Keychain',
      unitPrice: 39.9,
      personalizationKind: 'INITIAL',
      personalizationText: 'B',
      font: { id: 5, name: 'Great Vibes' },
      color: { id: 2, name: 'רוז גולד', hexCode: '#B76E79' },
    },
    {
      id: 83,
      productId: 9,
      productName: 'מנורת לילה כוכב',
      productImageUrl: 'https://placehold.co/600x600/f3e5e1/8a5a44?text=Star+Lamp',
      unitPrice: 84.9,
      personalizationKind: 'NONE',
      personalizationText: null,
      font: null,
      color: null,
    },
  ],
};

const errorExample = (code: string, message: string, details?: Json[]) => ({
  error: { code, message, ...(details ? { details } : {}) },
});

// ---------- סכמות ----------

const schemas: Record<string, Json> = {
  Error: {
    type: 'object',
    required: ['error'],
    properties: {
      error: {
        type: 'object',
        required: ['code', 'message'],
        properties: {
          code: { type: 'string', example: 'VALIDATION_ERROR' },
          message: { type: 'string', example: 'נתונים לא תקינים' },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'deliveryAddress' },
                message: { type: 'string', example: 'במשלוח יש להזין כתובת מלאה (לפחות 5 תווים)' },
              },
            },
          },
        },
      },
    },
  },
  Health: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ['ok', 'error'] },
      database: { type: 'string', enum: ['ok', 'unreachable'] },
      uptimeSeconds: { type: 'integer' },
      timestamp: { type: 'string', format: 'date-time' },
    },
  },
  User: {
    type: 'object',
    description: 'משתמש. סיסמה ו-Hash לעולם לא מוחזרים.',
    properties: {
      id: { type: 'integer' },
      fullName: { type: 'string' },
      email: { type: 'string', format: 'email' },
      phone: { type: 'string' },
      role: { type: 'string', enum: ['CUSTOMER', 'ADMIN'] },
      createdAt: { type: 'string', format: 'date-time' },
    },
    example: exampleUser,
  },
  AuthResponse: {
    type: 'object',
    properties: {
      token: { type: 'string', description: 'JWT Access Token. יש לשלוח בכותרת Authorization: Bearer <token>' },
      tokenType: { type: 'string', enum: ['Bearer'] },
      expiresIn: { type: 'integer', description: 'תוקף ה-Token בשניות', example: 7200 },
      user: ref('User'),
    },
  },
  RegisterInput: {
    type: 'object',
    required: ['fullName', 'email', 'phone', 'password'],
    additionalProperties: false,
    properties: {
      fullName: { type: 'string', minLength: 2, maxLength: 60, example: 'רחל כהן' },
      email: { type: 'string', format: 'email', maxLength: 120, example: 'new.customer@example.com' },
      phone: { type: 'string', description: '9-10 ספרות שמתחילות ב-0. מקפים ורווחים מוסרים', example: '052-1234567' },
      password: { type: 'string', minLength: 8, maxLength: 72, description: 'לפחות אות אחת וספרה אחת', example: 'MyPass123' },
    },
  },
  LoginInput: {
    type: 'object',
    required: ['email', 'password'],
    additionalProperties: false,
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' },
    },
  },
  Category: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
      productsCount: { type: 'integer', description: 'כמה מוצרים בקטגוריה (רק ברשימה)' },
    },
    example: { id: 1, name: 'בקבוקים ותרמוסים', productsCount: 3 },
  },
  NameInput: {
    type: 'object',
    required: ['name'],
    additionalProperties: false,
    properties: { name: { type: 'string', minLength: 2, maxLength: 40 } },
  },
  Font: {
    type: 'object',
    properties: { id: { type: 'integer' }, name: { type: 'string' } },
    example: { id: 5, name: 'Great Vibes' },
  },
  Color: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
      hexCode: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
    },
    example: { id: 1, name: 'זהב', hexCode: '#D4AF37' },
  },
  ColorCreateInput: {
    type: 'object',
    required: ['name', 'hexCode'],
    additionalProperties: false,
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 40, example: 'טורקיז' },
      hexCode: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$', example: '#40E0D0' },
    },
  },
  ColorUpdateInput: {
    type: 'object',
    additionalProperties: false,
    description: 'לפחות שדה אחד',
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 40 },
      hexCode: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
    },
  },
  Product: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
      description: { type: 'string' },
      price: { type: 'number', description: 'מחיר בשקלים' },
      imageUrl: { type: 'string', format: 'uri' },
      personalizationType: {
        type: 'string',
        enum: [...PERSONALIZATION_TYPES],
        description: 'NAME_OR_INITIAL = אפשר שם או אות. INITIAL_ONLY = אות בלבד',
      },
      categoryId: { type: 'integer' },
      category: { type: 'object', properties: { id: { type: 'integer' }, name: { type: 'string' } } },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
    example: exampleProduct,
  },
  ProductCreateInput: {
    type: 'object',
    required: ['name', 'description', 'price', 'imageUrl', 'personalizationType', 'categoryId'],
    additionalProperties: false,
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 80 },
      description: { type: 'string', minLength: 5, maxLength: 1000 },
      price: { type: 'number', minimum: 0, exclusiveMinimum: true, maximum: 100000, description: 'עד 2 ספרות אחרי הנקודה' },
      imageUrl: { type: 'string', format: 'uri', maxLength: 500 },
      personalizationType: { type: 'string', enum: [...PERSONALIZATION_TYPES] },
      categoryId: { type: 'integer', minimum: 1 },
    },
    example: {
      name: 'ספל קרמיקה לבן',
      description: 'ספל קרמיקה קלאסי בנפח 330 מ"ל, מתאים למדיח. הדפסת שם או אות לבחירה.',
      price: 45,
      imageUrl: 'https://placehold.co/600x600/f3e5e1/8a5a44?text=Mug',
      personalizationType: 'NAME_OR_INITIAL',
      categoryId: 5,
    },
  },
  ProductUpdateInput: {
    type: 'object',
    additionalProperties: false,
    description: 'שולחים רק את השדות שרוצים לשנות (לפחות אחד)',
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 80 },
      description: { type: 'string', minLength: 5, maxLength: 1000 },
      price: { type: 'number', minimum: 0, exclusiveMinimum: true, maximum: 100000 },
      imageUrl: { type: 'string', format: 'uri', maxLength: 500 },
      personalizationType: { type: 'string', enum: [...PERSONALIZATION_TYPES] },
      categoryId: { type: 'integer', minimum: 1 },
    },
    example: { price: 79.9 },
  },
  ProductList: {
    type: 'object',
    properties: {
      items: { type: 'array', items: ref('Product') },
      page: { type: 'integer' },
      limit: { type: 'integer' },
      total: { type: 'integer', description: 'כמה מוצרים תואמים בסך הכל' },
      totalPages: { type: 'integer' },
    },
  },
  OrderItemInput: {
    type: 'object',
    required: ['productId', 'personalizationKind'],
    additionalProperties: false,
    description:
      'פריט אחד מהסל. NONE: בלי טקסט, גופן וצבע. NAME: שם של 2-20 אותיות (רק במוצר NAME_OR_INITIAL) + גופן + צבע. INITIAL: אות אחת + גופן + צבע.',
    properties: {
      productId: { type: 'integer', minimum: 1 },
      personalizationKind: { type: 'string', enum: [...PERSONALIZATION_KINDS] },
      personalizationText: { type: 'string', nullable: true },
      fontId: { type: 'integer', minimum: 1, nullable: true },
      colorId: { type: 'integer', minimum: 1, nullable: true },
    },
  },
  OrderCreateInput: {
    type: 'object',
    required: ['deliveryMethod', 'contactName', 'contactPhone', 'items'],
    additionalProperties: false,
    properties: {
      deliveryMethod: { type: 'string', enum: [...DELIVERY_METHODS], description: 'DELIVERY = משלוח, PICKUP = איסוף עצמי' },
      contactName: { type: 'string', minLength: 2, maxLength: 60 },
      contactPhone: { type: 'string', description: '9-10 ספרות שמתחילות ב-0' },
      deliveryAddress: { type: 'string', maxLength: 200, description: 'חובה במשלוח (לפחות 5 תווים). באיסוף עצמי לא נשמרת' },
      notes: { type: 'string', maxLength: 500 },
      items: { type: 'array', minItems: 1, maxItems: 20, items: ref('OrderItemInput') },
    },
    example: {
      deliveryMethod: 'DELIVERY',
      contactName: 'רחל כהן',
      contactPhone: '0521234567',
      deliveryAddress: 'רחוב הרצל 12, בני ברק',
      notes: 'בבקשה לעטוף כמתנה',
      items: [
        { productId: 1, personalizationKind: 'NAME', personalizationText: 'Miriam', fontId: 5, colorId: 1 },
        { productId: 4, personalizationKind: 'INITIAL', personalizationText: 'B', fontId: 5, colorId: 2 },
        { productId: 9, personalizationKind: 'NONE' },
      ],
    },
  },
  OrderItem: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      productId: { type: 'integer' },
      productName: { type: 'string' },
      productImageUrl: { type: 'string' },
      unitPrice: { type: 'number', description: 'המחיר ברגע ההזמנה' },
      personalizationKind: { type: 'string', enum: [...PERSONALIZATION_KINDS] },
      personalizationText: { type: 'string', nullable: true },
      font: { nullable: true, allOf: [ref('Font')] },
      color: { nullable: true, allOf: [ref('Color')] },
    },
  },
  Order: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      customerId: { type: 'integer' },
      status: {
        type: 'string',
        enum: [...ORDER_STATUSES],
        description: 'RECEIVED=התקבלה, IN_PROGRESS=בהכנה, READY=מוכנה, DELIVERED=נמסרה, CANCELLED=בוטלה',
      },
      deliveryMethod: { type: 'string', enum: [...DELIVERY_METHODS] },
      contactName: { type: 'string' },
      contactPhone: { type: 'string' },
      deliveryAddress: { type: 'string', nullable: true },
      notes: { type: 'string', nullable: true },
      totalPrice: { type: 'number' },
      itemsCount: { type: 'integer' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
      customer: {
        type: 'object',
        description: 'מופיע רק בתשובות למנהל',
        properties: {
          id: { type: 'integer' },
          fullName: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
        },
      },
      items: { type: 'array', items: ref('OrderItem') },
    },
    example: exampleOrder,
  },
  OrderList: {
    type: 'object',
    properties: {
      items: { type: 'array', items: ref('Order') },
      page: { type: 'integer' },
      limit: { type: 'integer' },
      total: { type: 'integer' },
      totalPages: { type: 'integer' },
    },
  },
  OrderStatusInput: {
    type: 'object',
    required: ['status'],
    additionalProperties: false,
    properties: { status: { type: 'string', enum: [...ORDER_STATUSES] } },
    example: { status: 'IN_PROGRESS' },
  },
};

const responses: Record<string, Json> = {
  BadRequest: {
    description: '400 - נתונים לא תקינים',
    content: jsonContent(
      ref('Error'),
      errorExample('VALIDATION_ERROR', 'נתונים לא תקינים', [{ field: 'price', message: 'מחיר חייב להיות גדול מ-0' }]),
    ),
  },
  Unauthorized: {
    description: '401 - לא מחובר, Token חסר, לא תקין או שפג תוקפו',
    content: jsonContent(ref('Error'), errorExample('UNAUTHORIZED', 'נדרשת התחברות. יש לשלוח Authorization: Bearer <token>')),
  },
  Forbidden: {
    description: '403 - מחובר, אבל אין הרשאה לפעולה הזו',
    content: jsonContent(ref('Error'), errorExample('FORBIDDEN', 'אין לך הרשאה לבצע פעולה זו')),
  },
  NotFound: {
    description: '404 - לא נמצא',
    content: jsonContent(ref('Error'), errorExample('NOT_FOUND', 'המשאב המבוקש לא נמצא')),
  },
  Conflict: {
    description: '409 - התנגשות (למשל שם שכבר קיים)',
    content: jsonContent(ref('Error'), errorExample('CONFLICT', 'ערך זה כבר קיים במערכת')),
  },
};

// ---------- עזרים לפעולות של רשימות בחירה ----------

function catalogPaths(
  basePath: string,
  tag: string,
  whatHe: string,
  itemSchema: string,
  createSchema: string,
  updateSchema: string,
): Record<string, Json> {
  return {
    [basePath]: {
      get: {
        tags: [tag],
        summary: `רשימת ${whatHe}`,
        description: 'ציבורי - לא נדרשת התחברות.',
        responses: {
          '200': { description: 'הצלחה', content: jsonContent({ type: 'array', items: ref(itemSchema) }) },
        },
      },
      post: {
        tags: [tag],
        summary: `הוספה ל${whatHe}`,
        description: 'מנהל בלבד.',
        security: bearer,
        requestBody: { required: true, content: jsonContent(ref(createSchema)) },
        responses: {
          '201': { description: 'נוצר', content: jsonContent(ref(itemSchema)) },
          '400': resRef('BadRequest'),
          '401': resRef('Unauthorized'),
          '403': resRef('Forbidden'),
          '409': resRef('Conflict'),
        },
      },
    },
    [`${basePath}/{id}`]: {
      patch: {
        tags: [tag],
        summary: `עריכה ב${whatHe}`,
        description: 'מנהל בלבד.',
        security: bearer,
        parameters: [idParam('רשומה')],
        requestBody: { required: true, content: jsonContent(ref(updateSchema)) },
        responses: {
          '200': { description: 'עודכן', content: jsonContent(ref(itemSchema)) },
          '400': resRef('BadRequest'),
          '401': resRef('Unauthorized'),
          '403': resRef('Forbidden'),
          '404': resRef('NotFound'),
          '409': resRef('Conflict'),
        },
      },
    },
  };
}

// ---------- המסמך ----------

export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Ameing - מתנות במיתוג אישי - API',
    version: '1.0.0',
    description: [
      'שרת לאתר מתנות במיתוג אישי.',
      '',
      '**איך בודקים כתובות מוגנות:**',
      '1. פתחי את `POST /api/auth/login` ולחצי **Try it out**.',
      '2. שלחי אימייל וסיסמה (בפיתוח: `admin@example.com` / `Admin1234!` למנהל, או `rachel.cohen@example.com` / `Demo1234!` ללקוחה).',
      '3. העתיקי את הערך של `token` מהתשובה.',
      '4. לחצי על הכפתור **Authorize** למעלה, הדביקי את ה-Token (בלי המילה Bearer) ולחצי Authorize.',
      '5. עכשיו כל הבקשות נשלחות עם ה-Token.',
      '',
      'שגיאות: 400 נתונים לא תקינים, 401 לא מחובר, 403 אין הרשאה, 404 לא נמצא, 409 התנגשות.',
    ].join('\n'),
  },
  servers: [{ url: '/', description: 'השרת הנוכחי' }],
  tags: [
    { name: 'Health', description: 'בדיקת תקינות' },
    { name: 'Auth', description: 'הרשמה, התחברות ופרטי המשתמש המחובר' },
    { name: 'Products', description: 'מוצרים' },
    { name: 'Orders', description: 'הזמנות' },
    { name: 'Categories', description: 'קטגוריות' },
    { name: 'Fonts', description: 'גופנים להדפסה' },
    { name: 'Colors', description: 'צבעי הדפסה' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'הדביקי כאן את ה-Token שהתקבל מ-login (בלי המילה Bearer)',
      },
    },
    schemas,
    responses,
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'בדיקה שהשרת ומסד הנתונים פעילים',
        responses: {
          '200': {
            description: 'הכל תקין',
            content: jsonContent(ref('Health'), {
              status: 'ok',
              database: 'ok',
              uptimeSeconds: 42,
              timestamp: '2026-10-21T10:00:00.000Z',
            }),
          },
          '503': { description: 'מסד הנתונים לא זמין', content: jsonContent(ref('Health')) },
        },
      },
    },

    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'הרשמת לקוח חדש',
        description: 'יוצר תמיד משתמש מסוג CUSTOMER, ומחזיר Token כך שהלקוח מחובר מיד.',
        requestBody: { required: true, content: jsonContent(ref('RegisterInput')) },
        responses: {
          '201': { description: 'נרשם בהצלחה', content: jsonContent(ref('AuthResponse')) },
          '400': resRef('BadRequest'),
          '409': {
            description: 'האימייל כבר רשום',
            content: jsonContent(ref('Error'), errorExample('CONFLICT', 'כתובת האימייל כבר רשומה במערכת')),
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'התחברות',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: ref('LoginInput'),
              examples: {
                admin: { summary: 'מנהל (פיתוח)', value: { email: 'admin@example.com', password: 'Admin1234!' } },
                customer: { summary: 'לקוחה (פיתוח)', value: { email: 'rachel.cohen@example.com', password: 'Demo1234!' } },
              },
            },
          },
        },
        responses: {
          '200': { description: 'התחברות הצליחה', content: jsonContent(ref('AuthResponse')) },
          '400': resRef('BadRequest'),
          '401': {
            description: 'אימייל או סיסמה שגויים',
            content: jsonContent(ref('Error'), errorExample('INVALID_CREDENTIALS', 'אימייל או סיסמה שגויים')),
          },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'פרטי המשתמש המחובר',
        description: 'מתאים למילוי מראש של שם וטלפון בטופס ההזמנה.',
        security: bearer,
        responses: {
          '200': { description: 'הצלחה', content: jsonContent(ref('User')) },
          '401': resRef('Unauthorized'),
        },
      },
    },

    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'רשימת מוצרים עם חיפוש, סינון ומיון',
        description: 'ציבורי - לא נדרשת התחברות.',
        parameters: [
          { name: 'search', in: 'query', description: 'חיפוש בשם המוצר', schema: { type: 'string', maxLength: 80 }, example: 'תרמוס' },
          { name: 'categoryId', in: 'query', description: 'סינון לפי קטגוריה', schema: { type: 'integer', minimum: 1 } },
          {
            name: 'sort',
            in: 'query',
            description: 'newest = החדשים קודם, price_asc = מהזול ליקר, price_desc = מהיקר לזול, name = לפי שם',
            schema: { type: 'string', enum: ['newest', 'price_asc', 'price_desc', 'name'], default: 'newest' },
          },
          ...pageParams,
        ],
        responses: {
          '200': { description: 'הצלחה', content: jsonContent(ref('ProductList')) },
          '400': resRef('BadRequest'),
        },
      },
      post: {
        tags: ['Products'],
        summary: 'הוספת מוצר',
        description: 'מנהל בלבד.',
        security: bearer,
        requestBody: { required: true, content: jsonContent(ref('ProductCreateInput')) },
        responses: {
          '201': { description: 'המוצר נוצר', content: jsonContent(ref('Product')) },
          '400': resRef('BadRequest'),
          '401': resRef('Unauthorized'),
          '403': resRef('Forbidden'),
        },
      },
    },
    '/api/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'פרטי מוצר',
        description: 'ציבורי - לא נדרשת התחברות.',
        parameters: [idParam('מוצר')],
        responses: {
          '200': { description: 'הצלחה', content: jsonContent(ref('Product')) },
          '400': resRef('BadRequest'),
          '404': resRef('NotFound'),
        },
      },
      patch: {
        tags: ['Products'],
        summary: 'עריכת מוצר',
        description: 'מנהל בלבד. שולחים רק את השדות שמשתנים.',
        security: bearer,
        parameters: [idParam('מוצר')],
        requestBody: { required: true, content: jsonContent(ref('ProductUpdateInput')) },
        responses: {
          '200': { description: 'עודכן', content: jsonContent(ref('Product')) },
          '400': resRef('BadRequest'),
          '401': resRef('Unauthorized'),
          '403': resRef('Forbidden'),
          '404': resRef('NotFound'),
        },
      },
    },

    '/api/orders': {
      post: {
        tags: ['Orders'],
        summary: 'שליחת הזמנה עם כל פריטי הסל',
        description:
          'לקוח בלבד (מנהל יקבל 403). הלקוח נקבע לפי ה-Token. המחיר מחושב בשרת לפי המחיר במסד הנתונים.',
        security: bearer,
        requestBody: { required: true, content: jsonContent(ref('OrderCreateInput')) },
        responses: {
          '201': { description: 'ההזמנה נוצרה', content: jsonContent(ref('Order')) },
          '400': {
            description: 'נתונים לא תקינים',
            content: jsonContent(
              ref('Error'),
              errorExample('VALIDATION_ERROR', 'נתונים לא תקינים', [
                { field: 'items.1.personalizationKind', message: 'המוצר "מחזיק מפתחות לב מעור" מאפשר הדפסת אות בלבד' },
              ]),
            ),
          },
          '401': resRef('Unauthorized'),
          '403': resRef('Forbidden'),
        },
      },
      get: {
        tags: ['Orders'],
        summary: 'כל ההזמנות של כל הלקוחות',
        description: 'מנהל בלבד. חיפוש לפי שם או טלפון, סינון לפי סטטוס, מיון לפי תאריך.',
        security: bearer,
        parameters: [
          { name: 'status', in: 'query', description: 'סינון לפי סטטוס', schema: { type: 'string', enum: [...ORDER_STATUSES] } },
          { name: 'search', in: 'query', description: 'חיפוש לפי שם הלקוח או מספר הטלפון', schema: { type: 'string', maxLength: 80 } },
          { name: 'sort', in: 'query', description: 'newest = החדשה קודם, oldest = הישנה קודם', schema: { type: 'string', enum: ['newest', 'oldest'], default: 'newest' } },
          ...pageParams,
        ],
        responses: {
          '200': { description: 'הצלחה', content: jsonContent(ref('OrderList')) },
          '400': resRef('BadRequest'),
          '401': resRef('Unauthorized'),
          '403': resRef('Forbidden'),
        },
      },
    },
    '/api/orders/my': {
      get: {
        tags: ['Orders'],
        summary: 'ההזמנות שלי',
        description: 'לקוח בלבד. מחזיר רק את ההזמנות של הלקוח המחובר.',
        security: bearer,
        parameters: [
          { name: 'status', in: 'query', description: 'סינון לפי סטטוס', schema: { type: 'string', enum: [...ORDER_STATUSES] } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['newest', 'oldest'], default: 'newest' } },
          ...pageParams,
        ],
        responses: {
          '200': { description: 'הצלחה', content: jsonContent(ref('OrderList')) },
          '400': resRef('BadRequest'),
          '401': resRef('Unauthorized'),
          '403': resRef('Forbidden'),
        },
      },
    },
    '/api/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'פרטי הזמנה',
        description: 'לקוח: רק הזמנה שלו (הזמנה של אחר מחזירה 404). מנהל: כל הזמנה, כולל פרטי הלקוח.',
        security: bearer,
        parameters: [idParam('הזמנה')],
        responses: {
          '200': { description: 'הצלחה', content: jsonContent(ref('Order')) },
          '400': resRef('BadRequest'),
          '401': resRef('Unauthorized'),
          '404': resRef('NotFound'),
        },
      },
    },
    '/api/orders/{id}/status': {
      patch: {
        tags: ['Orders'],
        summary: 'עדכון סטטוס הזמנה',
        description: 'מנהל בלבד. הזמנה בסטטוס DELIVERED או CANCELLED היא סופית (409).',
        security: bearer,
        parameters: [idParam('הזמנה')],
        requestBody: { required: true, content: jsonContent(ref('OrderStatusInput')) },
        responses: {
          '200': { description: 'עודכן', content: jsonContent(ref('Order')) },
          '400': resRef('BadRequest'),
          '401': resRef('Unauthorized'),
          '403': resRef('Forbidden'),
          '404': resRef('NotFound'),
          '409': {
            description: 'ההזמנה בסטטוס סופי',
            content: jsonContent(ref('Error'), errorExample('ORDER_FINALIZED', 'לא ניתן לשנות הזמנה בסטטוס "נמסרה"')),
          },
        },
      },
    },

    ...catalogPaths('/api/categories', 'Categories', 'הקטגוריות', 'Category', 'NameInput', 'NameInput'),
    ...catalogPaths('/api/fonts', 'Fonts', 'הגופנים', 'Font', 'NameInput', 'NameInput'),
    ...catalogPaths('/api/colors', 'Colors', 'הצבעים', 'Color', 'ColorCreateInput', 'ColorUpdateInput'),
  },
};
