import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import ControlPanel from "../ControlPanel";
import Cross from "@/components/icons/Cross";
import Plus from "@/components/icons/Plus";
import Trash from "@/components/icons/Trash";
import NavigationButton from "@/components/shared/button/NavigationButton";
import SendButton from "@/components/shared/button/SendButton";
import StepIndicator from "../categories/components/StepIndicator";
import PageBuilder from "@/components/shared/pageBuilder/PageBuilder";
import ThumbnailUpload from "@/components/shared/ThumbnailUpload";
import { MultiSelectDropdown, SingleSelectDropdown } from "@/components/shared/Dropdown";
import { ArticleCardPreview, ArticleDetailPreview } from "./components/ArticlePreviews";
import { DatePickerField } from "../games/components/GameFormFields";
import { useGetCategoriesQuery } from "@/services/category/categoryApi";
import { useGetGamesQuery } from "@/services/gameApi";
import { useGetTagsQuery } from "@/services/tagApi";
import { useCreateArticleMutation, useGenerateArticleSlugMutation, useGetArticleQuery, useUpdateArticleMutation } from "@/services/articleApi";

const initialForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  author: "",
  readingTime: "",
  category: "",
  tags: [],
  relatedGames: [],
  faqs: [],
  publishedAt: "",
  isFeatured: false,
  status: "active",
  cover: null,
};

const steps = [
  { key: "basic", title: "اصلی" },
  { key: "content", title: "محتوا" },
  { key: "faqs", title: "سوالات متداول" },
  { key: "relations", title: "ارتباط‌ها" },
  { key: "publish", title: "انتشار و سئو" },
];

function makeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function toIdArray(value) {
  return Array.isArray(value) ? value.map((item) => item?._id || item).filter(Boolean) : [];
}

