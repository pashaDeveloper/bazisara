const mongoose = require("mongoose");
const translate = require("google-translate-api-x");
const Article = require("../models/article.model");
const {
  buildPaginationMeta,
  buildSearchQuery,
  getPaginationOptions,
  getSearchTerm,
} = require("../utils/pagination.util");

function makeSlug(value, { allowPersian = true } = {}) {
  const invalidCharsPattern = allowPersian ? /[^a-z0-9\u0600-\u06ff-]+/g : /[^a-z0-9-]+/g;

  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(invalidCharsPattern, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const persianWordFallbacks = {
  بازی: "game",
  بازیها: "games",
  بازی‌های: "games",
  خرید: "buy",
  فروش: "sale",
  قیمت: "price",
  راهنما: "guide",
  راهنمای: "guide",
  نقد: "review",
  بررسی: "review",
  مقایسه: "compare",
  بهترین: "best",
  جدید: "new",
  اخبار: "news",
  آموزش: "tutorial",
  کنسول: "console",
  کامپیوتر: "pc",
  موبایل: "mobile",
};

function transliteratePersian(value) {
  const charMap = {
    آ: "a",
    ا: "a",
    ب: "b",
    پ: "p",
    ت: "t",
    ث: "s",
    ج: "j",
    چ: "ch",
    ح: "h",
    خ: "kh",
    د: "d",
    ذ: "z",
    ر: "r",
    ز: "z",
    ژ: "zh",
    س: "s",
    ش: "sh",
    ص: "s",
    ض: "z",
    ط: "t",
    ظ: "z",
    ع: "a",
    غ: "gh",
    ف: "f",
    ق: "gh",
    ک: "k",
    ك: "k",
    گ: "g",
    ل: "l",
    م: "m",
    ن: "n",
    و: "v",
    ه: "h",
    ی: "y",
    ي: "y",
    ئ: "y",
    ء: "",
    أ: "a",
    إ: "e",
    ؤ: "v",
    ة: "h",
    "۰": "0",
    "۱": "1",
    "۲": "2",
    "۳": "3",
    "۴": "4",
    "۵": "5",
    "۶": "6",
    "۷": "7",
    "۸": "8",
    "۹": "9",
  };

  const safeWordFallbacks = {
    "\u0628\u0627\u0632\u06cc": "game",
    "\u0628\u0627\u0632\u06cc\u0647\u0627": "games",
    "\u0628\u0627\u0632\u06cc\u200c\u0647\u0627\u06cc": "games",
    "\u062e\u0631\u06cc\u062f": "buy",
    "\u0641\u0631\u0648\u0634": "sale",
    "\u0642\u06cc\u0645\u062a": "price",
    "\u0631\u0627\u0647\u0646\u0645\u0627": "guide",
    "\u0631\u0627\u0647\u0646\u0645\u0627\u06cc": "guide",
    "\u0646\u0642\u062f": "review",
    "\u0628\u0631\u0631\u0633\u06cc": "review",
    "\u0645\u0642\u0627\u06cc\u0633\u0647": "compare",
    "\u0628\u0647\u062a\u0631\u06cc\u0646": "best",
    "\u062c\u062f\u06cc\u062f": "new",
    "\u0627\u062e\u0628\u0627\u0631": "news",
    "\u0622\u0645\u0648\u0632\u0634": "tutorial",
    "\u06a9\u0646\u0633\u0648\u0644": "console",
    "\u06a9\u0627\u0645\u067e\u06cc\u0648\u062a\u0631": "pc",
    "\u0645\u0648\u0628\u0627\u06cc\u0644": "mobile",
  };
  const safeCharMap = {
    "\u0622": "a",
    "\u0627": "a",
    "\u0628": "b",
    "\u067e": "p",
    "\u062a": "t",
    "\u062b": "s",
    "\u062c": "j",
    "\u0686": "ch",
    "\u062d": "h",
    "\u062e": "kh",
    "\u062f": "d",
    "\u0630": "z",
    "\u0631": "r",
    "\u0632": "z",
    "\u0698": "zh",
    "\u0633": "s",
    "\u0634": "sh",
    "\u0635": "s",
    "\u0636": "z",
    "\u0637": "t",
    "\u0638": "z",
    "\u0639": "a",
    "\u063a": "gh",
    "\u0641": "f",
    "\u0642": "gh",
    "\u06a9": "k",
    "\u0643": "k",
    "\u06af": "g",
    "\u0644": "l",
    "\u0645": "m",
    "\u0646": "n",
    "\u0648": "v",
    "\u0647": "h",
    "\u06cc": "y",
    "\u064a": "y",
    "\u0626": "y",
    "\u0621": "",
    "\u0623": "a",
    "\u0625": "e",
    "\u0624": "v",
    "\u0629": "h",
    "\u06f0": "0",
    "\u06f1": "1",
    "\u06f2": "2",
    "\u06f3": "3",
    "\u06f4": "4",
    "\u06f5": "5",
    "\u06f6": "6",
    "\u06f7": "7",
    "\u06f8": "8",
    "\u06f9": "9",
  };

  return String(value || "")
    .split(/(\s+)/)
    .map((part) => safeWordFallbacks[part] || persianWordFallbacks[part] || part)
    .join("")
    .split("")
    .map((char) => safeCharMap[char] ?? charMap[char] ?? char)
    .join("");
}

function hasPersianLetters(value) {
  return /[\u0600-\u06ff]/.test(String(value || ""));
}

async function makeEnglishSlug(value) {
  const source = String(value || "").trim();
  if (!source) return "";

  if (!hasPersianLetters(source) && makeSlug(source, { allowPersian: false })) {
    return makeSlug(source, { allowPersian: false });
  }

  try {
    const translated = await translate(source, { from: "fa", to: "en" });
    const translatedText = Array.isArray(translated) ? translated[0]?.text : translated?.text;
    const translatedSlug = makeSlug(translatedText, { allowPersian: false });
    if (translatedSlug) return translatedSlug;
  } catch (_) {}

  return makeSlug(transliteratePersian(source), { allowPersian: false });
}

function parseArray(value) {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value.filter(Boolean);

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch (_) {}

  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeKeywords(value) {
  const keywords = parseArray(value);
  return keywords === undefined ? undefined : keywords.map((item) => String(item).trim()).filter(Boolean);
}

function normalizeObjectIds(value) {
  const items = parseArray(value);
  if (items === undefined) return undefined;
  return items.filter((item) => mongoose.Types.ObjectId.isValid(item));
}

function normalizeFaqs(value) {
  const items = parseArray(value);
  if (items === undefined) return undefined;

  return items
    .map((item) => ({
      question: String(item?.question || "").trim(),
      answer: String(item?.answer || "").trim(),
    }))
    .filter((item) => item.question || item.answer);
}

function normalizeDate(value) {
  if (value === undefined) return undefined;
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeBoolean(value) {
  if (value === undefined) return undefined;
  return value === true || value === "true" || value === "1" || value === 1;
}

function buildMedia(file) {
  if (!file) return undefined;
  return {
    url: file.url,
    public_id: file.public_id,
    storage: file.storage || "",
  };
}

function normalizeArticlePayload(body, uploadedFiles) {
  const title = body.title !== undefined ? String(body.title).trim() : undefined;
  const slugSource = body.slug !== undefined ? body.slug : title;
  const payload = {
    title,
    slug: slugSource !== undefined ? makeSlug(slugSource) : undefined,
    excerpt: body.excerpt !== undefined ? String(body.excerpt).trim() : undefined,
    content: body.content !== undefined ? String(body.content) : undefined,
    author: body.author !== undefined ? String(body.author).trim() : undefined,
    authorAvatar:
      body.authorAvatarUrl !== undefined
        ? {
            url: String(body.authorAvatarUrl || "").trim(),
            public_id: String(body.authorAvatarPublicId || "").trim(),
            storage: String(body.authorAvatarStorage || "").trim(),
          }
        : undefined,
    readingTime: body.readingTime !== undefined ? String(body.readingTime).trim() : undefined,
    category:
      body.category !== undefined && mongoose.Types.ObjectId.isValid(body.category)
        ? body.category
        : body.category === ""
          ? null
          : undefined,
    tags: normalizeObjectIds(body.tags),
    relatedGames: normalizeObjectIds(body.relatedGames),
    faqs: normalizeFaqs(body.faqs),
    seoTitle: body.seoTitle !== undefined ? String(body.seoTitle).trim() : undefined,
    seoDescription: body.seoDescription !== undefined ? String(body.seoDescription).trim() : undefined,
    seoKeywords: normalizeKeywords(body.seoKeywords),
    publishedAt: normalizeDate(body.publishedAt),
    isFeatured: normalizeBoolean(body.isFeatured),
    status: body.status !== undefined ? String(body.status).trim() : undefined,
  };

  const cover = buildMedia(uploadedFiles?.cover?.[0]);
  if (cover) payload.cover = cover;
  payload.status = "pending";

  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

async function articleSlugExists(slug, currentId = null) {
  if (!slug) return false;

  return Article.exists({
    slug,
    isDeleted: false,
    ...(currentId ? { _id: { $ne: currentId } } : {}),
  });
}

function populateArticle(query) {
  return query
    .populate({
      path: "category",
      select: "name slug parent",
      populate: {
        path: "parent",
        select: "name slug parent",
        populate: {
          path: "parent",
          select: "name slug parent",
        },
      },
    })
    .populate("tags", "name slug")
    .populate("relatedGames", "title slug cover cardDesktopCover");
}

exports.generateArticleSlug = async (req, res) => {
  const title = String(req.body?.title || "").trim();

  if (!title) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "عنوان مطلب برای ساخت اسلاگ الزامی است",
    });
  }

  const slug = await makeEnglishSlug(title);

  if (!slug) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "ساخت اسلاگ انگلیسی برای این عنوان ممکن نیست",
    });
  }

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "اسلاگ پیشنهادی ساخته شد",
    data: { slug },
  });
};

