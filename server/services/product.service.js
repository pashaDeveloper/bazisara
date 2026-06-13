const Product = require("../models/product.model");
const Brand = require("../models/brand.model");
const Specification = require("../models/specification.model");
const Variant = require("../models/variant.model");
const Badge = require("../models/badge.model");
const DigiPlus = require("../models/digiPlus.model");
const Seo = require("../models/seo.model");
const {
  buildPaginationMeta,
  buildSearchQuery,
  getPaginationOptions,
  getSearchTerm,
} = require("../utils/pagination.util");

function mediaUrl(file) {
  return file?.url || file?.path || "";
}

function parseArray(value) {
  if (value === undefined || value === null || value === "") return [];
  if (Array.isArray(value)) return value.filter(Boolean);

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch (_) {}

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseObject(value) {
  if (!value) return {};
  if (typeof value === "object") return value;

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (_) {}

  return {};
}

function parseNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function parseBoolean(value) {
  return value === true || value === "true" || value === "1" || value === 1;
}

function normalizeFaqs(value) {
  return parseArray(value)
    .map((item) => ({
      question: String(item?.question || "").trim(),
      answer: String(item?.answer || "").trim(),
    }))
    .filter((item) => item.question && item.answer);
}

function normalizeSpecs(value) {
  return parseArray(value)
    .map((item) => ({
      title: String(item?.title || "").trim(),
      attributes: parseArray(item?.attributes)
        .map((attribute) => ({
          title: String(attribute?.title || "").trim(),
          values: parseArray(attribute?.values).map(String).filter(Boolean),
        }))
        .filter((attribute) => attribute.title && attribute.values.length),
    }))
    .filter((item) => item.title && item.attributes.length);
}

function normalizeComments(value) {
  return parseArray(value)
    .map((item) => ({
      title: String(item?.title || "").trim(),
      body: String(item?.body || "").trim(),
      created_at: String(item?.created_at || new Date().toISOString()).trim(),
      rate: parseNumber(item?.rate),
      reactions: {
        likes: parseNumber(item?.likes ?? item?.reactions?.likes),
        dislikes: parseNumber(item?.dislikes ?? item?.reactions?.dislikes),
      },
      is_buyer: parseBoolean(item?.is_buyer),
      user_name: String(item?.user_name || "").trim(),
      is_anonymous: parseBoolean(item?.is_anonymous),
      relative_date: String(item?.relative_date || "").trim(),
    }))
    .filter((item) => item.body);
}

function normalizeQuestions(value) {
  return parseArray(value)
    .map((item) => ({
      text: String(item?.text || "").trim(),
      status: ["pending", "answered", "closed"].includes(item?.status) ? item.status : "pending",
      answer_count: parseNumber(item?.answer_count),
      sender: String(item?.sender || "").trim(),
      created_at: String(item?.created_at || new Date().toISOString()).trim(),
    }))
    .filter((item) => item.text);
}

function normalizeVariant(value) {
  const raw = parseObject(value);
  const badgeLabel = String(raw.badgeLabel || "").trim();

  return {
    title: String(raw.title || "تنوع اصلی").trim(),
    price: parseNumber(raw.price),
    oldPrice: parseNumber(raw.oldPrice),
    stock: parseNumber(raw.stock),
    color: String(raw.color || "").trim(),
    variant_badges: badgeLabel
      ? [
          {
            id: 1,
            type: raw.badgeType || "special_sell",
            slot: raw.badgeSlot || "topRightCorner",
            payload: {
              text: badgeLabel,
              text_color: raw.badgeTextColor || "#ffffff",
              svg_icon: raw.badgeIcon || null,
            },
          },
        ]
      : [],
  };
}

async function ensureBrand(body, existingProduct) {
  const brandId = body.brand || existingProduct?.brand;
  if (!brandId) return null;
  const brand = await Brand.findOne({ _id: brandId, isDeleted: false });
  return brand?._id || null;
}

async function createVariant(body) {
  const variant = await Variant.create(normalizeVariant(body.variant));
  return variant._id;
}

async function createSpecifications(body, adminId) {
  const specs = normalizeSpecs(body.specifications);
  if (!specs.length) {
    const fallback = await Specification.create({
      title: "مشخصات کلی",
      attributes: [{ title: "خلاصه", values: [String(body.summary || body.title || "محصول").trim()] }],
      creator: adminId,
    });
    return [fallback._id];
  }

  const created = await Specification.insertMany(specs.map((item) => ({ ...item, creator: adminId })));
  return created.map((item) => item._id);
}

async function createBadgeIds(value) {
  const badges = parseArray(value)
    .map((item) => ({
      title: String(item?.title || item?.label || "").trim(),
      tone: ["green", "orange", "red", "blue"].includes(item?.tone) ? item.tone : "green",
    }))
    .filter((item) => item.title);
  if (!badges.length) return [];
  const created = await Badge.insertMany(badges);
  return created.map((item) => item._id);
}

async function createDigiPlus(value) {
  const raw = parseObject(value);
  const item = await DigiPlus.create({
    title: String(raw.title || "تکنو پلاس").trim(),
    description: String(raw.description || "").trim(),
    price: parseNumber(raw.price),
  });
  return item._id;
}

async function createSeo(value) {
  const raw = parseObject(value);
  if (!raw.title && !raw.description && !parseArray(raw.keywords).length) return undefined;
  const seo = await Seo.create({
    title: String(raw.title || "").trim(),
    description: String(raw.description || "").trim(),
    keywords: parseArray(raw.keywords).map(String),
  });
  return seo._id;
}

function buildImages(body, uploadedFiles = {}, existing = null) {
  const mainFileUrl = mediaUrl(uploadedFiles.image?.[0]);
  const mainUrl = mainFileUrl || body.imageUrl || existing?.images?.main?.url?.[0] || "";
  const galleryFileUrls = Array.isArray(uploadedFiles.gallery) ? uploadedFiles.gallery.map(mediaUrl).filter(Boolean) : [];
  const galleryUrls = body.galleryUrls !== undefined ? parseArray(body.galleryUrls).map(String) : existing?.images?.list?.map((item) => item.url?.[0]).filter(Boolean) || [];

  return {
    main: {
      url: mainUrl ? [mainUrl] : [],
      webp_url: [],
    },
    list: [...galleryUrls, ...galleryFileUrls].map((url) => ({ url: [url], webp_url: [] })),
  };
}

async function normalizeProductPayload(req, existing = null, { defaultStatus = false } = {}) {
  const body = req.body || {};
  const variantId = await createVariant(body);
  const specifications = await createSpecifications(body, req.admin?._id);
  const technoPlus = await createDigiPlus(body.technoPlus);
  const seo = await createSeo(body.seo);
  const brand = await ensureBrand(body, existing);
  const productBadges = await createBadgeIds(body.product_badges);
  const variant = normalizeVariant(body.variant);
  const statusProduct = body.statusProduct || (parseNumber(variant.stock) > 0 ? "marketable" : "out_of_stock");

  const payload = {
    title: String(body.title || "").trim(),
    title_en: String(body.title_en || body.englishTitle || "").trim(),
    summary: String(body.summary || body.subtitle || "").trim(),
    statusProduct,
    has_quick_view: parseBoolean(body.has_quick_view),
    product_type: String(body.product_type || "product").trim(),
    category: body.category || existing?.category,
    brand,
    images: buildImages(body, req.uploadedFiles, existing),
    variants: [variantId],
    default_variant: variantId,
    second_default_variant: undefined,
    specifications,
    warranties: body.warranties !== undefined ? parseArray(body.warranties) : existing?.warranties || [],
    insurances: body.insurances !== undefined ? parseArray(body.insurances) : existing?.insurances || [],
    price: body.price !== undefined ? body.price || null : existing?.price || null,
    shipping_methods: body.shipping_methods !== undefined ? parseArray(body.shipping_methods) : existing?.shipping_methods || [],
    comments: [],
    questions: [],
    rating: {
      rate: parseNumber(body.ratingRate ?? body.rating?.rate),
      count: parseNumber(body.ratingCount ?? body.rating?.count),
    },
    pros_and_cons: parseArray(body.pros_and_cons).map(String),
    suggestion: {
      count: parseNumber(body.suggestionCount ?? body.suggestion?.count),
      percentage: parseNumber(body.suggestionPercentage ?? body.suggestion?.percentage),
    },
    faqs: normalizeFaqs(body.faqs),
    product_badges: productBadges,
    technoPlus,
    has_size_guide: parseBoolean(body.has_size_guide),
    has_true_to_size: parseBoolean(body.has_true_to_size),
    show_type: String(body.show_type || "normal").trim(),
    has_offline_shop_stock: parseBoolean(body.has_offline_shop_stock),
    expert_reviews: {
      description: String(body.expertDescription || body.expert_reviews?.description || "").trim(),
      short_review: String(body.expertShortReview || body.expert_reviews?.short_review || "").trim(),
      technical_properties: parseArray(body.technical_properties ?? body.expert_reviews?.technical_properties).map(String),
    },
    intrack: {
      eventName: String(body.intrackEventName || "").trim(),
      eventData: {
        currency: body.currency || "IRR",
        deviceType: body.deviceType || "web",
        name: body.title || "",
        productImageUrl: buildImages(body, req.uploadedFiles, existing).main.url,
        unitPrice: parseNumber(variant.price),
        supplyCategory: body.supplyCategory || "",
        leafCategory: body.leafCategory || "",
      },
    },
    promotion_banner: parseArray(body.promotion_banner).map(String),
    bigdata_tracker_data: {
      page_name: "product",
      page_info: {},
    },
    creator: req.admin?._id || existing?.creator,
    ...(seo ? { seo } : {}),
    ...(defaultStatus ? { status: body.status || "pending" } : body.status ? { status: body.status } : {}),
  };

  const comments = normalizeComments(body.comments);
  if (comments.length) {
    const createdComments = await require("../models/comment.model").insertMany(comments.map((item) => ({ ...item, creator: req.admin?._id })));
    payload.comments = createdComments.map((item) => item._id);
  } else if (existing?.comments?.length) {
    payload.comments = existing.comments;
  }

  const questions = normalizeQuestions(body.questions);
  if (questions.length) {
    const createdQuestions = await require("../models/question.model").insertMany(questions.map((item) => ({ ...item, creator: req.admin?._id })));
    payload.questions = createdQuestions.map((item) => item._id);
  } else if (existing?.questions?.length) {
    payload.questions = existing.questions;
  }

  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

function populateProduct(query) {
  return query
    .populate("category", "name")
    .populate("brand", "title_fa title_en brandId logo")
    .populate("variants")
    .populate("default_variant")
    .populate("specifications")
    .populate("warranties")
    .populate("insurances")
    .populate("price")
    .populate("shipping_methods")
    .populate("comments")
    .populate("questions")
    .populate("product_badges")
    .populate("technoPlus")
    .populate("seo");
}

function decorateProduct(product) {
  if (!product) return product;
  const item = typeof product.toObject === "function" ? product.toObject() : { ...product };
  const variant = item.default_variant || item.variants?.[0] || {};
  const imageUrl = item.images?.main?.url?.[0] || "";
  const badge = item.product_badges?.[0] || variant.variant_badges?.[0]?.payload;

  return {
    ...item,
    id: item.productId,
    slug: item.url?.uri_fa || item.url?.uri_en || "",
    subtitle: item.summary,
    image: { url: imageUrl, type: "image" },
    gallery: item.images?.list?.map((entry) => ({ url: entry.url?.[0] || "", type: "image" })).filter((entry) => entry.url) || [],
    priceRef: item.price || null,
    platform: item.product_type,
    genre: item.category?.name || "",
    maker: item.brand?.title_fa || "",
    price: item.price?.selling_price || variant.price || 0,
    oldPrice: variant.oldPrice || 0,
    stock: variant.stock || 0,
    available: item.statusProduct === "marketable",
    badge: badge?.title ? { label: badge.title, tone: badge.tone || "green" } : badge?.text ? { label: badge.text, tone: "green" } : null,
    ratingRate: item.rating?.rate || 0,
    ratingCount: item.rating?.count || 0,
  };
}

exports.createProduct = async (req, res) => {
  const payload = await normalizeProductPayload(req, null, { defaultStatus: true });
  if (!payload.title || !payload.summary || !payload.category || !payload.brand) {
    return res.status(400).json({ acknowledgement: false, message: "Bad Request", description: "عنوان، خلاصه، دسته‌بندی و برند محصول الزامی است" });
  }

  const product = await Product.create(payload);
  const populated = await populateProduct(Product.findById(product._id));
  res.status(201).json({ acknowledgement: true, message: "Created", description: "محصول ذخیره شد", data: decorateProduct(populated) });
};

exports.getProducts = async (req, res) => {
  const { page, limit, skip } = getPaginationOptions(req.query);
  const search = getSearchTerm(req.query);
  const query = {
    isDeleted: false,
    ...buildSearchQuery(search, ["title", "title_en", "summary", "product_type"]),
    ...(req.query.status ? { status: req.query.status } : {}),
    ...(req.query.statusProduct ? { statusProduct: req.query.statusProduct } : {}),
    ...(req.query.category ? { category: req.query.category } : {}),
    ...(req.query.available !== undefined ? { statusProduct: parseBoolean(req.query.available) ? "marketable" : { $ne: "marketable" } } : {}),
  };

  const [products, totalItems] = await Promise.all([
    populateProduct(Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)),
    Product.countDocuments(query),
  ]);

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    data: products.map(decorateProduct),
    pagination: buildPaginationMeta({ page, limit, totalItems }),
  });
};

