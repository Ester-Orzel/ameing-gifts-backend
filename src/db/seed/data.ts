/**
 * נתוני ההדגמה של החנות. כל השמות, הטלפונים והכתובות מומצאים.
 * הקובץ לא תלוי בשום ספרייה, כדי שאפשר יהיה לבדוק אותו בנפרד.
 */

import type {
  DeliveryMethodValue,
  OrderStatusValue,
  PersonalizationKindValue,
  PersonalizationTypeValue,
} from '../../domain/types';

export const CATEGORIES = [
  'בקבוקים ותרמוסים',
  'אביזרים אישיים',
  'תיקים וארנקים',
  'גאדג\'טים',
  'מוצרים לבית',
] as const;

/** גופנים חינמיים אמיתיים מ-Google Fonts: 4 בעברית ו-4 באנגלית */
export const FONTS = [
  'Assistant',
  'Heebo',
  'Frank Ruhl Libre',
  'Varela Round',
  'Great Vibes',
  'Dancing Script',
  'Pacifico',
  'Playfair Display',
] as const;

export const COLORS: ReadonlyArray<{ name: string; hexCode: string }> = [
  { name: 'זהב', hexCode: '#D4AF37' },
  { name: 'רוז גולד', hexCode: '#B76E79' },
  { name: 'כסף', hexCode: '#C0C0C0' },
  { name: 'שחור', hexCode: '#000000' },
  { name: 'לבן', hexCode: '#FFFFFF' },
  { name: 'אדום', hexCode: '#C8102E' },
  { name: 'ורוד נצנצים', hexCode: '#F4A6C6' },
];

export interface SeedProduct {
  name: string;
  description: string;
  price: number;
  /** אינדקס ב-CATEGORIES */
  category: number;
  personalizationType: PersonalizationTypeValue;
  imageUrl: string;
}

type RawProduct = Omit<SeedProduct, 'imageUrl'> & { imageText: string };

const image = (text: string): string =>
  `https://placehold.co/600x600/f3e5e1/8a5a44?text=${encodeURIComponent(text)}`;

/** כתובת התיקייה שבה נמצאות תמונות המוצרים האמיתיות (באתר ה־React) */
export const PRODUCT_PHOTOS_BASE =
  process.env.PRODUCT_PHOTOS_BASE_URL?.replace(/\/+$/, '') ??
  'https://nameing-web-client.onrender.com/images/products';

/** תמונה אמיתית לכל מוצר, לפי שם המוצר. מוצר שאין לו תמונה נשאר עם תמונת placeholder */
const PRODUCT_PHOTOS: Record<string, string> = {
  'תרמוס צבעוני חכם': 'thermos',
  'בקבוק מים נירוסטה שחור': 'black-bottle',
  'בקבוק ילדים עם כתר': 'crown-bottle',
  'מחזיק מפתחות לב מעור': 'heart-keychain',
  'תגית מזוודה מעור': 'luggage-tag',
  'ארנק כרטיסים מעור': 'card-wallet',
  'תיק טואלט מעור עם ידית': 'toiletry-bag',
  'נרתיק לאוזניות': 'earbuds-case',
  'מנורת לילה כוכב': 'star-lamp',
  'מראה מתקפלת עם תאורה': 'mirror',
  'מגבת רחצה לבנה': 'bath-towel',
  'מכשיר אדים קטן': 'humidifier',
  'קופסת תכשיטים מרובעת': 'jewelry-box',
  'קופסה שקופה עם מכסה': 'clear-box',
  'מגבת ידיים': 'hand-towel',
};

export const photoFor = (name: string): string | undefined => {
  const slug = PRODUCT_PHOTOS[name];
  return slug ? `${PRODUCT_PHOTOS_BASE}/${slug}.webp` : undefined;
};

