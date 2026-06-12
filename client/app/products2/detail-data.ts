import { products, type Product } from "./data";

export type DetailComment = {
  id: number;
  author: string;
  handle: string;
  body: string;
  timeAgo: string;
  likes: number;
  replies: number;
  tone: string;
};

export type DetailArticle = {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  date: string;
};

export type ProductDetail = {
  product: Product;
  englishTitle: string;
  breadcrumbs: string[];
  rating: number;
  ratingCount: number;
  reviewCount: number;
  questionsCount: number;
  priceLabel: string;
  gallery: string[];
  colorLabel: string;
  colors: Array<{ label: string; value: string }>;
  selectedColor: string;
  variantGroups: Array<{
    name: string;
    valueLabel: string;
    options: string[];
    selected: string;
  }>;
  insurance: {
    title: string;
    price: number;
    description: string;
  };
  reactionScore: string;
  selectedReaction: "Hate" | "Dislike" | "Neutral" | "Like" | "Love";
  tabs: Array<{ key: string; label: string }>;
  activeTab: string;
  summary: string;
  commentsTitle: string;
  relatedProducts: Product[];
  articles: DetailArticle[];
  comments: DetailComment[];
};

const defaultArticles: DetailArticle[] = [
  {
    id: 1,
    title: "راهنمای خرید کنسول PS5",
    excerpt: "ریجن چند بخرم؟ دیجیتال یا استاندارد؟ جواب همه سوالات اینجاست.",
    image: "/games/alan-wake-2.jpg",
    date: "۱۲ خرداد ۱۴۰۳",
  },
  {
    id: 2,
    title: "راهنمای خرید اشتراک پلاس",
    excerpt: "مقایسه سطح های مختلف اشتراک پلاس، تفاوتشان در چیست؟",
    image: "/games/prince-of-persia-the-lost-crown.jpg",
    date: "۱۴ خرداد ۱۴۰۳",
  },
  {
    id: 3,
    title: "راهنمای خرید کنسول PS3 کارکرده",
    excerpt: "کنسول PS3 با داشتن بازی‌های شاهکاری مثل Max Payne 3 همچنان ارزش خرید بالایی دارد.",
    image: "/games/the-quarry.png",
    date: "۱۲ خرداد ۱۴۰۳",
  },
  {
    id: 4,
    title: "راهنمای خرید کنسول PS4 کارکرده",
    excerpt: "قبل از خرید PS4 دست دوم، این نکات را بررسی کنید.",
    image: "/games/dead-space.jpg",
    date: "۱۲ خرداد ۱۴۰۳",
  },
];

const defaultComments: DetailComment[] = [
  {
    id: 1,
    author: "A.mxaz",
    handle: "@a.mxaz",
    body: "سال نو مبارک، به امید روز های خوب",
    timeAgo: "۹ دقیقه پیش",
    likes: 6,
    replies: 0,
    tone: "#3298ff",
  },
  {
    id: 2,
    author: "Shutdown",
    handle: "@shutdown",
    body: "بالاخره فضای اینجا خیلی بهتر از جای‌های دیگست.",
    timeAgo: "۹ دقیقه پیش",
    likes: 7,
    replies: 0,
    tone: "#ff7a18",
  },
  {
    id: 3,
    author: "DaddyHeshmat",
    handle: "@daddy",
    body: "حداقل اینترنت بانک‌ها رو باز کنید ما رو با اینترنت وصل بشن بخندیم.",
    timeAgo: "۹ دقیقه پیش",
    likes: 2,
    replies: 0,
    tone: "#0ea5e9",
  },
  {
    id: 4,
    author: "Communist",
    handle: "@communist",
    body: "من هنوز زنده‌ام و می‌خوام زندگی کنم",
    timeAgo: "۱۰ دقیقه پیش",
    likes: 7,
    replies: 0,
    tone: "#a855f7",
  },
];