function Field({ label, name, onChange, placeholder, type = "text", value }) {
  return (
    <label className="space-y-2">
      <span className="text-sm text-zinc-600 dark:text-zinc-300">{label}</span>
      <input
        className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-700 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-white"
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}

function Textarea({ label, name, onChange, placeholder, rows = 4, value }) {
  return (
    <label className="space-y-2">
      <span className="text-sm text-zinc-600 dark:text-zinc-300">{label}</span>
      <textarea
        className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-700 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-white"
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        value={value}
      />
    </label>
  );
}

function FaqRowsEditor({ items = [], onChange }) {
  const rows = items.length ? items : [{ question: "", answer: "" }];

  const cleanRows = (next) =>
    next.filter((item) => String(item.question || "").trim() || String(item.answer || "").trim());

  const updateItem = (index, patch) => {
    const next = rows.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
    onChange?.(cleanRows(next));
  };

  const addItem = () => onChange?.([...rows, { question: "", answer: "" }]);
  const removeItem = (index) => onChange?.(cleanRows(rows.filter((_, itemIndex) => itemIndex !== index)));

  return (
    <div className="space-y-3 rounded-xl border border-zinc-800 bg-black p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-sm font-bold text-zinc-200">سوالات متداول مطلب</span>
          <p className="mt-1 text-xs text-zinc-500">برای هر ردیف سوال و پاسخ را وارد کن؛ هر تعداد خواستی اضافه می‌شود.</p>
        </div>
        <button
          aria-label="افزودن سوال"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 text-zinc-200 transition hover:border-white hover:text-white"
          onClick={addItem}
          type="button"
        >
          <Plus />
        </button>
      </div>

      <div className="space-y-3">
        {rows.map((item, index) => (
          <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4" key={`article-faq-${index}`}>
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_48px]">
              <Field
                label={`سوال ${index + 1}`}
                name={`faq-question-${index}`}
                onChange={(event) => updateItem(index, { question: event.target.value })}
                placeholder="مثلا این مطلب برای چه کسانی مناسب است؟"
                value={item.question || ""}
              />
              <Textarea
                label="پاسخ"
                name={`faq-answer-${index}`}
                onChange={(event) => updateItem(index, { answer: event.target.value })}
                placeholder="پاسخ سوال را بنویسید"
                rows={3}
                value={item.answer || ""}
              />
              <button
                aria-label="حذف سوال"
                className="mt-7 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 text-zinc-400 transition hover:border-red-500 hover:text-red-400"
                onClick={() => removeItem(index)}
                type="button"
              >
                <Trash className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArticleForm({ mode = "create" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === "edit";
  const activeAdmin = useSelector((state) => state.auth.admin || {});
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [coverPreview, setCoverPreview] = useState("");
  const [isDesktopPreviewOpen, setIsDesktopPreviewOpen] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEdit);
  const slugManuallyEditedRef = useRef(isEdit);

  const { data: articleData, isLoading: isLoadingArticle } = useGetArticleQuery(id, { skip: !isEdit || !id });
  const { data: categoriesData } = useGetCategoriesQuery({ page: 1, limit: 200 });
  const { data: tagsData } = useGetTagsQuery({ page: 1, limit: 200 });
  const { data: gamesData } = useGetGamesQuery({ page: 1, limit: 200 });
  const [createArticle, createState] = useCreateArticleMutation();
  const [generateArticleSlug, generateSlugState] = useGenerateArticleSlugMutation();
  const [updateArticle, updateState] = useUpdateArticleMutation();

  const categories = categoriesData?.data || [];
  const tags = tagsData?.data || [];
  const games = gamesData?.data || [];
  const isSaving = createState.isLoading || updateState.isLoading;
  const isLastStep = currentStep === steps.length - 1;
  const titleIsValid = Boolean(form.title.trim());
  const contentIsValid = Boolean(form.content.trim());
  const currentStepKey = steps[currentStep].key;
  const canGoNext = currentStepKey === "basic" ? titleIsValid : currentStepKey === "content" ? contentIsValid : true;

  const categoryOptions = useMemo(() => categories.map((item) => ({ label: item.name, value: item._id })), [categories]);
  const tagOptions = useMemo(() => tags.map((item) => ({ label: item.name, value: item._id })), [tags]);
  const gameOptions = useMemo(() => games.map((item) => ({ label: item.title, value: item._id })), [games]);
  const selectedTagLabels = tagOptions.filter((option) => form.tags.includes(option.value)).map((option) => option.label);
  const selectedRelatedGames = useMemo(
    () => games.filter((game) => form.relatedGames.includes(game._id)),
    [form.relatedGames, games]
  );

  useEffect(() => {
    const article = articleData?.data;
    if (!article) return;

    setForm({
      ...initialForm,
      title: article.title || "",
      slug: article.slug || "",
      excerpt: article.excerpt || "",
      content: article.content || "",
      author: article.author || "",
      readingTime: article.readingTime || "",
      category: article.category?._id || article.category || "",
      tags: toIdArray(article.tags),
      relatedGames: toIdArray(article.relatedGames),
      faqs: Array.isArray(article.faqs) ? article.faqs.map((item) => ({ question: item?.question || "", answer: item?.answer || "" })) : [],
      publishedAt: formatDate(article.publishedAt),
      isFeatured: Boolean(article.isFeatured),
      status: article.status || "active",
      cover: null,
    });
    setCoverPreview(article.cover?.url || "");
    setSlugManuallyEdited(true);
    slugManuallyEditedRef.current = true;
  }, [articleData]);

  useEffect(() => {
    const activeAuthor = activeAdmin.name || activeAdmin.email || "";
    if (!activeAuthor) return;

    setForm((prev) => ({ ...prev, author: activeAuthor }));
  }, [activeAdmin.email, activeAdmin.name]);

  useEffect(() => {
    slugManuallyEditedRef.current = slugManuallyEdited;
  }, [slugManuallyEdited]);

  useEffect(() => {
    const title = form.title.trim();

    if (!title || slugManuallyEdited) return;

    const timeoutId = setTimeout(async () => {
      try {
        const response = await generateArticleSlug(title).unwrap();
        const suggestedSlug = response?.data?.slug || "";

        if (!suggestedSlug) return;

        setForm((prev) => {
          if (prev.title.trim() !== title || slugManuallyEditedRef.current) return prev;
          return { ...prev, slug: suggestedSlug };
        });
      } catch (_) {}
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [form.title, generateArticleSlug, slugManuallyEdited]);

  const completedSteps = steps.reduce((acc, step, index) => {
    acc[index + 1] = index < currentStep;
    return acc;
  }, {});

  const invalidSteps = {
    1: currentStep >= 0 && !titleIsValid,
    2: currentStep >= 1 && !contentIsValid,
  };

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target;

    if (name === "slug") {
      const nextSlug = makeSlug(value);
      const isManual = Boolean(nextSlug);
      slugManuallyEditedRef.current = isManual;
      setSlugManuallyEdited(isManual);
      setForm((prev) => ({ ...prev, slug: nextSlug }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const setArrayField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const goToStep = (step) => {
    const targetIndex = step - 1;

    if (targetIndex > 0 && !titleIsValid) {
      toast.error("عنوان مطلب را وارد کنید", { id: "article-step" });
      setCurrentStep(0);
      return;
    }

    if (targetIndex > 2 && !contentIsValid) {
      toast.error("محتوای مطلب را تکمیل کنید", { id: "article-step" });
      setCurrentStep(1);
      return;
    }

    setCurrentStep(targetIndex);
  };

  const goToNextStep = () => {
    if (!canGoNext) {
      toast.error(currentStepKey === "basic" ? "عنوان مطلب را وارد کنید" : "محتوای مطلب را تکمیل کنید", { id: "article-step" });
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const buildFormData = () => {
    const formData = new FormData();
    const activeAuthor = activeAdmin.name || activeAdmin.email || form.author || "";

    Object.entries({ ...form, author: activeAuthor }).forEach(([key, value]) => {
      if (key === "cover") {
        if (value instanceof File) formData.append(key, value);
        return;
      }
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
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

    if (!titleIsValid || !contentIsValid) {
      toast.error(!titleIsValid ? "عنوان مطلب را وارد کنید" : "محتوای مطلب را تکمیل کنید", { id: "save-article" });
      setCurrentStep(!titleIsValid ? 0 : 1);
      return;
    }

    try {
      toast.loading(isEdit ? "در حال به‌روزرسانی مطلب..." : "در حال ثبت مطلب...", { id: "save-article" });
      const formData = buildFormData();
      const response = isEdit ? await updateArticle({ id, formData }).unwrap() : await createArticle(formData).unwrap();

      toast.success(response.description || "مطلب ذخیره شد", { id: "save-article" });
      navigate("/articles");
    } catch (error) {
      toast.error(error?.data?.description || "ذخیره مطلب انجام نشد", { id: "save-article" });
    }
  };

  const renderStep = () => {
    switch (steps[currentStep].key) {
      case "basic":
        return (
          <div className="space-y-4">
            <Field label="عنوان مطلب" name="title" onChange={handleChange} placeholder="مثلا راهنمای خرید بازی " value={form.title} />
            <label className="space-y-2">
              <span className="flex items-center justify-between gap-3">
                <span className="text-sm text-zinc-600 dark:text-zinc-300">اسلاگ</span>
              </span>
              <input
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-left text-sm text-zinc-900 outline-none transition focus:border-zinc-700 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-white"
                dir="ltr"
                name="slug"
                onChange={handleChange}
                placeholder="game-buying-guide"
                type="text"
                value={form.slug}
              />
              <span className="block text-xs text-zinc-500">
                {generateSlugState.isLoading
                  ? "در حال ترجمه عنوان و ساخت اسلاگ..."
                  : slugManuallyEdited
                    ? "اسلاگ دستی است و تا زمانی که آن را خالی نکنید تغییر نمی‌کند."
                    : "اسلاگ از ترجمه انگلیسی عنوان ساخته می‌شود."}
              </span>
            </label>
            <ThumbnailUpload
              name="cover"
              preview={coverPreview}
              setThumbnail={(file) => setForm((prev) => ({ ...prev, cover: file }))}
              setThumbnailPreview={setCoverPreview}
              title="انتخاب کاور مطلب"
            />
          </div>
        );
      case "content":
        return (
          <div className="space-y-4">
            <Textarea label="خلاصه کوتاه" name="excerpt" onChange={handleChange} placeholder="خلاصه‌" value={form.excerpt} />
            <div className="space-y-3 rounded-xl border border-zinc-300 bg-white p-4 dark:border-zinc-800 dark:bg-black">
              <span className="text-sm text-zinc-600 dark:text-zinc-300">محتوای مطلب</span>
              <PageBuilder key={isEdit ? id : "create-article-content"} initialValue={form.content} onChange={(value) => setForm((prev) => ({ ...prev, content: value }))} />
            </div>
          </div>
        );
      case "faqs":
        return <FaqRowsEditor items={form.faqs} onChange={(value) => setArrayField("faqs", value)} />;
      case "relations":
        return (
          <div className="space-y-4">
            <SingleSelectDropdown label="دسته‌بندی" name="category" onChange={handleChange} options={categoryOptions} value={form.category} />
            <MultiSelectDropdown label="تگ‌ها" onChange={(value) => setArrayField("tags", value)} options={tagOptions} value={form.tags} />
            <MultiSelectDropdown label="بازی‌های مرتبط" onChange={(value) => setArrayField("relatedGames", value)} options={gameOptions} value={form.relatedGames} />
          </div>
        );
      case "publish":
        return (
          <div className="space-y-4">
            <DatePickerField
              label="تاریخ انتشار"
              onChange={(value) => setForm((prev) => ({ ...prev, publishedAt: value }))}
              value={form.publishedAt}
            />
            <label className="flex items-center justify-between rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-black dark:text-zinc-300">
              <span>مطلب ویژه</span>
              <input checked={form.isFeatured} name="isFeatured" onChange={handleChange} type="checkbox" />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="زمان مطالعه" name="readingTime" onChange={handleChange} placeholder="مثلا ۶ دقیقه" value={form.readingTime} />
              <div className="flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-black dark:text-zinc-300">
                <span className="shrink-0 text-xs text-zinc-500">نویسنده:</span>
                <span className="min-w-0 truncate text-zinc-900 dark:text-white">{activeAdmin.name || activeAdmin.email || "کاربر فعال"}</span>
              </div>
            </div>
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
            <p className="text-xs text-zinc-400">مدیریت مطلب‌نویس</p>
            <h1 className="mt-1 text-2xl font-bold text-white">{isEdit ? "ویرایش مطلب" : "افزودن مطلب"}</h1>
          </div>
          <Link className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-white hover:text-white" to="/articles">
            بازگشت به لیست
          </Link>
        </div>

        <form className="space-y-5 rounded-2xl border border-zinc-700 bg-zinc-950 p-5" onSubmit={handleSubmit}>
          {isLoadingArticle ? (
            <div className="rounded-xl border border-zinc-800 bg-black px-4 py-8 text-center text-sm text-zinc-500">در حال دریافت...</div>
          ) : (
            <>
              <div className="sticky top-16 z-20 rounded-xl border border-gray-200 bg-white/95 p-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
                <StepIndicator completedSteps={completedSteps} currentStep={currentStep + 1} invalidSteps={invalidSteps} onStepClick={goToStep} totalSteps={steps.length} />
              </div>
              <div className="grid gap-5 xl:grid-cols-[minmax(460px,660px)_minmax(240px,280px)_minmax(520px,1fr)]" dir="ltr">
                <div className="space-y-5 rounded-xl border border-zinc-800 bg-black p-4" dir="rtl">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-500">فرم تکمیل مطلب</span>
                    <span className="rounded-full border border-zinc-800 px-2 py-1 text-[10px] text-zinc-500">
                      {currentStep + 1} / {steps.length}
                    </span>
                  </div>
                  {renderStep()}
                  <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
                    {isLastStep ? (
                      <SendButton isLoading={isSaving} label={isEdit ? "ذخیره مطلب" : "ثبت مطلب"} loadingLabel="در حال ذخیره..." />
                    ) : (
                      <NavigationButton direction="next" disabled={!canGoNext || isSaving} onClick={goToNextStep} />
                    )}
                    <NavigationButton direction="prev" disabled={currentStep === 0 || isSaving} onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))} />
                  </div>
                </div>

                <ArticleCardPreview coverPreview={coverPreview} form={form} tags={selectedTagLabels} />
                <div className="sticky top-24 flex flex-col items-center space-y-3 self-start" dir="rtl">
                  <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-black px-3 py-2">
                    <button
                      className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-xs text-zinc-300 transition hover:border-white hover:text-white"
                      onClick={() => setIsDesktopPreviewOpen(true)}
                      type="button"
                      aria-label="باز کردن پیش‌نمایش دسکتاپ"
                    >
                      <span className="text-base leading-none">⛶</span>
                    </button>
                  </div>
                  <ArticleDetailPreview
                    coverPreview={coverPreview}
                    form={form}
                    relatedGames={selectedRelatedGames}
                    tags={selectedTagLabels}
                    variant="mobile"
                  />
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
            <div className="mx-auto w-full max-w-7xl px-4 pb-8">
              <ArticleDetailPreview
                coverPreview={coverPreview}
                form={form}
                isSticky={false}
                relatedGames={selectedRelatedGames}
                tags={selectedTagLabels}
              />
            </div>
          </div>
        ) : null}
      </section>
    </ControlPanel>
  );
}

export default ArticleForm;