const RAW_PRODUCTS: RawProduct[] = [
  {
    name: 'תרמוס צבעוני חכם',
    description: 'תרמוס נירוסטה בצבעי מעבר עדינים, שומר על חום וקור עד 12 שעות. מגיע עם הדפסת שם לבחירה.',
    price: 89.9,
    category: 0,
    personalizationType: 'NAME_OR_INITIAL',
    imageText: 'Thermos',
  },
  {
    name: 'בקבוק מים נירוסטה שחור',
    description: 'בקבוק נירוסטה מט בנפח 500 מ"ל עם פקק כסוף. ההדפסה בולטת במיוחד על הרקע השחור.',
    price: 69.9,
    category: 0,
    personalizationType: 'NAME_OR_INITIAL',
    imageText: 'Black Bottle',
  },
  {
    name: 'בקבוק ילדים עם כתר',
    description: 'בקבוק שתייה לילדים בצבע ורוד עם מכסה בצורת כתר ופיה נשלפת. בטוח לשימוש ונוח לנשיאה.',
    price: 59.9,
    category: 0,
    personalizationType: 'NAME_OR_INITIAL',
    imageText: 'Crown Bottle',
  },
  {
    name: 'מחזיק מפתחות לב מעור',
    description: 'מחזיק מפתחות בצורת לב מעור סינטטי איכותי בגוון ורוד עתיק, עם טבעת מתכת. מקום לאות אחת מעוצבת.',
    price: 39.9,
    category: 1,
    personalizationType: 'INITIAL_ONLY',
    imageText: 'Heart Keychain',
  },
  {
    name: 'תגית מזוודה מעור',
    description: 'תגית לזיהוי מזוודה מעור סינטטי עם רצועה. זמינה בוורוד ובלבן, ומתאימה גם לתיקי בית ספר.',
    price: 34.9,
    category: 1,
    personalizationType: 'NAME_OR_INITIAL',
    imageText: 'Bag Tag',
  },
  {
    name: 'ארנק כרטיסים מעור',
    description: 'ארנק דק לכרטיסי אשראי ותעודות, בשני גווני ורוד. נכנס לכל תיק ולכל כיס.',
    price: 59.9,
    category: 2,
    personalizationType: 'NAME_OR_INITIAL',
    imageText: 'Card Holder',
  },
  {
    name: 'תיק טואלט מעור עם ידית',
    description: 'תיק נסיעות מרווח מעור סינטטי בגוון בז\'-ורוד, עם ידית נשיאה ורוכסן כפול. מתאים לנסיעות ולסידור הבית.',
    price: 129.9,
    category: 2,
    personalizationType: 'NAME_OR_INITIAL',
    imageText: 'Travel Bag',
  },
  {
    name: 'נרתיק לאוזניות',
    description: 'נרתיק קשיח ולבן לאוזניות אלחוטיות, מגן מפני שריטות ונפילות. הדפסה על המכסה.',
    price: 49.9,
    category: 3,
    personalizationType: 'NAME_OR_INITIAL',
    imageText: 'Earbuds Case',
  },
  {
    name: 'מנורת לילה כוכב',
    description: 'מנורת לילה רכה בצורת כוכב בצבע ורוד, עם אור חם ונעים. מושלמת לחדר ילדים.',
    price: 84.9,
    category: 4,
    personalizationType: 'NAME_OR_INITIAL',
    imageText: 'Star Lamp',
  },
  {
    name: 'מראה מתקפלת עם תאורה',
    description: 'מראה שולחנית מתקפלת עם תאורת LED נטענת בשלוש עוצמות. נוחה לנסיעות.',
    price: 99.9,
    category: 3,
    personalizationType: 'INITIAL_ONLY',
    imageText: 'LED Mirror',
  },
  {
    name: 'מגבת רחצה לבנה',
    description: 'מגבת כותנה רכה וסופגת במידה 70x140 ס"מ, עם רקמת שם בצבע לבחירה.',
    price: 74.9,
    category: 4,
    personalizationType: 'NAME_OR_INITIAL',
    imageText: 'Towel',
  },
  {
    name: 'מכשיר אדים קטן',
    description: 'מכשיר אדים שולחני שקט עם תאורת לילה, מתחבר ב-USB. מתאים לחדר שינה ולמשרד.',
    price: 79.9,
    category: 4,
    personalizationType: 'NAME_OR_INITIAL',
    imageText: 'Humidifier',
  },
  {
    name: 'קופסת תכשיטים מרובעת',
    description: 'קופסה מרופדת לתכשיטים עם רוכסן ותאים פנימיים. אות מוזהבת על המכסה.',
    price: 94.9,
    category: 4,
    personalizationType: 'INITIAL_ONLY',
    imageText: 'Jewelry Box',
  },
  {
    name: 'קופסה שקופה עם מכסה',
    description: 'קופסת אחסון שקופה עם מסגרת בגוון רוז גולד ורגליות. לסידור אביזרים קטנים על השולחן.',
    price: 69.9,
    category: 4,
    personalizationType: 'INITIAL_ONLY',
    imageText: 'Clear Box',
  },
  {
    name: 'מחזיק מפתחות עגול מעור',
    description: 'מחזיק מפתחות עגול ועדין מעור סינטטי, עם תליון מתכת. מקום לאות אחת.',
    price: 32.9,
    category: 1,
    personalizationType: 'INITIAL_ONLY',
    imageText: 'Round Keychain',
  },
  {
    name: 'מגבת ידיים',
    description: 'מגבת ידיים מכותנה במידה 50x90 ס"מ, עם רקמת שם או אות. סט מושלם יחד עם מגבת הרחצה.',
    price: 44.9,
    category: 4,
    personalizationType: 'NAME_OR_INITIAL',
    imageText: 'Hand Towel',
  },
];