exports.getProduct = async (req, res) => {
  const product = await populateProduct(Product.findOne({ _id: req.params.id, isDeleted: false }));
  if (!product) {
    return res.status(404).json({ acknowledgement: false, message: "Not Found", description: "محصول پیدا نشد" });
  }
  res.status(200).json({ acknowledgement: true, message: "OK", data: decorateProduct(product) });
};

exports.updateProduct = async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isDeleted: false });
  if (!product) {
    return res.status(404).json({ acknowledgement: false, message: "Not Found", description: "محصول پیدا نشد" });
  }

  const bodyKeys = Object.keys(req.body || {});
  if (bodyKeys.length === 1 && bodyKeys[0] === "status") {
    product.status = req.body.status;
    await product.save();
    const populated = await populateProduct(Product.findById(product._id));
    return res.status(200).json({ acknowledgement: true, message: "OK", description: "وضعیت محصول به‌روزرسانی شد", data: decorateProduct(populated) });
  }

  const payload = await normalizeProductPayload(req, product);
  Object.assign(product, payload);
  await product.save();
  const populated = await populateProduct(Product.findById(product._id));
  res.status(200).json({ acknowledgement: true, message: "OK", description: "محصول به‌روزرسانی شد", data: decorateProduct(populated) });
};

exports.deleteProduct = async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );
  if (!product) {
    return res.status(404).json({ acknowledgement: false, message: "Not Found", description: "محصول پیدا نشد" });
  }
  res.status(200).json({ acknowledgement: true, message: "OK", description: "محصول حذف شد", data: product });
};