exports.createArticle = async (req, res) => {
  const payload = normalizeArticlePayload(req.body, req.uploadedFiles);

  if (!payload.title) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "عنوان مطلب الزامی است",
    });
  }

  if (!payload.slug) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "اسلاگ مطلب الزامی است",
    });
  }

  if (await articleSlugExists(payload.slug)) {
    return res.status(409).json({
      acknowledgement: false,
      message: "Conflict",
      description: "این اسلاگ قبلا برای مطلب دیگری ثبت شده است",
    });
  }

  const article = await Article.create(payload);
  const populatedArticle = await populateArticle(Article.findById(article._id));

  res.status(201).json({
    acknowledgement: true,
    message: "Created",
    description: "مطلب با موفقیت ایجاد شد",
    data: populatedArticle,
  });
};

exports.getArticles = async (req, res) => {
  const search = getSearchTerm(req.query);
  const category = String(req.query.category || "").trim();
  if (category && !mongoose.Types.ObjectId.isValid(category)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه دسته‌بندی مطلب معتبر نیست",
    });
  }
  const query = {
    isDeleted: false,
    ...(req.adminRecord ? {} : { status: "active" }),
    ...(category ? { category } : {}),
    ...buildSearchQuery(search, [
      "title",
      "slug",
      "excerpt",
      "content",
      "author",
      "seoTitle",
      "seoDescription",
      "seoKeywords",
    ]),
  };
  const { limit, page, skip } = getPaginationOptions(req.query);
  const [articles, totalItems] = await Promise.all([
    populateArticle(Article.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)),
    Article.countDocuments(query),
  ]);

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "لیست مطالب دریافت شد",
    data: articles,
    pagination: buildPaginationMeta({ limit, page, totalItems }),
  });
};

