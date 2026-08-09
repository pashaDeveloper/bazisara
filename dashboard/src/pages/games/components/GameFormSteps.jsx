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
import { useSuggestGamesQuery, useSuggestPlayStationGalleryQuery } from "@/services/gameApi";

const borderlessControlClass = "";
const borderlessIconClass = "";
const borderlessSwitchClass = "border-0 shadow-none";
const playStationGalleryDragType = "application/x-playstation-gallery-image";

function ImageSizeBadge({ src }) {
  const [size, setSize] = React.useState(null);

  React.useEffect(() => {
    const url = String(src || "").trim();
    if (!url) {
      setSize(null);
      return undefined;
    }

    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (!cancelled) setSize({ height: image.naturalHeight, width: image.naturalWidth });
    };
    image.onerror = () => {
      if (!cancelled) setSize(null);
    };
    image.src = url;

    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!size?.width || !size?.height) return null;

  return (
    <span
      className="absolute bottom-2 left-2 z-20 rounded-md bg-white px-2 py-1 text-[10px] font-bold !text-zinc-950 shadow-md ring-1 ring-black/20"
      style={{ backgroundColor: "#fff", color: "#111827" }}
    >
      {size.width} × {size.height}
    </span>
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

function splitListValue(value) {
  return String(value || "")
    .split(/[،,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinListValue(items) {
  return items.map((item) => String(item || "").trim()).filter(Boolean).join("، ");
}

function ListTextField({ label, name, onChange, placeholder, value }) {
  const [draft, setDraft] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const rootRef = React.useRef(null);
  const items = splitListValue(value);

  const emit = (nextItems) => onChange?.(joinListValue(nextItems));

  const addDraft = () => {
    const nextValue = draft.trim();
    if (!nextValue) return;
    emit([...items, nextValue]);
    setDraft("");
    setIsOpen(true);
  };

  const removeItem = (index) => {
    emit(items.filter((_, itemIndex) => itemIndex !== index));
  };

  React.useEffect(() => {
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div className="relative flex flex-col gap-y-1" ref={rootRef}>
      <span className="text-sm text-zinc-700 dark:text-gray-100">{label}</span>
      <div className="relative">
        <button
          aria-label={`باز کردن ${label}`}
          className="absolute right-0 top-0 z-10 flex h-full w-12 items-center justify-center rounded-r-primary rounded-l-none border border-l border-gray-300 bg-gray-200 text-gray-700 shadow-sm transition hover:bg-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          <Plus className="h-5 w-5" />
        </button>
        <input
          className="h-10 w-full cursor-default border bg-white py-2 pl-3 pr-14 text-sm text-zinc-900 outline-none transition focus:border-green-400 focus:ring-0 dark:bg-[#0a2d4d] dark:text-gray-100 dark:focus:border-blue-500"
          name={name}
          onClick={() => setIsOpen(true)}
          placeholder={placeholder || label}
          readOnly
          value={items.length ? items.join("، ") : ""}
        />
      </div>
      {isOpen ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-gray-600 dark:bg-[#08243d]">
          <div className="max-h-44 space-y-1 overflow-y-auto">
            {items.length ? (
              items.map((item, index) => (
                <div
                  className="flex min-h-9 items-center justify-between gap-2 rounded-lg bg-zinc-50 px-2 text-sm text-zinc-800 dark:bg-gray-800 dark:text-gray-100"
                  key={`${name}-dropdown-item-${index}-${item}`}
                >
                  <span className="min-w-0 flex-1 truncate">{item}</span>
                  <button
                    aria-label="حذف مورد"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition hover:bg-red-100 hover:text-red-600 dark:text-gray-300 dark:hover:bg-red-950"
                    onClick={() => removeItem(index)}
                    type="button"
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="rounded-lg bg-zinc-50 px-2 py-2 text-xs text-zinc-500 dark:bg-gray-800 dark:text-gray-300">
                موردی ثبت نشده است
              </div>
            )}
          </div>
          <div className="mt-2 flex gap-2 border-t border-zinc-100 pt-2 dark:border-gray-700">
            <input
              autoFocus
              className="h-9 min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-green-400 dark:border-gray-600 dark:bg-[#0a2d4d] dark:text-gray-100"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addDraft();
                }
              }}
              placeholder={placeholder || label}
              value={draft}
            />
            <button
              aria-label={`افزودن ${label}`}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-gray-100 text-zinc-700 transition hover:border-green-500 hover:text-green-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              onClick={addDraft}
              type="button"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function GameTitleSuggestField({ form, onChange, setForm }) {
  const [debouncedTitle, setDebouncedTitle] = React.useState("");
  const [debouncedTitleId, setDebouncedTitleId] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const rootRef = React.useRef(null);
  const title = String(form.title || "");
  const titleId = String(form.playstationTitleId || "");
  const isNumericTitleIdOnly = /^\d{3,}$/.test(titleId.trim()) && title.trim().length < 2;

  React.useEffect(() => {
    const value = title.trim();
    const timer = window.setTimeout(() => setDebouncedTitle(value), 300);
    return () => window.clearTimeout(timer);
  }, [title]);

  React.useEffect(() => {
    const value = titleId.trim();
    const timer = window.setTimeout(() => setDebouncedTitleId(value), 300);
    return () => window.clearTimeout(timer);
  }, [titleId]);

  React.useEffect(() => {
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const { data, isFetching } = useSuggestGamesQuery(
    { q: debouncedTitle, titleId: debouncedTitleId },
    {
      skip: isNumericTitleIdOnly || (debouncedTitle.length < 2 && debouncedTitleId.length < 2),
    }
  );
  const shouldShowSuggestions = title.trim().length >= 2 || titleId.trim().length >= 2;
  const suggestions = Array.isArray(data?.data) ? data.data : [];

  const selectSuggestion = (item) => {
    const nextTitle = String(item.title || "").trim();
    if (!nextTitle) return;

    setForm((prev) => ({
      ...prev,
      title: nextTitle,
      playstationTitleId: item.source === "playstation" ? String(item.titleId || item.externalId || prev.playstationTitleId || "").trim() : prev.playstationTitleId,
      slug: prev.slug || makeGameSlug(nextTitle),
    }));
    setIsOpen(false);
  };

  return (
    <div className="relative grid gap-2 sm:grid-cols-[minmax(0,1fr)_150px]" ref={rootRef}>
      <label className="flex flex-col gap-y-1">
        <span className="text-sm text-zinc-700 dark:text-gray-100">عنوان بازی *</span>
        <input
          autoComplete="off"
          className="h-10 w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-zinc-900 outline-none transition focus:border-green-400 focus:ring-0 dark:border-gray-600 dark:bg-[#0a2d4d] dark:text-gray-100 dark:focus:border-blue-500"
          name="title"
          onChange={(event) => {
            onChange(event);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="مثلا Rider"
          value={title}
        />
      </label>
      <label className="flex flex-col gap-y-1">
        <span className="text-xs text-zinc-500 dark:text-gray-300">PS Title ID / Code</span>
        <input
          autoComplete="off"
          className="h-10 w-full rounded-full border border-gray-300 bg-white px-3 py-2 text-xs text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-0 dark:border-gray-600 dark:bg-[#0a2d4d] dark:text-gray-100"
          dir="ltr"
          name="playstationTitleId"
          onChange={(event) => {
            onChange(event);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="CUSA08519 / PPSA01490"
          value={titleId}
        />
      </label>
      {isOpen && shouldShowSuggestions ? (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-[#08243f]">
          {isNumericTitleIdOnly ? (
            <div className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-300">برای کد ناشر مثل 1004، عنوان بازی را هم وارد کنید.</div>
          ) : isFetching ? (
            <div className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-300">در حال جستجوی عنوان...</div>
          ) : suggestions.length ? (
            <div className="max-h-72 overflow-y-auto py-1">
              {suggestions.map((item) => (
                <button
                  className="flex w-full items-center gap-3 px-3 py-2 text-right transition hover:bg-zinc-50 dark:hover:bg-white/5"
                  key={`${item.source}-${item.externalId || item.title}`}
                  onClick={() => selectSuggestion(item)}
                  type="button"
                >
                  {item.image ? (
                    <img alt="" className="h-10 w-10 rounded-lg object-cover" src={item.image} />
                  ) : (
                    <span className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-white/10" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-zinc-800 dark:text-zinc-100" dir="ltr">{item.title}</span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">{item.platform || item.source}</span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-300">پیشنهادی پیدا نشد</div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function PlayStationGallerySuggestions({ gameTitle, onAdd, onAssign, onClear, playstationTitleId, selectedSuggestion }) {
  const [debouncedTitle, setDebouncedTitle] = React.useState("");
  const [debouncedTitleId, setDebouncedTitleId] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedImage, setSelectedImage] = React.useState(null);
  const title = String(gameTitle || "").trim();
  const titleId = String(playstationTitleId || "").trim();
  const isNumericTitleIdOnly = /^\d{3,}$/.test(titleId) && title.length < 2;
  const pageSize = 12;
  const selectedUrl = String(selectedSuggestion?.url || "");

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedTitle(title), 350);
    return () => window.clearTimeout(timer);
  }, [title]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedTitleId(titleId), 350);
    return () => window.clearTimeout(timer);
  }, [titleId]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedTitle, debouncedTitleId]);

  const { data, isFetching } = useSuggestPlayStationGalleryQuery(
    { q: debouncedTitle, titleId: debouncedTitleId },
    { skip: isNumericTitleIdOnly || (debouncedTitle.length < 2 && debouncedTitleId.length < 2) }
  );
  const suggestions = Array.isArray(data?.data) ? data.data : [];
  const pageCount = Math.max(1, Math.ceil(suggestions.length / pageSize));
  const visibleSuggestions = suggestions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  React.useEffect(() => {
    setCurrentPage((page) => Math.min(page, pageCount));
  }, [pageCount]);

  const startDrag = (event, item) => {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData(playStationGalleryDragType, JSON.stringify(item));
  };

  if (isNumericTitleIdOnly) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 px-4 py-5 text-center text-xs text-zinc-500 dark:border-zinc-800">
        برای کد ناشر مثل 1004، عنوان بازی را هم وارد کنید.
      </div>
    );
  }

  if (debouncedTitle.length < 2 && debouncedTitleId.length < 2) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 px-4 py-5 text-center text-xs text-zinc-500 dark:border-zinc-800">
        برای پیشنهاد عکس PlayStation، عنوان بازی یا کدی مثل CUSA/PPSA/NPUB را وارد کنید.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <span className="block text-sm font-bold text-zinc-800 dark:text-zinc-100">پیشنهاد تصاویر PlayStation</span>
          <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">PS3 / PS4 / PS5 - انتخاب هر مقصد با اندازه همان بخش آپلود می‌شود</span>
        </div>
        {isFetching ? <span className="text-xs text-zinc-500 dark:text-zinc-400">در حال دریافت...</span> : null}
      </div>
      {suggestions.length ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {visibleSuggestions.map((item) => {
              const isSelected = selectedUrl && selectedUrl === String(item.url || "");

              return (
              <div
                className={`group relative overflow-visible rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:border-green-400 dark:border-zinc-800 dark:bg-black ${
                  isSelected ? "z-50 border-green-400 ring-2 ring-green-500/20" : "z-0"
                }`}
                draggable
                key={`${item.externalId || item.url}`}
                onDragStart={(event) => startDrag(event, item)}
                title="برای افزودن داخل گالری درگ کنید"
              >
                <div className="relative aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                  <img alt={item.title || "PlayStation"} className="h-full w-full object-cover" src={item.url} />
                  <button
                    aria-label="نمایش بزرگ تصویر"
                    className="absolute inset-0 z-10 cursor-zoom-in bg-transparent"
                    onClick={() => setSelectedImage(item)}
                    title="نمایش بزرگ"
                    type="button"
                  />
                  <ImageSizeBadge src={item.url} />
                  <span className="pointer-events-none absolute right-2 top-2 z-20 rounded-md bg-white/95 px-2 py-1 text-[10px] font-bold text-zinc-950 shadow-md ring-1 ring-black/10">
                    {item.platform || "PlayStation"}
                  </span>
                </div>
                <div className="space-y-2 p-2">
                  <span className="block truncate text-xs font-bold text-zinc-700 dark:text-zinc-200" dir="ltr">{item.title}</span>
                  <button
                    className={`inline-flex h-8 w-full items-center justify-center gap-1 rounded-lg px-2 text-xs font-bold transition ${
                      isSelected ? "bg-zinc-900 !text-white hover:bg-zinc-800 dark:bg-white dark:!text-zinc-950 dark:hover:bg-zinc-200" : "bg-green-600 !text-white hover:bg-green-500 [&_svg]:!text-white"
                    }`}
                    onClick={() => (isSelected ? onClear?.() : onAdd?.(item))}
                    type="button"
                  >
                    <Plus className={`h-3.5 w-3.5 ${isSelected ? "dark:!text-zinc-950" : "!text-white"}`} />
                    {isSelected ? "بستن" : "افزودن"}
                  </button>
                  {isSelected ? (
                    <div className="absolute left-2 right-2 top-2 z-50 flex flex-col overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-black/10" dir="rtl" style={{ backgroundColor: "#fff" }}>
                      <button className="h-8 w-full px-3 text-right text-[11px] font-bold !text-zinc-950 transition hover:bg-zinc-100" onClick={() => onAssign?.("cover", item)} style={{ color: "#111827" }} type="button">
                        کارت
                      </button>
                      <button className="h-8 w-full border-t border-zinc-200 px-3 text-right text-[11px] font-bold !text-zinc-950 transition hover:bg-zinc-100" onClick={() => onAssign?.("mobileCover", item)} style={{ color: "#111827" }} type="button">
                        موبایل
                      </button>
                      <button className="h-8 w-full border-t border-zinc-200 px-3 text-right text-[11px] font-bold !text-zinc-950 transition hover:bg-zinc-100" onClick={() => onAssign?.("desktopCover", item)} style={{ color: "#111827" }} type="button">
                        دسکتاپ
                      </button>
                      <button className="h-8 w-full border-t border-zinc-200 px-3 text-right text-[11px] font-bold !text-zinc-950 transition hover:bg-zinc-100" onClick={() => onAssign?.("gallery", item)} style={{ color: "#111827" }} type="button">
                        گالری
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
              );
            })}
          </div>
          {pageCount > 1 ? (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-black">
              <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                صفحه {currentPage} از {pageCount} - {suggestions.length} تصویر
              </span>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-bold text-zinc-700 transition hover:border-green-500 hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-200"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  type="button"
                >
                  قبلی
                </button>
                <button
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-bold text-zinc-700 transition hover:border-green-500 hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-200"
                  disabled={currentPage >= pageCount}
                  onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                  type="button"
                >
                  بعدی
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : isFetching ? null : (
        <div className="rounded-lg border border-dashed border-zinc-200 px-4 py-5 text-center text-xs text-zinc-500 dark:border-zinc-800">
          تصویری از PlayStation برای این عنوان پیدا نشد.
        </div>
      )}
      {selectedImage ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative h-[62vh] w-[92vw] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl lg:w-[33vw]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              aria-label="بستن تصویر"
              className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-lg font-bold text-zinc-950 shadow-lg transition hover:bg-white"
              onClick={() => setSelectedImage(null)}
              type="button"
            >
              ×
            </button>
            <img alt={selectedImage.title || "PlayStation"} className="h-full w-full object-contain" src={selectedImage.url} />
          </div>
        </div>
      ) : null}
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

function formatMoney(value, locale = "fa-IR") {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number <= 0) return "-";
  return number.toLocaleString(locale, {
    maximumFractionDigits: locale === "en-US" ? 2 : 0,
  });
}

function getPlatformText(platformId, platformOptions = []) {
  const option = platformOptions.find((item) => item.value === platformId);
  return String(option?.label || option?.name || platformId || "").toLowerCase();
}

function getCapacityOptions(platformId, platformOptions = []) {
  const text = getPlatformText(platformId, platformOptions);

  if (/playstation|پلی|ps[345]?/.test(text)) {
    return ["ظرفیت ۱", "ظرفیت ۲", "ظرفیت ۳", "ظرفیت کامل"];
  }

  if (/xbox|ایکس|اکس/.test(text)) {
    return ["هوم", "سوئیچ", "ظرفیت کامل"];
  }

  if (/switch|nintendo|نینتندو|سوئیچ/.test(text)) {
    return ["ظرفیت کامل"];
  }

  return ["ظرفیت کامل"];
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

function formatScoreValue(value, decimals = 2) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  return number.toFixed(decimals);
}

function normalizeRatingDetails(details, fallbackScore) {
  const hasScore = details && typeof details === "object" && details.score !== undefined && details.score !== null && details.score !== "";
  const hasFallbackScore = fallbackScore !== undefined && fallbackScore !== null && fallbackScore !== "";

  if (!details || typeof details !== "object") {
    return {
      count: [],
      score: hasFallbackScore ? formatScoreValue(fallbackScore) : "",
      total: "",
    };
  }

  return {
    count: Array.isArray(details.count) ? details.count : [],
    score: hasScore ? formatScoreValue(details.score) : hasFallbackScore ? formatScoreValue(fallbackScore) : "",
    total: details.total ? String(details.total) : "",
  };
}

function toEditableNumber(value) {
  return String(value || "")
    .replace(/[۰-۹]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
    .replace(/[٠-٩]/g, (digit) => "٠١٢٣٤٥٦٧٨٩".indexOf(digit))
    .trim();
}

function clampNumber(value, min, max) {
  const number = Number(toEditableNumber(value));
  if (!Number.isFinite(number)) return "";
  return String(Math.min(max, Math.max(min, number)));
}

function calculateRatingFromCounts(rating, countRows) {
  const rows = countRows.map((item) => ({
    count: clampNumber(item.count, 0, Number.MAX_SAFE_INTEGER),
    score: clampNumber(item.score ?? item.star, 1, 5),
  }));
  const total = rows.reduce((sum, item) => sum + Number(item.count || 0), 0);
  const weighted = rows.reduce((sum, item) => sum + Number(item.score || 0) * Number(item.count || 0), 0);

  return {
    ...rating,
    count: rows,
    score: total > 0 ? (weighted / total).toFixed(2) : rating.score,
    total: total > 0 ? String(total) : rating.total,
  };
}

function moveCaretToEnd(element) {
  const selection = window.getSelection?.();
  const range = document.createRange?.();
  if (!selection || !range) return;
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

function EditableRatingText({ ariaLabel, children, className, max, min, onCommit }) {
  const normalizeValue = (value) => {
    if (min === undefined && max === undefined) return toEditableNumber(value);
    const number = Number(toEditableNumber(value));
    if (!Number.isFinite(number)) return "";
    return String(Math.min(max ?? number, Math.max(min ?? number, number)));
  };

  const handleInput = (event) => {
    if (max === undefined && min === undefined) return;
    const normalized = normalizeValue(event.currentTarget.textContent);
    if (normalized && normalized !== event.currentTarget.textContent) {
      event.currentTarget.textContent = normalized;
      moveCaretToEnd(event.currentTarget);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();
    }
  };

  return (
    <span
      aria-label={ariaLabel}
      className={`${className} cursor-text rounded px-1 outline-none transition focus:bg-white focus:ring-2 focus:ring-green-500/30 dark:focus:bg-zinc-950`}
      contentEditable
      onBlur={(event) => onCommit?.(normalizeValue(event.currentTarget.textContent))}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      role="textbox"
      suppressContentEditableWarning
      tabIndex={0}
    >
      {children}
    </span>
  );
}

function ScoreDetailModal({ details, fallbackScore, isOpen, label, onChange, onClose }) {
  if (!isOpen) return null;

  const rating = normalizeRatingDetails(details, fallbackScore);
  const canEdit = typeof onChange === "function";
  const updateRating = (patch) => {
    if (!canEdit) return;
    onChange({ ...rating, ...patch, count: patch.count || rating.count });
  };
  const updateCountRow = (index, patch) => {
    const rows = rating.count.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
    updateRating(calculateRatingFromCounts(rating, rows));
  };
  const addCountRow = () => {
    const usedScores = new Set(rating.count.map((item) => Number(item.score ?? item.star)).filter(Boolean));
    const nextScore = [5, 4, 3, 2, 1].find((score) => !usedScores.has(score)) || 5;
    updateRating(calculateRatingFromCounts(rating, [...rating.count, { count: "0", score: String(nextScore) }]));
  };
  const removeCountRow = (index) => {
    updateRating(calculateRatingFromCounts(rating, rating.count.filter((_, itemIndex) => itemIndex !== index)));
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{label}</span>
          <button className="rounded-lg border border-zinc-200 px-3 py-1 text-xs text-zinc-600 transition hover:border-zinc-400 dark:border-zinc-800 dark:text-zinc-300" onClick={onClose} type="button">
            بستن
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-zinc-50 p-3 dark:bg-black">
            <span className="block text-zinc-500">امتیاز</span>
            {canEdit ? (
              <EditableRatingText ariaLabel="ویرایش امتیاز" className="mt-1 block text-lg font-bold text-zinc-950 dark:text-white" max={5} min={0} onCommit={(value) => updateRating({ score: clampNumber(value, 0, 5) })}>
                {rating.score || "-"}
              </EditableRatingText>
            ) : (
              <strong className="mt-1 block text-lg text-zinc-950 dark:text-white">{rating.score || "-"}</strong>
            )}
          </div>
          <div className="rounded-xl bg-zinc-50 p-3 dark:bg-black">
            <span className="block text-zinc-500">تعداد رأی</span>
            {canEdit ? (
              <EditableRatingText ariaLabel="ویرایش تعداد رأی" className="mt-1 block text-lg font-bold text-zinc-950 dark:text-white" onCommit={(value) => updateRating({ total: clampNumber(value, 0, Number.MAX_SAFE_INTEGER) })}>
                {rating.total || "-"}
              </EditableRatingText>
            ) : (
              <strong className="mt-1 block text-lg text-zinc-950 dark:text-white">{rating.total || "-"}</strong>
            )}
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {canEdit ? (
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">رأی‌دهندگان</span>
              <button
                aria-label="افزودن ردیف امتیاز"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:border-green-500 hover:text-green-600 dark:border-zinc-800 dark:text-zinc-300"
                onClick={addCountRow}
                title="افزودن ردیف"
                type="button"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : null}
          {rating.count.length ? (
            rating.count.map((item, index) => {
              const score = Number(item.score ?? item.star);
              const count = Number(item.count || 0);
              const total = Number(rating.total || 0);
              const percent = total > 0 ? Math.min(100, Math.round((count / total) * 100)) : 0;

              return (
                <div className={`grid items-center gap-2 text-xs ${canEdit ? "grid-cols-[52px_minmax(0,1fr)_70px_30px]" : "grid-cols-[40px_minmax(0,1fr)_70px]"}`} key={`${index}-${score}-${count}`}>
                  {canEdit ? (
                    <span className="font-bold text-zinc-700 dark:text-zinc-200">
                      <EditableRatingText ariaLabel="ویرایش ستاره" className="inline-block min-w-4 text-center" max={5} min={1} onCommit={(value) => updateCountRow(index, { score: clampNumber(value, 1, 5) })}>
                        {score || ""}
                      </EditableRatingText>
                      ستاره
                    </span>
                  ) : (
                    <span className="font-bold text-zinc-700 dark:text-zinc-200">{score} ستاره</span>
                  )}
                  <span className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <span className="block h-full rounded-full bg-amber-400" style={{ width: `${percent}%` }} />
                  </span>
                  {canEdit ? (
                    <EditableRatingText ariaLabel="ویرایش تعداد رأی ردیف" className="block text-left text-zinc-500" onCommit={(value) => updateCountRow(index, { count: clampNumber(value, 0, Number.MAX_SAFE_INTEGER) })}>
                      {count}
                    </EditableRatingText>
                  ) : (
                    <span className="text-left text-zinc-500">{count.toLocaleString("fa-IR")}</span>
                  )}
                  {canEdit ? (
                    <button
                      aria-label="حذف ردیف امتیاز"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:border-red-500 hover:text-red-500 dark:border-zinc-800"
                      onClick={() => removeCountRow(index)}
                      title="حذف"
                      type="button"
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>
              );
            })
          ) : (
            <p className="text-xs text-zinc-500">جزئیات رأی برای این منبع ثبت نشده است.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreInput({ details, label, max, min, name, onChange, onDetailsChange, step, value }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const handleDetailsChange = (nextDetails) => {
    onDetailsChange?.(nextDetails);
    if (nextDetails?.score !== undefined && nextDetails.score !== null && nextDetails.score !== "") {
      onChange?.({ target: { name, value: nextDetails.score } });
    }
  };

  return (
    <div className="space-y-2">
      <TextField className={borderlessControlClass} iconClassName={borderlessIconClass} label={label} max={max} min={min} name={name} onChange={onChange} step={step} type="number" value={value} />
      <button
        className="h-8 w-full rounded-lg border border-zinc-200 bg-zinc-50 text-xs font-bold text-zinc-600 transition hover:border-green-500 hover:text-green-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        نمایش جزئیات
      </button>
      <ScoreDetailModal details={details} fallbackScore={value} isOpen={isOpen} label={label} onChange={onDetailsChange ? handleDetailsChange : undefined} onClose={() => setIsOpen(false)} />
    </div>
  );
}

function PlayStationIcon({ className = "" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9.5 3.2c2.8.8 5.3 1.8 5.3 5.3c0 3.2-1.9 4.5-4.2 3.5V6.6c0-.6-.1-1-.5-1.1c-.3-.1-.6.1-.6.7v13.2l-3.1-1V2.6c1 .2 2 .4 3.1.6Z" />
      <path d="M12 16.3l5.1-1.8c.6-.2.7-.6.2-.8c-.5-.2-1.4-.1-2 .1L12 15v-2l.2-.1c1.4-.5 3.4-.8 4.9-.5c1.8.3 2.7 1.1 2.7 2.1c0 .9-.6 1.6-2 2.1L12 18.7v-2.4Z" />
      <path d="M5.4 17.8c-1.7-.5-2.7-1.2-2.7-2.2c0-1.2 1.5-2.1 4.2-2.8v2.1l-1.1.4c-.6.2-.7.5-.2.7c.5.2 1.3.1 1.9-.1l.9-.3v2.1c-1.1.3-2.1.4-3 .1Z" />
    </svg>
  );
}

function XboxIcon({ className = "" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2" />
      <path d="M6.7 6.8c2.2.5 4 1.8 5.3 3.7c1.3-1.9 3.1-3.2 5.3-3.7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="M7.4 17.3c1.2-2 2.8-3.8 4.6-5.2c1.8 1.4 3.4 3.2 4.6 5.2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function PlatformTrophiesPreview({ onFetch, platform = "xbox", state }) {
  const achievements = Array.isArray(state?.achievements) ? state.achievements : [];
  const visibleAchievements = achievements.slice(0, 12);
  const isPlayStation = platform === "playstation";
  const Icon = isPlayStation ? PlayStationIcon : XboxIcon;
  const label = isPlayStation ? "تروفی‌های PlayStation" : "تروفی‌های Xbox";
  const badgeClassName = isPlayStation ? "bg-blue-600 text-white" : "bg-emerald-600 text-white";
  const fallbackIconClassName = isPlayStation ? "text-blue-600" : "text-emerald-600";
  const meta = isPlayStation
    ? [state?.sourceTitle, state?.platform, state?.npCommunicationId ? `NP: ${state.npCommunicationId}` : ""]
    : [state?.sourceTitle, state?.titleId ? `Title ID: ${state.titleId}` : ""];
  const statusClassName =
    state?.status === "success"
      ? "text-emerald-600 dark:text-emerald-400"
      : state?.status === "error"
        ? "text-red-500"
        : "text-zinc-500";

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-black sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            aria-label={`دریافت ${label}`}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${badgeClassName} transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70`}
            disabled={state?.status === "loading"}
            onClick={onFetch}
            title={`دریافت ${label}`}
            type="button"
          >
            <Icon className="h-5 w-5 !text-white" />
          </button>
          <div className="min-w-0">
            <div className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{label}</div>
            {meta.some(Boolean) ? (
              <div className="truncate text-[11px] text-zinc-500" dir="ltr">
                {meta.filter(Boolean).join(" · ")}
              </div>
            ) : null}
          </div>
        </div>
        {state?.total ? (
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
            {state.total}
          </span>
        ) : null}
      </div>

      {state?.message ? <p className={`mt-3 text-xs ${statusClassName}`}>{state.message}</p> : null}

      {state?.status === "loading" ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
          ))}
        </div>
      ) : null}

      {visibleAchievements.length ? (
        <div className="mt-3 grid max-h-80 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
          {visibleAchievements.map((item) => (
            <div key={item.id || item.name} className="grid grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-zinc-100 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-white dark:bg-zinc-900">
                {item.icon ? (
                  <img alt="" className="h-full w-full object-cover" src={item.icon} />
                ) : (
                  <Icon className={`h-5 w-5 ${fallbackIconClassName}`} />
                )}
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs font-bold text-zinc-800 dark:text-zinc-100" dir="ltr">{item.name || (isPlayStation ? "Trophy" : "Achievement")}</div>
                {item.description ? (
                  <div className="mt-1 line-clamp-1 text-[11px] text-zinc-500" dir="ltr">{item.description}</div>
                ) : null}
              </div>
              {item.gamerscore !== null && item.gamerscore !== undefined ? (
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {item.gamerscore}G
                </span>
              ) : item.type ? (
                <span className="rounded-full bg-blue-100 px-2 py-1 text-[11px] font-bold capitalize text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {item.type}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
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
    <div className="space-y-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-3 sm:p-4">
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
              className="h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black px-2.5 text-xs text-zinc-950 dark:text-white outline-none transition focus:border-white sm:h-12 sm:rounded-xl sm:px-3 sm:text-sm"
              onChange={(event) => updateItem(index, event.target.value)}
              placeholder={placeholder}
              value={item}
            />
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 transition hover:border-red-500 hover:text-red-400 sm:h-12 sm:w-12 sm:rounded-xl"
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
              className="mt-6 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 transition hover:border-red-500 hover:text-red-400"
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
              className="mt-6 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 transition hover:border-red-500 hover:text-red-400"
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

function ImageAltOverlay({ onChange, value }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="absolute bottom-1 left-1 right-1 z-50">
      {isOpen ? (
        <input
          autoFocus
          className="h-7 w-full rounded-md border border-white/70 bg-white px-2 text-[11px] font-bold text-zinc-950 outline-none shadow-lg"
          onBlur={() => setIsOpen(false)}
          onChange={(event) => onChange?.(event.target.value)}
          onClick={(event) => event.stopPropagation()}
          placeholder="Alt"
          value={value || ""}
        />
      ) : (
        <button
          className="h-6 w-full rounded-md bg-white/90 px-2 text-[10px] font-black text-zinc-950 shadow transition hover:bg-white"
          onClick={(event) => {
            event.stopPropagation();
            setIsOpen(true);
          }}
          type="button"
        >
          Alt
        </button>
      )}
    </div>
  );
}

function withMediaAlt(media, alt) {
  if (!media) return media;
  if (typeof media === "object") return { ...media, alt };
  return media;
}

function withMediaBlur(media, blur, fallbackUrl = "") {
  if (media && typeof media === "object") return { ...media, blur };
  if (fallbackUrl) return { blur, type: "image", url: fallbackUrl };
  return media;
}

function InlineImageUploadButton({ altValue = "", image, name, onAltChange, onChange, onRemove, state, title }) {
  const previewUrl = imageUrl(image, state);

  return (
    <div className="mt-6 flex items-center gap-2">
      {previewUrl ? (
        <div className="group relative h-12 w-12 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
          <img alt="" className="h-full w-full object-cover" src={previewUrl} />
          <UploadStateOverlay state={state} />
          <ImageAltOverlay onChange={onAltChange} value={altValue} />
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
      <label className="py-1 px-4 flex flex-row gap-x-2 dark:bg-blue-100 bg-green-100 border dark:text-blue-700 dark:border-blue-900 border-green-900 text-green-900 rounded-secondary w-fit text-sm cursor-pointer">
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
    <div className="space-y-3  bg-white dark:bg-black p-4">
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
                label="حجم"
                name={`${title}-versionSize-${index}`}
                onChange={(event) => updateItem(index, { versionSize: event.target.value })}
                placeholder="مثلا ۸۵ گیگابایت"
                value={item.versionSize}
              />
              <InlineImageUploadButton
                altValue={item.image?.alt || ""}
                image={item.image}
                name={`dlcImages-${index}`}
                onAltChange={(alt) => updateItem(index, { image: withMediaAlt(item.image, alt) })}
                onChange={async (file) => {
                  const media = await onImageUpload?.(`dlcs-${index}`, file, {
                    resizeFit: "cover",
                    resizeHeight: 768,
                    resizeWidth: 768,
                  });
                  if (media) updateItem(index, { image: withMediaAlt(media, item.image?.alt || "") });
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

function EditionRowsEditor({ imageUploadState = {}, items = [], onChange, onDeleteUploadedImage, onImageUpload, platformOptions = [], title }) {
  const rows = items.length ? items : [{ title: "", versionTitles: "", items: [], image: "" }];
  const [selectedIndexes, setSelectedIndexes] = React.useState([]);
  const [modalTargets, setModalTargets] = React.useState([]);
  const [itemDraft, setItemDraft] = React.useState({
    capacityType: "",
    discountPercent: "",
    platform: "",
    price: "",
  });

  const hasEditionContent = (item) =>
    String(item.title || "").trim() ||
    String(item.versionTitles || "").trim() ||
    (Array.isArray(item.items) && item.items.length) ||
    item.image;

  const updateItem = (index, patch) => {
    const next = rows.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
    onChange?.(next.filter(hasEditionContent));
  };

  const addItem = () => onChange?.([...rows, { title: "", versionTitles: "", items: [], image: "" }]);
  const removeItem = (index) => {
    setSelectedIndexes([]);
    onChange?.(rows.filter((_, itemIndex) => itemIndex !== index));
  };
  const toggleSelectedIndex = (index) => {
    setSelectedIndexes((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index]
    );
  };
  const discountedPrice = (() => {
    const price = Number(itemDraft.price || 0);
    const discount = Math.max(0, Math.min(100, Number(itemDraft.discountPercent || 0)));
    if (!Number.isFinite(price) || price <= 0) return "";
    return Math.max(0, Math.round(price - (price * discount) / 100));
  })();

  const openSelectedModal = () => {
    if (!selectedIndexes.length) return;
    setModalTargets(selectedIndexes);
    setItemDraft({ capacityType: "", discountPercent: "", platform: "", price: "" });
  };

  const capacityOptions = getCapacityOptions(itemDraft.platform, platformOptions).map((item) => ({
    label: item,
    value: item,
  }));

  const updateDraftPlatform = (platform) => {
    const nextOptions = getCapacityOptions(platform, platformOptions);
    setItemDraft((prev) => ({
      ...prev,
      platform,
      capacityType: nextOptions.includes(prev.capacityType) ? prev.capacityType : nextOptions[0] || "",
    }));
  };

  const addEditionItem = () => {
    if (!modalTargets.length) return;
    const nextEntry = {
      ...itemDraft,
      discountedPrice,
    };
    const targetSet = new Set(modalTargets);
    const next = rows.map((item, index) => {
      if (!targetSet.has(index)) return item;
      const currentItems = Array.isArray(item.items) ? item.items : [];
      return { ...item, items: [...currentItems, nextEntry] };
    });
    onChange?.(next.filter(hasEditionContent));
    setModalTargets([]);
  };

  const removeEditionItem = (editionIndex, itemIndex) => {
    const currentItems = Array.isArray(rows[editionIndex]?.items) ? rows[editionIndex].items : [];
    updateItem(editionIndex, { items: currentItems.filter((_, index) => index !== itemIndex) });
  };

  return (
    <div className="space-y-3  p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-zinc-700 dark:text-zinc-300">{title}</span>
        <div className="flex items-center gap-2">
          <button
            aria-label="افزودن مورد به نسخه‌های انتخاب‌شده"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 !text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:!text-zinc-500 dark:disabled:bg-zinc-800 dark:disabled:!text-zinc-500 [&_svg]:!text-white disabled:[&_svg]:!text-zinc-500"
            disabled={!selectedIndexes.length}
            onClick={openSelectedModal}
            title="افزودن مورد به نسخه‌های انتخاب‌شده"
            type="button"
          >
            <Plus className="h-4 w-4 !text-white" />
          </button>
          <button
            aria-label="افزودن نسخه"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 transition hover:border-white hover:text-zinc-950 dark:text-white"
            onClick={addItem}
            title="افزودن نسخه"
            type="button"
          >
            <Plus />
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {rows.map((item, index) => (
          <div className="space-y-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4" key={`${title}-${index}`}>
            <div className="flex items-center gap-2">
              <button
                aria-label="انتخاب نسخه"
                className={`h-5 w-5 rounded-full border transition ${selectedIndexes.includes(index) ? "border-green-500 bg-green-500" : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-black"}`}
                onClick={() => toggleSelectedIndex(index)}
                type="button"
              />
            </div>
            <div className="grid items-end gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_48px]">
              <TextField
                label="نام نسخه"
                name={`${title}-title-${index}`}
                onChange={(event) => updateItem(index, { title: event.target.value })}
                placeholder="مثلا Deluxe Edition"
                value={item.title}
              />
              <ListTextField
                label="عناوین"
                name={`${title}-versionTitles-${index}`}
                onChange={(value) => updateItem(index, { versionTitles: value })}
                placeholder="عنوان را وارد کنید"
                value={item.versionTitles}
              />
              <InlineImageUploadButton
                altValue={item.image?.alt || ""}
                image={item.image}
                name={`extraEditionImages-${index}`}
                onAltChange={(alt) => updateItem(index, { image: withMediaAlt(item.image, alt) })}
                onChange={async (file) => {
                  const media = await onImageUpload?.(`extraEditions-${index}`, file, {
                    resizeFit: "cover",
                    resizeHeight: 768,
                    resizeWidth: 768,
                  });
                  if (media) updateItem(index, { image: withMediaAlt(media, item.image?.alt || "") });
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
            {Array.isArray(item.items) && item.items.length ? (
              <div className="space-y-2 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-black">
                {item.items.map((entry, entryIndex) => {
                  const platformLabel = platformOptions.find((option) => option.value === entry.platform)?.label || entry.platform || "-";
                  return (
                    <div className="grid gap-2 rounded-lg bg-zinc-50 p-2 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 md:grid-cols-[1fr_1fr_1fr_1fr_32px]" key={`${index}-entry-${entryIndex}`}>
                      <span>{platformLabel}</span>
                      <span>{entry.capacityType || "-"}</span>
                      <span>{entry.price ? `${formatMoney(entry.price)} تومان` : "-"}</span>
                      <span>{entry.discountedPrice ? Number(entry.discountedPrice).toLocaleString("fa-IR") : "-"}</span>
                      <button
                        aria-label="حذف مورد"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-red-100 hover:text-red-600"
                        onClick={() => removeEditionItem(index, entryIndex)}
                        type="button"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {modalTargets.length ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950" dir="rtl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">افزودن مورد نسخه</h3>
              <button className="text-sm text-zinc-500" onClick={() => setModalTargets([])} type="button">
                بستن
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <SingleSelectDropdown
                label="پلتفرم"
                name="edition-item-platform"
                onChange={(event) => updateDraftPlatform(event.target.value)}
                options={platformOptions}
                value={itemDraft.platform}
              />
              <SingleSelectDropdown
                label="نوع ظرفیت"
                name="edition-item-capacity"
                onChange={(event) => setItemDraft((prev) => ({ ...prev, capacityType: event.target.value }))}
                options={capacityOptions}
                value={itemDraft.capacityType}
              />
              <TextField
                label="قیمت"
                name="edition-item-price"
                onChange={(event) => setItemDraft((prev) => ({ ...prev, price: event.target.value }))}
                placeholder="مثلا 250000"
                type="number"
                value={itemDraft.price}
              />
              <TextField
                label="درصد تخفیف"
                name="edition-item-discount"
                onChange={(event) => setItemDraft((prev) => ({ ...prev, discountPercent: event.target.value }))}
                placeholder="مثلا 20"
                type="number"
                value={itemDraft.discountPercent}
              />
            </div>
            <div className="mt-4 rounded-xl bg-zinc-100 p-3 text-sm text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
              <div>قیمت: {itemDraft.price ? `${formatMoney(itemDraft.price)} تومان` : "-"}</div>
              <div className="mt-1">قیمت با تخفیف: {discountedPrice ? `${formatMoney(discountedPrice)} تومان` : "-"}</div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="rounded-xl border border-zinc-200 px-4 py-2 text-sm dark:border-zinc-800" onClick={() => setModalTargets([])} type="button">
                انصراف
              </button>
              <button className="rounded-xl bg-green-600 px-4 py-2 text-sm !text-white" onClick={addEditionItem} type="button">
                افزودن
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const reviewSourceOptions = [
  { label: "زومجی", value: "زومجی" },
  { label: "گیم‌فا", value: "گیم‌فا" },
];

function LinkRowsEditor({ label, items = [], onChange }) {
  const rows = items.length ? items : [{ title: reviewSourceOptions[0].value, link: "" }];

  const updateItem = (index, patch) => {
    const next = rows.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
    onChange?.(next.filter((item) => item.title || item.link));
  };

  const addItem = () => onChange?.([...rows, { title: reviewSourceOptions[0].value, link: "" }]);
  const removeItem = (index) => onChange?.(rows.filter((_, itemIndex) => itemIndex !== index));

  return (
    <div className="space-y-3  p-4">
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
            <SingleSelectDropdown
              label="منبع"
              name={`${label}-title-${index}`}
              onChange={(event) => updateItem(index, { title: event.target.value })}
              options={reviewSourceOptions}
              value={reviewSourceOptions.some((option) => option.value === item.title) ? item.title : reviewSourceOptions[0].value}
            />
            <TextField
              dir="ltr"
              label="لینک"
              name={`${label}-link-${index}`}
              onChange={(event) => updateItem(index, { link: event.target.value })}
              placeholder="https://..."
              value={item.link}
            />
            <button
              className="mt-6 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 transition hover:border-red-500 hover:text-red-400"
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
              label="نام"
              name={`search-title-${index}`}
              onChange={(event) => updateTitle(index, event.target.value)}
              onKeyDown={(event) => handleInputKeyDown(event, index)}
              placeholder="مثلا بازی اکشن پلی استیشن 5"
              value={item.title}
            />
            <TextField
              dir="ltr"
              label="اسلاگ"
              name={`search-title-slug-${index}`}
              onChange={(event) => updateItem(index, { slug: event.target.value })}
              onKeyDown={(event) => handleInputKeyDown(event, index)}
              placeholder="ps5-action-games"
              value={item.slug}
            />
            <button
              className="mt-6 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 transition hover:border-red-500 hover:text-red-400"
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
  form,
  gameTitle,
  imageUploadState = {},
  mergePlatformReleases,
  onFetchPlayStationTrophies,
  onFetchScores,
  onFetchXboxAchievements,
  onChange,
  onRemoteImageUpload,
  scoreImportState,
  setArrayField,
  setCoverPreview,
  setDesktopCoverPreview,
  setForm,
  setGalleryPreview,
  setMobileCoverPreview,
  translateGameIntro,
  translateSearchTitleSlug,
  playstationTitleId,
  playStationTrophiesState,
  xboxAchievementsState,
}) {
  const [introTranslateState, setIntroTranslateState] = React.useState({
    message: "",
    status: "idle",
  });
  const [descriptionImportState, setDescriptionImportState] = React.useState({
    message: "",
    status: "idle",
  });
  const [pendingSuggestion, setPendingSuggestion] = React.useState(null);

  const syncGallery = (updater) => {
    setGalleryPreview?.((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      setForm((form) => ({ ...form, gallery: next }));
      return next;
    });
  };

  const uploadPlayStationSuggestion = async (uploadKey, suggestion, options) => {
    const media = await onRemoteImageUpload?.(uploadKey, suggestion, {
      allowEnlargement: true,
      resizeFit: "cover",
      ...options,
    });
    return media ? withMediaAlt(media, suggestion?.title || "") : null;
  };

  const appendPlayStationImage = async (suggestion) => {
    const url = String(suggestion?.url || "").trim();
    if (!url) return;

    const id = `gallery-playstation-${Date.now()}-${makeGameSlug(suggestion?.title || "image")}`;
    syncGallery((prev) => {
      if (prev.some((item) => String(item?.sourceUrl || item?.url || item?.media?.url || "") === url)) return prev;

      return [
        ...prev,
        {
          id,
          kind: "new",
          platform: suggestion?.platform || "PlayStation",
          source: "playstation-uploading",
          sourceUrl: url,
          title: suggestion?.title || "",
          type: "image",
          url,
        },
      ];
    });

    const media = await uploadPlayStationSuggestion(id, suggestion, {
      resizeHeight: 1080,
      resizeWidth: 1920,
    });

    if (!media) {
      syncGallery((prev) => prev.map((item) => (item.id === id ? { ...item, kind: "error", source: "playstation-error" } : item)));
      return;
    }

    syncGallery((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...media,
              kind: "uploaded",
              media,
              source: "playstation-uploaded",
              url: media.url,
            }
          : item
      )
    );
  };

  const assignPlayStationImage = async (destination, suggestion = pendingSuggestion) => {
    if (!suggestion?.url) return;

    if (destination === "gallery") {
      await appendPlayStationImage(suggestion);
      setPendingSuggestion(null);
      return;
    }

    const uploadOptions =
      destination === "cover"
        ? { resizeHeight: 768, resizeWidth: 768 }
        : destination === "mobileCover"
          ? { resizeHeight: 810, resizeWidth: 1080 }
          : { resizeHeight: 1080, resizeWidth: 1920 };

    const media = await uploadPlayStationSuggestion(destination, suggestion, uploadOptions);
    if (!media) return;

    if (destination === "cover") {
      setForm((prev) => ({ ...prev, cover: withMediaAlt(media, prev.cover?.alt || suggestion?.title || "") }));
      setCoverPreview?.(media.url);
    } else if (destination === "mobileCover") {
      setForm((prev) => ({ ...prev, mobileCover: withMediaAlt(media, prev.mobileCover?.alt || suggestion?.title || "") }));
      setMobileCoverPreview?.(media.url);
    } else if (destination === "desktopCover") {
      setForm((prev) => ({ ...prev, desktopCover: withMediaAlt(media, prev.desktopCover?.alt || suggestion?.title || "") }));
      setDesktopCoverPreview?.(media.url);
    }

    setPendingSuggestion(null);
  };

  const handleIntroImport = async (source, target = "summary") => {
    const title = form.title.trim();
    const setStatus = target === "description" ? setDescriptionImportState : setIntroTranslateState;
    if (!title) {
      setStatus({ message: "ابتدا عنوان بازی را وارد کنید", status: "error" });
      return;
    }

    setStatus({
      message: source === "playstation" ? "در حال دریافت از PlayStation..." : "در حال دریافت از Xbox...",
      status: "loading",
    });

    try {
      const response = await translateGameIntro({
        source,
        title,
        ...(source === "playstation" && form.playstationTitleId ? { playstationTitleId: form.playstationTitleId } : {}),
      }).unwrap();
      const translatedText = response?.data?.text || "";
      if (!translatedText) throw new Error("Empty translation");
      setForm((prev) => ({
        ...prev,
        ...(source === "playstation" && response?.data?.score ? { sonyScore: response.data.score } : {}),
        ...(source === "playstation" && response?.data?.starRating ? { starRating: response.data.starRating } : {}),
        ...(response?.data?.platformReleases?.length && typeof mergePlatformReleases === "function"
          ? { platformReleases: mergePlatformReleases(prev.platformReleases, response.data.platformReleases) }
          : {}),
        ...(target === "description"
          ? { shortDescription: translatedText.slice(0, 5000) }
          : { summary: translatedText.slice(0, 160) }),
      }));
      setStatus({
        message: `${target === "description" ? "معرفی" : "خلاصه"} ${response?.data?.sourceTitle ? `«${response.data.sourceTitle}» ` : ""}درج شد؛ می‌توانید متن را ویرایش کنید`,
        status: "success",
      });
    } catch (error) {
      setStatus({
        message: error?.data?.description || "ترجمه انجام نشد",
        status: "error",
      });
    }
  };

  const statusClassName =
    introTranslateState.status === "success"
      ? "text-emerald-600 dark:text-emerald-400"
      : introTranslateState.status === "error"
        ? "text-red-500"
        : "text-zinc-500";
  const descriptionStatusClassName =
    descriptionImportState.status === "success"
      ? "text-emerald-600 dark:text-emerald-400"
      : descriptionImportState.status === "error"
        ? "text-red-500"
        : "text-zinc-500";
  const scoreStatusClassName =
    scoreImportState?.status === "success"
      ? "text-emerald-600 dark:text-emerald-400"
      : scoreImportState?.status === "error"
        ? "text-red-500"
        : "text-zinc-500";

  return (
      <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
        <GameTitleSuggestField form={form} onChange={onChange} setForm={setForm} />
        <TextField dir="ltr" label="اسلاگ بازی" name="slug" onChange={onChange} value={form.slug} />
      </div>
      <TextField
        dir="ltr"
        label="PlayStation NP Communication ID"
        name="playstationNpCommunicationId"
        onChange={onChange}
        placeholder="NPWR09412_00"
        value={form.playstationNpCommunicationId}
      />
      <p className="-mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        اگر بازی داخل اکانت PSN سرور نیست، NP Communication ID مثل NPWR18910_00 را وارد کنید.
      </p>
      <div className="grid gap-3 lg:grid-cols-2">
        <PlatformTrophiesPreview onFetch={onFetchXboxAchievements} platform="xbox" state={xboxAchievementsState} />
        <PlatformTrophiesPreview onFetch={onFetchPlayStationTrophies} platform="playstation" state={playStationTrophiesState} />
      </div>
      <label className="flex flex-col gap-y-1">
        <span className="text-sm text-zinc-700 dark:text-gray-100">خلاصه کوتاه</span>
        <div className="relative">
          <input
            className="h-10 w-full rounded-full border border-gray-300 bg-white py-2 pl-20 pr-14 text-sm text-zinc-900 outline-none transition focus:border-green-400 focus:ring-0 dark:border-gray-600 dark:bg-[#0a2d4d] dark:text-gray-100 dark:focus:border-blue-500"
            maxLength={160}
            name="summary"
            onChange={onChange}
            placeholder="حداکثر ۱۶۰ کاراکتر"
            value={form.summary}
          />
          <span className="pointer-events-none absolute right-0 top-0 flex h-full w-12 items-center justify-center rounded-r-primary rounded-l-none border border-l border-gray-300 bg-gray-200 text-gray-700 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
            <Edit className="h-5 w-5" />
          </span>
          <button
            aria-label="دریافت از PlayStation"
            className="absolute bottom-0 left-10 flex h-10 w-10 items-center justify-center border-0 border-r border-blue-700 bg-blue-600 !text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:!text-white"
            disabled={introTranslateState.status === "loading"}
            onClick={() => handleIntroImport("playstation")}
            title="دریافت از PlayStation"
            type="button"
          >
            <PlayStationIcon className="h-5 w-5 !text-white" />
          </button>
          <button
            aria-label="دریافت از Xbox"
            className="absolute bottom-0 left-0 flex h-10 w-10 items-center justify-center rounded-l-full rounded-r-none border-0 border-r border-emerald-700 bg-emerald-600 !text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:!text-white"
            disabled={introTranslateState.status === "loading"}
            onClick={() => handleIntroImport("xbox")}
            title="دریافت از Xbox"
            type="button"
          >
            <XboxIcon className="h-5 w-5 !text-white" />
          </button>
        </div>
        {introTranslateState.message ? (
          <p className={`text-xs ${statusClassName}`}>{introTranslateState.message}</p>
        ) : null}
      </label>
      <LegacySearchTitleRowsEditor
        items={form.searchTitles}
        onChange={(value) => setArrayField("searchTitles", value)}
        translateSearchTitleSlug={translateSearchTitleSlug}
      />
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-zinc-700 dark:text-zinc-300">معرفی بازی</span>
          <div className="flex overflow-hidden rounded-full border border-gray-300 shadow-sm dark:border-gray-600">
            <button
              aria-label="دریافت معرفی از PlayStation"
              className="flex h-9 w-10 items-center justify-center border-0 border-l border-blue-700 bg-blue-600 !text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:!text-white"
              disabled={descriptionImportState.status === "loading"}
              onClick={() => handleIntroImport("playstation", "description")}
              title="دریافت معرفی از PlayStation"
              type="button"
            >
              <PlayStationIcon className="h-5 w-5 !text-white" />
            </button>
            <button
              aria-label="دریافت معرفی از Xbox"
              className="flex h-9 w-10 items-center justify-center border-0 bg-emerald-600 !text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:!text-white"
              disabled={descriptionImportState.status === "loading"}
              onClick={() => handleIntroImport("xbox", "description")}
              title="دریافت معرفی از Xbox"
              type="button"
            >
              <XboxIcon className="h-5 w-5 !text-white" />
            </button>
          </div>
        </div>
        <div className="game-summary-editor min-w-0 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-gray-600 dark:bg-[#0a2d4d]">
          <MyEditor
            value={form.shortDescription}
            onChange={(value) => setForm((prev) => ({ ...prev, shortDescription: value }))}
          />
        </div>
        {descriptionImportState.message ? (
          <p className={`text-xs ${descriptionStatusClassName}`}>{descriptionImportState.message}</p>
        ) : null}
      </div>
      <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-black">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-zinc-700 dark:text-zinc-300">ابزارهای API</span>
          <div className="flex flex-wrap items-center gap-2">
            {Object.entries(imageUploadState).some(([key, item]) => ["cover", "mobileCover", "desktopCover"].includes(key) && item?.status === "uploading") ? (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">در حال آپلود تصویر انتخابی...</span>
            ) : null}
            <button
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-700 transition hover:border-amber-400 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-300"
              disabled={scoreImportState?.status === "loading"}
              onClick={onFetchScores}
              type="button"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] !text-white">★</span>
              {scoreImportState?.status === "loading" ? "در حال دریافت..." : "دریافت امتیازها"}
            </button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <ScoreInput label="امتیاز متاکریتیک" name="metacriticScore" onChange={onChange} value={form.metacriticScore} />
          <ScoreInput
            details={form.starRating}
            label="امتیاز سونی"
            max="5"
            min="0"
            name="sonyScore"
            onChange={onChange}
            onDetailsChange={(value) => setForm((prev) => ({ ...prev, starRating: value }))}
            step="0.01"
            value={form.sonyScore}
          />
          <ScoreInput
            details={form.steamRating}
            label="امتیاز استیم"
            max="5"
            min="0"
            name="steamScore"
            onChange={onChange}
            onDetailsChange={(value) => setForm((prev) => ({ ...prev, steamRating: value }))}
            step="0.01"
            value={form.steamScore}
          />
          <ScoreInput
            details={form.xboxRating}
            label="امتیاز Xbox"
            max="5"
            min="0"
            name="xboxScore"
            onChange={onChange}
            onDetailsChange={(value) => setForm((prev) => ({ ...prev, xboxRating: value }))}
            step="0.01"
            value={form.xboxScore}
          />
        </div>
        {scoreImportState?.message ? (
          <p className={`text-xs ${scoreStatusClassName}`}>{scoreImportState.message}</p>
        ) : null}
        <PlayStationGallerySuggestions
          gameTitle={gameTitle || form.title}
          playstationTitleId={playstationTitleId || form.playstationTitleId}
          onAdd={setPendingSuggestion}
          onAssign={assignPlayStationImage}
          onClear={() => setPendingSuggestion(null)}
          selectedSuggestion={pendingSuggestion}
        />
      </div>
    </div>
  );
}

export function GameMediaStep({
  coverPreview,
  desktopCoverPreview,
  form,
  galleryPreview,
  gameTitle,
  imageUploadState = {},
  isTrailerVideoUploading,
  onDeleteMainImage,
  onDeleteUploadedImage,
  onEditDesktopCoverPosition,
  onImageUpload,
  onRemoteImageUpload,
  onVideoUpload,
  setCoverPreview,
  setDesktopCoverCropFile,
  setDesktopCoverPreview,
  setForm,
  setGalleryPreview,
  mobileCoverPreview,
  playstationTitleId,
  setMobileCoverPreview,
  setTrailerThumbnailPreview,
  trailerThumbnailPreview,
  trailerVideoPreview,
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-4">
          <span className="mb-3 block text-sm text-zinc-700 dark:text-zinc-300">تصویر کارت مشترک *</span>
          <p className="mb-3 text-xs text-zinc-500">اندازه پیشنهادی: 768 × 768</p>
          <ThumbnailUpload
            altValue={form.cover?.alt || ""}
            blurValue={form.cover?.blur}
            immediateUpload={false}
            name="cover"
            onAltChange={(alt) => setForm((prev) => ({ ...prev, cover: withMediaAlt(prev.cover, alt) }))}
            onBlurChange={(blur) => setForm((prev) => ({ ...prev, cover: withMediaBlur(prev.cover, blur, coverPreview) }))}
            onRemove={() => onDeleteMainImage?.("cover", setCoverPreview)}
            profilePreview
            preview={coverPreview}
            uploadState={imageUploadState.cover}
            setThumbnail={async (file) => {
              const media = await onImageUpload?.("cover", file, {
                resizeFit: "cover",
                resizeHeight: 768,
                resizeWidth: 768,
              });
              if (!media) return;
              setForm((prev) => ({ ...prev, cover: withMediaAlt(media, prev.cover?.alt || "") }));
              setCoverPreview(media.url);
            }}
            setThumbnailPreview={setCoverPreview}
            title="انتخاب"
          />
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-4">
          <span className="mb-3 block text-sm text-zinc-700 dark:text-zinc-300">تصویر اصلی موبایل</span>
          <p className="mb-3 text-xs text-zinc-500">اندازه پیشنهادی: 1080 × 810</p>
          <ThumbnailUpload
            altValue={form.mobileCover?.alt || ""}
            blurValue={form.mobileCover?.blur}
            immediateUpload={false}
            name="mobileCover"
            onAltChange={(alt) => setForm((prev) => ({ ...prev, mobileCover: withMediaAlt(prev.mobileCover, alt) }))}
            onBlurChange={(blur) => setForm((prev) => ({ ...prev, mobileCover: withMediaBlur(prev.mobileCover, blur, mobileCoverPreview) }))}
            onRemove={() => onDeleteMainImage?.("mobileCover", setMobileCoverPreview)}
            profilePreview
            preview={mobileCoverPreview}
            uploadState={imageUploadState.mobileCover}
            setThumbnail={async (file) => {
              const media = await onImageUpload?.("mobileCover", file, {
                resizeFit: "cover",
                resizeHeight: 810,
                resizeWidth: 1080,
              });
              if (!media) return;
              setForm((prev) => ({ ...prev, mobileCover: withMediaAlt(media, prev.mobileCover?.alt || "") }));
              setMobileCoverPreview(media.url);
            }}
            setThumbnailPreview={setMobileCoverPreview}
            title="انتخاب"
          />
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-4">
          <span className="mb-3 block text-sm text-zinc-700 dark:text-zinc-300">تصویر اصلی دسکتاپ</span>
          <p className="mb-3 text-xs text-zinc-500">اندازه پیشنهادی: 1920 × 1080</p>
          <ThumbnailUpload
            altValue={form.desktopCover?.alt || ""}
            blurValue={form.desktopCover?.blur}
            immediateUpload={false}
            name="desktopCover"
            onAltChange={(alt) => setForm((prev) => ({ ...prev, desktopCover: withMediaAlt(prev.desktopCover, alt) }))}
            onBlurChange={(blur) => setForm((prev) => ({ ...prev, desktopCover: withMediaBlur(prev.desktopCover, blur, desktopCoverPreview) }))}
            onRemove={() => onDeleteMainImage?.("desktopCover", setDesktopCoverPreview)}
            profilePreview
            preview={desktopCoverPreview}
            uploadState={imageUploadState.desktopCover}
            setThumbnail={(file) => {
              if (file instanceof File) setDesktopCoverCropFile(file);
            }}
            setThumbnailPreview={() => {}}
            title="انتخاب"
          />
          {desktopCoverPreview ? (
            <button
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-bold text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-white dark:hover:text-white"
              onClick={onEditDesktopCoverPosition}
              type="button"
            >
              <Edit className="h-4 w-4" />
              ویرایش ناحیه نمایش
            </button>
          ) : null}
        </div>
      </div>
      <MediaStep
        coverPreview={coverPreview}
        desktopCoverPreview={desktopCoverPreview}
        galleryPreview={galleryPreview}
        gameTitle={gameTitle}
        playstationTitleId={playstationTitleId}
        imageUploadState={imageUploadState}
        onDeleteUploadedImage={onDeleteUploadedImage}
        onImageUpload={onImageUpload}
        onRemoteImageUpload={onRemoteImageUpload}
        setCoverPreview={setCoverPreview}
        setDesktopCoverPreview={setDesktopCoverPreview}
        setForm={setForm}
        setGalleryPreview={setGalleryPreview}
        mobileCoverPreview={mobileCoverPreview}
        setMobileCoverPreview={setMobileCoverPreview}
      />
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
  platformOptions,
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
      <div>
        <div className="relative">
          <MultiSelectDropdown controlClassName="pl-24" iconClassName={borderlessIconClass} label="ژانر" onChange={(value) => setArrayField("genres", value)} options={genreOptions} value={form.genres} />
          <button
            aria-label="افزودن ژانر"
            className="absolute bottom-0 left-10 flex h-10 w-10 items-center justify-center border-0 border-r border-gray-300 bg-gray-200 text-gray-700 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            onClick={() => onQuickCreate?.("genre", { field: "genres" })}
            title="افزودن ژانر"
            type="button"
          >
            <Plus className="h-5 w-5" />
          </button>
          <button
            aria-label={form.showGenresInCategories ? "تغییر نمایش ژانرها در دسته‌بندی" : "تغییر نمایش ژانرها در دسته‌بندی"}
            className={`absolute bottom-0 left-0 flex h-10 w-10 items-center justify-center rounded-l-full rounded-r-none border-0 border-r border-gray-300 shadow-sm dark:border-gray-600 ${
              form.showGenresInCategories
                ? "bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300"
                : "bg-gray-200 text-gray-700 hover:text-emerald-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:text-blue-300"
            }`}
            onClick={toggleGenresVisibility}
            title={form.showGenresInCategories ? "تغییر نمایش ژانرها در دسته‌بندی" : "تغییر نمایش ژانرها در دسته‌بندی"}
            type="button"
          >
            {form.showGenresInCategories ? <OutlineEyeInvisible className="h-5 w-5" /> : <OutlineEye className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <QuickCreateField label="دسته‌بندی" onCreate={() => onQuickCreate?.("category", { field: "category" })}>
        <SingleSelectDropdown controlClassName={borderlessControlClass} iconClassName={borderlessIconClass} label="دسته‌بندی" name="category" onChange={onChange} options={categoryOptions} value={form.category} />
      </QuickCreateField>
      <QuickCreateField label="کالکشن بازی" onCreate={() => onQuickCreate?.("gameCollection", { field: "collections" })}>
        <MultiSelectDropdown controlClassName={borderlessControlClass} iconClassName={borderlessIconClass} label="کالکشن‌های نمایش" onChange={(value) => setArrayField("collections", value)} options={collectionOptions} value={form.collections} />
      </QuickCreateField>
      <QuickCreateField label="کلمات کلیدی بازی" onCreate={() => onQuickCreate?.("gameKeyword", { field: "gameKeywords" })}>
        <MultiSelectDropdown controlClassName={borderlessControlClass} iconClassName={borderlessIconClass} label="کلمات کلیدی بازی" onChange={(value) => setArrayField("gameKeywords", value)} options={gameKeywordOptions} value={form.gameKeywords} />
      </QuickCreateField>
      <QuickCreateField label="پلتفرم" onCreate={() => onQuickCreate?.("platform", { field: "platforms" })}>
        <MultiSelectDropdown controlClassName={borderlessControlClass} iconClassName={borderlessIconClass} label="پلتفرم‌ها" onChange={(value) => setArrayField("platforms", value)} options={platformOptions} value={form.platforms} />
      </QuickCreateField>
      <QuickCreateField label="سازنده‌ها" onCreate={() => onQuickCreate?.("company", { field: "developers" })}>
        <MultiSelectDropdown controlClassName={borderlessControlClass} iconClassName={borderlessIconClass} label="سازنده‌ها" onChange={(value) => setArrayField("developers", value)} options={companyOptions} value={form.developers} />
      </QuickCreateField>
      <QuickCreateField label="ناشرها" onCreate={() => onQuickCreate?.("company", { field: "publishers" })}>
        <MultiSelectDropdown controlClassName={borderlessControlClass} iconClassName={borderlessIconClass} label="ناشرها" onChange={(value) => setArrayField("publishers", value)} options={companyOptions} value={form.publishers} />
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
  const selectedOfflinePlayerKey = form.offlinePlayers?.[0]?.key || "";

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <SingleSelectDropdown
        controlClassName={borderlessControlClass}
        iconClassName={borderlessIconClass}
        label="بازیکنان آفلاین"
        name="offlinePlayers"
        onChange={(event) => {
          const option = offlinePlayerOptions.find((item) => item.value === event.target.value);
          setArrayField(
            "offlinePlayers",
            option
              ? [
                  {
                    key: option.key,
                    title_fa: option.title_fa,
                    title_en: option.title_en,
                    min: option.min,
                    max: option.max,
                  },
                ]
              : []
          );
        }}
        options={offlinePlayerOptions}
        value={selectedOfflinePlayerKey}
      />
      <TextField
        className={borderlessControlClass}
        iconClassName={borderlessIconClass}
        label="بازیکنان آنلاین"
        name="onlinePlayerCount"
        onChange={onChange}
        placeholder="مثلا ۲ تا ۸ نفر"
        value={form.onlinePlayerCount}
      />
      <TextField
        className={borderlessControlClass}
        iconClassName={borderlessIconClass}
        label="بازیکنان چندنفره"
        name="multiplayerPlayerCount"
        onChange={onChange}
        placeholder="مثلا ۲ تا ۸ نفر"
        value={form.multiplayerPlayerCount}
      />
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

export function ReleaseStep({ ageRatingOptions, form, onChange, scoreImportState, setForm }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <SingleSelectDropdown controlClassName={borderlessControlClass} iconClassName={borderlessIconClass} label="رده سنی" name="ageRating" onChange={onChange} options={ageRatingOptions} value={form.ageRating} />
        <TextField className={borderlessControlClass} dir="ltr" iconClassName={borderlessIconClass} label="وب‌سایت رسمی" name="officialWebsite" onChange={onChange} value={form.officialWebsite} />
        <TextField className={borderlessControlClass} iconClassName={borderlessIconClass} label="زمان تقریبی گیم‌پلی" name="gameplayTime" onChange={onChange} placeholder="مثلا 25 ساعت" value={form.gameplayTime} />
      </div>
      <div className="grid gap-4 md:grid-cols-6">
        <StatusSwitch checked={form.isFeatured} className={borderlessSwitchClass} id="isFeatured" label="بازی پرطرفدار" name="isFeatured" onChange={onChange} />
        <StatusSwitch
          checked={form.showOnlyInCollections}
          className={borderlessSwitchClass}
          id="showOnlyInCollections"
          label="نمایش فقط در کالکشن‌ها"
          name="showOnlyInCollections"
          onChange={onChange}
        />
        <StatusSwitch checked={form.hasDubbing} className={borderlessSwitchClass} id="hasDubbing" label="دوبله دارد" name="hasDubbing" onChange={onChange} />
        <StatusSwitch checked={form.hasSubtitle} className={borderlessSwitchClass} id="hasSubtitle" label="زیرنویس دارد" name="hasSubtitle" onChange={onChange} />
        <StatusSwitch
          checked={form.hasFreePersianSubtitle}
          className={borderlessSwitchClass}
          id="hasFreePersianSubtitle"
          label="زیرنویس  رایگان"
          name="hasFreePersianSubtitle"
          onChange={onChange}
        />
        <StatusSwitch
          checked={form.hasPaidPersianSubtitle}
          className={borderlessSwitchClass}
          id="hasPaidPersianSubtitle"
          label="زیرنویس  پولی"
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
          { label: "حجم", placeholder: "مثلا ۸۵ گیگابایت" },
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

export function DlcEditionStep({ form, imageUploadState, onDeleteUploadedImage, onImageUpload, platformOptions = [], setArrayField }) {
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
        platformOptions={platformOptions}
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

export function EditionsStep({ form, imageUploadState, onDeleteUploadedImage, onImageUpload, platformOptions = [], setArrayField }) {
  return (
    <EditionRowsEditor
      title="نسخه‌های اضافه"
      imageUploadState={imageUploadState}
      items={form.extraEditions}
    onChange={(value) => setArrayField("extraEditions", value)}
    onDeleteUploadedImage={onDeleteUploadedImage}
    onImageUpload={onImageUpload}
    platformOptions={platformOptions}
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
          profilePreview
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

export function MediaStep({
  galleryPreview,
  gameTitle,
  imageUploadState = {},
  onDeleteUploadedImage,
  onImageUpload,
  onRemoteImageUpload,
  playstationTitleId,
  setCoverPreview,
  setDesktopCoverPreview,
  setForm,
  setGalleryPreview,
  setMobileCoverPreview,
}) {
  const [draggedId, setDraggedId] = React.useState(null);
  const [selectedGalleryImage, setSelectedGalleryImage] = React.useState(null);

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
        allowEnlargement: true,
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

  const appendPlayStationImage = async (suggestion) => {
    const sourceUrl = String(suggestion?.url || "").trim();
    if (!sourceUrl) return;

    const id = `gallery-playstation-${Date.now()}-${makeGameSlug(suggestion?.title || "image")}`;
    syncGallery((prev) => {
      if (prev.some((item) => String(item?.sourceUrl || item?.url || item?.media?.url || "") === sourceUrl)) return prev;

      return [
        ...prev,
        {
          id,
          kind: "new",
          platform: suggestion?.platform || "PlayStation",
          source: "playstation-uploading",
          sourceUrl,
          title: suggestion?.title || "",
          type: "image",
          url: sourceUrl,
        },
      ];
    });

    const media = await onRemoteImageUpload?.(id, suggestion, {
      allowEnlargement: true,
      resizeFit: "cover",
      resizeHeight: 1080,
      resizeWidth: 1920,
    });

    if (!media) {
      syncGallery((prev) => prev.map((item) => (item.id === id ? { ...item, kind: "error", source: "playstation-error" } : item)));
      return;
    }

    syncGallery((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...media,
              kind: "uploaded",
              media,
              source: "playstation-uploaded",
              url: media.url,
            }
          : item
      )
    );
  };

  const handleGalleryDrop = (event) => {
    const suggestionPayload = event.dataTransfer.getData(playStationGalleryDragType);
    if (!suggestionPayload) return;

    event.preventDefault();
    try {
      appendPlayStationImage(JSON.parse(suggestionPayload));
    } catch (_) {
      // Ignore malformed drag payloads from outside the dashboard.
    }
  };

  const handleGalleryDragOver = (event) => {
    const dragTypes = Array.from(event.dataTransfer.types || []);
    if (!dragTypes.includes(playStationGalleryDragType)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
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
        allowEnlargement: true,
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
    if (item.source !== "playstation") onDeleteUploadedImage?.(item.id, item.media || item);
    setSelectedGalleryImage((current) => (current?.id === item.id ? null : current));
    syncGallery((prev) => prev.filter((current) => current.id !== item.id));
  };

  const updateGalleryAlt = (itemId, alt) => {
    syncGallery((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              alt,
              media: item.media ? { ...item.media, alt } : item.media,
            }
          : item
      )
    );
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
        <div
          className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-4"
          onDragOver={handleGalleryDragOver}
          onDrop={handleGalleryDrop}
        >
          <span className="mb-3 block text-sm text-zinc-700 dark:text-zinc-300">گالری</span>
          <p className="mb-3 text-xs text-zinc-500">اندازه پیشنهادی: 1920 × 1080</p>
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
                    <button
                      aria-label="نمایش بزرگ تصویر"
                      className="absolute inset-0 z-10 cursor-zoom-in bg-transparent"
                      onClick={() => setSelectedGalleryImage(item)}
                      type="button"
                    />
                    <ImageSizeBadge src={item.url} />
                    <UploadStateOverlay state={imageUploadState[item.id]} />
                    <ImageAltOverlay onChange={(alt) => updateGalleryAlt(item.id, alt)} value={item.alt || item.media?.alt || ""} />
                    <button
                      aria-label="حذف تصویر"
                      className="absolute left-2 top-2 z-40 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-600/90 !text-white opacity-0 shadow-lg transition hover:bg-red-500 group-hover:opacity-100 [&_svg]:!text-white"
                      onClick={() => removeItem(item)}
                      title="حذف"
                      type="button"
                    >
                      <Trash className="h-4 w-4 !text-white" style={{ color: "#fff" }} />
                    </button>
                    <span className="absolute right-2 top-2 rounded-md bg-white/95 px-2 py-1 text-[10px] font-bold text-zinc-950 shadow-md ring-1 ring-black/10">
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
      {selectedGalleryImage ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setSelectedGalleryImage(null)}>
          <div
            className="relative h-[62vh] w-[92vw] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl lg:w-[33vw]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              aria-label="بستن"
              className="absolute left-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-zinc-950 shadow-lg transition hover:bg-white"
              onClick={() => setSelectedGalleryImage(null)}
              type="button"
            >
              ×
            </button>
            <img alt={selectedGalleryImage.alt || gameTitle || "gallery"} className="h-full w-full object-contain" src={selectedGalleryImage.url} />
          </div>
        </div>
      ) : null}
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-4">
          <span className="mb-3 block text-sm text-zinc-700 dark:text-zinc-300">تریلر</span>
          <ThumbnailUpload
            immediateUpload={false}
            accept="video/*"
            disabled={isTrailerVideoUploading}
            imageSize={150}
            name="trailerVideo"
            poster={trailerThumbnailPreview}
            profilePreview
            preview={trailerVideoPreview}
            setThumbnail={(file) => onVideoUpload?.("trailerVideo", file)}
            setThumbnailPreview={() => {}}
            title="انتخاب"
          />
          {isTrailerVideoUploading ? <p className="mt-3 text-xs text-amber-300">در حال آپلود تریلر روی Arvan...</p> : null}
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-4">
          <span className="mb-3 block text-sm text-zinc-700 dark:text-zinc-300">تصویر بندانگشتی</span>
          <ThumbnailUpload
            immediateUpload={false}
            imageSize={150}
            name="trailerThumbnail"
            profilePreview
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
