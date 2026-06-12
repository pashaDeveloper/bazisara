import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Popup from "@/components/ui/Popup";
import Plus from "@/components/icons/Plus";
import { IconSelectDropdown } from "@/components/shared/Dropdown";
import IconPreview from "@/components/shared/IconPreview";
import { useCreateIconMutation } from "@/services/iconApi";

const initialForm = {
  name: "",
  svg: "",
  color: "",
};

function IconPicker({
  disabled = false,
  icons = [],
  isLoadingIcons = false,
  label = "آیکون‌های ذخیره‌شده",
  name = "icon",
  onChange,
  placeholder,
  value,
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [createdIcon, setCreatedIcon] = useState(null);
  const [createIcon, { isLoading: isCreating }] = useCreateIconMutation();

  const options = useMemo(() => {
    if (!createdIcon || icons.some((icon) => icon._id === createdIcon._id)) {
      return icons;
    }

    return [createdIcon, ...icons];
  }, [createdIcon, icons]);

  const selectedIcon = options.find((icon) => icon._id === value);
  const formId = `create-icon-${name}`;
  const selectedColor = form.color?.trim() || "#ffffff";

  useEffect(() => {
    if (!isCreateOpen) setForm(initialForm);
  }, [isCreateOpen]);

  const handleChange = (event) => {
    const { name: fieldName, value: fieldValue } = event.target;
    setForm((prev) => ({ ...prev, [fieldName]: fieldValue }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.svg.trim()) {
      toast.error("نام و کد SVG آیکون الزامی است");
      return;
    }

    try {
      const response = await createIcon({
        name: form.name.trim(),
        svg: form.svg.trim(),
        color: form.color.trim(),
      }).unwrap();
      const icon = response.data;

      setCreatedIcon(icon);
      onChange?.({ target: { name, value: icon._id } });
      toast.success(response.description || "آیکون با موفقیت ثبت شد");
      setIsCreateOpen(false);
    } catch (error) {
      toast.error(error?.data?.description || "ثبت آیکون انجام نشد");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <IconSelectDropdown
            disabled={disabled || isLoadingIcons}
            label={label}
            name={name}
            onChange={onChange}
            options={options}
            placeholder={placeholder || (isLoadingIcons ? "در حال دریافت آیکون‌ها..." : "انتخاب آیکون")}
            value={value}
          />
        </div>
        <button
          aria-label="افزودن آیکون"
          className="mb-0 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-green-500 bg-green-500 text-white transition hover:border-green-400 hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          onClick={() => setIsCreateOpen(true)}
          title="افزودن آیکون"
          type="button"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {selectedIcon ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-black px-3 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <IconPreview
              icon={selectedIcon}
              label={selectedIcon.name}
              sizeClass="h-10 w-10 [&_svg]:h-5 [&_svg]:w-5"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{selectedIcon.name}</p>
              <p className="mt-1 truncate text-xs text-zinc-500">
                {selectedIcon.color || "بدون رنگ اختصاصی"}
              </p>
            </div>
          </div>
          <button
            className="rounded-lg border border-zinc-800 px-3 py-2 text-xs text-zinc-300 transition hover:border-white hover:text-white"
            onClick={() => onChange?.({ target: { name, value: "" } })}
            type="button"
          >
            حذف انتخاب
          </button>
        </div>
      ) : !isLoadingIcons ? (
        <div className="rounded-xl border border-zinc-800 bg-black px-4 py-6 text-sm text-zinc-500">
          از لیست بالا یک آیکون انتخاب کنید یا با دکمه + آیکون جدید بسازید.
        </div>
      ) : null}

      <Popup
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="افزودن آیکون"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-white hover:text-white"
              onClick={() => setIsCreateOpen(false)}
              type="button"
            >
              انصراف
            </button>
            <button
              className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isCreating}
              form={formId}
              type="submit"
            >
              {isCreating ? "در حال ذخیره..." : "ثبت آیکون"}
            </button>
          </div>
        }
      >
        <form className="space-y-5" id={formId} onSubmit={handleCreate}>
          <div>
            <label className="mb-2 block text-xs text-zinc-400">نام</label>
            <input
              className="w-full rounded-xl border border-zinc-800 bg-black text-white"
              name="name"
              onChange={handleChange}
              placeholder="مثلا دسته‌بندی اکشن"
              value={form.name}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs text-zinc-400">کد SVG آیکون</label>
            <textarea
              className="w-full rounded-xl border border-zinc-800 bg-black text-white"
              name="svg"
              onChange={handleChange}
              placeholder="<svg ...>...</svg>"
              rows="6"
              value={form.svg}
            />
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-zinc-800 bg-black px-3 py-3">
              <span className="text-xs text-zinc-500">پیش‌نمایش</span>
              <IconPreview icon={{ svg: form.svg, color: form.color }} label="icon preview" />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs text-zinc-400">رنگ</label>
            <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-black p-3 sm:flex-row sm:items-center">
              <input
                className="h-11 w-full cursor-pointer rounded-lg border border-zinc-800 bg-black p-1 sm:w-24"
                name="color"
                onChange={handleChange}
                type="color"
                value={selectedColor}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-zinc-300">{form.color?.trim() || "بدون رنگ اختصاصی"}</p>
                <p className="mt-1 text-xs text-zinc-500">انتخاب رنگ اختیاری است.</p>
              </div>
              <button
                className="rounded-lg border border-zinc-800 px-3 py-2 text-xs text-zinc-300 transition hover:border-white hover:text-white"
                onClick={() => handleChange({ target: { name: "color", value: "" } })}
                type="button"
              >
                حذف رنگ
              </button>
            </div>
          </div>
        </form>
      </Popup>
    </div>
  );
}

export default IconPicker;