const detailOverrides: Record<number, Omit<ProductDetail, "product" | "relatedProducts"> & { relatedIds: number[] }> = {
  1: {
    englishTitle: "Sony PlayStation 5 Slim Digital Edition Console",
    breadcrumbs: ["کالای دیجیتال", "کنسول بازی", "پلی استیشن", "PS5 Slim Digital"],
    rating: 4.6,
    ratingCount: 15,
    reviewCount: 2000,
    questionsCount: 23,
    priceLabel: "قیمت:",
    gallery: [
      "/products/png/ps5-slim-digital.png",
      "/products/png/ps5-pro.png",
      "/products/png/dualsense.png",
      "/products/png/ps5-slim-disc.png",
    ],
    colorLabel: "رنگ: سفید",
    colors: [
      { label: "سفید", value: "#f8fafc" },
      { label: "مشکی", value: "#0f172a" },
      { label: "آبی", value: "#2563eb" },
    ],
    selectedColor: "سفید",
    variantGroups: [
      { name: "وضعیت", valueLabel: "نو", options: ["نو", "در حد نو", "کارکرده"], selected: "نو" },
      { name: "ظرفیت", valueLabel: "1TB", options: ["1TB", "825GB", "512GB"], selected: "1TB" },
    ],
    insurance: {
      title: "بیمه تجهیزات دیجیتال - بیمه سامان",
      price: 3135000,
      description: "پوشش سرقت و آسیب فیزیکی تا یک سال",
    },
    reactionScore: "۱۲,۱۲۱",
    selectedReaction: "Like",
    tabs: [
      { key: "intro", label: "معرفی" },
      { key: "review", label: "نقد و بررسی" },
      { key: "specs", label: "مشخصات" },
      { key: "comments", label: "دیدگاه‌ها" },
    ],
    activeTab: "intro",
    summary:
      "نوع اتصال: بی‌سیم | حافظه داخلی: ۱ ترابایت | خروجی تصویر 4K | پشتیبانی از صدای سه‌بعدی | همراه با یک کنترلر DualSense",
    commentsTitle: "۳۵۵ دیدگاه ثبت شده، نظر تو چیه؟",
    relatedIds: [2, 3, 4, 6],
    articles: defaultArticles,
    comments: defaultComments,
  },
  2: {
    englishTitle: "Sony PlayStation 5 Slim Disc Edition Console",
    breadcrumbs: ["کالای دیجیتال", "کنسول بازی", "پلی استیشن", "PS5 Slim Disc"],
    rating: 4.4,
    ratingCount: 18,
    reviewCount: 1650,
    questionsCount: 27,
    priceLabel: "قیمت:",
    gallery: [
      "/products/png/ps5-slim-disc.png",
      "/products/png/ps5-slim-digital.png",
      "/products/png/dualsense.png",
      "/products/png/ps5-pro.png",
    ],
    colorLabel: "رنگ: سفید",
    colors: [
      { label: "سفید", value: "#f8fafc" },
      { label: "مشکی", value: "#111827" },
    ],
    selectedColor: "سفید",
    variantGroups: [
      { name: "وضعیت", valueLabel: "نو", options: ["نو", "در حد نو", "کارکرده"], selected: "نو" },
      { name: "ظرفیت", valueLabel: "1TB", options: ["1TB", "825GB"], selected: "1TB" },
    ],
    insurance: {
      title: "بیمه تجهیزات دیجیتال - بیمه سامان",
      price: 3290000,
      description: "پوشش خرابی، نوسان برق و سرقت",
    },
    reactionScore: "۹,۰۴۱",
    selectedReaction: "Like",
    tabs: [
      { key: "intro", label: "معرفی" },
      { key: "review", label: "نقد و بررسی" },
      { key: "specs", label: "مشخصات" },
      { key: "comments", label: "دیدگاه‌ها" },
    ],
    activeTab: "intro",
    summary:
      "نسخه دیسک‌خور اسلیم | حافظه ۱ ترابایت | مناسب اجرای بازی‌های نسل نهم | دارای درایو نوری جداشونده",
    commentsTitle: "۲۸۴ دیدگاه ثبت شده، نظر تو چیه؟",
    relatedIds: [1, 3, 4, 11],
    articles: defaultArticles,
    comments: defaultComments,
  },
  4: {
    englishTitle: "Sony DualSense Wireless Controller",
    breadcrumbs: ["لوازم جانبی", "کنترلر بازی", "پلی استیشن", "DualSense"],
    rating: 4.8,
    ratingCount: 22,
    reviewCount: 980,
    questionsCount: 41,
    priceLabel: "قیمت:",
    gallery: [
      "/products/png/dualsense.png",
      "/products/png/ps5-slim-digital.png",
      "/products/png/ps5-slim-disc.png",
    ],
    colorLabel: "رنگ: سفید",
    colors: [
      { label: "سفید", value: "#f8fafc" },
      { label: "آبی", value: "#2563eb" },
      { label: "مشکی", value: "#0f172a" },
    ],
    selectedColor: "سفید",
    variantGroups: [
      { name: "وضعیت", valueLabel: "نو", options: ["نو", "کارکرده"], selected: "نو" },
      { name: "نسخه", valueLabel: "استاندارد", options: ["استاندارد", "چنجر", "ادیشن"], selected: "استاندارد" },
    ],
    insurance: {
      title: "بیمه لوازم جانبی بازی",
      price: 695000,
      description: "پوشش ضربه و نوسان برق",
    },
    reactionScore: "۴,۴۸۸",
    selectedReaction: "Love",
    tabs: [
      { key: "intro", label: "معرفی" },
      { key: "review", label: "نقد و بررسی" },
      { key: "specs", label: "مشخصات" },
      { key: "comments", label: "دیدگاه‌ها" },
    ],
    activeTab: "intro",
    summary:
      "فیدبک لمسی | تریگرهای تطبیقی | اسپیکر داخلی | میکروفون داخلی | مناسب پلی استیشن ۵ و PC",
    commentsTitle: "۱۴۹ دیدگاه ثبت شده، نظر تو چیه؟",
    relatedIds: [1, 2, 5, 12],
    articles: defaultArticles,
    comments: defaultComments,
  },
};

