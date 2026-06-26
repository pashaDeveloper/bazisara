import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ControlPanel from "../ControlPanel";
import DynamicOptionsInput from "@/components/shared/DynamicOptionsInput";
import SendButton from "@/components/shared/button/SendButton";
import {
  useCreateCategoryFilterMutation,
  useGetCategoryFilterQuery,
  useUpdateCategoryFilterMutation,
} from "../../services/category/categoryFilterApi";
import { useGetCategoryTreeQuery } from "../../services/category/categoryApi";
import { useGetFilterDefinitionsQuery } from "../../services/category/filterDefinitionApi";
import renderTreeOptions from "../categories/components/renderTreeOptions";
import { getTypeLabel, numericTypes, optionTypes } from "./filterOptions";

const initialForm = {
  category: "",
  filter: "",
  options: [],
  min: "",
  max: "",
  unit: "",
  isRequired: false,
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

function CategoryOptionsEditor({ definition, onChange, value }) {
  const definitionOptions = definition?.options || [];
  const isColor = definition?.type === "color";

  return (
    <div className="space-y-3">
      <DynamicOptionsInput
        helperText={
          isColor
            ? "رنگ‌هایی را وارد کنید که برای این دسته‌بندی قابل انتخاب هستند."
            : "آیتم‌هایی را وارد کنید که این دسته‌بندی برای این فیلتر دارد."
        }
        isColor={isColor}
        label={isColor ? "رنگ‌های این دسته‌بندی" : "آیتم‌های این فیلتر در این دسته‌بندی"}
        onChange={onChange}
        value={value}
      />

      {definitionOptions.length ? (
        <div className="flex justify-end">
          <button
            className="rounded-lg border border-zinc-800 px-3 py-2 text-xs text-zinc-300 transition hover:border-white hover:text-white"
            onClick={() => onChange(definitionOptions)}
            type="button"
          >
            استفاده از گزینه‌های تعریف اصلی
          </button>
        </div>
      ) : null}
    </div>
  );
}

function CategoryFilterForm({ mode = "create" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === "edit";
  const [form, setForm] = useState(initialForm);

  const { data: treeData } = useGetCategoryTreeQuery();
  const { data: definitionsData } = useGetFilterDefinitionsQuery({ page: 1, limit: 100 });
  const { data: filterData, isLoading: isLoadingFilter } = useGetCategoryFilterQuery(id, {
    skip: !isEdit || !id,
  });
  const [createFilter, createState] = useCreateCategoryFilterMutation();
  const [updateFilter, updateState] = useUpdateCategoryFilterMutation();

  const tree = treeData?.data || [];
  const definitions = definitionsData?.data || [];
  const selectedDefinition =
    definitions.find((item) => item._id === form.filter) || filterData?.data?.filter;
  const isSaving = createState.isLoading || updateState.isLoading;
  const showOptions = optionTypes.includes(selectedDefinition?.type);
  const showNumbers = numericTypes.includes(selectedDefinition?.type);

  useEffect(() => {
    const filter = filterData?.data;
    if (!filter) return;

    setForm({
      category: filter.category?._id || filter.category || "",
      filter: filter.filter?._id || filter.filter || "",
      options: filter.options?.length ? filter.options : [],
      min: filter.min ?? "",
      max: filter.max ?? "",
      unit: filter.unit || "",
      isRequired: Boolean(filter.isRequired),
      isActive: filter.status !== "inactive",
    });
  }, [filterData]);

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "filter" ? { options: [], min: "", max: "", unit: "" } : {}),
    }));
  };

  const handleOptionsChange = (options) => {
    setForm((prev) => ({ ...prev, options }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.category || !form.filter) {
      toast.error("دسته‌بندی و فیلتر را انتخاب کنید");
      return;
    }

    const options = cleanOptions(form.options);
    if (showOptions && !options.length) {
      toast.error("آیتم‌های این فیلتر را برای دسته‌بندی وارد کنید");
      return;
    }

    const body = {
      category: form.category,
      filter: form.filter,
      ...(showOptions ? { options } : {}),
      ...(showNumbers && form.min !== "" ? { min: form.min } : {}),
      ...(showNumbers && form.max !== "" ? { max: form.max } : {}),
      ...(showNumbers && form.unit !== "" ? { unit: form.unit } : {}),
      isRequired: form.isRequired,
      isActive: form.isActive,
    };

    try {
      const response = isEdit
        ? await updateFilter({ id, body }).unwrap()
        : await createFilter(body).unwrap();

      toast.success(response.description || "اتصال فیلتر ذخیره شد");
      navigate("/category-filters");
    } catch (error) {
      toast.error(
        error?.data?.description ||
          error?.message ||
          "ذخیره اتصال فیلتر انجام نشد"
      );
    }
  };

  return (
    <ControlPanel>
      <section className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between rounded-2xl border border-zinc-700 bg-black/80 p-5">
          <div>
            <p className="text-xs text-zinc-400">تنظیم آیتم‌های فیلتر برای هر دسته‌بندی</p>
            <h1 className="mt-1 text-2xl font-bold text-white">
              {isEdit ? "ویرایش فیلتر دسته‌بندی" : "افزودن فیلتر به دسته‌بندی"}
            </h1>
          </div>
          <Link
            className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-white hover:text-white"
            to="/category-filters"
          >
            بازگشت
          </Link>
        </div>

        <form
          className="space-y-5 rounded-2xl border border-zinc-700 bg-zinc-950 p-5"
          onSubmit={handleSubmit}
        >
          {isLoadingFilter ? (
            <div className="rounded-xl border border-zinc-800 bg-black px-4 py-6 text-sm text-zinc-500">
              در حال دریافت...
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm text-zinc-300">دسته‌بندی</span>
                  <select
                    className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-white outline-none transition focus:border-white"
                    name="category"
                    onChange={handleChange}
                    required
                    value={form.category}
                  >
                    <option value="" className="text-left">انتخاب دسته‌بندی</option>
                    {renderTreeOptions(tree)}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm text-zinc-300">فیلتر آماده</span>
                  <select
                    className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-white outline-none transition focus:border-white"
                    name="filter"
                    onChange={handleChange}
                    required
                    value={form.filter}
                  >
                    <option value="">انتخاب فیلتر</option>
                    {definitions.map((filter) => (
                      <option key={filter._id} value={filter._id}>
                        {filter.label} - {getTypeLabel(filter.type)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {selectedDefinition ? (
                <div className="rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-zinc-400">
                  <span className="text-white">{selectedDefinition.label}</span>
                  <span className="mx-2 text-zinc-600">/</span>
                  <span dir="ltr">{selectedDefinition.key}</span>
                  <span className="mx-2 text-zinc-600">/</span>
                  <span>{getTypeLabel(selectedDefinition.type)}</span>
                </div>
              ) : null}

              {showOptions ? (
                <CategoryOptionsEditor
                  definition={selectedDefinition}
                  onChange={handleOptionsChange}
                  value={form.options}
                />
              ) : null}

              {showNumbers ? (
                <div className="space-y-3">
                  <div className="rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-zinc-400">
                    بازه تعریف اصلی:
                    <span className="mx-2 text-white">
                      {selectedDefinition.min ?? "-"} تا {selectedDefinition.max ?? "-"}{" "}
                      {selectedDefinition.unit || ""}
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="space-y-2">
                      <span className="text-sm text-zinc-300">حداقل این دسته‌بندی</span>
                      <input
                        className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white"
                        name="min"
                        onChange={handleChange}
                        placeholder={selectedDefinition.min ?? ""}
                        type="number"
                        value={form.min}
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm text-zinc-300">حداکثر این دسته‌بندی</span>
                      <input
                        className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white"
                        name="max"
                        onChange={handleChange}
                        placeholder={selectedDefinition.max ?? ""}
                        type="number"
                        value={form.max}
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm text-zinc-300">واحد این دسته‌بندی</span>
                      <input
                        className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white"
                        name="unit"
                        onChange={handleChange}
                        placeholder={selectedDefinition.unit || "GB، تومان، اینچ"}
                        value={form.unit}
                      />
                    </label>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-zinc-300">
                  <input
                    checked={form.isRequired}
                    className="h-4 w-4 accent-white"
                    name="isRequired"
                    onChange={handleChange}
                    type="checkbox"
                  />
                  اجباری
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-zinc-300">
                  <input
                    checked={form.isActive}
                    className="h-4 w-4 accent-white"
                    name="isActive"
                    onChange={handleChange}
                    type="checkbox"
                  />
                  فعال
                </label>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <SendButton
                  isLoading={isSaving}
                  label={isEdit ? "ذخیره تغییرات" : "ثبت فیلتر دسته‌بندی"}
                  loadingLabel="در حال ذخیره..."
                />
              </div>
            </>
          )}
        </form>
      </section>
    </ControlPanel>
  );
}

export default CategoryFilterForm;

