import React, { useState } from "react";
import { Link } from "react-router-dom";
import ControlPanel from "./ControlPanel";
import MutationFeedback from "@/components/MutationFeedback";
import ThumbnailUpload from "@/components/shared/ThumbnailUpload";
import DisplayImages from "@/components/shared/DisplayImages";
import {
  useCreateCategoryMutation,
  useGetCategoryTreeQuery,
} from "../services/category/categoryApi";

function SvgPreview({ svg, label }) {
  if (!svg?.trim()) {
    return <span className="text-zinc-500">ندارد</span>;
  }

  return (
    <div
      aria-label={label}
      className="flex h-12 w-12 items-center justify-center rounded-lg border border-zinc-800 bg-black text-white [&_svg]:h-6 [&_svg]:w-6"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function renderTreeOptions(nodes, depth = 0) {
  return nodes.flatMap((node) => [
    <option key={node._id} value={node._id}>
      {`${"- ".repeat(depth)}${node.name}`}
    </option>,
    ...(node.children?.length ? renderTreeOptions(node.children, depth + 1) : []),
  ]);
}

function CategoryCreate() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    icon: "",
    parent: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState("");

  const { data: treeData } = useGetCategoryTreeQuery();
  const [createCategory, mutationState] = useCreateCategoryMutation();
  const tree = treeData?.data || [];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("icon", form.icon.trim());
      if (form.parent) formData.append("parent", form.parent);
      if (form.image) formData.append("image", form.image);

      await createCategory(formData).unwrap();
    } catch (_) {}
  };

  return (
    <ControlPanel>
      <MutationFeedback
        state={mutationState}
        toastId="create-category"
        loadingMessage="در حال ثبت دسته‌بندی..."
        successMessage="دسته‌بندی با موفقیت ثبت شد"
        errorMessage="ثبت دسته‌بندی انجام نشد"
        navigateTo="/categories"
      />

      <section className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between rounded-2xl border border-zinc-700 bg-black/80 p-5">
          <div>
            <p className="text-xs text-zinc-400">مدیریت ساختار بازی</p>
            <h1 className="mt-1 text-2xl font-bold text-white">افزودن دسته‌بندی</h1>
          </div>
          <Link
            className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-white hover:text-white"
            to="/categories"
          >
            بازگشت به لیست
          </Link>
        </div>

        <form
          className="space-y-5 rounded-2xl border border-zinc-700 bg-zinc-950 p-5"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs text-zinc-400">نام</label>
              <input
                className="w-full rounded-xl border border-zinc-800 bg-black text-white"
                name="name"
                onChange={handleChange}
                placeholder="مثلا اکشن"
                value={form.name}
              />
            </div>
            <div>
              <label className="mb-2 block text-xs text-zinc-400">والد</label>
              <select
                className="w-full rounded-xl border border-zinc-800 bg-black text-white"
                name="parent"
                onChange={handleChange}
                value={form.parent}
              >
                <option value="">بدون والد</option>
                {renderTreeOptions(tree)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs text-zinc-400">کد SVG آیکون</label>
            <textarea
              className="w-full rounded-xl border border-zinc-800 bg-black text-white"
              name="icon"
              onChange={handleChange}
              placeholder="<svg ...>...</svg>"
              rows="5"
              value={form.icon}
            />
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-zinc-800 bg-black px-3 py-3">
              <span className="text-xs text-zinc-500">پیش‌نمایش</span>
              <SvgPreview label="category icon preview" svg={form.icon} />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs text-zinc-400">توضیح</label>
            <textarea
              className="w-full rounded-xl border border-zinc-800 bg-black text-white"
              name="description"
              onChange={handleChange}
              placeholder="توضیح کوتاه برای دسته‌بندی"
              rows="4"
              value={form.description}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs text-zinc-400">تصویر</label>
            <ThumbnailUpload
              name="image"
              preview={imagePreview}
              setThumbnail={(file) =>
                setForm((prev) => ({
                  ...prev,
                  image: file,
                }))
              }
              setThumbnailPreview={setImagePreview}
              title="انتخاب تصویر دسته‌بندی"
            />
    
          </div>

          <button
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={mutationState.isLoading}
            type="submit"
          >
            {mutationState.isLoading ? "در حال ثبت..." : "ثبت دسته‌بندی"}
          </button>
        </form>
      </section>
    </ControlPanel>
  );
}

export default CategoryCreate;
