import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import ControlPanel from "../ControlPanel";
import CloudUpload from "@/components/icons/CloudUpload";
import Cross from "@/components/icons/Cross";
import IconPicker from "@/components/shared/IconPicker";
import Minus from "@/components/icons/Minus";
import Plus from "@/components/icons/Plus";
import NavigationButton from "@/components/shared/button/NavigationButton";
import SendButton from "@/components/shared/button/SendButton";
import StatusSwitch from "@/components/shared/button/StatusSwitch";
import StepIndicator from "../categories/components/StepIndicator";
import PageBuilder from "@/components/shared/pageBuilder/PageBuilder";
import ThumbnailUpload from "@/components/shared/ThumbnailUpload";
import { MultiSelectDropdown, SingleSelectDropdown } from "@/components/shared/Dropdown";
import { ArticleCardPreview, ArticleDetailPreview } from "./components/ArticlePreviews";
import { DatePickerField } from "../games/components/GameFormFields";
import { flattenPlatforms } from "../platforms/utils";
import { useCreateCategoryMutation, useGetCategoriesQuery } from "@/services/category/categoryApi";
import { useGetGamesQuery } from "@/services/gameApi";
import { useGetPlatformsQuery } from "@/services/platformApi";
import { useGetIconsQuery } from "@/services/iconApi";
import { useCreateTagMutation, useGetTagsQuery } from "@/services/tagApi";
import { useCreateArticleMutation, useGenerateArticleSlugMutation, useGetArticleQuery, useUpdateArticleMutation } from "@/services/articleApi";
import { getUploadErrorMessage, normalizeUploadedMedia, uploadImageWithProgress } from "@/utils/immediateUpload";

function getTodayDateInput() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const initialForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  author: "",
  readingTime: "",
  category: "",
  tags: [],
  platforms: [],
  relatedGames: [],
  faqs: [],
  publishedAt: getTodayDateInput(),
  isFeatured: false,
  status: "active",
  cover: null,
  cardCover: null,
  contentCover: null,
};

const deletedMediaValue = "__delete__";
const quickCreateInitialValues = {
  description: "",
  icon: "",
  image: null,
  name: "",
  parent: "",
  slug: "",
};

const quickCreateLabels = {
  category: "دسته‌بندی",
  tag: "تگ",
};

