import React from "react";
import CloudUpload from "@/components/icons/CloudUpload";
import SocialLinksInput from "@/components/shared/SocialLinksInput";
import FormPageBuilder from "@/components/shared/input/FormPageBuilder";
import MyEditor from "@/components/shared/textEditor/TextEditor";
import ThumbnailUpload from "@/components/shared/ThumbnailUpload";
import StatusSwitch from "@/components/shared/button/StatusSwitch";
import Edit from "@/components/icons/Edit";
import OutlineEye from "@/components/icons/OutlineEye";
import OutlineEyeInvisible from "@/components/icons/OutlineEyeInvisible";
import Plus from "@/components/icons/Plus";
import Trash from "@/components/icons/Trash";
import { MultiSelectDropdown, SingleSelectDropdown } from "@/components/shared/Dropdown";
import { DatePickerField, TextField, TextareaField } from "./GameFormFields";
import { dlcTypeOptions } from "../gameOptions";
import { makeGameSlug } from "../gameFormUtils";

function QuickCreateField({ children, label, onCreate }) {
  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_56px]">
      {children}
      <button
        aria-label={`افزودن ${label}`}
        className="mt-5 inline-flex h-14 w-14 items-center justify-center rounded-xl border border-emerald-700 bg-emerald-600 !text-white dark:border-blue-700 dark:bg-blue-600 [&_svg]:!text-white"
        onClick={onCreate}
        title={`افزودن ${label}`}
        type="button"
      >
        <Plus className="h-7 w-7 !text-white" style={{ color: "#fff" }} />
      </button>
    </div>
  );
}

function formatFileSize(size) {
  const value = Number(size || 0);
  if (!value) return "";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

function UploadStateOverlay({ state }) {
  if (!state) return null;

  const isUploading = state.status === "uploading";
  const progress = Math.max(0, Math.min(100, Number(state.progress || 0)));

  return (
    <>
      {(state.originalSize || state.uploadedSize) ? (
        <div className="absolute bottom-1 left-1 right-1 z-20 flex flex-wrap gap-1">
          {state.originalSize ? <span className="rounded-md bg-red-600/90 px-1.5 py-0.5 text-[9px] !text-white">{formatFileSize(state.originalSize)}</span> : null}
          {state.uploadedSize ? <span className="rounded-md bg-emerald-600/90 px-1.5 py-0.5 text-[9px] !text-white">{formatFileSize(state.uploadedSize)}</span> : null}
        </div>
      ) : null}
      {isUploading ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/45 text-white">
          <span
            className="relative h-8 w-8 animate-spin rounded-full"
            style={{
              background: `conic-gradient(rgb(255 255 255) ${progress * 3.6}deg, rgba(255,255,255,.24) 0deg)`,
              WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))",
              mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))",
            }}
          />
        </div>
      ) : null}
    </>
  );
}

function imageUrl(value, uploadState) {
  if ((uploadState?.status === "uploading" || uploadState?.status === "error") && uploadState?.localPreview) return uploadState.localPreview;
  if (typeof value === "string") return value;
  return value?.url || "";
}