exports.getArticle = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه مطلب معتبر نیست",
    });
  }

  const article = await populateArticle(
    Article.findOne({
      _id: id,
      isDeleted: false,
      ...(req.adminRecord ? {} : { status: "active" }),
    })
  );

  if (!article) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "مطلب یافت نشد",
    });
  }

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "جزئیات مطلب دریافت شد",
    data: article,
  });
};

exports.updateArticle = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه مطلب معتبر نیست",
    });
  }

  const article = await Article.findOne({ _id: id, isDeleted: false });
  if (!article) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "مطلب یافت نشد",
    });
  }

  const payload = normalizeArticlePayload(req.body, req.uploadedFiles);

  if (payload.slug && (await articleSlugExists(payload.slug, id))) {
    return res.status(409).json({
      acknowledgement: false,
      message: "Conflict",
      description: "این اسلاگ قبلا برای مطلب دیگری ثبت شده است",
    });
  }

  Object.assign(article, payload);
  await article.save();
  const populatedArticle = await populateArticle(Article.findById(article._id));

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "مطلب با موفقیت به‌روزرسانی شد",
    data: populatedArticle,
  });
};

exports.deleteArticle = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "شناسه مطلب معتبر نیست",
    });
  }

  const article = await Article.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, deletedAt: Date.now(), status: "inactive" },
    { new: true }
  );

  if (!article) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "مطلب یافت نشد",
    });
  }

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "مطلب با موفقیت حذف شد",
  });
};