export const PRODUCTS: ReadonlyArray<SeedProduct> = RAW_PRODUCTS.map(({ imageText, ...product }) => ({
  ...product,
  imageUrl: photoFor(product.name) ?? image(imageText),
}));

export interface SeedCustomer {
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

export const CUSTOMERS: ReadonlyArray<SeedCustomer> = [
  { fullName: 'רחל כהן', email: 'rachel.cohen@example.com', phone: '0521234567', address: 'רחוב הרצל 12, בני ברק' },
  { fullName: 'שרה לוי', email: 'sara.levi@example.com', phone: '0527654321', address: 'רחוב רבי עקיבא 45, בני ברק' },
  { fullName: 'מרים פרידמן', email: 'miriam.friedman@example.com', phone: '0533812457', address: 'רחוב בר אילן 8, ירושלים' },
  { fullName: 'אסתר גולדברג', email: 'esther.goldberg@example.com', phone: '0548127736', address: 'רחוב נחל לכיש 22, בית שמש' },
  { fullName: 'חנה וייס', email: 'chana.weiss@example.com', phone: '0556348812', address: 'רחוב רשב"י 14, אלעד' },
  { fullName: 'דבורה רוזנברג', email: 'dvora.rosenberg@example.com', phone: '0504471290', address: 'רחוב אבני נזר 31, מודיעין עילית' },
  { fullName: 'יעל שפירא', email: 'yael.shapira@example.com', phone: '0522958341', address: 'רחוב ז\'בוטינסקי 103, פתח תקווה' },
  { fullName: 'בתיה כץ', email: 'batya.katz@example.com', phone: '0538824417', address: 'רחוב הרב קוק 6, אשדוד' },
  { fullName: 'רבקה הורוביץ', email: 'rivka.horowitz@example.com', phone: '0583317265', address: 'רחוב המעגל 19, ביתר עילית' },
  { fullName: 'לאה ברגר', email: 'leah.berger@example.com', phone: '0527720943', address: 'רחוב הרצל 77, רחובות' },
  { fullName: 'נחמה קליין', email: 'nechama.klein@example.com', phone: '0546638120', address: 'רחוב סוקולוב 40, חולון' },
  { fullName: 'מלכה שטרן', email: 'malka.stern@example.com', phone: '0532249986', address: 'רחוב שמואל הנביא 51, ירושלים' },
  { fullName: 'צביה אדלר', email: 'tzivia.adler@example.com', phone: '0559083374', address: 'רחוב החשמונאים 9, בני ברק' },
  { fullName: 'יוסף מזרחי', email: 'yosef.mizrahi@example.com', phone: '0501187642', address: 'רחוב יפו 120, ירושלים' },
  { fullName: 'משה אברהם', email: 'moshe.avraham@example.com', phone: '0528864219', address: 'רחוב ויצמן 33, נתניה' },
];

/** שמות להדפסה, כמו בתמונות של העסק */
const PRINT_NAMES = [
  'Esty', 'Chani', 'Malky', 'Miriam', 'Brachi', 'Feigy', 'Dvory', 'Rochel', 'Shiffy', 'Tziri',
  'שרי', 'רחלי', 'יעלי', 'נחמי', 'מירי', 'חני', 'בתי', 'אסתי',
] as const;
const PRINT_INITIALS = ['B', 'M', 'G', 'C', 'R', 'S', 'E', 'D', 'מ', 'ש', 'ר', 'ח'] as const;
const NOTES = [
  'בבקשה לעטוף כמתנה',
  'מתנה ליום הולדת, אפשר להוסיף כרטיס ברכה?',
  'אם אפשר עד יום חמישי',
  'להתקשר לפני ההגעה',
  'מתנה לסיום שנה',
] as const;

/** מחולל מספרים "אקראיים" קבוע, כדי שנתוני ההדגמה יהיו זהים בכל הרצה */
export function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, list: readonly T[]): T {
  const value = list[Math.floor(rng() * list.length)];
  if (value === undefined) throw new Error('empty list');
  return value;
}