function TextListEditor({ label, items = [], onChange, placeholder = "???? ????" }) {
  const rows = items.length ? items : [""];

  const updateItem = (index, value) => {
    const next = rows.map((item, itemIndex) => (itemIndex === index ? value : item));
    onChange?.(next.filter((item) => String(item || "").trim()));
  };

  const addItem = () => onChange?.([...rows, ""]);
  const removeItem = (index) => onChange?.(rows.filter((_, itemIndex) => itemIndex !== index));

  return (
    <div className="space-y-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-zinc-700 dark:text-zinc-300">{label}</span>
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 transition hover:border-white hover:text-zinc-950 dark:text-white"
          onClick={addItem}
          type="button"
        >
          <Plus />
        </button>
      </div>
      <div className="space-y-3">
        {rows.map((item, index) => (
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_40px]" key={`${label}-${index}`}>
            <input
              className="h-12 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black px-3 text-sm text-zinc-950 dark:text-white outline-none transition focus:border-white"
              onChange={(event) => updateItem(index, event.target.value)}
              placeholder={placeholder}
              value={item}
            />
            <button
              className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 transition hover:border-red-500 hover:text-red-400"
              onClick={() => removeItem(index)}
              type="button"
            >
              <Trash className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ObjectRowsEditor({ columns, items = [], onChange, onCreatePlatform, title }) {
  const rows = items.length ? items : [{ platform: "", variant: "", size: "" }];

  const updateItem = (index, patch) => {
    const next = rows.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
    onChange?.(
      next.filter((item) => String(item.platform || "").trim() || String(item.variant || "").trim() || String(item.size || "").trim())
    );
  };

  const addItem = () => onChange?.([...rows, { platform: "", variant: "", size: "" }]);
  const removeItem = (index) => onChange?.(rows.filter((_, itemIndex) => itemIndex !== index));

  return (
    <div className="space-y-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-zinc-700 dark:text-zinc-300">{title}</span>
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 transition hover:border-white hover:text-zinc-950 dark:text-white"
          onClick={addItem}
          type="button"
        >
          <Plus />
        </button>
      </div>
      <div className="space-y-3">
        {rows.map((item, index) => (
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_40px]" key={`${title}-${index}`}>
            <QuickCreateField label="پلتفرم" onCreate={() => onCreatePlatform?.({ field: "platformSizes", index })}>
              <SingleSelectDropdown
                label={columns[0].label}
                name={`${title}-platform-${index}`}
                onChange={(event) => updateItem(index, { platform: event.target.value })}
                options={columns[0].options}
                value={item.platform}
              />
            </QuickCreateField>
            <TextField
              label={columns[1].label}
              name={`${title}-variant-${index}`}
              onChange={(event) => updateItem(index, { variant: event.target.value })}
              placeholder={columns[1].placeholder}
              value={item.variant}
            />
            <TextField
              label={columns[2].label}
              name={`${title}-size-${index}`}
              onChange={(event) => updateItem(index, { size: event.target.value })}
              placeholder={columns[2].placeholder}
              value={item.size}
            />
            <button
              className="mt-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 transition hover:border-red-500 hover:text-red-400"
              onClick={() => removeItem(index)}
              type="button"
            >
              <Trash className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlatformReleaseRowsEditor({ items = [], onChange, onCreatePlatform, platformOptions }) {
  const rows = items.length ? items : [{ platform: "", releaseDate: "" }];

  const updateItem = (index, patch) => {
    const next = rows.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
    onChange?.(next.filter((item) => String(item.platform || "").trim() || String(item.releaseDate || "").trim()));
  };

  const addItem = () => onChange?.([...rows, { platform: "", releaseDate: "" }]);
  const removeItem = (index) => onChange?.(rows.filter((_, itemIndex) => itemIndex !== index));

  return (
    <div className="platform-release-font space-y-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-zinc-700 dark:text-zinc-300">تاریخ انتشار پلتفرم‌ها</span>
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 transition hover:border-white hover:text-zinc-950 dark:text-white"
          onClick={addItem}
          type="button"
        >
          <Plus />
        </button>
      </div>
      <div className="space-y-3">
        {rows.map((item, index) => (
          <div className="platform-release-font grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_40px]" key={`platform-release-${index}`}>
            <QuickCreateField label="پلتفرم" onCreate={() => onCreatePlatform?.({ field: "platformReleases", index })}>
              <SingleSelectDropdown
                label="پلتفرم"
                name={`platform-release-platform-${index}`}
                onChange={(event) => updateItem(index, { platform: event.target.value })}
                options={platformOptions}
                value={item.platform}
              />
            </QuickCreateField>
            <DatePickerField
              label="تاریخ انتشار"
              onChange={(value) => updateItem(index, { releaseDate: value })}
              value={item.releaseDate}
            />
            <button
              className="mt-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 transition hover:border-red-500 hover:text-red-400"
              onClick={() => removeItem(index)}
              type="button"
            >
              <Trash className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function InlineImageUploadButton({ image, name, onChange, onRemove, state, title }) {
  const previewUrl = imageUrl(image, state);

  return (
    <div className="mt-6 flex items-center gap-2">
      {previewUrl ? (
        <div className="group relative h-12 w-12 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
          <img alt="" className="h-full w-full object-cover" src={previewUrl} />
          <UploadStateOverlay state={state} />
          {typeof onRemove === "function" ? (
            <button
              aria-label="حذف تصویر"
              className="absolute inset-0 z-40 flex items-center justify-center bg-black/45 !text-white opacity-0 transition group-hover:opacity-100 [&_svg]:!text-white"
              onClick={onRemove}
              type="button"
            >
              <Trash className="h-4 w-4 !text-white" style={{ color: "#fff" }} />
            </button>
          ) : null}
        </div>
      ) : null}
      <label className="inline-flex h-12 w-fit cursor-pointer flex-row items-center gap-x-2 rounded-secondary border border-green-900 bg-green-100 px-4 py-1 text-sm text-green-900 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm dark:border-blue-900 dark:bg-blue-100 dark:text-blue-700">
        <CloudUpload className="h-5 w-5 dark:!text-blue-700" />
        <span>{title}</span>
        <input
          accept="image/*"
          className="hidden"
          name={name}
          onChange={(event) => onChange?.(event.target.files?.[0] || null)}
          type="file"
        />
      </label>
    </div>
  );
}

function DlcRowsEditor({ imageUploadState = {}, items = [], onChange, onDeleteUploadedImage, onImageUpload, title, typeOptions }) {
  const rows = items.length ? items : [{ title: "", type: "", image: "", versionSize: "" }];

  const updateItem = (index, patch) => {
    const next = rows.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
    onChange?.(
      next.filter(
        (item) =>
          String(item.title || "").trim() ||
          String(item.type || "").trim() ||
          String(item.versionSize || "").trim() ||
          item.image
      )
    );
  };

  const addItem = () => onChange?.([...rows, { title: "", type: "", image: "", versionSize: "" }]);
  const removeItem = (index) => onChange?.(rows.filter((_, itemIndex) => itemIndex !== index));

  return (
    <div className="space-y-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-zinc-700 dark:text-zinc-300">{title}</span>
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 transition hover:border-white hover:text-zinc-950 dark:text-white"
          onClick={addItem}
          type="button"
        >
          <Plus />
        </button>
      </div>
      <div className="space-y-4">
        {rows.map((item, index) => (
          <div className="space-y-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4" key={`${title}-${index}`}>
            <div className="grid items-end gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto_48px]">
              <TextField
                label="عنوان DLC"
                name={`${title}-title-${index}`}
                onChange={(event) => updateItem(index, { title: event.target.value })}
                placeholder="مثلا Midnight Expansion"
                value={item.title}
              />
              <SingleSelectDropdown
                label="نوع DLC"
                name={`${title}-type-${index}`}
                onChange={(event) => updateItem(index, { type: event.target.value })}
                options={typeOptions}
                value={item.type}
              />
              <TextField
                label="حجم نسخه"
                name={`${title}-versionSize-${index}`}
                onChange={(event) => updateItem(index, { versionSize: event.target.value })}
                placeholder="مثلا 12 GB"
                value={item.versionSize}
              />
              <InlineImageUploadButton
                image={item.image}
                name={`dlcImages-${index}`}
                onChange={async (file) => {
                  const media = await onImageUpload?.(`dlcs-${index}`, file);
                  if (media) updateItem(index, { image: media });
                }}
                onRemove={async () => {
                  await onDeleteUploadedImage?.(`dlcs-${index}`, item.image);
                  updateItem(index, { image: "" });
                }}
                state={imageUploadState[`dlcs-${index}`]}
                title="افزودن تصویر DLC"
              />
              <button
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 transition hover:border-red-500 hover:text-red-400"
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

function EditionRowsEditor({ imageUploadState = {}, items = [], onChange, onDeleteUploadedImage, onImageUpload, title }) {
  const rows = items.length ? items : [{ title: "", versionSize: "", price: "", image: "" }];

  const updateItem = (index, patch) => {
    const next = rows.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
    onChange?.(
      next.filter(
        (item) =>
          String(item.title || "").trim() ||
          String(item.versionSize || "").trim() ||
          String(item.price || "").trim() ||
          item.image
      )
    );
  };

  const addItem = () => onChange?.([...rows, { title: "", versionSize: "", price: "", image: "" }]);
  const removeItem = (index) => onChange?.(rows.filter((_, itemIndex) => itemIndex !== index));

  return (
    <div className="space-y-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-zinc-700 dark:text-zinc-300">{title}</span>
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 transition hover:border-white hover:text-zinc-950 dark:text-white"
          onClick={addItem}
          type="button"
        >
          <Plus />
        </button>
      </div>
      <div className="space-y-3">
        {rows.map((item, index) => (
          <div className="space-y-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4" key={`${title}-${index}`}>
            <div className="grid items-end gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto_48px]">
              <TextField
                label="خلاصه"
                name={`${title}-title-${index}`}
                onChange={(event) => updateItem(index, { title: event.target.value })}
                placeholder="مثلا Deluxe Edition"
                value={item.title}
              />
              <TextField
                label="حجم نسخه"
                name={`${title}-versionSize-${index}`}
                onChange={(event) => updateItem(index, { versionSize: event.target.value })}
                placeholder="مثلا 12 GB"
                value={item.versionSize}
              />
              <TextField
                label="سازنده‌ها"
                name={`${title}-price-${index}`}
                onChange={(event) => updateItem(index, { price: event.target.value })}
                placeholder="مثلا 250000"
                type="number"
                value={item.price}
              />
              <InlineImageUploadButton
                image={item.image}
                name={`extraEditionImages-${index}`}
                onChange={async (file) => {
                  const media = await onImageUpload?.(`extraEditions-${index}`, file);
                  if (media) updateItem(index, { image: media });
                }}
                onRemove={async () => {
                  await onDeleteUploadedImage?.(`extraEditions-${index}`, item.image);
                  updateItem(index, { image: "" });
                }}
                state={imageUploadState[`extraEditions-${index}`]}
                title="افزودن تصویر نسخه"
              />
              <button
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 transition hover:border-red-500 hover:text-red-400"
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

function LinkRowsEditor({ label, items = [], onChange }) {
  const rows = items.length ? items : [{ title: "", link: "" }];

  const updateItem = (index, patch) => {
    const next = rows.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
    onChange?.(next.filter((item) => item.title || item.link));
  };

  const addItem = () => onChange?.([...rows, { title: "", link: "" }]);
  const removeItem = (index) => onChange?.(rows.filter((_, itemIndex) => itemIndex !== index));

  return (
    <div className="space-y-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-zinc-700 dark:text-zinc-300">{label}</span>
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 transition hover:border-white hover:text-zinc-950 dark:text-white"
          onClick={addItem}
          type="button"
        >
          <Plus />
        </button>
      </div>
      <div className="space-y-3">
        {rows.map((item, index) => (
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_40px]" key={`${label}-${index}`}>
            <TextField
              label="خلاصه"
              name={`${label}-title-${index}`}
              onChange={(event) => updateItem(index, { title: event.target.value })}
              placeholder="مثلا Metacritic"
              value={item.title}
            />
            <TextField
              dir="ltr"
              label="سازنده‌ها"
              name={`${label}-link-${index}`}
              onChange={(event) => updateItem(index, { link: event.target.value })}
              placeholder="https://..."
              value={item.link}
            />
            <button
              className="mt-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 transition hover:border-red-500 hover:text-red-400"
              onClick={() => removeItem(index)}
              type="button"
            >
              <Trash className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function LegacySearchTitleRowsEditor({ items = [], onChange, translateSearchTitleSlug }) {
  const rows = items.length ? items : [{ title: "", slug: "" }];
  const autoSlugsRef = React.useRef({});
  const translationTimersRef = React.useRef({});

  const updateItem = (index, patch) => {
    const next = rows.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
    onChange?.(next.filter((item) => String(item.title || "").trim() || String(item.slug || "").trim()));
  };

  const scheduleTranslatedSlug = (index, title) => {
    if (!translateSearchTitleSlug) return;
    window.clearTimeout(translationTimersRef.current[index]);

    const trimmedTitle = String(title || "").trim();
    if (!trimmedTitle) return;

    translationTimersRef.current[index] = window.setTimeout(async () => {
      try {
        const response = await translateSearchTitleSlug(trimmedTitle).unwrap();
        const translatedSlug = response?.data?.slug || "";
        if (!translatedSlug) return;

        const titleInput = document.querySelector(`[name="search-title-${index}"]`);
        const slugInput = document.querySelector(`[name="search-title-slug-${index}"]`);
        if (titleInput?.value !== trimmedTitle) return;

        const currentSlug = String(slugInput?.value || "");
        const previousAutoSlug = autoSlugsRef.current[index] || "";
        if (currentSlug && currentSlug !== previousAutoSlug) return;

        autoSlugsRef.current[index] = translatedSlug;
        updateItem(index, { title: trimmedTitle, slug: translatedSlug });
      } catch (_) {}
    }, 500);
  };

  const updateTitle = (index, title) => {
    const currentItem = rows[index] || {};
    const currentSlug = String(currentItem.slug || "");
    const previousAutoSlug = autoSlugsRef.current[index] || makeGameSlug(currentItem.title);
    updateItem(index, {
      title,
      ...(currentSlug && currentSlug !== previousAutoSlug ? {} : { slug: "" }),
    });
    scheduleTranslatedSlug(index, title);
  };

  const addItem = () => onChange?.([...rows, { title: "", slug: "" }]);
  const removeItem = (index) => onChange?.(rows.filter((_, itemIndex) => itemIndex !== index));
  const focusNextTitle = (index) => {
    window.setTimeout(() => {
      document.querySelector(`[name="search-title-${index + 1}"]`)?.focus();
    }, 0);
  };

  const handleInputKeyDown = (event, index) => {
    if (event.key !== "Enter") return;
    event.preventDefault();

    if (rows[index + 1]) {
      focusNextTitle(index);
      return;
    }

    onChange?.([...rows, { title: "", slug: "" }]);
    focusNextTitle(index);
  };

  return (
    <div className="space-y-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-zinc-700 dark:text-zinc-300">عناوین جستجو</span>
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 transition hover:border-white hover:text-zinc-950 dark:text-white"
          onClick={addItem}
          type="button"
        >
          <Plus />
        </button>
      </div>
      <div className="space-y-3">
        {rows.map((item, index) => (
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_40px]" key={`search-title-${index}`}>
            <TextField
              label="خلاصه"
              name={`search-title-${index}`}
              onChange={(event) => updateTitle(index, event.target.value)}
              onKeyDown={(event) => handleInputKeyDown(event, index)}
              placeholder="مثلا بازی اکشن پلی استیشن 5"
              value={item.title}
            />
            <TextField
              dir="ltr"
              label="خلاصه"
              name={`search-title-slug-${index}`}
              onChange={(event) => updateItem(index, { slug: event.target.value })}
              onKeyDown={(event) => handleInputKeyDown(event, index)}
              placeholder="ps5-action-games"
              value={item.slug}
            />
            <button
              className="mt-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 transition hover:border-red-500 hover:text-red-400"
              onClick={() => removeItem(index)}
              type="button"
            >
              <Trash className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BasicStep({
  cardDesktopCoverPreview,
  cardMobileCoverPreview,
  coverPreview,
  desktopCoverPreview,
  setCardDesktopCoverPreview,
  setCardMobileCoverPreview,
  setCoverPreview,
  setDesktopCoverPreview,
  setDesktopCoverCropFile,
  form,
  onChange,
  setArrayField,
  setForm,
  translateSearchTitleSlug,
}) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="عنوان بازی *" name="title" onChange={onChange} value={form.title} />
        <TextField dir="ltr" label="اسلاگ بازی" name="slug" onChange={onChange} value={form.slug} />
      </div>
      <LegacySearchTitleRowsEditor
        items={form.searchTitles}
        onChange={(value) => setArrayField("searchTitles", value)}
        translateSearchTitleSlug={translateSearchTitleSlug}
      />
      <div className="min-w-0 space-y-2">
        <span className="text-sm text-zinc-700 dark:text-zinc-300">خلاصه بازی</span>
        <div className="game-summary-editor min-w-0 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
          <MyEditor
            value={form.shortDescription}
            onChange={(value) => setForm((prev) => ({ ...prev, shortDescription: value }))}
          />
        </div>
      </div>
    </div>
  );
}

export function GameMediaStep({
  cardDesktopCoverPreview,
  cardMobileCoverPreview,
  coverPreview,
  desktopCoverPreview,
  galleryPreview,
  imageUploadState = {},
  isTrailerVideoUploading,
  onDeleteMainImage,
  onDeleteUploadedImage,
  onImageUpload,
  onVideoUpload,
  setCardDesktopCoverPreview,
  setCardMobileCoverPreview,
  setCoverPreview,
  setDesktopCoverCropFile,
  setForm,
  setGalleryPreview,
  setTrailerThumbnailPreview,
  trailerThumbnailPreview,
  trailerVideoPreview,
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-4">
          <span className="mb-3 block text-sm text-zinc-700 dark:text-zinc-300">تصویر کاور اصلی *</span>
          <p className="mb-3 text-xs text-zinc-500">اندازه پیشنهادی: 1024 × 1024</p>
          <ThumbnailUpload
            immediateUpload={false}
            name="cardDesktopCover"
            onRemove={() => onDeleteMainImage?.("cardDesktopCover", setCardDesktopCoverPreview)}
            preview={cardDesktopCoverPreview}
            uploadState={imageUploadState.cardDesktopCover}
            setThumbnail={async (file) => {
              const media = await onImageUpload?.("cardDesktopCover", file);
              if (!media) return;
              setForm((prev) => ({
                ...prev,
                cardDesktopCover: media,
                cover: prev.cover || media,
              }));
              setCardDesktopCoverPreview(media.url);
              if (!coverPreview) setCoverPreview(media.url);
            }}
            setThumbnailPreview={(preview) => {
              setCardDesktopCoverPreview(preview);
              if (!coverPreview) setCoverPreview(preview);
            }}
            title="انتخاب"
          />
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-4">
          <span className="mb-3 block text-sm text-zinc-700 dark:text-zinc-300">تصویر کارت موبایل</span>
          <p className="mb-3 text-xs text-zinc-500">اندازه پیشنهادی: 1440 × 1080</p>
          <ThumbnailUpload
            immediateUpload={false}
            name="cardMobileCover"
            onRemove={() => onDeleteMainImage?.("cardMobileCover", setCardMobileCoverPreview)}
            preview={cardMobileCoverPreview}
            uploadState={imageUploadState.cardMobileCover}
            setThumbnail={async (file) => {
              const media = await onImageUpload?.("cardMobileCover", file);
              if (!media) return;
              setForm((prev) => ({ ...prev, cardMobileCover: media }));
              setCardMobileCoverPreview(media.url);
            }}
            setThumbnailPreview={setCardMobileCoverPreview}
            title="انتخاب"
          />
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-4">
          <span className="mb-3 block text-sm text-zinc-700 dark:text-zinc-300">تصویر کارت موبایل</span>
          <p className="mb-3 text-xs text-zinc-500">اندازه پیشنهادی: 1920 × 1080</p>
          <ThumbnailUpload
            immediateUpload={false}
            name="desktopCover"
            onRemove={() => onDeleteMainImage?.("desktopCover", setDesktopCoverPreview)}
            preview={desktopCoverPreview}
            uploadState={imageUploadState.desktopCover}
            setThumbnail={(file) => {
              if (file instanceof File) setDesktopCoverCropFile(file);
            }}
            setThumbnailPreview={() => {}}
            title="انتخاب"
          />
        </div>
      </div>
      <MediaStep galleryPreview={galleryPreview} imageUploadState={imageUploadState} onDeleteUploadedImage={onDeleteUploadedImage} onImageUpload={onImageUpload} setForm={setForm} setGalleryPreview={setGalleryPreview} />
      <VideosStep
        isTrailerVideoUploading={isTrailerVideoUploading}
        onVideoUpload={onVideoUpload}
        setForm={setForm}
        setTrailerThumbnailPreview={setTrailerThumbnailPreview}
        trailerThumbnailPreview={trailerThumbnailPreview}
        trailerVideoPreview={trailerVideoPreview}
      />
    </div>
  );
}

export function RelationsStep({
  categoryOptions,
  collectionOptions,
  companyOptions,
  form,
  gameKeywordOptions,
  genreOptions,
  onChange,
  onQuickCreate,
  setArrayField,
}) {
  const toggleGenresVisibility = () => {
    onChange?.({
      target: {
        checked: !form.showGenresInCategories,
        name: "showGenresInCategories",
        type: "checkbox",
      },
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_56px_48px]">
        <MultiSelectDropdown label="پلتفرم" onChange={(value) => setArrayField("genres", value)} options={genreOptions} value={form.genres} />
        <button
          aria-label="افزودن ژانر"
          className="mt-5 inline-flex h-14 w-14 items-center justify-center rounded-xl border border-emerald-700 bg-emerald-600 !text-white dark:border-blue-700 dark:bg-blue-600 [&_svg]:!text-white"
          onClick={() => onQuickCreate?.("genre", { field: "genres" })}
          title="افزودن ژانر"
          type="button"
        >
          <Plus className="h-7 w-7 !text-white" style={{ color: "#fff" }} />
        </button>
        <button
          aria-label={form.showGenresInCategories ? "تغییر نمایش ژانرها در دسته‌بندی" : "تغییر نمایش ژانرها در دسته‌بندی"}
          className={`mt-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border transition ${
            form.showGenresInCategories
              ? "border-amber-400 bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300"
              : "border-zinc-200 bg-white text-zinc-600 hover:border-emerald-500 hover:text-emerald-600 dark:border-zinc-800 dark:bg-black dark:text-zinc-300 dark:hover:border-blue-500 dark:hover:text-blue-300"
          }`}
          onClick={toggleGenresVisibility}
          title={form.showGenresInCategories ? "تغییر نمایش ژانرها در دسته‌بندی" : "تغییر نمایش ژانرها در دسته‌بندی"}
          type="button"
        >
          {form.showGenresInCategories ? <OutlineEyeInvisible className="h-5 w-5" /> : <OutlineEye className="h-5 w-5" />}
        </button>
      </div>
      <QuickCreateField label="دسته‌بندی" onCreate={() => onQuickCreate?.("category", { field: "category" })}>
        <SingleSelectDropdown label="دسته‌بندی" name="category" onChange={onChange} options={categoryOptions} value={form.category} />
      </QuickCreateField>
      <QuickCreateField label="پلتفرم" onCreate={() => onQuickCreate?.("gameCollection", { field: "collections" })}>
        <MultiSelectDropdown label="کالکشن‌های نمایش" onChange={(value) => setArrayField("collections", value)} options={collectionOptions} value={form.collections} />
      </QuickCreateField>
      <QuickCreateField label="کلمات کلیدی بازی" onCreate={() => onQuickCreate?.("gameKeyword", { field: "gameKeywords" })}>
        <MultiSelectDropdown label="کلمات کلیدی بازی" onChange={(value) => setArrayField("gameKeywords", value)} options={gameKeywordOptions} value={form.gameKeywords} />
      </QuickCreateField>
      <QuickCreateField label="سازنده‌ها" onCreate={() => onQuickCreate?.("company", { field: "developers" })}>
        <MultiSelectDropdown label="دسته‌بندی" onChange={(value) => setArrayField("developers", value)} options={companyOptions} value={form.developers} />
      </QuickCreateField>
      <QuickCreateField label="سازنده‌ها" onCreate={() => onQuickCreate?.("company", { field: "publishers" })}>
        <MultiSelectDropdown label="پلتفرم" onChange={(value) => setArrayField("publishers", value)} options={companyOptions} value={form.publishers} />
      </QuickCreateField>
    </div>
  );
}

export function PlatformReleasesStep({ form, onQuickCreate, platformOptions, setArrayField }) {
  return (
    <PlatformReleaseRowsEditor
      items={form.platformReleases}
      onChange={(value) => setArrayField("platformReleases", value)}
      onCreatePlatform={(target) => onQuickCreate?.("platform", target)}
      platformOptions={platformOptions}
    />
  );
}

export function PlayersStep({ form, offlinePlayerOptions, onChange, setArrayField }) {
  return (
    <div className="space-y-4">
      <SingleSelectDropdown
        label="بازیکنان آفلاین"
        name="offlinePlayers"
        onChange={(event) => setArrayField("offlinePlayers", event.target.value ? [event.target.value] : [])}
        options={offlinePlayerOptions}
        value={form.offlinePlayers?.[0] || ""}
      />
      <div className="space-y-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
          <StatusSwitch
            checked={form.hasOnlineMode}
            id="hasOnlineMode"
            label="حالت آنلاین"
            name="hasOnlineMode"
            onChange={onChange}
          />
          {form.hasOnlineMode ? (
            <TextField
              label=""
              name="onlinePlayerCount"
              onChange={onChange}
              placeholder="مثلا ۲ تا ۸ نفر"
              value={form.onlinePlayerCount}
            />
          ) : null}
        </div>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
          <StatusSwitch
            checked={form.hasMultiplayerMode}
            id="hasMultiplayerMode"
            label="کلمات کلیدی بازی"
            name="hasMultiplayerMode"
            onChange={onChange}
          />
          {form.hasMultiplayerMode ? (
            <TextField
              label=""
              name="multiplayerPlayerCount"
              onChange={onChange}
              placeholder="مثلا ۲ تا ۸ نفر"
              value={form.multiplayerPlayerCount}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function RelatedGamesStep({ form, relatedGameOptions, setArrayField }) {
  return (
    <div className="grid gap-4">
      <MultiSelectDropdown
        label="بازی‌های مشابه"
        onChange={(value) => setArrayField("relatedGames", value)}
        options={relatedGameOptions}
        value={form.relatedGames}
      />
    </div>
  );
}

export function ReleaseStep({ ageRatingOptions, form, onChange, setForm }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <SingleSelectDropdown label="رده سنی" name="ageRating" onChange={onChange} options={ageRatingOptions} value={form.ageRating} />
      <TextField label="زمان تقریبی گیم‌پلی" name="gameplayTime" onChange={onChange} placeholder="مثلا 25 ساعت" value={form.gameplayTime} />
      <TextField label="امتیاز متاکریتیک" name="metacriticScore" onChange={onChange} type="number" value={form.metacriticScore} />
      <TextField dir="ltr" label="وب‌سایت رسمی" name="officialWebsite" onChange={onChange} value={form.officialWebsite} />
      <div className="md:col-span-3">
        <StatusSwitch checked={form.isFeatured} id="isFeatured" label="بازی پرطرفدار" name="isFeatured" onChange={onChange} />
      </div>
      <div className="md:col-span-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-4 space-y-3">
        <StatusSwitch checked={form.hasDubbing} id="hasDubbing" label="دوبله دارد" name="hasDubbing" onChange={onChange} />
        <StatusSwitch checked={form.hasSubtitle} id="hasSubtitle" label="وب‌سایت رسمی" name="hasSubtitle" onChange={onChange} />
        <StatusSwitch
          checked={form.hasFreePersianSubtitle}
          id="hasFreePersianSubtitle"
          label="زیرنویس فارسی رایگان"
          name="hasFreePersianSubtitle"
          onChange={onChange}
        />
        <StatusSwitch
          checked={form.hasPaidPersianSubtitle}
          id="hasPaidPersianSubtitle"
          label="زیرنویس فارسی پولی"
          name="hasPaidPersianSubtitle"
          onChange={onChange}
        />
      </div>
    </div>
  );
}

export function PlatformSizesStep({ form, onQuickCreate, platformOptions, setArrayField }) {
  return (
    <div className="space-y-4">
      <ObjectRowsEditor
        columns={[
          { label: "پلتفرم", options: platformOptions },
          { label: "نسخه", placeholder: "مثلا Standard / PS5" },
          { label: "حجم", placeholder: "مثلا 78 GB" },
        ]}
        items={form.platformSizes}
        onChange={(value) => setArrayField("platformSizes", value)}
        onCreatePlatform={(target) => onQuickCreate?.("platform", target)}
        title="حجم نسخه‌های پلتفرم"
      />
    </div>
  );
}

export function DiscoveryStep({
  ageRatingOptions,
  form,
  gameModeOptions,
  genreOptions,
  offlinePlayerOptions,
  setArrayField,
  setForm,
}) {
  const updateFilterValues = (patch) => {
    setForm((prev) => ({
      ...prev,
      filterValues: {
        ...(prev.filterValues || {}),
        ...patch,
      },
    }));
  };

  const filterValues = form.filterValues || {};

  return (
    <div className="grid gap-4">
      <MultiSelectDropdown
        label="ژانرهای فیلتر"
        onChange={(value) => updateFilterValues({ genres: value })}
        options={genreOptions}
        value={filterValues.genres || []}
      />
      <MultiSelectDropdown
        label="رده سنی فیلتر"
        onChange={(value) => updateFilterValues({ ageRatings: value })}
        options={ageRatingOptions}
        value={filterValues.ageRatings || []}
      />
      <MultiSelectDropdown
        label="اسلاگ بازی"
        onChange={(value) => updateFilterValues({ gameModes: value })}
        options={gameModeOptions}
        value={filterValues.gameModes || []}
      />
      <MultiSelectDropdown
        label="بازیکنان آفلاین"
        onChange={(value) => updateFilterValues({ offlinePlayers: value })}
        options={offlinePlayerOptions}
        value={filterValues.offlinePlayers || []}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          label="دوبله دارد"
          name="filter-price-min"
          onChange={(event) => updateFilterValues({ priceMin: event.target.value })}
          type="number"
          value={filterValues.priceMin ?? ""}
        />
        <TextField
          label="حداکثر قیمت"
          name="filter-price-max"
          onChange={(event) => updateFilterValues({ priceMax: event.target.value })}
          type="number"
          value={filterValues.priceMax ?? ""}
        />
        <TextField
          label="حداقل حجم GB"
          name="filter-size-min"
          onChange={(event) => updateFilterValues({ sizeMinGb: event.target.value })}
          type="number"
          value={filterValues.sizeMinGb ?? ""}
        />
        <TextField
          label="حداکثر حجم GB"
          name="filter-size-max"
          onChange={(event) => updateFilterValues({ sizeMaxGb: event.target.value })}
          type="number"
          value={filterValues.sizeMaxGb ?? ""}
        />
      </div>
    </div>
  );
}

export function DlcEditionStep({ form, imageUploadState, onDeleteUploadedImage, onImageUpload, setArrayField }) {
  return (
    <div className="space-y-4">
      <DlcRowsEditor
        title="DLC ها"
        imageUploadState={imageUploadState}
        items={form.dlcs}
        onChange={(value) => setArrayField("dlcs", value)}
        onDeleteUploadedImage={onDeleteUploadedImage}
        onImageUpload={onImageUpload}
        typeOptions={dlcTypeOptions}
      />
      <EditionRowsEditor
        title="نسخه‌های اضافه"
        imageUploadState={imageUploadState}
        items={form.extraEditions}
        onChange={(value) => setArrayField("extraEditions", value)}
        onDeleteUploadedImage={onDeleteUploadedImage}
        onImageUpload={onImageUpload}
      />
    </div>
  );
}

export function DlcStep({ form, imageUploadState, onDeleteUploadedImage, onImageUpload, setArrayField }) {
  return (
    <DlcRowsEditor
      title="DLC ها"
      imageUploadState={imageUploadState}
      items={form.dlcs}
      onChange={(value) => setArrayField("dlcs", value)}
      onDeleteUploadedImage={onDeleteUploadedImage}
      onImageUpload={onImageUpload}
      typeOptions={dlcTypeOptions}
    />
  );
}

export function EditionsStep({ form, imageUploadState, onDeleteUploadedImage, onImageUpload, setArrayField }) {
  return (
    <EditionRowsEditor
      title="نسخه‌های اضافه"
      imageUploadState={imageUploadState}
      items={form.extraEditions}
      onChange={(value) => setArrayField("extraEditions", value)}
      onDeleteUploadedImage={onDeleteUploadedImage}
      onImageUpload={onImageUpload}
    />
  );
}

export function SeoTagsStep({ form, onQuickCreate, setArrayField, tagOptions }) {
  return (
    <QuickCreateField label="تگ‌ها" onCreate={() => onQuickCreate?.("tag", { field: "tags" })}>
      <MultiSelectDropdown
        label="تگ‌های سئو"
        onChange={(value) => setArrayField("tags", value)}
        options={tagOptions}
        value={form.tags}
      />
    </QuickCreateField>
  );
}

export function PatchStep({ form, onChange, patchImagePreview, setForm, setPatchImagePreview }) {
  return (
    <div className="grid gap-4">
      <TextField label="عنوان پچ" name="patchTitle" onChange={onChange} value={form.patchTitle} />
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-4">
        <span className="mb-3 block text-sm text-zinc-700 dark:text-zinc-300">عکس پچ</span>
        <ThumbnailUpload
            immediateUpload={false}
          name="patchImage"
          preview={patchImagePreview}
          setThumbnail={(file) => setForm((prev) => ({ ...prev, patchImage: file }))}
          setThumbnailPreview={setPatchImagePreview}
          title="انتخاب"
        />
      </div>
    </div>
  );
}

export function ReviewStep({ form, setArrayField }) {
  return (
    <div className="grid gap-4">
      <LinkRowsEditor label="لینک‌های نقد و بررسی" items={form.reviewItems} onChange={(value) => setArrayField("reviewItems", value)} />
    </div>
  );
}

export function SummaryStep({ form, onChange }) {
  return (
    <div className="grid gap-4">
      <TextareaField label="خلاصه" name="shortDescription" onChange={onChange} rows={4} value={form.shortDescription} />
    </div>
  );
}

export function SocialStep({ form, setArrayField }) {
  return (
    <SocialLinksInput
      label="شبکه‌های اجتماعی بازی"
      onChange={(value) => setArrayField("socialLinks", value)}
      value={form.socialLinks}
    />
  );
}

export function DescriptionStep({ form, setForm }) {
  return (
    <div className="grid gap-4">
      <FormPageBuilder
        label="دوبله دارد"
        onChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
        value={form.description}
      />
    </div>
  );
}

export function MediaStep({ galleryPreview, imageUploadState = {}, onDeleteUploadedImage, onImageUpload, setForm, setGalleryPreview }) {
  const [draggedId, setDraggedId] = React.useState(null);

  const syncGallery = (updater) => {
    setGalleryPreview((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      setForm((form) => ({ ...form, gallery: next }));
      return next;
    });
  };

  const appendFiles = (files) => {
    const selectedFiles = Array.from(files || []);
    if (!selectedFiles.length) return;

    const nextItems = selectedFiles.map((file, index) => ({
      id: `gallery-${Date.now()}-${index}-${file.name}`,
      url: URL.createObjectURL(file),
      type: "image",
      kind: "new",
      file,
    }));

    syncGallery((prev) => [...prev, ...nextItems]);

    nextItems.forEach(async (item) => {
      const media = await onImageUpload?.(item.id, item.file, {
        resizeFit: "cover",
        resizeHeight: 1080,
        resizeWidth: 1920,
      });
      if (!media) {
        syncGallery((prev) => prev.map((current) => (current.id === item.id ? { ...current, file: undefined, kind: "error" } : current)));
        return;
      }
      syncGallery((prev) =>
        prev.map((current) =>
          current.id === item.id
            ? {
                ...current,
                ...media,
                file: undefined,
                kind: "uploaded",
                media,
                url: media.url,
              }
            : current
        )
      );
    });
  };

  const replaceFile = (id, file) => {
    if (!file) return;
    const nextId = `gallery-${Date.now()}-${file.name}`;

    syncGallery((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              id: nextId,
              url: URL.createObjectURL(file),
              type: "image",
              kind: "new",
              file,
            }
          : item
      )
    );

    (async () => {
      const media = await onImageUpload?.(nextId, file, {
        resizeFit: "cover",
        resizeHeight: 1080,
        resizeWidth: 1920,
      });
      if (!media) {
        syncGallery((prev) => prev.map((current) => (current.id === nextId ? { ...current, file: undefined, kind: "error" } : current)));
        return;
      }
      syncGallery((prev) =>
        prev.map((current) =>
          current.id === nextId
            ? {
                ...current,
                ...media,
                file: undefined,
                kind: "uploaded",
                media,
                url: media.url,
              }
            : current
        )
      );
    })();
  };

  const removeItem = (item) => {
    onDeleteUploadedImage?.(item.id, item.media || item);
    syncGallery((prev) => prev.filter((current) => current.id !== item.id));
  };

  const moveItem = (targetId) => {
    if (!draggedId || draggedId === targetId) return;

    syncGallery((prev) => {
      const fromIndex = prev.findIndex((item) => item.id === draggedId);
      const toIndex = prev.findIndex((item) => item.id === targetId);
      if (fromIndex < 0 || toIndex < 0) return prev;

      const next = [...prev];
      const [movedItem] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, movedItem);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-4">
          <span className="mb-3 block text-sm text-zinc-700 dark:text-zinc-300">گالری</span>
          <ThumbnailUpload
            immediateUpload={false}
            multiple
            name="gallery"
            preview=""
            setThumbnail={appendFiles}
            setThumbnailPreview={() => {}}
            showPreview={false}
            title="انتخاب"
          />
          {galleryPreview.length ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {galleryPreview.map((item, index) => (
                <div
                  className={`group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-2 transition ${
                    draggedId === item.id ? "opacity-60 ring-1 ring-white" : "hover:border-zinc-600"
                  }`}
                  draggable
                  key={item.id || `${item.url}-${index}`}
                  onDragEnd={() => setDraggedId(null)}
                  onDragEnter={() => moveItem(item.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDragStart={() => setDraggedId(item.id)}
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
                    <img alt="gallery" className="h-full w-full object-cover" src={item.url} />
                    <UploadStateOverlay state={imageUploadState[item.id]} />
                    <button
                      aria-label="حذف تصویر"
                      className="absolute left-2 top-2 z-40 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-600/90 !text-white opacity-0 shadow-lg transition hover:bg-red-500 group-hover:opacity-100 [&_svg]:!text-white"
                      onClick={() => removeItem(item)}
                      title="حذف"
                      type="button"
                    >
                      <Trash className="h-4 w-4 !text-white" style={{ color: "#fff" }} />
                    </button>
                    <span className="absolute right-2 top-2 rounded-md bg-white dark:bg-black/70 px-2 py-1 text-[10px] text-zinc-950 dark:text-white">
                      {index + 1}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-2">
                    <label
                      aria-label="ویرایش تصویر"
                      className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 transition hover:border-white hover:text-zinc-950 dark:text-white"
                      title="انتخاب"
                    >
                      <Edit className="h-4 w-4" />
                      <input
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => replaceFile(item.id, event.target.files?.[0])}
                        type="file"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 px-4 py-8 text-center text-sm text-zinc-500">
              هنوز تصویری برای گالری انتخاب نشده است.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function VideosStep({
  isTrailerVideoUploading = false,
  onVideoUpload,
  setForm,
  setTrailerThumbnailPreview,
  trailerThumbnailPreview,
  trailerVideoPreview,
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-4">
          <span className="mb-3 block text-sm text-zinc-700 dark:text-zinc-300">گالری</span>
          <ThumbnailUpload
            immediateUpload={false}
            accept="video/*"
            disabled={isTrailerVideoUploading}
            imageSize={150}
            name="trailerVideo"
            poster={trailerThumbnailPreview}
            preview={trailerVideoPreview}
            previewShape="square"
            setThumbnail={(file) => onVideoUpload?.("trailerVideo", file)}
            setThumbnailPreview={() => {}}
            title="انتخاب"
          />
          {isTrailerVideoUploading ? <p className="mt-3 text-xs text-amber-300">در حال آپلود تریلر روی Arvan...</p> : null}
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-4">
          <span className="mb-3 block text-sm text-zinc-700 dark:text-zinc-300">تصویر تریلر</span>
          <ThumbnailUpload
            immediateUpload={false}
            imageSize={150}
            name="trailerThumbnail"
            preview={trailerThumbnailPreview}
            previewShape="square"
            setThumbnail={(file) => setForm((prev) => ({ ...prev, trailerThumbnail: file }))}
            setThumbnailPreview={setTrailerThumbnailPreview}
            title="انتخاب"
          />
        </div>
      </div>
    </div>
  );
}



