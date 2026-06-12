import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Popup from "@/components/ui/Popup";
import ControlPanel from "../ControlPanel";
import AddButton from "@/components/shared/button/AddButton";
import DynamicOptionsInput from "@/components/shared/DynamicOptionsInput";
import Pagination, { usePaginationState } from "@/components/shared/Pagination";
import SearchBox, { useDebouncedValue } from "@/components/shared/SearchBox";
import Pencil from "@/components/icons/Pencil";
import Trash from "@/components/icons/Trash";
import {
  filterTypes,
  getTypeLabel,
  numericTypes,
  optionTypes,
} from "../categoryFilters/filterOptions";
import {
  useCreateFilterDefinitionMutation,
  useDeleteFilterDefinitionMutation,
  useGetFilterDefinitionsQuery,
  useUpdateFilterDefinitionMutation,
} from "../../services/category/filterDefinitionApi";

const initialForm = {
  key: "",
  label: "",
  type: "select",
  options: [],
  min: "",
  max: "",
  unit: "",
  isActive: true,
};

function cleanOptions(options = []) {
  return options
    .map((option) => ({
      label: String(option.label || "").trim(),
      value: String(option.value || option.label || "").trim(),
    }))
    .filter((option) => option.label && option.value);
}

function ColorOptionPreview({ option }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="h-3 w-3 shrink-0 rounded-full border border-zinc-700"
        style={{ backgroundColor: option.value }}
      />
      <span>{option.label}</span>
    </span>
  );
}

function FilterDefinitionForm({ form, onChange, onOptionsChange }) {
  const showOptions = optionTypes.includes(form.type);
  const showNumbers = numericTypes.includes(form.type);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm text-zinc-300">عنوان نمایشی</span>
          <input
            className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white"
            name="label"
            onChange={onChange}
            placeholder="مثلا گارانتی"
            value={form.label}
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm text-zinc-300">کلید فنی</span>
          <input
            className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-3 text-left text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white"
            dir="ltr"
            name="key"
            onChange={onChange}
            placeholder="warranty"
            value={form.key}
          />
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm text-zinc-300">نوع فیلتر</span>
        <select
          className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-white outline-none transition focus:border-white"
          name="type"
          onChange={onChange}
          value={form.type}
        >
          {filterTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </label>

      {showOptions ? (
        <DynamicOptionsInput
          helperText={
            form.type === "color"
              ? "برای رنگ‌ها مقدار فنی را به شکل کد رنگ مثل #000000 وارد کنید."
              : "برای گزینه‌هایی مثل گارانتی، هر ردیف یک عنوان و یک مقدار فنی دارد."
          }
          isColor={form.type === "color"}
          label={form.type === "color" ? "رنگ‌های پیش‌فرض" : "گزینه‌های پیش‌فرض"}
          onChange={onOptionsChange}
          value={form.options}
        />
      ) : null}

      {showNumbers ? (
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm text-zinc-300">حداقل</span>
            <input className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-white outline-none transition focus:border-white" name="min" onChange={onChange} type="number" value={form.min} />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-zinc-300">حداکثر</span>
            <input className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-white outline-none transition focus:border-white" name="max" onChange={onChange} type="number" value={form.max} />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-zinc-300">واحد</span>
            <input className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white" name="unit" onChange={onChange} placeholder="GB، تومان، اینچ" value={form.unit} />
          </label>
        </div>
      ) : null}

      <label className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-zinc-300">
        <input checked={form.isActive} className="h-4 w-4 accent-white" name="isActive" onChange={onChange} type="checkbox" />
        فعال
      </label>
    </div>
  );
}

