import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ControlPanel from "../ControlPanel";
import Cross from "@/components/icons/Cross";
import NavigationButton from "@/components/shared/button/NavigationButton";
import SendButton from "@/components/shared/button/SendButton";
import StepIndicator from "../categories/components/StepIndicator";
import ThumbnailUpload from "@/components/shared/ThumbnailUpload";
import { MultiSelectDropdown, SingleSelectDropdown } from "@/components/shared/Dropdown";
import { useGetCategoriesQuery } from "@/services/category/categoryApi";
import { useGetCategoryFiltersQuery } from "@/services/category/categoryFilterApi";
import { useGetBrandsQuery } from "@/services/brandApi";
import {
  useGetInsurancesQuery,
  useGetShippingMethodsQuery,
  useGetWarrantiesQuery,
} from "@/services/catalogEntityApi";
import { useCreateProductMutation, useGetProductQuery, useUpdateProductMutation } from "@/services/productApi";

const initialForm = {
  title: "",
  title_en: "",
  summary: "",
  category: "",
  brand: "",
  warranties: [],
  insurances: [],
  price: "",
  shipping_methods: [],
  statusProduct: "marketable",
  product_type: "product",
  image: null,
  gallery: [],
  imageUrl: "",
  galleryUrls: [],
  basePrice: "",
  priceConfig: { basePrice: "", orderLimit: 1 },
  variants: [],
  variant: {
    title: "تنوع اصلی",
    price: "",
    oldPrice: "",
    stock: "",
    color: "",
    badgeLabel: "",
    badgeType: "special_sell",
    badgeSlot: "topRightCorner",
  },
  specifications: [],
  faqs: [],
  comments: [],
  questions: [],
  ratingRate: "",
  ratingCount: "",
  pros_and_cons: [],
  suggestionCount: "",
  suggestionPercentage: "",
  product_badges: [],
  technoPlus: { title: "تکنو پلاس", price: "", description: "" },
  has_quick_view: false,
  has_size_guide: false,
  has_true_to_size: false,
  has_offline_shop_stock: false,
  show_type: "normal",
  expertDescription: "",
  expertShortReview: "",
  technical_properties: [],
  promotion_banner: [],
  seo: { title: "", description: "", keywords: [] },
  status: "pending",
};

const steps = [
  { key: "basic", title: "اصلی" },
  { key: "content", title: "محتوا" },
  { key: "specs", title: "مشخصات" },
  { key: "social", title: "FAQ و نظر" },
  { key: "publish", title: "انتشار" },
];