export interface SeedOrderItem {
  /** אינדקס ב-PRODUCTS */
  product: number;
  personalizationKind: PersonalizationKindValue;
  personalizationText: string | null;
  /** אינדקס ב-FONTS / COLORS, או null */
  font: number | null;
  color: number | null;
}

export interface SeedOrder {
  /** אינדקס ב-CUSTOMERS */
  customer: number;
  status: OrderStatusValue;
  deliveryMethod: DeliveryMethodValue;
  contactName: string;
  contactPhone: string;
  deliveryAddress: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: SeedOrderItem[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** סטטוס הגיוני לפי גיל ההזמנה: ישנות כבר נמסרו, חדשות עוד בטיפול */
function statusForAge(daysAgo: number, rng: () => number): OrderStatusValue {
  if (daysAgo > 14) return rng() < 0.12 ? 'CANCELLED' : 'DELIVERED';
  if (daysAgo > 7) return pick(rng, ['DELIVERED', 'DELIVERED', 'READY', 'CANCELLED'] as const);
  if (daysAgo > 3) return pick(rng, ['IN_PROGRESS', 'READY', 'READY'] as const);
  if (daysAgo > 1) return pick(rng, ['RECEIVED', 'IN_PROGRESS', 'IN_PROGRESS'] as const);
  return 'RECEIVED';
}

/**
 * בונה 30 הזמנות לדוגמה מפוזרות על פני 60 הימים האחרונים.
 * הלקוחה הראשונה (רחל כהן) מקבלת כמה הזמנות בסטטוסים שונים, כדי שיהיה נוח לבדוק איתה.
 */
export function buildDemoOrders(now: Date, count = 30): SeedOrder[] {
  const rng = createRng(20261021);
  const orders: SeedOrder[] = [];

  for (let i = 0; i < count; i++) {
    // הזמנות 0-3 שייכות ללקוחה הראשונה, השאר מתחלקות בין כולם
    const customerIndex = i < 4 ? 0 : 1 + Math.floor(rng() * (CUSTOMERS.length - 1));
    const customer = CUSTOMERS[customerIndex]!;

    const daysAgo = i < 4 ? [0, 3, 10, 35][i]! : Math.floor(rng() * 60);
    const createdAt = new Date(now.getTime() - daysAgo * DAY_MS - Math.floor(rng() * 10) * 60 * 60 * 1000);
    const status = statusForAge(daysAgo, rng);
    const updatedAt =
      status === 'RECEIVED'
        ? createdAt
        : new Date(Math.min(now.getTime(), createdAt.getTime() + (1 + Math.floor(rng() * 3)) * DAY_MS));

    const deliveryMethod: DeliveryMethodValue = rng() < 0.6 ? 'DELIVERY' : 'PICKUP';
    const itemsCount = 1 + Math.floor(rng() * 4); // 1-4 פריטים

    const items: SeedOrderItem[] = [];
    for (let j = 0; j < itemsCount; j++) {
      const productIndex = Math.floor(rng() * PRODUCTS.length);
      const product = PRODUCTS[productIndex]!;
      const roll = rng();

      if (roll < 0.12) {
        items.push({ product: productIndex, personalizationKind: 'NONE', personalizationText: null, font: null, color: null });
        continue;
      }

      const wantsName = product.personalizationType === 'NAME_OR_INITIAL' && roll < 0.8;
      const text = wantsName ? pick(rng, PRINT_NAMES) : pick(rng, PRINT_INITIALS);
      const isHebrew = /[א-ת]/.test(text);
      // גופן עברי (0-3) לטקסט בעברית, גופן אנגלי (4-7) לטקסט באנגלית
      const font = (isHebrew ? 0 : 4) + Math.floor(rng() * 4);
      const color = Math.floor(rng() * COLORS.length);

      items.push({
        product: productIndex,
        personalizationKind: wantsName ? 'NAME' : 'INITIAL',
        personalizationText: text,
        font,
        color,
      });
    }

    orders.push({
      customer: customerIndex,
      status,
      deliveryMethod,
      contactName: customer.fullName,
      contactPhone: customer.phone,
      deliveryAddress: deliveryMethod === 'DELIVERY' ? customer.address : null,
      notes: rng() < 0.3 ? pick(rng, NOTES) : null,
      createdAt,
      updatedAt,
      items,
    });
  }

  // מהישנה לחדשה, כך שמספרי ההזמנות יעלו לפי הזמן
  return orders.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}