function FilterDefinitions() {
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [popupMode, setPopupMode] = useState(null);
  const debouncedSearch = useDebouncedValue(search);
  const pagination = usePaginationState(5, debouncedSearch);

  const { data, isLoading } = useGetFilterDefinitionsQuery({
    page: pagination.currentPage,
    limit: pagination.pageSize,
    search: debouncedSearch,
  });
  const [createFilter, createState] = useCreateFilterDefinitionMutation();
  const [updateFilter, updateState] = useUpdateFilterDefinitionMutation();
  const [deleteFilter, deleteState] = useDeleteFilterDefinitionMutation();

  const filters = data?.data || [];
  const meta = data?.pagination;
  const isSaving = createState.isLoading || updateState.isLoading;

  useEffect(() => {
    if (popupMode === "create") {
      setForm(initialForm);
      setSelectedFilter(null);
    }
  }, [popupMode]);

  const closePopup = () => {
    setPopupMode(null);
    setSelectedFilter(null);
    setForm(initialForm);
  };

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleOptionsChange = (options) => {
    setForm((prev) => ({ ...prev, options }));
  };

  const openEdit = (filter) => {
    setSelectedFilter(filter);
    setForm({
      key: filter.key || "",
      label: filter.label || "",
      type: filter.type || "select",
      options: filter.options || [],
      min: filter.min ?? "",
      max: filter.max ?? "",
      unit: filter.unit || "",
      isActive: filter.status !== "inactive",
    });
    setPopupMode("edit");
  };

  const buildBody = () => ({
    key: form.key,
    label: form.label,
    type: form.type,
    options: optionTypes.includes(form.type) ? cleanOptions(form.options) : [],
    min: numericTypes.includes(form.type) ? form.min : null,
    max: numericTypes.includes(form.type) ? form.max : null,
    unit: numericTypes.includes(form.type) ? form.unit : "",
    isActive: form.isActive,
  });

  const handleSubmit = async () => {
    try {
      const response =
        popupMode === "edit"
          ? await updateFilter({ id: selectedFilter._id, body: buildBody() }).unwrap()
          : await createFilter(buildBody()).unwrap();

      toast.success(response.description || "تعریف فیلتر ذخیره شد");
      closePopup();
    } catch (error) {
      toast.error(error?.data?.description || "ذخیره تعریف فیلتر انجام نشد");
    }
  };

  const handleDelete = async () => {
    if (!selectedFilter?._id) return;

    try {
      const response = await deleteFilter(selectedFilter._id).unwrap();
      toast.success(response.description || "تعریف فیلتر حذف شد");
      closePopup();
    } catch (error) {
      toast.error(error?.data?.description || "حذف تعریف فیلتر انجام نشد");
    }
  };

  return (
    <ControlPanel>
      <section className="space-y-6">
        <div className="rounded-2xl border border-zinc-700 bg-black/80 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs text-zinc-400">کتابخانه فیلترهای قابل استفاده در دسته‌بندی‌ها</p>
              <h1 className="mt-1 text-2xl font-bold text-white">تعریف فیلترها</h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-500">
                فیلترهای مشترک مثل برند، ظرفیت حافظه یا رنگ را یک بار بسازید و بعد به چند دسته‌بندی وصل کنید.
              </p>
            </div>
            <AddButton onClick={() => setPopupMode("create")} />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">لیست تعریف‌ها</h2>
              <span className="mt-1 block text-xs text-zinc-500">{meta?.totalItems || filters.length} مورد</span>
            </div>
            <SearchBox onChange={setSearch} placeholder="جستجوی عنوان، کلید یا گزینه..." value={search} />
          </div>

          <div className="mt-4 overflow-hidden">
            <table className="w-full table-fixed text-right text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="w-[42%] pb-3 font-medium sm:w-[30%]">عنوان</th>
                  <th className="hidden pb-3 font-medium md:table-cell">کلید</th>
                  <th className="w-[24%] pb-3 font-medium sm:w-[18%]">نوع</th>
                  <th className="hidden pb-3 font-medium lg:table-cell">گزینه‌ها / بازه</th>
                  <th className="w-16 pb-3 text-center font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td className="py-6 text-center text-zinc-500" colSpan="5">در حال دریافت...</td></tr>
                ) : filters.length ? (
                  filters.map((item) => (
                    <tr key={item._id} className="border-b border-zinc-900 text-zinc-200">
                      <td className="py-4 pl-3">
                        <span className="block truncate font-medium text-white">{item.label}</span>
                        <span className="mt-1 inline-flex rounded-lg border border-zinc-800 px-2 py-1 text-xs text-zinc-400 sm:hidden">
                          {getTypeLabel(item.type)}
                        </span>
                      </td>
                      <td className="hidden py-4 text-right font-mono text-xs text-zinc-400 md:table-cell" dir="ltr"><span className="block truncate">{item.key}</span></td>
                      <td className="py-4">
                        <span className="inline-flex max-w-full rounded-lg border border-zinc-800 bg-black px-2 py-1 text-xs text-zinc-200">
                          <span className="truncate">{getTypeLabel(item.type)}</span>
                        </span>
                      </td>
                      <td className="hidden py-4 pl-3 text-zinc-400 lg:table-cell">
                        <span className="block truncate">
                          {item.options?.length
                            ? item.type === "color"
                              ? item.options.map((option) => <ColorOptionPreview key={option.value} option={option} />).reduce((items, option, index) => (index ? [...items, "، ", option] : [option]), [])
                              : item.options.map((option) => option.label).join("، ")
                            : item.min !== null || item.max !== null
                              ? `${item.min ?? "-"} تا ${item.max ?? "-"} ${item.unit || ""}`
                              : "-"}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
                          <button aria-label="ویرایش تعریف فیلتر" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 transition hover:border-white hover:text-white" onClick={() => openEdit(item)} type="button">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button aria-label="حذف تعریف فیلتر" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-900/70 text-red-300 transition hover:border-red-400 hover:text-red-200" onClick={() => { setSelectedFilter(item); setPopupMode("delete"); }} type="button">
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td className="py-6 text-center text-zinc-500" colSpan="5">هنوز تعریفی ثبت نشده است.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination currentPage={pagination.currentPage} onPageChange={pagination.setCurrentPage} onPageSizeChange={pagination.setPageSize} pageSize={pagination.pageSize} totalItems={meta?.totalItems || filters.length} totalPages={meta?.totalPages} />
        </div>
      </section>

      <Popup
        isOpen={popupMode === "create" || popupMode === "edit"}
        onClose={closePopup}
        title={popupMode === "edit" ? "ویرایش تعریف فیلتر" : "افزودن تعریف فیلتر"}
        footer={
          <div className="flex items-center justify-end gap-3">
            <button className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-white hover:text-white" onClick={closePopup} type="button">انصراف</button>
            <button className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50" disabled={isSaving} onClick={handleSubmit} type="button">
              {isSaving ? "در حال ذخیره..." : "ذخیره"}
            </button>
          </div>
        }
      >
        <FilterDefinitionForm form={form} onChange={handleChange} onOptionsChange={handleOptionsChange} />
      </Popup>

      <Popup
        isOpen={popupMode === "delete"}
        onClose={closePopup}
        title="حذف تعریف فیلتر"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-white hover:text-white" onClick={closePopup} type="button">انصراف</button>
            <button className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50" disabled={deleteState.isLoading} onClick={handleDelete} type="button">
              {deleteState.isLoading ? "در حال حذف..." : "حذف"}
            </button>
          </div>
        }
      >
        <p className="text-sm text-zinc-300">آیا از حذف این تعریف فیلتر مطمئن هستید؟</p>
      </Popup>
    </ControlPanel>
  );
}

export default FilterDefinitions;