function formatPrice(value) {
  return Number(value || 0).toLocaleString("fa-IR");
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function toNumber(value) {
  const number = Number(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(number) ? number : 0;
}

function calculateVariantPrice(variant, basePrice) {
  const base = toNumber(variant.basePrice || basePrice);
  const modifiersTotal = toArray(variant.priceModifiers).reduce((sum, item) => sum + toNumber(item.priceDelta), 0);
  return base + modifiersTotal;
}

function Field({ label, children }) {
  return (
    <label className="space-y-2">
      <span className="text-sm text-zinc-600 dark:text-zinc-300">{label}</span>
      {children}
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-700 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-white"
      {...props}
    />
  );
}

function Textarea(props) {
  return (
    <textarea
      className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm leading-7 text-zinc-900 outline-none transition focus:border-zinc-700 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-white"
      {...props}
    />
  );
}

function SimpleRows({ items, label, onChange, placeholder }) {
  const rows = items.length ? items : [""];
  return (
    <div className="space-y-3 rounded-xl border border-zinc-300 bg-white p-4 dark:border-zinc-800 dark:bg-black">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{label}</span>
        <button className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-white hover:text-white" onClick={() => onChange([...rows, ""])} type="button">
          افزودن
        </button>
      </div>
      {rows.map((item, index) => (
        <div className="flex gap-2" key={`${label}-${index}`}>
          <TextInput onChange={(event) => onChange(rows.map((row, rowIndex) => (rowIndex === index ? event.target.value : row)))} placeholder={placeholder} value={item} />
          {rows.length > 1 ? (
            <button className="rounded-lg border border-red-900/70 px-3 text-xs text-red-300 transition hover:border-red-400" onClick={() => onChange(rows.filter((_, rowIndex) => rowIndex !== index))} type="button">
              حذف
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function FaqRows({ items, onChange }) {
  const rows = items.length ? items : [{ question: "", answer: "" }];
  const update = (index, key, value) => onChange(rows.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)));

  return (
    <div className="space-y-3 rounded-xl border border-zinc-300 bg-white p-4 dark:border-zinc-800 dark:bg-black">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">سوالات متداول محصول</span>
        <button className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-white hover:text-white" onClick={() => onChange([...rows, { question: "", answer: "" }])} type="button">
          افزودن
        </button>
      </div>
      {rows.map((item, index) => (
        <div className="space-y-2 rounded-2xl border border-zinc-300 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950" key={`faq-${index}`}>
          <TextInput onChange={(event) => update(index, "question", event.target.value)} placeholder="سوال" value={item.question || ""} />
          <Textarea onChange={(event) => update(index, "answer", event.target.value)} placeholder="پاسخ" rows={3} value={item.answer || ""} />
          {rows.length > 1 ? (
            <button className="rounded-lg border border-red-900/70 px-3 py-2 text-xs text-red-300 transition hover:border-red-400" onClick={() => onChange(rows.filter((_, rowIndex) => rowIndex !== index))} type="button">
              حذف
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function SpecificationRows({ items, onChange }) {
  const rows = items.length ? items : [{ title: "مشخصات کلی", attributes: [{ title: "", values: "" }] }];
  const updateSpec = (index, next) => onChange(rows.map((item, itemIndex) => (itemIndex === index ? next : item)));

  return (
    <div className="space-y-3 rounded-xl border border-zinc-300 bg-white p-4 dark:border-zinc-800 dark:bg-black">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">مشخصات محصول</span>
        <button className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-white hover:text-white" onClick={() => onChange([...rows, { title: "", attributes: [{ title: "", values: "" }] }])} type="button">
          افزودن گروه
        </button>
      </div>
      {rows.map((spec, index) => (
        <div className="space-y-3 rounded-2xl border border-zinc-300 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950" key={`spec-${index}`}>
          <TextInput onChange={(event) => updateSpec(index, { ...spec, title: event.target.value })} placeholder="عنوان گروه مشخصات" value={spec.title || ""} />
          {toArray(spec.attributes).map((attribute, attrIndex) => (
            <div className="grid gap-2 md:grid-cols-2" key={`spec-${index}-${attrIndex}`}>
              <TextInput
                onChange={(event) => {
                  const attributes = toArray(spec.attributes).map((item, itemIndex) => (itemIndex === attrIndex ? { ...item, title: event.target.value } : item));
                  updateSpec(index, { ...spec, attributes });
                }}
                placeholder="عنوان ویژگی"
                value={attribute.title || ""}
              />
              <TextInput
                onChange={(event) => {
                  const attributes = toArray(spec.attributes).map((item, itemIndex) => (itemIndex === attrIndex ? { ...item, values: event.target.value } : item));
                  updateSpec(index, { ...spec, attributes });
                }}
                placeholder="مقادیر با کاما"
                value={Array.isArray(attribute.values) ? attribute.values.join(", ") : attribute.values || ""}
              />
            </div>
          ))}
          <div className="flex gap-2">
            <button className="rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition hover:border-white" onClick={() => updateSpec(index, { ...spec, attributes: [...toArray(spec.attributes), { title: "", values: "" }] })} type="button">
              افزودن ویژگی
            </button>
            {rows.length > 1 ? (
              <button className="rounded-lg border border-red-900/70 px-3 py-2 text-xs text-red-300 transition hover:border-red-400" onClick={() => onChange(rows.filter((_, rowIndex) => rowIndex !== index))} type="button">
                حذف گروه
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function VariantPricingRows({ basePrice, categoryFilters, items, onBasePriceChange, onChange }) {
  const rows = items.length
    ? items
    : [{ title: "تنوع اصلی", stock: "", color: "", basePrice: "", oldPrice: "", priceModifiers: [] }];
  const [editingIndex, setEditingIndex] = useState(null);
  const editingVariant = editingIndex === null ? null : rows[editingIndex];

  const update = (index, next) => onChange(rows.map((item, itemIndex) => (itemIndex === index ? next : item)));
  const addVariant = () =>
    onChange([
      ...rows,
      {
        title: `تنوع ${rows.length + 1}`,
        stock: "",
        color: "",
        basePrice: "",
        oldPrice: "",
        priceModifiers: [],
      },
    ]);

  const upsertModifier = (filter, option, priceDelta) => {
    if (editingIndex === null) return;
    const modifiers = toArray(editingVariant.priceModifiers);
    const nextModifier = {
      categoryFilter: filter._id,
      filterKey: filter.key,
      filterLabel: filter.label || filter.key,
      optionValue: option.value,
      optionLabel: option.label,
      priceDelta,
    };
    const exists = modifiers.some((item) => item.categoryFilter === filter._id && item.optionValue === option.value);
    const nextModifiers = exists
      ? modifiers.map((item) => (item.categoryFilter === filter._id && item.optionValue === option.value ? nextModifier : item))
      : [...modifiers, nextModifier];
    update(editingIndex, { ...editingVariant, priceModifiers: nextModifiers });
  };

  const removeModifier = (filterId, optionValue) => {
    if (editingIndex === null) return;
    update(editingIndex, {
      ...editingVariant,
      priceModifiers: toArray(editingVariant.priceModifiers).filter(
        (item) => !(item.categoryFilter === filterId && item.optionValue === optionValue)
      ),
    });
  };

  return (
    <div className="space-y-4 rounded-xl border border-zinc-300 bg-white p-4 dark:border-zinc-800 dark:bg-black">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">قیمت‌گذاری محصول</h3>
          <p className="mt-1 text-xs text-zinc-500">قیمت نهایی هر تنوع از قیمت پایه و قیمت بخش‌های انتخابی محاسبه می‌شود.</p>
        </div>
        <button className="rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition hover:border-white" onClick={addVariant} type="button">
          افزودن variant
        </button>
      </div>

      <Field label="قیمت پایه">
        <TextInput inputMode="numeric" onChange={(event) => onBasePriceChange(event.target.value)} value={basePrice} />
      </Field>

      <div className="space-y-3">
        {rows.map((variant, index) => {
          const finalPrice = calculateVariantPrice(variant, basePrice);

          return (
            <div className="rounded-2xl border border-zinc-300 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950" key={`variant-${index}`}>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="عنوان variant">
                  <TextInput onChange={(event) => update(index, { ...variant, title: event.target.value })} value={variant.title || ""} />
                </Field>
                <Field label="رنگ/مدل">
                  <TextInput onChange={(event) => update(index, { ...variant, color: event.target.value })} value={variant.color || ""} />
                </Field>
                <Field label="موجودی">
                  <TextInput inputMode="numeric" onChange={(event) => update(index, { ...variant, stock: event.target.value })} value={variant.stock || ""} />
                </Field>
                <Field label="قیمت قبل">
                  <TextInput inputMode="numeric" onChange={(event) => update(index, { ...variant, oldPrice: event.target.value })} value={variant.oldPrice || ""} />
                </Field>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-3 text-xs dark:border-zinc-800">
                <span className="font-bold text-emerald-500">قیمت نهایی: {formatPrice(finalPrice)} تومان</span>
                <div className="flex gap-2">
                  <button className="rounded-lg border border-zinc-700 px-3 py-2 text-zinc-300 transition hover:border-white" onClick={() => setEditingIndex(index)} type="button">
                    تنظیم قیمت بخش‌ها
                  </button>
                  {rows.length > 1 ? (
                    <button className="rounded-lg border border-red-900/70 px-3 py-2 text-red-300 transition hover:border-red-400" onClick={() => onChange(rows.filter((_, rowIndex) => rowIndex !== index))} type="button">
                      حذف
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editingVariant ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4 backdrop-blur" dir="rtl">
          <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-zinc-700 bg-zinc-950 p-5">
            <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white">قیمت‌گذاری {editingVariant.title}</h3>
                <p className="mt-1 text-xs text-zinc-500">برای هر گزینه از فیلترهای دسته‌بندی، مبلغ افزایشی جدا ثبت می‌شود.</p>
              </div>
              <button className="rounded-lg border border-zinc-800 px-3 py-2 text-xs text-zinc-300 transition hover:border-white" onClick={() => setEditingIndex(null)} type="button">
                بستن
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {categoryFilters.length ? (
                categoryFilters.map((filter) => (
                  <div className="rounded-xl border border-zinc-800 bg-black p-4" key={filter._id}>
                    <h4 className="text-sm font-bold text-white">{filter.label || filter.key}</h4>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {toArray(filter.options).map((option) => {
                        const current = toArray(editingVariant.priceModifiers).find(
                          (item) => item.categoryFilter === filter._id && item.optionValue === option.value
                        );

                        return (
                          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3" key={`${filter._id}-${option.value}`}>
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <span className="text-sm font-bold text-zinc-200">{option.label}</span>
                              {current ? (
                                <button className="text-xs text-red-300" onClick={() => removeModifier(filter._id, option.value)} type="button">
                                  حذف قیمت
                                </button>
                              ) : null}
                            </div>
                            <TextInput
                              inputMode="numeric"
                              onChange={(event) => upsertModifier(filter, option, event.target.value)}
                              placeholder="مبلغ افزایشی"
                              value={current?.priceDelta ?? ""}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-zinc-800 bg-black p-6 text-center text-sm text-zinc-500">
                  برای این دسته‌بندی هنوز فیلتری ثبت نشده است.
                </div>
              )}
            </div>

            <div className="mt-5 rounded-xl border border-emerald-900/60 bg-emerald-950/30 p-4 text-sm font-bold text-emerald-200">
              قیمت نهایی: {formatPrice(calculateVariantPrice(editingVariant, basePrice))} تومان
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProductCardPreview({ form, imagePreview }) {
  const available = form.statusProduct === "marketable";
  const previewVariant = form.variants?.[0] || form.variant;
  const previewPrice = calculateVariantPrice(previewVariant, form.basePrice || form.priceConfig.basePrice);
  return (
    <aside className="sticky top-24 self-start" dir="rtl">
      <div className="group block w-full">
        <div className="rounded-xl border border-[#e8ecf1] bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:border-[#dce3eb] hover:shadow-[0_18px_32px_-28px_rgba(24,35,55,.28)]">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-[#eef2f7]">
            {imagePreview ? (
              <img alt={form.title || "محصول"} className="h-full w-full object-contain p-6 transition-transform duration-300 group-hover:scale-[1.04]" src={imagePreview} />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-bold text-[#7f879c]">تصویر محصول</div>
            )}
          </div>
          <div className="mt-4 space-y-2">
            <h3 className="line-clamp-2 text-right text-[13px] font-black leading-6 text-[#444d68]">{form.title || "عنوان محصول"}</h3>
            <p className="line-clamp-1 text-right text-[12px] font-medium text-[#7f879c]">{form.summary || "خلاصه کوتاه محصول"}</p>
            {available ? (
              <div className="pt-1 text-left text-[14px] font-black text-[#2f3446]">
                {formatPrice(previewPrice)} <span className="text-[10px] font-bold text-[#7f879c]">تومان</span>
              </div>
            ) : (
              <div className="pt-1 text-left text-[11px] font-bold text-[#ff5268]">ناموجود</div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

function ProductDetailPreview({ brandLabel, form, imagePreview, isSticky = true, forceMobile = false }) {
  const previewVariant = form.variants?.[0] || form.variant;
  const previewPrice = calculateVariantPrice(previewVariant, form.basePrice || form.priceConfig.basePrice);
  const available = form.statusProduct === "marketable";
  const title = form.title || "عنوان محصول";
  const englishTitle = form.title_en || `${brandLabel || "Bazisara"} ${form.product_type || "product"}`;
  const summary = form.summary || "خلاصه محصول در اینجا نمایش داده می‌شود.";
  const gallery = [imagePreview, ...toArray(form.galleryUrls)].filter(Boolean);
  const ratingRate = Number(form.ratingRate || 4.6);
  const ratingCount = Number(form.ratingCount || 128);
  const questionsCount = Math.max(toArray(form.questions).length, 3);
  const commentsCount = Math.max(toArray(form.comments).length, 12);
  const variants = toArray(form.variants).length ? toArray(form.variants) : [form.variant];
  const colorVariants = variants.filter((item) => item.color);
  const specs = toArray(form.specifications).filter((item) => item.title || toArray(item.attributes).length);
  const tabs = ["بررسی محصول", "مشخصات", "دیدگاه‌ها", "پرسش‌ها"];
  const frameClass = forceMobile
    ? "mx-auto aspect-[9/19.5] max-h-[76vh] max-w-[360px] overflow-hidden"
    : "overflow-hidden";

  return (
    <article className={`${isSticky ? "sticky top-24" : ""} relative w-full ${frameClass} rounded-[28px] bg-[#fbfcfe] text-right text-[#29467c] shadow-2xl shadow-black/20`} dir="rtl">
      <div className={forceMobile ? "hidden" : "hidden gap-6 p-5 lg:grid lg:grid-cols-[250px_minmax(0,1fr)_330px]"}>
        <aside className="space-y-4">
          <div className="rounded-[1.5rem] border border-[#e7ebf1] bg-white p-5 shadow-[0_25px_50px_-38px_rgba(15,23,42,.18)]">
            <div className="text-sm font-black text-[#31467c]">فروشنده: بازی‌سرا</div>
            <div className="mt-4 rounded-2xl border border-[#edf1f6] bg-[#fbfcff] p-4 text-sm font-bold text-[#59627a]">
              <div className="flex items-center justify-between">
                <span>{available ? "آماده ارسال" : "ناموجود"}</span>
                <span className={available ? "text-[#20a365]" : "text-[#ef476f]"}>{available ? "موجود" : "غیرفعال"}</span>
              </div>
              <div className="mt-3 text-left text-2xl font-black text-[#2f3446]">
                {formatPrice(previewPrice)} <span className="text-xs font-bold text-[#7f879c]">تومان</span>
              </div>
            </div>
            <button className="mt-4 w-full rounded-2xl bg-[#ef476f] px-4 py-3 text-sm font-black text-white" type="button">
              افزودن به سبد خرید
            </button>
          </div>
          <div className="rounded-[1.5rem] border border-[#e7ebf1] bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-black text-[#31467c]">امتیاز شما :</h3>
              <span className="text-xl font-black text-[#31467c]">{ratingRate.toLocaleString("fa-IR")}</span>
            </div>
            <div className="grid grid-cols-5 gap-1 text-center text-[11px] text-[#727d92]">
              {["عالی", "خوب", "معمولی", "ضعیف", "بد"].map((item, index) => (
                <div className={`rounded-xl px-1 py-3 ${index === 0 ? "bg-[#e7f7ec] text-[#1f8d4d]" : "bg-[#fbfcff]"}`} key={item}>
                  <div className="text-lg">{index === 0 ? "♡" : "•"}</div>
                  <div className="mt-1">{item}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="space-y-4">
          <div>
            <p className="text-xs font-bold text-[#7f879c]">{brandLabel || "برند"} / {form.product_type}</p>
            <h2 className="mt-2 text-[1.8rem] font-black leading-[1.6] text-[#29467c]">{title}</h2>
            <p className="mt-1.5 text-sm text-[#97a1b8]">{englishTitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 text-sm">
            <div className="rounded-full border border-[#e9edf3] px-4 py-2 font-black text-[#21a365]">
              ★ {ratingRate.toLocaleString("fa-IR")} <span className="font-bold text-[#7f8796]">({ratingCount.toLocaleString("fa-IR")} رای)</span>
            </div>
            <div className="rounded-full border border-[#e9edf3] px-4 py-2 font-bold text-[#59627a]">{commentsCount.toLocaleString("fa-IR")} دیدگاه</div>
            <div className="rounded-full border border-[#e9edf3] px-4 py-2 font-bold text-[#59627a]">{questionsCount.toLocaleString("fa-IR")} سوال</div>
          </div>
          <div className="space-y-4 rounded-[1.35rem] border border-[#e8edf3] bg-white p-4 shadow-[0_24px_48px_-38px_rgba(15,23,42,.18)]">
            <div>
              <div className="text-lg font-black text-[#111827]">رنگ: {previewVariant.color || "پیش‌فرض"}</div>
              <div className="mt-2.5 flex flex-wrap gap-2.5">
                {(colorVariants.length ? colorVariants : variants).slice(0, 5).map((variant, index) => (
                  <button className={`rounded-[0.85rem] border px-3.5 py-2 text-sm font-bold ${index === 0 ? "border-[#344054] text-[#111827]" : "border-[#e5eaf2] text-[#4b557a]"}`} key={`desktop-color-${index}`} type="button">
                    {variant.color || variant.title || `تنوع ${index + 1}`}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-lg font-black text-[#111827]">تنوع: {previewVariant.title || "تنوع اصلی"}</div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {variants.slice(0, 4).map((variant, index) => (
                  <button className={`rounded-[0.85rem] border px-3.5 py-2 text-sm font-bold ${index === 0 ? "border-[#344054] bg-white text-[#111827]" : "border-[#e5eaf2] bg-white text-[#4b557a]"}`} key={`desktop-variant-${index}`} type="button">
                    {variant.title || `تنوع ${index + 1}`}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-[1rem] border border-[#e8edf3] bg-[#fbfcff] p-3.5">
              <div className="text-sm font-bold text-[#2f3c61]">{form.technoPlus.title || "بیمه و خدمات تکمیلی"}</div>
              <div className="mt-1.5 text-xs leading-6 text-[#7f879a]">{form.technoPlus.description || "امکان افزودن خدمات و بیمه از بخش انتشار محصول."}</div>
              {form.technoPlus.price ? <div className="mt-1.5 text-base font-black text-[#2f3c61]">{formatPrice(form.technoPlus.price)} تومان</div> : null}
            </div>
          </div>
        </section>

        <section className="rounded-[1.9rem] border border-[#e7ebf1] bg-white p-5 shadow-[0_30px_60px_-40px_rgba(15,23,42,.24)]">
          <div className="flex gap-3">
            <div className="flex min-w-[72px] flex-col gap-3">
              {(gallery.length ? gallery : [""]).slice(0, 4).map((item, index) => (
                <button className={`relative h-[92px] rounded-[1rem] border ${index === 0 ? "border-[#cad5e7] bg-[#f8fafc]" : "border-[#edf1f6] bg-white"}`} key={`thumb-${index}`} type="button">
                  {item ? <img alt={`${title} ${index + 1}`} className="h-full w-full object-contain p-2" src={item} /> : null}
                </button>
              ))}
            </div>
            <div className="relative flex-1 overflow-hidden rounded-[1.6rem] bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fd_100%)]">
              {gallery[0] ? (
                <img alt={title} className="mx-auto h-full max-h-[520px] w-full object-contain p-10" src={gallery[0]} />
              ) : (
                <div className="flex aspect-square h-full min-h-[360px] items-center justify-center text-sm font-bold text-[#7f879c]">تصویر محصول</div>
              )}
              <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
                {[0, 1, 2].map((index) => (
                  <span className={`h-3 rounded-full ${index === 0 ? "w-10 bg-[#8b8f99]" : "w-3 bg-[#cfd4dd]"}`} key={index} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className={forceMobile ? "h-full overflow-y-auto bg-[#fbfcfe] pb-28" : "bg-[#fbfcfe] pb-28 lg:hidden"}>
        <div className="sticky top-0 z-20 border-b border-[#e8ecf3] bg-white px-4 py-4">
          <div className="flex items-center justify-between">
            <button className="text-lg font-black text-[#495162]" type="button">←</button>
            <div className="text-lg font-black text-[#111827]">کالای دیجیتال</div>
            <div className="flex items-center gap-4 text-lg text-[#495162]">
              <span>↗</span>
              <span>☆</span>
            </div>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {["نمودار قیمت", "مقایسه", "اشتراک", "پرسش"].map((item) => (
              <button className="shrink-0 rounded-full border border-[#e7ebf1] px-5 py-2 text-sm font-bold text-[#4b557a]" key={item} type="button">
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 pt-6">
          <div className="rounded-[1.5rem] bg-white py-6">
            <div className="relative mx-auto aspect-square w-full max-w-[420px]">
              {gallery[0] ? (
                <img alt={title} className="h-full w-full object-contain p-6" src={gallery[0]} />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-[1.5rem] bg-[#eef2f7] text-sm font-bold text-[#7f879c]">تصویر محصول</div>
              )}
            </div>
            <div className="mt-3 flex justify-center gap-2">
              <span className="h-4 w-10 rounded-full bg-[#8b8f99]" />
              <span className="h-4 w-4 rounded-full bg-[#d0d6df]" />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap flex-row-reverse items-center justify-start gap-2 text-sm text-[#7a8396]">
            {[brandLabel || "برند", form.product_type || "محصولات", title].map((crumb, index, items) => (
              <span className="flex flex-row-reverse items-center gap-2" key={`${crumb}-${index}`}>
                <span>{crumb}</span>
                {index < items.length - 1 ? <span>/</span> : null}
              </span>
            ))}
          </div>
          <h1 className="mt-4 text-[1.95rem] font-black leading-[1.7] text-[#29467c]">{title}</h1>
          <p className="mt-2 text-[1.05rem] leading-7 text-[#9ba3ba]">{englishTitle}</p>

          <div className="mt-5 flex flex-wrap gap-2 text-sm">
            <div className="rounded-full border border-[#e9edf3] px-4 py-2 font-black text-[#20a365]">
              ★ {ratingRate.toLocaleString("fa-IR")} <span className="font-bold text-[#7f8796]">({ratingCount.toLocaleString("fa-IR")} رای)</span>
            </div>
            <div className="rounded-full border border-[#e9edf3] px-4 py-2 font-bold text-[#59627a]">{commentsCount.toLocaleString("fa-IR")} دیدگاه</div>
            <div className="rounded-full border border-[#e9edf3] px-4 py-2 font-bold text-[#59627a]">{questionsCount.toLocaleString("fa-IR")} سوال</div>
          </div>

          <div className="mt-8 rounded-[1.4rem] border border-[#e8edf3] bg-white p-4 shadow-[0_24px_48px_-38px_rgba(15,23,42,.18)]">
            <div className="text-[1.15rem] font-black text-[#111827]">رنگ: {previewVariant.color || "پیش‌فرض"}</div>
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {(colorVariants.length ? colorVariants : variants).slice(0, 6).map((variant, index) => (
                <button className={`shrink-0 rounded-[1rem] border px-4 py-2.5 text-sm font-bold ${index === 0 ? "border-[#344054]" : "border-[#e7ebf1]"}`} key={`mobile-color-${index}`} type="button">
                  {variant.color || variant.title || `تنوع ${index + 1}`}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7">
            <div className="text-[1.15rem] font-black text-[#111827]">تنوع: {previewVariant.title || "تنوع اصلی"}</div>
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {variants.slice(0, 6).map((variant, index) => (
                <button className={`shrink-0 rounded-[1rem] border px-4 py-2.5 text-sm font-bold ${index === 0 ? "border-[#344054]" : "border-[#e7ebf1]"}`} key={`mobile-variant-${index}`} type="button">
                  {variant.title || `تنوع ${index + 1}`}
                </button>
              ))}
            </div>
          </div>

          <section className="mt-8 rounded-[1.4rem] border border-[#e8edf3] bg-white p-4 shadow-[0_24px_48px_-38px_rgba(15,23,42,.18)]">
            <div className="mb-3 text-[1.15rem] font-black text-[#111827]">بیمه</div>
            <div className="rounded-[1rem] border border-[#e8edf3] bg-[#fbfcff] p-4">
              <div className="text-base font-bold text-[#2f3c61]">{form.technoPlus.title || "تکنو پلاس"}</div>
              <div className="mt-2 text-sm leading-7 text-[#7f879a]">{form.technoPlus.description || "خدمات تکمیلی محصول از همین فرم قابل تنظیم است."}</div>
              {form.technoPlus.price ? <div className="mt-2 text-lg font-black text-[#2f3c61]">{formatPrice(form.technoPlus.price)} تومان</div> : null}
            </div>
          </section>

          <section className="mt-8 border-y border-[#e8ecf3] bg-white">
            <div className="flex flex-row-reverse justify-start gap-6 overflow-x-auto px-1 py-4 text-base font-bold text-[#6b7280]">
              {tabs.map((tab, index) => (
                <button className={`relative shrink-0 px-3 py-2 ${index === 0 ? "text-[#ef476f]" : ""}`} key={tab} type="button">
                  {tab}
                  {index === 0 ? <span className="absolute inset-x-0 -bottom-3 h-1 rounded-full bg-[#ef476f]" /> : null}
                </button>
              ))}
            </div>
          </section>
          <div className="mt-5 rounded-[1.5rem] border border-[#e7ebf1] bg-white p-5 text-[1rem] leading-9 text-[#2f3d62]">{summary}</div>
          {specs.length ? (
            <div className="mt-5 space-y-2">
              {specs.slice(0, 3).map((spec, index) => (
                <div className="rounded-[1.2rem] border border-[#e7ebf1] bg-white px-4 py-3 text-sm font-bold text-[#5d6683]" key={`mobile-spec-${index}`}>
                  {spec.title || "مشخصات"}: {toArray(spec.attributes)[0]?.title || "ویژگی"}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className={`${isSticky ? "absolute" : "fixed"} inset-x-0 bottom-0 z-30 border-t border-[#e6ebf1] bg-white px-4 py-3 shadow-[0_-12px_30px_-24px_rgba(15,23,42,.4)]`}>
          <div className="mx-auto flex max-w-md items-center gap-3">
            <button className="h-12 flex-1 rounded-2xl bg-[#ef476f] text-sm font-black text-white" type="button">
              افزودن به سبد
            </button>
            <div className="min-w-[128px] text-left">
              <div className="text-lg font-black text-[#2f3446]">{available ? formatPrice(previewPrice) : "ناموجود"}</div>
              {available ? <div className="text-[11px] font-bold text-[#7f879c]">تومان</div> : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function ProductForm({ mode = "create" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === "edit";
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [imagePreview, setImagePreview] = useState("");
  const [isDesktopPreviewOpen, setIsDesktopPreviewOpen] = useState(false);
  const { data: productData, isLoading: isLoadingProduct } = useGetProductQuery(id, { skip: !isEdit || !id });
  const { data: categoriesData } = useGetCategoriesQuery({ page: 1, limit: 200 });
  const { data: categoryFiltersData } = useGetCategoryFiltersQuery(
    { page: 1, limit: 200, category: form.category },
    { skip: !form.category }
  );
  const { data: brandsData } = useGetBrandsQuery({ page: 1, limit: 300 });
  const { data: warrantiesData } = useGetWarrantiesQuery({ page: 1, limit: 300 });
  const { data: insurancesData } = useGetInsurancesQuery({ page: 1, limit: 300 });
  const { data: shippingMethodsData } = useGetShippingMethodsQuery({ page: 1, limit: 300 });
  const [createProduct, createState] = useCreateProductMutation();
  const [updateProduct, updateState] = useUpdateProductMutation();

  const categories = categoriesData?.data || [];
  const categoryFilters = categoryFiltersData?.data || [];
  const brands = brandsData?.data || [];
  const warranties = warrantiesData?.data || [];
  const insurances = insurancesData?.data || [];
  const shippingMethods = shippingMethodsData?.data || [];
  const categoryOptions = useMemo(() => categories.map((item) => ({ label: item.name, value: item._id })), [categories]);
  const brandOptions = useMemo(() => brands.map((item) => ({ label: item.title_fa || item.name, value: item._id })), [brands]);
  const warrantyOptions = useMemo(() => warranties.map((item) => ({ label: item.title_fa, value: item._id })), [warranties]);
  const insuranceOptions = useMemo(() => insurances.map((item) => ({ label: item.title_fa, value: item._id })), [insurances]);
  const shippingMethodOptions = useMemo(() => shippingMethods.map((item) => ({ label: item.title_fa, value: item._id })), [shippingMethods]);
  const selectedBrandLabel = useMemo(() => brandOptions.find((item) => item.value === form.brand)?.label || "", [brandOptions, form.brand]);
  const isSaving = createState.isLoading || updateState.isLoading;
  const isLastStep = currentStep === steps.length - 1;
  const titleIsValid = Boolean(form.title.trim());
  const contentIsValid = Boolean(form.summary.trim());
  const categoryIsValid = Boolean(form.category);
  const brandIsValid = Boolean(form.brand);
  const canGoNext = steps[currentStep].key === "basic" ? titleIsValid && categoryIsValid && brandIsValid : steps[currentStep].key === "content" ? contentIsValid : true;

  useEffect(() => {
    const product = productData?.data;
    if (!product) return;
    const defaultVariant = product.default_variant || product.variants?.[0] || {};
    const mainImage = product.images?.main?.url?.[0] || product.image?.url || "";
    setForm({
      ...initialForm,
      title: product.title || "",
      title_en: product.title_en || "",
      summary: product.summary || product.subtitle || "",
      category: product.category?._id || product.category || "",
      brand: product.brand?._id || product.brand || "",
      warranties: toArray(product.warranties).map((item) => item?._id || item).filter(Boolean),
      insurances: toArray(product.insurances).map((item) => item?._id || item).filter(Boolean),
      price: product.priceRef?._id || product.priceRef || "",
      shipping_methods: toArray(product.shipping_methods).map((item) => item?._id || item).filter(Boolean),
      statusProduct: product.statusProduct || "marketable",
      product_type: product.product_type || "product",
      imageUrl: mainImage,
      galleryUrls: toArray(product.gallery).map((item) => item.url).filter(Boolean),
      basePrice: product.priceConfig?.basePrice ?? product.basePrice ?? defaultVariant.basePrice ?? "",
      priceConfig: {
        basePrice: product.priceConfig?.basePrice ?? product.basePrice ?? defaultVariant.basePrice ?? "",
        orderLimit: product.priceRef?.order_limit ?? 1,
      },
      variants: (product.variantGroups?.length ? product.variantGroups : product.variants || []).map((item, index) => ({
        title: item.title || `تنوع ${index + 1}`,
        basePrice: item.basePrice ?? product.priceConfig?.basePrice ?? product.basePrice ?? "",
        price: item.price ?? "",
        oldPrice: item.oldPrice ?? "",
        stock: item.stock ?? "",
        color: item.color || "",
        priceModifiers: toArray(item.priceModifiers),
        badgeLabel: item.variant_badges?.[0]?.payload?.text || "",
      })),
      variant: {
        ...initialForm.variant,
        title: defaultVariant.title || "تنوع اصلی",
        price: defaultVariant.price ?? product.price ?? "",
        oldPrice: defaultVariant.oldPrice ?? product.oldPrice ?? "",
        stock: defaultVariant.stock ?? product.stock ?? "",
        color: defaultVariant.color || "",
        badgeLabel: defaultVariant.variant_badges?.[0]?.payload?.text || product.badge?.label || "",
      },
      specifications: toArray(product.specifications).map((item) => ({
        title: item.title || "",
        attributes: toArray(item.attributes).map((attribute) => ({ title: attribute.title || "", values: toArray(attribute.values).join(", ") })),
      })),
      faqs: toArray(product.faqs),
      comments: toArray(product.comments),
      questions: toArray(product.questions),
      ratingRate: product.rating?.rate ?? product.ratingRate ?? "",
      ratingCount: product.rating?.count ?? product.ratingCount ?? "",
      pros_and_cons: toArray(product.pros_and_cons),
      suggestionCount: product.suggestion?.count ?? "",
      suggestionPercentage: product.suggestion?.percentage ?? "",
      product_badges: toArray(product.product_badges).map((item) => ({ title: item.title || "", tone: item.tone || "green" })),
      technoPlus: {
        title: product.technoPlus?.title || "تکنو پلاس",
        price: product.technoPlus?.price ?? "",
        description: product.technoPlus?.description || "",
      },
      has_quick_view: Boolean(product.has_quick_view),
      has_size_guide: Boolean(product.has_size_guide),
      has_true_to_size: Boolean(product.has_true_to_size),
      has_offline_shop_stock: Boolean(product.has_offline_shop_stock),
      show_type: product.show_type || "normal",
      expertDescription: product.expert_reviews?.description || "",
      expertShortReview: product.expert_reviews?.short_review || "",
      technical_properties: toArray(product.expert_reviews?.technical_properties),
      promotion_banner: toArray(product.promotion_banner),
      seo: {
        title: product.seo?.title || "",
        description: product.seo?.description || "",
        keywords: toArray(product.seo?.keywords),
      },
      status: product.status || "pending",
    });
    setImagePreview(mainImage);
  }, [productData]);

  const completedSteps = steps.reduce((acc, _, index) => ({ ...acc, [index + 1]: index < currentStep }), {});
  const invalidSteps = {
    1: currentStep >= 0 && (!titleIsValid || !categoryIsValid || !brandIsValid),
    2: currentStep >= 1 && !contentIsValid,
  };

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));
  const setNestedField = (name, key, value) => setForm((prev) => ({ ...prev, [name]: { ...prev[name], [key]: value } }));
  const handleChange = (event) => {
    const { checked, name, type, value } = event.target;
    setField(name, type === "checkbox" ? checked : value);
  };

  const goToStep = (step) => {
    const targetIndex = step - 1;
    if (targetIndex > 0 && (!titleIsValid || !categoryIsValid || !brandIsValid)) {
      toast.error("عنوان، دسته‌بندی و برند محصول را کامل کنید", { id: "product-step" });
      setCurrentStep(0);
      return;
    }
    if (targetIndex > 1 && !contentIsValid) {
      toast.error("خلاصه محصول را کامل کنید", { id: "product-step" });
      setCurrentStep(1);
      return;
    }
    setCurrentStep(targetIndex);
  };

  const goToNextStep = () => {
    if (!canGoNext) {
      toast.error(steps[currentStep].key === "basic" ? "عنوان، دسته‌بندی و برند محصول را کامل کنید" : "خلاصه محصول را کامل کنید", { id: "product-step" });
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const buildFormData = () => {
    const formData = new FormData();
    const payload = {
      ...form,
      specifications: form.specifications.map((spec) => ({
        ...spec,
        attributes: toArray(spec.attributes).map((attribute) => ({
          ...attribute,
          values: String(attribute.values || "").split(",").map((item) => item.trim()).filter(Boolean),
        })),
      })),
      basePrice: form.basePrice || form.priceConfig.basePrice,
      priceConfig: {
        ...form.priceConfig,
        basePrice: form.basePrice || form.priceConfig.basePrice,
      },
      variants: (form.variants.length ? form.variants : [form.variant]).map((variant, index) => ({
        ...variant,
        title: variant.title || `تنوع ${index + 1}`,
        basePrice: variant.basePrice || form.basePrice || form.priceConfig.basePrice,
        price: calculateVariantPrice(variant, form.basePrice || form.priceConfig.basePrice),
        priceModifiers: toArray(variant.priceModifiers),
      })),
    };

    Object.entries(payload).forEach(([key, value]) => {
      if (key === "image") {
        if (value instanceof File) formData.append("image", value);
        return;
      }
      if (key === "gallery") {
        toArray(value).forEach((file) => {
          if (file instanceof File) formData.append("gallery", file);
        });
        return;
      }
      if (typeof value === "object") {
        formData.append(key, JSON.stringify(value || {}));
        return;
      }
      formData.append(key, String(value ?? ""));
    });
    return formData;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isLastStep) {
      goToNextStep();
      return;
    }
    if (!titleIsValid || !contentIsValid || !categoryIsValid || !brandIsValid) {
      toast.error("فیلدهای ضروری محصول را کامل کنید", { id: "save-product" });
      return;
    }
    try {
      toast.loading("در حال ذخیره محصول...", { id: "save-product" });
      const formData = buildFormData();
      const response = isEdit ? await updateProduct({ id, formData }).unwrap() : await createProduct(formData).unwrap();
      toast.success(response.description || "محصول ذخیره شد", { id: "save-product" });
      navigate("/products");
    } catch (error) {
      toast.error(error?.data?.description || "ذخیره محصول انجام نشد", { id: "save-product" });
    }
  };

  const renderStep = () => {
    switch (steps[currentStep].key) {
      case "basic":
        return (
          <div className="space-y-4">
            <Field label="عنوان محصول"><TextInput name="title" onChange={handleChange} value={form.title} /></Field>
            <Field label="عنوان انگلیسی"><TextInput dir="ltr" name="title_en" onChange={handleChange} value={form.title_en} /></Field>
            <SingleSelectDropdown label="دسته‌بندی" name="category" onChange={handleChange} options={categoryOptions} value={form.category} />
            <SingleSelectDropdown label="برند" name="brand" onChange={handleChange} options={brandOptions} placeholder="ابتدا برند را از بخش برندها ثبت کنید" value={form.brand} />
            <ThumbnailUpload
              name="image"
              preview={imagePreview}
              setThumbnail={(file) => setField("image", file)}
              setThumbnailPreview={setImagePreview}
              title="انتخاب تصویر اصلی محصول"
            />
          </div>
        );
      case "content":
        return (
          <div className="space-y-4">
            <Field label="خلاصه محصول"><Textarea name="summary" onChange={handleChange} rows={5} value={form.summary} /></Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="نوع محصول"><TextInput name="product_type" onChange={handleChange} value={form.product_type} /></Field>
              <Field label="نوع نمایش"><TextInput name="show_type" onChange={handleChange} value={form.show_type} /></Field>
            </div>
            <VariantPricingRows
              basePrice={form.basePrice}
              categoryFilters={categoryFilters}
              items={form.variants}
              onBasePriceChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  basePrice: value,
                  priceConfig: { ...prev.priceConfig, basePrice: value },
                }))
              }
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  variants: value,
                  variant: value[0] || prev.variant,
                }))
              }
            />
            <Field label="گالری محصول">
              <TextInput
                accept="image/*"
                multiple
                onChange={(event) => setField("gallery", Array.from(event.target.files || []))}
                type="file"
              />
            </Field>
          </div>
        );
      case "specs":
        return (
          <div className="space-y-4">
            <SpecificationRows items={form.specifications} onChange={(value) => setField("specifications", value)} />
            <SimpleRows items={form.pros_and_cons} label="مزایا و معایب" onChange={(value) => setField("pros_and_cons", value)} placeholder="مثلا کیفیت ساخت بالا" />
            <SimpleRows items={form.technical_properties} label="ویژگی‌های فنی نقد تخصصی" onChange={(value) => setField("technical_properties", value)} placeholder="مثلا پردازنده قدرتمند" />
            <Field label="نقد تخصصی کوتاه"><Textarea name="expertShortReview" onChange={handleChange} rows={3} value={form.expertShortReview} /></Field>
            <Field label="توضیح نقد تخصصی"><Textarea name="expertDescription" onChange={handleChange} rows={5} value={form.expertDescription} /></Field>
          </div>
        );
      case "social":
        return (
          <div className="space-y-4">
            <FaqRows items={form.faqs} onChange={(value) => setField("faqs", value)} />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="امتیاز"><TextInput inputMode="numeric" name="ratingRate" onChange={handleChange} value={form.ratingRate} /></Field>
              <Field label="تعداد امتیاز"><TextInput inputMode="numeric" name="ratingCount" onChange={handleChange} value={form.ratingCount} /></Field>
              <Field label="تعداد پیشنهاد"><TextInput inputMode="numeric" name="suggestionCount" onChange={handleChange} value={form.suggestionCount} /></Field>
              <Field label="درصد پیشنهاد"><TextInput inputMode="numeric" name="suggestionPercentage" onChange={handleChange} value={form.suggestionPercentage} /></Field>
            </div>
          </div>
        );
      case "publish":
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="وضعیت فروش">
                <select className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 outline-none dark:border-zinc-800 dark:bg-black dark:text-white" name="statusProduct" onChange={handleChange} value={form.statusProduct}>
                  <option value="marketable">قابل فروش</option>
                  <option value="unavailable">ناموجود</option>
                  <option value="out_of_stock">اتمام موجودی</option>
                </select>
              </Field>
              <Field label="وضعیت تایید">
                <select className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 outline-none dark:border-zinc-800 dark:bg-black dark:text-white" name="status" onChange={handleChange} value={form.status}>
                  <option value="pending">در انتظار تایید</option>
                  <option value="active">فعال</option>
                  <option value="inactive">غیرفعال</option>
                </select>
              </Field>
              <Field label="محدودیت سفارش">
                <TextInput
                  inputMode="numeric"
                  onChange={(event) => setNestedField("priceConfig", "orderLimit", event.target.value)}
                  value={form.priceConfig.orderLimit}
                />
              </Field>
              <Field label="عنوان تکنو پلاس"><TextInput onChange={(event) => setNestedField("technoPlus", "title", event.target.value)} value={form.technoPlus.title} /></Field>
              <Field label="قیمت تکنو پلاس"><TextInput onChange={(event) => setNestedField("technoPlus", "price", event.target.value)} value={form.technoPlus.price} /></Field>
            </div>
            <MultiSelectDropdown label="گارانتی‌ها" onChange={(value) => setField("warranties", value)} options={warrantyOptions} placeholder="گارانتی‌ها را از بخش گارانتی‌ها بسازید" value={form.warranties} />
            <MultiSelectDropdown label="بیمه‌ها" onChange={(value) => setField("insurances", value)} options={insuranceOptions} placeholder="بیمه‌ها را از بخش بیمه‌ها بسازید" value={form.insurances} />
            <MultiSelectDropdown label="نحوه ارسال" onChange={(value) => setField("shipping_methods", value)} options={shippingMethodOptions} placeholder="روش‌های ارسال را از بخش نحوه ارسال بسازید" value={form.shipping_methods} />
            <Field label="توضیح تکنو پلاس"><Textarea onChange={(event) => setNestedField("technoPlus", "description", event.target.value)} rows={3} value={form.technoPlus.description} /></Field>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ["has_quick_view", "نمایش سریع"],
                ["has_size_guide", "راهنمای سایز"],
                ["has_true_to_size", "True to size"],
                ["has_offline_shop_stock", "موجودی فروشگاه حضوری"],
              ].map(([name, label]) => (
                <label className="flex items-center justify-between rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-black dark:text-zinc-300" key={name}>
                  <span>{label}</span>
                  <input checked={form[name]} name={name} onChange={handleChange} type="checkbox" />
                </label>
              ))}
            </div>
            <Field label="عنوان سئو"><TextInput onChange={(event) => setNestedField("seo", "title", event.target.value)} value={form.seo.title} /></Field>
            <Field label="توضیح سئو"><Textarea onChange={(event) => setNestedField("seo", "description", event.target.value)} rows={3} value={form.seo.description} /></Field>
            <SimpleRows items={form.seo.keywords} label="کلمات کلیدی سئو" onChange={(value) => setNestedField("seo", "keywords", value)} placeholder="کلمه کلیدی" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <ControlPanel>
      <section className="mx-auto max-w-[1600px] space-y-6">
        <div className="flex items-center justify-between rounded-2xl border border-zinc-700 bg-black/80 p-5">
          <div>
            <p className="text-xs text-zinc-400">مدیریت فروشگاه</p>
            <h1 className="mt-1 text-2xl font-bold text-white">{isEdit ? "ویرایش محصول" : "افزودن محصول"}</h1>
          </div>
          <Link className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-white hover:text-white" to="/products">
            بازگشت به لیست
          </Link>
        </div>

        <form className="space-y-5 rounded-2xl border border-zinc-700 bg-zinc-950 p-5" onSubmit={handleSubmit}>
          {isLoadingProduct ? (
            <div className="rounded-xl border border-zinc-800 bg-black px-4 py-8 text-center text-sm text-zinc-500">در حال دریافت...</div>
          ) : (
            <>
              <div className="sticky top-16 z-20 rounded-xl border border-gray-200 bg-white/95 p-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
                <StepIndicator completedSteps={completedSteps} currentStep={currentStep + 1} invalidSteps={invalidSteps} onStepClick={goToStep} totalSteps={steps.length} />
              </div>
              <div className="grid gap-4 xl:grid-cols-[0.95fr_0.42fr_0.82fr]" dir="ltr">
                <div className="space-y-4 rounded-xl border border-zinc-800 bg-black p-3" dir="rtl">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-500">فرم تکمیل محصول</span>
                    <span className="rounded-full border border-zinc-800 px-2 py-1 text-[10px] text-zinc-500">
                      {currentStep + 1} / {steps.length}
                    </span>
                  </div>
                  {renderStep()}
                  <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
                    {isLastStep ? (
                      <SendButton isLoading={isSaving} label={isEdit ? "ذخیره محصول" : "ثبت محصول"} loadingLabel="در حال ذخیره..." />
                    ) : (
                      <NavigationButton direction="next" disabled={!canGoNext || isSaving} onClick={goToNextStep} />
                    )}
                    <NavigationButton direction="prev" disabled={currentStep === 0 || isSaving} onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))} />
                  </div>
                </div>

                <ProductCardPreview form={form} imagePreview={imagePreview} />
                <div className="sticky top-24 flex flex-col items-center space-y-3 self-start" dir="rtl">
                  <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-black px-3 py-2">
                    <button
                      aria-label="باز کردن پیش‌نمایش دسکتاپ"
                      className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-xs text-zinc-300 transition hover:border-white hover:text-white"
                      onClick={() => setIsDesktopPreviewOpen(true)}
                      type="button"
                    >
                      <span className="text-base leading-none">⛶</span>
                    </button>
                  </div>
                  <ProductDetailPreview brandLabel={selectedBrandLabel} forceMobile form={form} imagePreview={imagePreview} />
                </div>
              </div>
            </>
          )}
        </form>

        {isDesktopPreviewOpen ? (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur" dir="rtl">
            <button
              aria-label="بستن پیش‌نمایش دسکتاپ"
              className="fixed left-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-black/70 text-white backdrop-blur transition hover:border-white"
              onClick={() => setIsDesktopPreviewOpen(false)}
              type="button"
            >
              <Cross />
            </button>
            <div className="mx-auto w-full max-w-7xl px-4 py-8">
              <ProductDetailPreview brandLabel={selectedBrandLabel} form={form} imagePreview={imagePreview} isSticky={false} />
            </div>
          </div>
        ) : null}
      </section>
    </ControlPanel>
  );
}

export default ProductForm;
