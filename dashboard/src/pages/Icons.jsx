import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Popup from "@/components/ui/Popup";
import DeleteModal from "@/components/shared/DeleteModal";
import Pagination, { usePaginationState } from "@/components/shared/Pagination";
import SearchBox, { useDebouncedValue } from "@/components/shared/SearchBox";
import Pencil from "@/components/icons/Pencil";
import ControlPanel from "./ControlPanel";
import {
  useCreateIconMutation,
  useDeleteIconMutation,
  useGetIconsQuery,
  useUpdateIconMutation,
} from "../services/iconApi";

const initialForm = {
  name: "",
  svg: "",
  color: "",
};

function SvgPreview({ svg, color, label }) {
  if (!svg?.trim()) {
    return <span className="text-zinc-500">ندارد</span>;
  }

  return (
    <div
      aria-label={label}
      className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-black dark:text-white [&_svg]:h-6 [&_svg]:w-6"
      style={{ color: color || undefined }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function IconForm({ form, isLoading, mode, onChange, onSubmit }) {
  const selectedColor = form.color?.trim() || "#ffffff";

  return (
    <form className="space-y-5" id="icon-form" onSubmit={onSubmit}>
      <div>
        <label className="mb-2 block text-xs text-zinc-400">نام</label>
        <input
          className="w-full rounded-xl border border-zinc-800 bg-black text-white"
          name="name"
          onChange={onChange}
          placeholder="مثلا دسته‌بندی اکشن"
          value={form.name}
        />
      </div>

      <div>
        <label className="mb-2 block text-xs text-zinc-400">کد SVG آیکون</label>
        <textarea
          className="w-full rounded-xl border border-zinc-800 bg-black text-white"
          name="svg"
          onChange={onChange}
          placeholder="<svg ...>...</svg>"
          rows="6"
          value={form.svg}
        />
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-zinc-800 bg-black px-3 py-3">
          <span className="text-xs text-zinc-500">پیش‌نمایش</span>
          <SvgPreview label="icon preview" svg={form.svg} color={form.color} />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs text-zinc-400">رنگ</label>
        <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-black p-3 sm:flex-row sm:items-center">
          <input
            className="h-11 w-full cursor-pointer rounded-lg border border-zinc-800 bg-black p-1 sm:w-24"
            name="color"
            onChange={onChange}
            type="color"
            value={selectedColor}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-zinc-300">{form.color?.trim() || "بدون رنگ اختصاصی"}</p>
            <p className="mt-1 text-xs text-zinc-500">انتخاب رنگ اختیاری است.</p>
          </div>
          <button
            className="rounded-lg border border-zinc-800 px-3 py-2 text-xs text-zinc-300 transition hover:border-white hover:text-white"
            onClick={() => onChange({ target: { name: "color", value: "" } })}
            type="button"
          >
            حذف رنگ
          </button>
        </div>
      </div>

      <button className="hidden" disabled={isLoading} type="submit">
        {mode === "edit" ? "ذخیره تغییرات" : "ثبت آیکون"}
      </button>
    </form>
  );
}

function Icons() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const iconsPagination = usePaginationState(5, debouncedSearch);
  const { data: iconsData, isLoading } = useGetIconsQuery({
    limit: iconsPagination.pageSize,
    page: iconsPagination.currentPage,
    search: debouncedSearch,
  });
  const [createIcon, { isLoading: isCreating }] = useCreateIconMutation();
  const [updateIcon, { isLoading: isUpdating }] = useUpdateIconMutation();
  const [deleteIcon, { isLoading: isDeleting }] = useDeleteIconMutation();

  const [form, setForm] = useState(initialForm);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [popupMode, setPopupMode] = useState(null);

  const icons = iconsData?.data || [];
  const iconsMeta = iconsData?.pagination;
  const isFormLoading = isCreating || isUpdating;

  useEffect(() => {
    if (popupMode === "create") {
      setForm(initialForm);
      setSelectedIcon(null);
    }
  }, [popupMode]);

  const closePopup = () => {
    setPopupMode(null);
    setSelectedIcon(null);
    setForm(initialForm);
  };

  const openEditPopup = (icon) => {
    setSelectedIcon(icon);
    setForm({
      name: icon.name || "",
      svg: icon.svg || "",
      color: icon.color || "",
    });
    setPopupMode("edit");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.svg.trim()) {
      toast.error("نام و کد SVG آیکون الزامی است");
      return;
    }

    try {
      const body = {
        name: form.name.trim(),
        svg: form.svg.trim(),
        color: form.color.trim(),
      };

      const response =
        popupMode === "edit"
          ? await updateIcon({ id: selectedIcon._id, body }).unwrap()
          : await createIcon(body).unwrap();

      toast.success(response.description || "عملیات با موفقیت انجام شد");
      closePopup();
    } catch (error) {
      toast.error(error?.data?.description || "عملیات انجام نشد");
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;

    try {
      const response = await deleteIcon(id).unwrap();
      toast.success(response.description || "آیکون حذف شد");
    } catch (error) {
      toast.error(error?.data?.description || "حذف آیکون انجام نشد");
    }
  };

  return (
    <ControlPanel>
      <section className="space-y-6">
        <div className="rounded-2xl border border-zinc-700 bg-black/80 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs text-zinc-400">مدیریت آیکون‌ها</p>
              <h1 className="mt-1 text-2xl font-bold text-white">آیکون‌ها</h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-500">
                آیکون‌های SVG ذخیره‌شده برای استفاده در بخش‌های مختلف داشبورد از اینجا قابل مدیریت هستند.
              </p>
            </div>
            <button
              className="inline-flex w-auto items-center justify-center rounded-lg bg-green-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-green-400"
              onClick={() => setPopupMode("create")}
              type="button"
            >
              افزودن آیکون
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">لیست آیکون‌ها</h2>
              <span className="mt-1 block text-xs text-zinc-500">{iconsMeta?.totalItems || icons.length} مورد</span>
            </div>
            <SearchBox onChange={setSearch} placeholder="جستجوی نام یا رنگ آیکون..." value={search} />
          </div>

          <div className="mt-4 overflow-hidden">
            <table className="w-full table-fixed text-right text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="w-[45%] pb-3 font-medium sm:w-[36%]">نام</th>
                  <th className="w-[28%] pb-3 font-medium sm:w-[24%]">آیکون</th>
                  <th className="hidden pb-3 font-medium md:table-cell">رنگ</th>
                  <th className="w-16 pb-3 text-center font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="py-6 text-center text-zinc-500" colSpan="4">
                      در حال دریافت...
                    </td>
                  </tr>
                ) : icons.length ? (
                  icons.map((item) => (
                    <tr key={item._id} className="border-b border-zinc-900 text-zinc-200">
                      <td className="py-4 pl-3">
                        <span className="block truncate">{item.name}</span>
                      </td>
                      <td className="py-4">
                        <SvgPreview svg={item.svg} color={item.color} label={item.name} />
                      </td>
                      <td className="hidden py-4 text-zinc-400 md:table-cell">{item.color || "-"}</td>
                      <td className="py-4">
                        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
                          <button
                            aria-label="ویرایش آیکون"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 transition hover:border-white hover:text-white"
                            onClick={() => openEditPopup(item)}
                            type="button"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <DeleteModal
                            ariaLabel="حذف آیکون"
                            isLoading={isDeleting}
                            itemTitle={item.name}
                            message="این آیکون حذف شود؟"
                            onDelete={() => handleDelete(item._id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-6 text-center text-zinc-500" colSpan="4">
                      هنوز آیکونی ثبت نشده است.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={iconsPagination.currentPage}
            onPageChange={iconsPagination.setCurrentPage}
            onPageSizeChange={iconsPagination.setPageSize}
            pageSize={iconsPagination.pageSize}
            totalItems={iconsMeta?.totalItems || icons.length}
            totalPages={iconsMeta?.totalPages}
          />
        </div>
      </section>

      <Popup
        isOpen={popupMode === "create" || popupMode === "edit"}
        onClose={closePopup}
        title={popupMode === "edit" ? "ویرایش آیکون" : "افزودن آیکون"}
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-white hover:text-white"
              onClick={closePopup}
              type="button"
            >
              انصراف
            </button>
            <button
              className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isFormLoading}
              form="icon-form"
              type="submit"
            >
              {isFormLoading ? "در حال ذخیره..." : popupMode === "edit" ? "ذخیره تغییرات" : "ثبت آیکون"}
            </button>
          </div>
        }
      >
        <IconForm form={form} isLoading={isFormLoading} mode={popupMode} onChange={handleChange} onSubmit={handleSubmit} />
      </Popup>
    </ControlPanel>
  );
}

export default Icons;
