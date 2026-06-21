import React from "react";
import DisplayImages from "@/components/shared/DisplayImages";
import SocialLinksInput from "@/components/shared/SocialLinksInput";
import FormPageBuilder from "@/components/shared/input/FormPageBuilder";
import ThumbnailUpload from "@/components/shared/ThumbnailUpload";
import StatusSwitch from "@/components/shared/button/StatusSwitch";
import Plus from "@/components/icons/Plus";
import Trash from "@/components/icons/Trash";
import { MultiSelectDropdown, SingleSelectDropdown } from "@/components/shared/Dropdown";
import { DatePickerField, TextField, TextareaField } from "./GameFormFields";
import { dlcTypeOptions } from "../gameOptions";

function TextListEditor({ label, items = [], onChange, placeholder = "مورد جدید" }) {
  const rows = items.length ? items : [""];

  const updateItem = (index, value) => {
    const next = rows.map((item, itemIndex) => (itemIndex === index ? value : item));
    onChange?.(next.filter((item) => String(item || "").trim()));
  };

  const addItem = () => onChange?.([...rows, ""]);
  const removeItem = (index) => onChange?.(rows.filter((_, itemIndex) => itemIndex !== index));

  return (
    <div className="space-y-3 rounded-xl border border-zinc-800 bg-black p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-zinc-300">{label}</span>
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 text-zinc-200 transition hover:border-white hover:text-white"
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
              className="h-12 w-full rounded-xl border border-zinc-800 bg-black px-3 text-sm text-white outline-none transition focus:border-white"
              onChange={(event) => updateItem(index, event.target.value)}
              placeholder={placeholder}
              value={item}
            />
            <button
              className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 text-zinc-400 transition hover:border-red-500 hover:text-red-400"
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

function ObjectRowsEditor({ columns, items = [], onChange, title }) {
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
    <div className="space-y-3 rounded-xl border border-zinc-800 bg-black p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-zinc-300">{title}</span>
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 text-zinc-200 transition hover:border-white hover:text-white"
          onClick={addItem}
          type="button"
        >
          <Plus />
        </button>
      </div>
      <div className="space-y-3">
        {rows.map((item, index) => (
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_40px]" key={`${title}-${index}`}>
            <SingleSelectDropdown
              label={columns[0].label}
              name={`${title}-platform-${index}`}
              onChange={(event) => updateItem(index, { platform: event.target.value })}
              options={columns[0].options}
              value={item.platform}
            />
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
              className="mt-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 text-zinc-400 transition hover:border-red-500 hover:text-red-400"
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

function PlatformReleaseRowsEditor({ items = [], onChange, platformOptions }) {
  const rows = items.length ? items : [{ platform: "", releaseDate: "" }];

  const updateItem = (index, patch) => {
    const next = rows.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
    onChange?.(next.filter((item) => String(item.platform || "").trim() || String(item.releaseDate || "").trim()));
  };

  const addItem = () => onChange?.([...rows, { platform: "", releaseDate: "" }]);
  const removeItem = (index) => onChange?.(rows.filter((_, itemIndex) => itemIndex !== index));

  return (
    <div className="space-y-3 rounded-xl border border-zinc-800 bg-black p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-zinc-300">تاریخ انتشار پلتفرم‌ها</span>
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 text-zinc-200 transition hover:border-white hover:text-white"
          onClick={addItem}
          type="button"
        >
          <Plus />
        </button>
      </div>
      <div className="space-y-3">
        {rows.map((item, index) => (
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_40px]" key={`platform-release-${index}`}>
            <SingleSelectDropdown
              label="پلتفرم"
              name={`platform-release-platform-${index}`}
              onChange={(event) => updateItem(index, { platform: event.target.value })}
              options={platformOptions}
              value={item.platform}
            />
            <DatePickerField
              label="تاریخ انتشار"
              onChange={(value) => updateItem(index, { releaseDate: value })}
              value={item.releaseDate}
            />
            <button
              className="mt-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 text-zinc-400 transition hover:border-red-500 hover:text-red-400"
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

function DlcRowsEditor({ items = [], onChange, title, typeOptions }) {
  const rows = items.length ? items : [{ title: "", type: "", image: "", versionSize: "" }];
  const [previews, setPreviews] = React.useState(
    rows.map((item) => (typeof item.image === "string" ? item.image : item.image?.url || ""))
  );

  React.useEffect(() => {
    setPreviews(
      rows.map((item, index) => {
        if (typeof item.image === "string") return item.image;
        if (item.image?.url) return item.image.url;
        return previews[index] || "";
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

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
    <div className="space-y-3 rounded-xl border border-zinc-800 bg-black p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-zinc-300">{title}</span>
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 text-zinc-200 transition hover:border-white hover:text-white"
          onClick={addItem}
          type="button"
        >
          <Plus />
        </button>
      </div>
      <div className="space-y-4">
        {rows.map((item, index) => (
          <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4" key={`${title}-${index}`}>
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
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
            </div>
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-end">
              <TextField
                label="حجم نسخه"
                name={`${title}-versionSize-${index}`}
                onChange={(event) => updateItem(index, { versionSize: event.target.value })}
                placeholder="مثلا 12 GB"
                value={item.versionSize}
              />
              <div className="rounded-xl border border-zinc-800 bg-black p-3">
                <span className="mb-3 block text-sm text-zinc-300">عکس DLC</span>
                <ThumbnailUpload
                  compact
                  iconSize={18}
                  showPreview={false}
                  name="dlcImages"
                  preview={previews[index]}
                  setThumbnail={(file) => updateItem(index, { image: file })}
                  setThumbnailPreview={(preview) =>
                    setPreviews((prev) => ({
                      ...prev,
                      [index]: preview,
                    }))
                  }
                  title=""
                  accept="image/*"
                />
              </div>
            </div>
            <button
              className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 text-zinc-400 transition hover:border-red-500 hover:text-red-400"
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

function EditionRowsEditor({ items = [], onChange, title }) {
  const rows = items.length ? items : [{ title: "", versionSize: "", image: "" }];
  const [previews, setPreviews] = React.useState(
    rows.map((item) => (typeof item.image === "string" ? item.image : item.image?.url || ""))
  );

  React.useEffect(() => {
    setPreviews(
      rows.map((item, index) => {
        if (typeof item.image === "string") return item.image;
        if (item.image?.url) return item.image.url;
        return previews[index] || "";
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const updateItem = (index, patch) => {
    const next = rows.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
    onChange?.(
      next.filter(
        (item) =>
          String(item.title || "").trim() ||
          String(item.versionSize || "").trim() ||
          item.image
      )
    );
  };

  const addItem = () => onChange?.([...rows, { title: "", versionSize: "", image: "" }]);
  const removeItem = (index) => onChange?.(rows.filter((_, itemIndex) => itemIndex !== index));

  return (
    <div className="space-y-3 rounded-xl border border-zinc-800 bg-black p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-zinc-300">{title}</span>
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 text-zinc-200 transition hover:border-white hover:text-white"
          onClick={addItem}
          type="button"
        >
          <Plus />
        </button>
      </div>
      <div className="space-y-3">
        {rows.map((item, index) => (
          <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4" key={`${title}-${index}`}>
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <TextField
                label="عنوان"
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
            </div>
            <div className="rounded-xl border border-zinc-800 bg-black p-3">
              <span className="mb-3 block text-sm text-zinc-300">عکس نسخه</span>
              <ThumbnailUpload
                compact
                iconSize={18}
                showPreview={false}
                name="extraEditionImages"
                preview={previews[index]}
                setThumbnail={(file) => updateItem(index, { image: file })}
                setThumbnailPreview={(preview) =>
                  setPreviews((prev) => ({
                    ...prev,
                    [index]: preview,
                  }))
                }
                title=""
                accept="image/*"
              />
            </div>
            <button
              className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 text-zinc-400 transition hover:border-red-500 hover:text-red-400"
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

function LinkRowsEditor({ label, items = [], onChange }) {
  const rows = items.length ? items : [{ title: "", link: "" }];

  const updateItem = (index, patch) => {
    const next = rows.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
    onChange?.(next.filter((item) => item.title || item.link));
  };

  const addItem = () => onChange?.([...rows, { title: "", link: "" }]);
  const removeItem = (index) => onChange?.(rows.filter((_, itemIndex) => itemIndex !== index));

  return (
    <div className="space-y-3 rounded-xl border border-zinc-800 bg-black p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-zinc-300">{label}</span>
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 text-zinc-200 transition hover:border-white hover:text-white"
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
              label="عنوان"
              name={`${label}-title-${index}`}
              onChange={(event) => updateItem(index, { title: event.target.value })}
              placeholder="مثلا Metacritic"
              value={item.title}
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
              className="mt-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 text-zinc-400 transition hover:border-red-500 hover:text-red-400"
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
  setDesktopCoverCropFile,
  form,
  onChange,
  setForm,
}) {
  return (
    <div className="grid gap-4">
      <TextField label="عنوان" name="title" onChange={onChange} value={form.title} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-black p-4">
          <span className="mb-3 block text-sm text-zinc-300">تصویر کارت دسکتاپ</span>
          <ThumbnailUpload
            name="cardDesktopCover"
            preview={cardDesktopCoverPreview}
            setThumbnail={(file) => {
              setForm((prev) => ({
                ...prev,
                cardDesktopCover: file,
                cover: prev.cover || file,
              }));
            }}
            setThumbnailPreview={(preview) => {
              setCardDesktopCoverPreview(preview);
              if (!coverPreview) setCoverPreview(preview);
            }}
            title="انتخاب"
          />
        </div>
        <div className="rounded-xl border border-zinc-800 bg-black p-4">
          <span className="mb-3 block text-sm text-zinc-300">تصویر جزئیات موبایل</span>
          <ThumbnailUpload
            name="cardMobileCover"
            preview={cardMobileCoverPreview}
            setThumbnail={(file) => setForm((prev) => ({ ...prev, cardMobileCover: file }))}
            setThumbnailPreview={setCardMobileCoverPreview}
            title="انتخاب"
          />
        </div>
        <div className="rounded-xl border border-zinc-800 bg-black p-4">
          <span className="mb-3 block text-sm text-zinc-300">تصویر جزئیات دسکتاپ</span>
          <ThumbnailUpload
            name="desktopCover"
            preview={desktopCoverPreview}
            setThumbnail={(file) => {
              if (file instanceof File) setDesktopCoverCropFile(file);
            }}
            setThumbnailPreview={() => {}}
            title="انتخاب"
          />
        </div>
      </div>
    </div>
  );
}

export function RelationsStep({ categoryOptions, collectionOptions, companyOptions, form, genreOptions, onChange, setArrayField, tagOptions }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SingleSelectDropdown label="دسته‌بندی" name="category" onChange={onChange} options={categoryOptions} value={form.category} />
      <MultiSelectDropdown label="ژانرها" onChange={(value) => setArrayField("genres", value)} options={genreOptions} value={form.genres} />
      <MultiSelectDropdown label="سازنده‌ها" onChange={(value) => setArrayField("developers", value)} options={companyOptions} value={form.developers} />
      <MultiSelectDropdown label="ناشرها" onChange={(value) => setArrayField("publishers", value)} options={companyOptions} value={form.publishers} />
      <MultiSelectDropdown label="تگ‌های سئو" onChange={(value) => setArrayField("tags", value)} options={tagOptions} value={form.tags} />
      <MultiSelectDropdown label="کالکشن‌های نمایش" onChange={(value) => setArrayField("collections", value)} options={collectionOptions} value={form.collections} />
    </div>
  );
}

export function PlatformsStep({
  form,
  gameModeOptions,
  launcherOptions,
  onChange,
  setArrayField,
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <MultiSelectDropdown label="حالت‌های بازی" onChange={(value) => setArrayField("gameModes", value)} options={gameModeOptions} value={form.gameModes} />
      <MultiSelectDropdown label="سرویس / پلتفرم انتشار" onChange={(value) => setArrayField("launcher", value)} options={launcherOptions} value={form.launcher} />
    </div>
  );
}

export function PlatformReleasesStep({ form, platformOptions, setArrayField }) {
  return (
    <PlatformReleaseRowsEditor
      items={form.platformReleases}
      onChange={(value) => setArrayField("platformReleases", value)}
      platformOptions={platformOptions}
    />
  );
}

export function PlayersStep({ form, offlinePlayerOptions, onlinePlayerOptions, setArrayField }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <MultiSelectDropdown
        label="بازیکنان آفلاین"
        onChange={(value) => setArrayField("offlinePlayers", value)}
        options={offlinePlayerOptions}
        value={form.offlinePlayers}
      />
      <MultiSelectDropdown
        label="بازیکنان آنلاین"
        onChange={(value) => setArrayField("onlinePlayers", value)}
        options={onlinePlayerOptions}
        value={form.onlinePlayers}
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
      <div className="md:col-span-3 rounded-xl border border-zinc-800 bg-black p-4 space-y-3">
        <StatusSwitch checked={form.hasDubbing} id="hasDubbing" label="دوبله دارد" name="hasDubbing" onChange={onChange} />
        <StatusSwitch checked={form.hasSubtitle} id="hasSubtitle" label="زیرنویس دارد" name="hasSubtitle" onChange={onChange} />
      </div>
    </div>
  );
}

export function PlatformSizesStep({ form, platformOptions, setArrayField }) {
  return (
    <ObjectRowsEditor
      columns={[
        { label: "پلتفرم", options: platformOptions },
        { label: "نسخه", placeholder: "مثلا Standard / PS5" },
        { label: "حجم", placeholder: "مثلا 78 GB" },
      ]}
      items={form.platformSizes}
      onChange={(value) => setArrayField("platformSizes", value)}
      title="حجم نسخه‌های پلتفرم"
    />
  );
}

export function DlcEditionStep({ form, setArrayField }) {
  return (
    <div className="space-y-4">
      <DlcRowsEditor
        title="DLC ها"
        items={form.dlcs}
        onChange={(value) => setArrayField("dlcs", value)}
        typeOptions={dlcTypeOptions}
      />
      <EditionRowsEditor
        title="نسخه‌های اضافه"
        items={form.extraEditions}
        onChange={(value) => setArrayField("extraEditions", value)}
      />
    </div>
  );
}

export function PatchStep({ form, onChange, patchImagePreview, setForm, setPatchImagePreview }) {
  return (
    <div className="grid gap-4">
      <TextField label="عنوان پچ" name="patchTitle" onChange={onChange} value={form.patchTitle} />
      <div className="rounded-xl border border-zinc-800 bg-black p-4">
        <span className="mb-3 block text-sm text-zinc-300">عکس پچ</span>
        <ThumbnailUpload
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
        label="توضیح مفصل"
        onChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
        value={form.description}
      />
    </div>
  );
}

export function MediaStep({ galleryPreview, setForm, setGalleryPreview }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div className="rounded-xl border border-zinc-800 bg-black p-4">
          <span className="mb-3 block text-sm text-zinc-300">گالری</span>
          <ThumbnailUpload
            multiple
            name="gallery"
            preview=""
            setThumbnail={(files) => setForm((prev) => ({ ...prev, gallery: files || [] }))}
            setThumbnailPreview={(preview) => {
              if (preview) setGalleryPreview((prev) => [...prev, { url: preview, type: "image" }]);
            }}
            title="انتخاب"
          />
          {galleryPreview.length ? <DisplayImages galleryPreview={galleryPreview} imageSize={86} rounded="square" /> : null}
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
      <div className="rounded-xl border border-zinc-800 bg-black p-4">
        <span className="mb-3 block text-sm text-zinc-300">تریلر</span>
        <ThumbnailUpload
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
        <div className="mt-4">
          <span className="mb-3 block text-sm text-zinc-300">تصویر تریلر</span>
          <ThumbnailUpload
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