function buildFallbackDetail(product: Product): ProductDetail {
  const relatedProducts = products.filter((item) => item.id !== product.id).slice(0, 4);

  return {
    product,
    englishTitle: `${product.title} | ${product.subtitle}`,
    breadcrumbs: ["کالای دیجیتال", "محصولات", product.title],
    rating: 4.5,
    ratingCount: 15,
    reviewCount: 1250,
    questionsCount: 500,
    priceLabel: "قیمت:",
    gallery: [product.image, ...relatedProducts.map((item) => item.image).slice(0, 3)],
    colorLabel: "رنگ: مشکی",
    colors: [
      { label: "مشکی", value: "#111827" },
      { label: "سفید", value: "#f8fafc" },
      { label: "سبز", value: "#16a34a" },
      { label: "آبی", value: "#2563eb" },
    ],
    selectedColor: "مشکی",
    variantGroups: [
      { name: "وضعیت", valueLabel: product.available ? "نو" : "ناموجود", options: ["نو", "در حد نو", "کارکرده"], selected: product.available ? "نو" : "کارکرده" },
      { name: "حافظه", valueLabel: "12GB", options: ["12GB", "32GB", "64GB", "128GB"], selected: "12GB" },
    ],
    insurance: {
      title: "بیمه تجهیزات دیجیتال - بیمه سامان",
      price: Math.max(350000, Math.round(product.price * 0.045)),
      description: "پوشش خرابی و حوادث فیزیکی تا یک سال",
    },
    reactionScore: "۱۲,۱۲۱",
    selectedReaction: "Like",
    tabs: [
      { key: "intro", label: "معرفی" },
      { key: "review", label: "نقد و بررسی" },
      { key: "specs", label: "مشخصات" },
      { key: "comments", label: "دیدگاه‌ها" },
    ],
    activeTab: "intro",
    summary: `نوع اتصال: ${product.platform.toUpperCase()} | سازنده: ${product.maker} | دسته‌بندی: ${product.genre} | وضعیت موجودی: ${product.available ? "موجود" : "ناموجود"}`,
    commentsTitle: "۱۴۹ دیدگاه ثبت شده، نظر تو چیه؟",
    relatedProducts,
    articles: defaultArticles,
    comments: defaultComments,
  };
}

export function getProductById(id: number) {
  return products.find((product) => product.id === id);
}

export function getProductDetail(id: number): ProductDetail | undefined {
  const product = getProductById(id);

  if (!product) return undefined;

  const override = detailOverrides[id];

  if (!override) {
    return buildFallbackDetail(product);
  }

  return {
    ...override,
    product,
    relatedProducts: override.relatedIds
      .map((relatedId) => products.find((item) => item.id === relatedId))
      .filter((item): item is Product => Boolean(item)),
  };
}