const quickCreateUploadTypes = {
  category: "category",
  tag: "tag",
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

function QuickCreateField({ children, label, onCreate }) {
  const child = React.isValidElement(children)
    ? React.cloneElement(children, {
        controlClassName: [children.props.controlClassName, "pl-14"].filter(Boolean).join(" "),
      })
    : children;

  return (
    <div className="relative">
      {child}
      <button
        aria-label={`افزودن ${label}`}
        className="absolute bottom-0 left-0 flex h-10 w-12 items-center justify-center rounded-l-full rounded-r-none border-0 border-r border-gray-300 bg-gray-200 text-gray-700 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        onClick={onCreate}
        title={`افزودن ${label}`}
        type="button"
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
}

function isMediaObject(value) {
  return Boolean(value && typeof value === "object" && !(value instanceof File) && value.url);
}

function ArticleImagePicker({
  field,
  label,
  onChange,
  preview,
  resizeHeight,
  resizeWidth,
  setPreview,
}) {
  return (
    <div className="rounded-xl border border-zinc-300 bg-white p-4 dark:border-zinc-800 dark:bg-black">
      <span className="mb-3 block text-sm text-zinc-700 dark:text-zinc-300">{label}</span>
      <p className="mb-3 text-xs text-zinc-500">
        اندازه پیشنهادی: {resizeWidth} × {resizeHeight}
      </p>
      <ThumbnailUpload
        immediateUpload
        immediateUploadOptions={{
          entityType: "magazines",
          resizeFit: "cover",
          resizeHeight,
          resizeWidth,
        }}
        name={field}
        onRemove={() => onChange(deletedMediaValue)}
        profilePreview
        preview={preview}
        setThumbnail={onChange}
        setThumbnailPreview={setPreview}
        title="انتخاب"
      />
    </div>
  );
}

function QuickCreateImageUpload({ label = "تصویر", name, onRemove, onSelect, preview }) {
  return (
    <div className="space-y-3 md:col-span-2">
      <span className="text-sm text-zinc-700 dark:text-zinc-300">{label}</span>
      <div className="flex flex-wrap items-center gap-3">
        <label className="py-1 px-4 flex flex-row gap-x-2 dark:bg-blue-100 bg-green-100 border dark:text-blue-700 dark:border-blue-900 border-green-900 text-green-900 rounded-secondary w-fit text-sm cursor-pointer">
          <CloudUpload className="h-5 w-5 dark:!text-blue-700" />
          <span>انتخاب {label}</span>
          <input
            accept="image/*"
            className="hidden"
            name={name}
            onChange={(event) => onSelect?.(event.target.files?.[0] || null)}
            type="file"
          />
        </label>
        {preview ? (
          <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
            <img alt="" className="h-full w-full object-cover" src={preview} />
            <button
              aria-label="حذف تصویر"
              className="absolute left-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-500 [&_svg]:!text-white"
              onClick={onRemove}
              type="button"
            >
              <Cross className="h-3 w-3" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function getFaqMediaType(file, media) {
  const type = String(file?.type || media?.type || "").toLowerCase();
  return type.startsWith("video") ? "video" : "image";
}

function splitFaqAnswerMedia(answer, existingMedia = []) {
  const media = Array.isArray(existingMedia) ? existingMedia.filter((item) => item?.url) : [];
  const cleanAnswer = String(answer || "").replace(
    /<figure[^>]*class=["'][^"']*article-faq-media[^"']*["'][^>]*>[\s\S]*?<\/figure>/gi,
    (figure) => {
      const srcMatch = figure.match(/\s(?:src)=["']([^"']+)["']/i);
      const url = srcMatch?.[1] || "";
      if (url && !media.some((item) => item.url === url)) {
        media.push({
          url,
          public_id: "",
          storage: "",
          type: /<video/i.test(figure) ? "video" : "image",
        });
      }
      return "";
    }
  ).trim();

  return { answer: cleanAnswer, media };
}

function FaqRowsEditor({ items = [], onChange }) {
  const rows = Array.isArray(items) && items.length ? items : [{ question: "", answer: "", media: [] }];
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);

  const handleAddItem = () => {
    onChange?.([...rows, { question: "", answer: "", media: [] }]);
  };

  const handleRemoveItem = (index) => {
    const next = [...rows];
    next.splice(index, 1);
    onChange?.(next);
  };

  const handleItemChange = (index, field, value) => {
    const next = rows.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item
    );
    onChange?.(next);
  };

  const addItemMedia = (index, mediaItems) => {
    const nextMedia = mediaItems.filter((item) => item?.url).slice(0, 1);
    handleItemChange(index, "media", nextMedia);
  };

  const removeItemMedia = (index, mediaIndex) => {
    const nextMedia = (rows[index]?.media || []).filter((_, itemIndex) => itemIndex !== mediaIndex);
    handleItemChange(index, "media", nextMedia);
  };

  const handleMediaFiles = async (index, fileList) => {
    const files = Array.from(fileList || []).filter((file) => file?.type?.startsWith("image/") || file?.type?.startsWith("video/"));
    if (!files.length) return;

    setUploadingIndex(index);
    toast.loading("در حال آپلود رسانه پاسخ...", { id: "faq-media-upload" });

    try {
      const mediaItems = [];
      for (const file of files) {
        const response = await uploadImageWithProgress(file, null, { entityType: "magazines" });
        const media = normalizeUploadedMedia(response, getFaqMediaType(file));
        if (media?.url) mediaItems.push({ ...media, type: getFaqMediaType(file, media) });
      }

      addItemMedia(index, mediaItems);
      toast.success("رسانه به پاسخ اضافه شد", { id: "faq-media-upload" });
    } catch (error) {
      toast.error(getUploadErrorMessage(error), { id: "faq-media-upload" });
    } finally {
      setUploadingIndex(null);
      setDragIndex(null);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-zinc-300 bg-white p-4 dark:border-zinc-800 dark:bg-black">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">سوالات متداول مجله</span>
          <p className="mt-1 text-xs text-zinc-500">هر سطر یک سوال و پاسخ دارد؛ روی + کنار پاسخ کلیک کنید یا عکس، گیف و ویدیو را روی پاسخ رها کنید.</p>
        </div>
      </div>

      {rows.map((item, index) => {
        const firstMedia = Array.isArray(item?.media) ? item.media[0] : null;

        return (
        <div className="flex flex-row items-start gap-x-2 rounded-2xl border border-zinc-300 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950" key={`article-faq-${index}`}>
          <div className="flex w-full flex-col gap-y-2">
            <input
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-700 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-white"
              onChange={(event) => handleItemChange(index, "question", event.target.value)}
              placeholder="مثلا این مجله برای چه کسانی مناسب است؟"
              type="text"
              value={item?.question || ""}
            />
            <div
              className={`relative rounded-xl  transition ${
                dragIndex === index
                  ? "border-emerald-500 bg-emerald-50 dark:border-blue-500 dark:bg-blue-950/30"
                  : "border-zinc-300 bg-white dark:border-zinc-800 dark:bg-black"
              }`}
              onDragLeave={() => setDragIndex(null)}
              onDragOver={(event) => {
                event.preventDefault();
                setDragIndex(index);
              }}
              onDrop={(event) => {
                event.preventDefault();
                handleMediaFiles(index, event.dataTransfer.files);
              }}
            >
              <input
                className="w-full rounded-xl border-0 bg-transparent py-3 pl-14 pr-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-700 dark:text-white dark:focus:border-white"
                onChange={(event) => handleItemChange(index, "answer", event.target.value)}
                onDrop={(event) => event.preventDefault()}
                placeholder="پاسخ سوال را بنویسید"
                type="text"
                value={item?.answer || ""}
              />
              <label
                aria-label="افزودن رسانه به پاسخ"
                className={`group absolute left-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center overflow-hidden rounded-full border text-white transition ${
                  firstMedia
                    ? "border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900"
                    : "border-emerald-700 bg-emerald-600 hover:bg-emerald-500 dark:border-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 [&_svg]:!text-white"
                } ${
                  uploadingIndex === index ? "pointer-events-none opacity-60" : ""
                }`}
                htmlFor={`article-faq-media-${index}`}
                title="افزودن عکس، گیف یا ویدیو"
              >
                {uploadingIndex === index ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : firstMedia ? (
                  firstMedia.type === "video" ? (
                    <video className="h-full w-full object-cover" muted playsInline src={firstMedia.url} />
                  ) : (
                    <img alt="" className="h-full w-full object-cover" src={firstMedia.url} />
                  )
                ) : (
                  <Plus className="h-5 w-5 !text-white" style={{ color: "#fff" }} />
                )}
              </label>
              {firstMedia ? (
                <button
                  aria-label="حذف رسانه پاسخ"
                  className="absolute left-0.5 top-0.5 z-10 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white shadow-sm transition hover:bg-red-500 [&_svg]:!text-white"
                  onClick={() => removeItemMedia(index, 0)}
                  type="button"
                >
                  <Cross className="h-2.5 w-2.5" />
                </button>
              ) : null}
              <input
                accept="image/*,video/*"
                className="hidden"
                id={`article-faq-media-${index}`}
                onChange={(event) => {
                  handleMediaFiles(index, event.target.files);
                  event.target.value = "";
                }}
                type="file"
              />
            </div>
          </div>

          {index > 0 && (
            <span
              className="cursor-pointer rounded-full border border-zinc-300 bg-red-500 p-1 text-white transition hover:bg-red-400 dark:border-zinc-800"
              onClick={() => handleRemoveItem(index)}
            >
              <Minus />
            </span>
          )}

          {index === rows.length - 1 && (
            <span
              className="cursor-pointer rounded-full border border-zinc-300 bg-green-500 p-1 text-white transition hover:bg-green-400 dark:border-zinc-800"
              onClick={handleAddItem}
            >
              <Plus />
            </span>
          )}
        </div>
        );
      })}
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
  const [cardCoverPreview, setCardCoverPreview] = useState("");
  const [contentCoverPreview, setContentCoverPreview] = useState("");
  const [isDesktopPreviewOpen, setIsDesktopPreviewOpen] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEdit);
  const [quickCreate, setQuickCreate] = useState(null);
  const [quickCreateForm, setQuickCreateForm] = useState(quickCreateInitialValues);
  const [quickCreateImagePreview, setQuickCreateImagePreview] = useState("");
  const slugManuallyEditedRef = useRef(isEdit);

  const { data: articleData, isLoading: isLoadingArticle } = useGetArticleQuery(id, { skip: !isEdit || !id });
  const { data: categoriesData, refetch: refetchCategories } = useGetCategoriesQuery({ page: 1, limit: 200 });
  const { data: tagsData, refetch: refetchTags } = useGetTagsQuery({ page: 1, limit: 200 });
  const { data: gamesData } = useGetGamesQuery({ page: 1, limit: 200 });
  const { data: platformsData } = useGetPlatformsQuery({ tree: true, limit: 500 });
  const { data: iconsData, isLoading: isLoadingIcons } = useGetIconsQuery({ page: 1, limit: 300 });
  const [createArticle, createState] = useCreateArticleMutation();
  const [createCategory, createCategoryState] = useCreateCategoryMutation();
  const [createTag, createTagState] = useCreateTagMutation();
  const [generateArticleSlug, generateSlugState] = useGenerateArticleSlugMutation();
  const [updateArticle, updateState] = useUpdateArticleMutation();

  const categories = categoriesData?.data || [];
  const tags = tagsData?.data || [];
  const games = gamesData?.data || [];
  const platforms = useMemo(() => flattenPlatforms(platformsData?.data || []), [platformsData]);
  const icons = iconsData?.data || [];
  const isSaving = createState.isLoading || updateState.isLoading;
  const isQuickCreateSaving = createCategoryState.isLoading || createTagState.isLoading;
  const isLastStep = currentStep === steps.length - 1;
  const titleIsValid = Boolean(form.title.trim());
  const contentIsValid = Boolean(form.content.trim());
  const currentStepKey = steps[currentStep].key;
  const canGoNext = currentStepKey === "basic" ? titleIsValid : currentStepKey === "content" ? contentIsValid : true;

  const categoryOptions = useMemo(() => categories.map((item) => ({ label: item.name, value: item._id })), [categories]);
  const tagOptions = useMemo(() => tags.map((item) => ({ label: item.name, value: item._id })), [tags]);
  const gameOptions = useMemo(() => games.map((item) => ({ label: item.title, value: item._id })), [games]);
  const platformOptions = useMemo(() => platforms.map((item) => ({ label: item.label, value: item._id })), [platforms]);
  const selectedTagLabels = tagOptions.filter((option) => form.tags.includes(option.value)).map((option) => option.label);
  const selectedPlatformLabels = platformOptions.filter((option) => form.platforms.includes(option.value)).map((option) => option.label.replace(/^-+\s*/, ""));
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
      platforms: toIdArray(article.platforms),
      relatedGames: toIdArray(article.relatedGames),
      faqs: Array.isArray(article.faqs)
        ? article.faqs.map((item) => ({
            question: item?.question || "",
            ...splitFaqAnswerMedia(item?.answer, item?.media),
          }))
        : [],
      publishedAt: formatDate(article.publishedAt),
      isFeatured: Boolean(article.isFeatured),
      status: article.status || "active",
      cover: null,
      cardCover: null,
      contentCover: null,
    });
    setCoverPreview(article.cover?.url || "");
    setCardCoverPreview(article.cardCover?.url || article.cover?.url || "");
    setContentCoverPreview(article.contentCover?.url || article.cover?.url || "");
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

  const openQuickCreate = (type) => {
    setQuickCreate(type);
    setQuickCreateForm(quickCreateInitialValues);
    setQuickCreateImagePreview("");
  };

  const closeQuickCreate = () => {
    if (isQuickCreateSaving) return;
    setQuickCreate(null);
    setQuickCreateForm(quickCreateInitialValues);
    setQuickCreateImagePreview("");
  };

  const setQuickCreateValue = (name, value) => {
    setQuickCreateForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "name" && !prev.slug) next.slug = makeSlug(value);
      return next;
    });
  };

  const setQuickCreateImageFile = async (file) => {
    if (!(file instanceof File)) {
      setQuickCreateValue("image", null);
      setQuickCreateImagePreview("");
      return;
    }

    const entityName = quickCreateForm.name.trim();
    if (!entityName) {
      toast.error("ابتدا نام را وارد کنید", { id: "article-quick-create-image" });
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setQuickCreateImagePreview(localPreview);

    try {
      const response = await uploadImageWithProgress(file, null, {
        entityName,
        entityType: quickCreateUploadTypes[quickCreate] || quickCreate || "magazines",
        requireEntityName: true,
      });
      const media = normalizeUploadedMedia(response, "image");
      if (!media) throw new Error("پاسخ آپلود معتبر نیست");
      setQuickCreateValue("image", media);
      setQuickCreateImagePreview(media.url);
    } catch (error) {
      setQuickCreateValue("image", null);
      setQuickCreateImagePreview("");
      toast.error(getUploadErrorMessage(error), { id: "article-quick-create-image" });
    } finally {
      URL.revokeObjectURL(localPreview);
    }
  };

  const buildQuickCreateRequest = () => {
    const trimmed = Object.fromEntries(Object.entries(quickCreateForm).map(([key, value]) => [key, String(value || "").trim()]));
    const formData = new FormData();
    const name = trimmed.name;
    const slug = makeSlug(trimmed.slug || name);

    formData.append("name", name);
    if (slug) formData.append("slug", slug);
    if (trimmed.description) formData.append("description", trimmed.description);
    if (trimmed.icon) formData.append("icon", trimmed.icon);
    if (quickCreate === "category" && trimmed.parent) formData.append("parent", trimmed.parent);
    if (isMediaObject(quickCreateForm.image)) formData.append("image", JSON.stringify(quickCreateForm.image));

    return formData;
  };

  const handleQuickCreateSubmit = async (event) => {
    event.preventDefault();
    if (!quickCreate) return;

    const name = quickCreateForm.name.trim();
    if (!name) {
      toast.error("\u0646\u0627\u0645 \u0631\u0627 \u0648\u0627\u0631\u062f \u06a9\u0646\u06cc\u062f", { id: "article-quick-create" });
      return;
    }

    try {
      const label = quickCreate === "category" ? "\u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc" : "\u062a\u06af";
      toast.loading(`\u062f\u0631 \u062d\u0627\u0644 \u0627\u0641\u0632\u0648\u062f\u0646 ${label}...`, { id: "article-quick-create" });
      const response =
        quickCreate === "category"
          ? await createCategory(buildQuickCreateRequest()).unwrap()
          : await createTag(buildQuickCreateRequest()).unwrap();
      const createdId = response?.data?._id;

      if (quickCreate === "category") {
        await refetchCategories();
        if (createdId) setForm((prev) => ({ ...prev, category: createdId }));
      } else {
        await refetchTags();
        if (createdId) setForm((prev) => ({ ...prev, tags: prev.tags.includes(createdId) ? prev.tags : [...prev.tags, createdId] }));
      }

      setQuickCreate(null);
      setQuickCreateForm(quickCreateInitialValues);
      setQuickCreateImagePreview("");
      toast.success(response?.description || `${label} \u0627\u0636\u0627\u0641\u0647 \u0634\u062f`, { id: "article-quick-create" });
    } catch (error) {
      const label = quickCreate === "category" ? "\u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc" : "\u062a\u06af";
      toast.error(error?.data?.description || `\u0627\u0641\u0632\u0648\u062f\u0646 ${label} \u0646\u0627\u0645\u0648\u0641\u0642 \u0628\u0648\u062f`, { id: "article-quick-create" });
    }
  };

  const goToStep = (step) => {
    const targetIndex = step - 1;

    if (targetIndex > 0 && !titleIsValid) {
      toast.error("عنوان مجله را وارد کنید", { id: "article-step" });
      setCurrentStep(0);
      return;
    }

    if (targetIndex > 2 && !contentIsValid) {
      toast.error("محتوای مجله را تکمیل کنید", { id: "article-step" });
      setCurrentStep(1);
      return;
    }

    setCurrentStep(targetIndex);
  };

  const goToNextStep = () => {
    if (!canGoNext) {
      toast.error(currentStepKey === "basic" ? "عنوان مجله را وارد کنید" : "محتوای مجله را تکمیل کنید", { id: "article-step" });
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const buildFormData = () => {
    const formData = new FormData();
    const activeAuthor = activeAdmin.name || activeAdmin.email || form.author || "";

    Object.entries({ ...form, author: activeAuthor }).forEach(([key, value]) => {
      if (key === "cover" || key === "cardCover" || key === "contentCover") {
        if (value instanceof File) formData.append(key, value);
        else if (isMediaObject(value)) formData.append(key, JSON.stringify(value));
        else if (value === deletedMediaValue) formData.append(key, deletedMediaValue);
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
      toast.error(!titleIsValid ? "عنوان مجله را وارد کنید" : "محتوای مجله را تکمیل کنید", { id: "save-article" });
      setCurrentStep(!titleIsValid ? 0 : 1);
      return;
    }

    try {
      toast.loading(isEdit ? "در حال به‌روزرسانی مجله..." : "در حال ثبت مجله...", { id: "save-article" });
      const formData = buildFormData();
      const response = isEdit ? await updateArticle({ id, formData }).unwrap() : await createArticle(formData).unwrap();

      toast.success(response.description || "مجله ذخیره شد", { id: "save-article" });
      navigate("/magazines");
    } catch (error) {
      toast.error(error?.data?.description || "ذخیره مجله انجام نشد", { id: "save-article" });
    }
  };

  const renderStep = () => {
    switch (steps[currentStep].key) {
      case "basic":
        return (
          <div className="space-y-4">
            <Field label="عنوان مجله" name="title" onChange={handleChange} placeholder="مثلا راهنمای خرید بازی " value={form.title} />
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
            <div className="grid gap-4 lg:grid-cols-2">
              <ArticleImagePicker
                field="cardCover"
                label="تصویر کارت"
                onChange={(media) => setForm((prev) => ({ ...prev, cardCover: media }))}
                preview={cardCoverPreview}
                resizeHeight={768}
                resizeWidth={768}
                setPreview={setCardCoverPreview}
              />
              <ArticleImagePicker
                field="contentCover"
                label="تصویر جزئیات مجله"
                onChange={(media) => setForm((prev) => ({ ...prev, contentCover: media }))}
                preview={contentCoverPreview}
                resizeHeight={1080}
                resizeWidth={1920}
                setPreview={setContentCoverPreview}
              />
            </div>
          </div>
        );
      case "content":
        return (
          <div className="space-y-4">
            <Textarea label="خلاصه کوتاه" name="excerpt" onChange={handleChange} placeholder="خلاصه‌" value={form.excerpt} />
            <div className="space-y-3 rounded-xl border border-zinc-300 bg-white p-4 dark:border-zinc-800 dark:bg-black">
              <span className="text-sm text-zinc-600 dark:text-zinc-300">محتوای مجله</span>
              <PageBuilder key={isEdit ? id : "create-article-content"} initialValue={form.content} onChange={(value) => setForm((prev) => ({ ...prev, content: value }))} />
            </div>
          </div>
        );
      case "faqs":
        return <FaqRowsEditor items={form.faqs} onChange={(value) => setArrayField("faqs", value)} />;
      case "relations": {
        return (
          <div className="space-y-4">
            <QuickCreateField label="دسته‌بندی" onCreate={() => openQuickCreate("category")}>
              <SingleSelectDropdown label="دسته‌بندی" name="category" onChange={handleChange} options={categoryOptions} value={form.category} />
            </QuickCreateField>
            <QuickCreateField label="تگ" onCreate={() => openQuickCreate("tag")}>
              <MultiSelectDropdown label="تگ‌ها" onChange={(value) => setArrayField("tags", value)} options={tagOptions} value={form.tags} />
            </QuickCreateField>
            <MultiSelectDropdown label="پلتفرم‌ها (اختیاری)" onChange={(value) => setArrayField("platforms", value)} options={platformOptions} value={form.platforms} />
            <MultiSelectDropdown label="بازی‌های مرتبط" onChange={(value) => setArrayField("relatedGames", value)} options={gameOptions} value={form.relatedGames} />
          </div>
        );
      }
      case "publish":
        return (
          <div className="space-y-4">
            <DatePickerField
              label="تاریخ انتشار"
              onChange={(value) => setForm((prev) => ({ ...prev, publishedAt: value }))}
              value={form.publishedAt}
            />
            <StatusSwitch
              checked={form.isFeatured}
              id="article-is-featured"
              label="مجله ویژه"
              name="isFeatured"
              onChange={handleChange}
              tone="dark"
            />
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
            <p className="text-xs text-zinc-400">مدیریت مجله‌نویس</p>
            <h1 className="mt-1 text-2xl font-bold text-white">{isEdit ? "ویرایش مجله" : "افزودن مجله"}</h1>
          </div>
          <Link className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-white hover:text-white" to="/magazines">
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
                    <span className="text-xs font-bold text-zinc-500">فرم تکمیل مجله</span>
                    <span className="rounded-full border border-zinc-800 px-2 py-1 text-[10px] text-zinc-500">
                      {currentStep + 1} / {steps.length}
                    </span>
                  </div>
                  {renderStep()}
                  <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
                    {isLastStep ? (
                      <SendButton isLoading={isSaving} label={isEdit ? "ذخیره مجله" : "ثبت مجله"} loadingLabel="در حال ذخیره..." />
                    ) : (
                      <NavigationButton direction="next" disabled={!canGoNext || isSaving} onClick={goToNextStep} />
                    )}
                    <NavigationButton direction="prev" disabled={currentStep === 0 || isSaving} onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))} />
                  </div>
                </div>

                <ArticleCardPreview coverPreview={cardCoverPreview || coverPreview} form={form} tags={selectedTagLabels} />
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
                    coverPreview={contentCoverPreview || coverPreview || cardCoverPreview}
                    form={form}
                    relatedGames={selectedRelatedGames}
                    platforms={selectedPlatformLabels}
                    tags={selectedTagLabels}
                    variant="mobile"
                  />
                </div>
              </div>
            </>
          )}
        </form>

        {quickCreate ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6" dir="rtl">
            <form className="w-full max-w-2xl space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950" onSubmit={handleQuickCreateSubmit}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-zinc-500">افزودن سریع</p>
                  <h2 className="text-lg font-bold text-zinc-950 dark:text-white">{quickCreateLabels[quickCreate]}</h2>
                </div>
                <button
                  aria-label="بستن"
                  className="rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-600 transition hover:border-red-400 hover:text-red-500 dark:border-zinc-800 dark:text-zinc-300"
                  disabled={isQuickCreateSaving}
                  onClick={closeQuickCreate}
                  type="button"
                >
                  بستن
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <QuickCreateImageUpload
                  label="تصویر"
                  name={`quick-create-${quickCreate}-image`}
                  onRemove={() => {
                    setQuickCreateValue("image", null);
                    setQuickCreateImagePreview("");
                  }}
                  onSelect={setQuickCreateImageFile}
                  preview={quickCreateImagePreview}
                />

                <label className="space-y-2">
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">عنوان</span>
                  <input
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-blue-500"
                    onChange={(event) => setQuickCreateValue("name", event.target.value)}
                    placeholder={quickCreate === "category" ? "مثلا اخبار بازی" : "مثلا راهنمای خرید"}
                    value={quickCreateForm.name}
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">اسلاگ</span>
                  <input
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-blue-500"
                    dir="ltr"
                    onChange={(event) => setQuickCreateValue("slug", event.target.value)}
                    placeholder="buying-guide"
                    value={quickCreateForm.slug}
                  />
                </label>

                {quickCreate === "category" ? (
                  <>
                    <div className="md:col-span-2">
                      <IconPicker
                        icons={icons}
                        isLoadingIcons={isLoadingIcons}
                        label="آیکون"
                        name="icon"
                        onChange={(event) => setQuickCreateValue("icon", event.target.value)}
                        value={quickCreateForm.icon}
                      />
                    </div>
                    <label className="space-y-2">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">والد</span>
                      <select
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-blue-500"
                        onChange={(event) => setQuickCreateValue("parent", event.target.value)}
                        value={quickCreateForm.parent}
                      >
                        <option value="">بدون والد</option>
                        {categoryOptions.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </>
                ) : null}

                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">توضیحات</span>
                  <textarea
                    className="min-h-24 w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-blue-500"
                    onChange={(event) => setQuickCreateValue("description", event.target.value)}
                    placeholder="توضیح کوتاه"
                    value={quickCreateForm.description}
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <button
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-sm text-zinc-600 transition hover:border-zinc-400 hover:text-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-white dark:hover:text-white"
                  disabled={isQuickCreateSaving}
                  onClick={closeQuickCreate}
                  type="button"
                >
                  انصراف
                </button>
                <button
                  className="rounded-xl border border-emerald-600 bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
                  disabled={isQuickCreateSaving}
                  type="submit"
                >
                  {isQuickCreateSaving ? "در حال ثبت..." : "ثبت و انتخاب"}
                </button>
              </div>
            </form>
          </div>
        ) : null}

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
                coverPreview={contentCoverPreview || coverPreview || cardCoverPreview}
                form={form}
                isSticky={false}
                relatedGames={selectedRelatedGames}
                platforms={selectedPlatformLabels}
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
