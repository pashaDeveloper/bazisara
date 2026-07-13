import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ControlPanel from "../ControlPanel";
import ThumbnailUpload from "@/components/shared/ThumbnailUpload";
import MyEditor from "@/components/shared/textEditor/TextEditor";
import SendButton from "@/components/shared/button/SendButton";
import { mediaToFormValue } from "@/utils/immediateUpload";
import {
  useCreateGameKeywordMutation,
  useGenerateGameKeywordSlugMutation,
  useGetGameKeywordQuery,
  useUpdateGameKeywordMutation,
} from "@/services/gameKeywordApi";

const initialForm = {
  name: "",
  slug: "",
  description: "",
  image: null,
};

function GameKeywordForm({ mode = "create" }) {
  const isEdit = mode === "edit";
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [imagePreview, setImagePreview] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const { data: itemData, isLoading: isLoadingItem } = useGetGameKeywordQuery(id, {
    skip: !isEdit || !id,
  });
  const [createKeyword, createState] = useCreateGameKeywordMutation();
  const [updateKeyword, updateState] = useUpdateGameKeywordMutation();
  const [generateSlug, generateSlugState] = useGenerateGameKeywordSlugMutation();
  const mutationState = isEdit ? updateState : createState;

  useEffect(() => {
    if (!itemData?.data) return;

    const item = itemData.data;
    setForm({
      name: item.name || "",
      slug: item.slug || "",
      description: item.description || "",
      image: null,
    });
    setImagePreview(item.image?.url || "");
    setSlugTouched(true);
  }, [itemData]);

  useEffect(() => {
    if (isEdit || slugTouched) return undefined;

    const name = form.name.trim();
    if (!name) return undefined;

    const timer = window.setTimeout(async () => {
      try {
        const response = await generateSlug(name).unwrap();
        const slug = response?.data?.slug || "";
        if (slug) {
          setForm((prev) => ({ ...prev, slug }));
        }
      } catch (_) {}
    }, 600);

    return () => window.clearTimeout(timer);
  }, [form.name, generateSlug, isEdit, slugTouched]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "slug") setSlugTouched(true);
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const buildFormData = () => {
    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("slug", form.slug.trim());
    formData.append("description", form.description || "");
    const imageValue = mediaToFormValue(form.image);
    if (imageValue) formData.append("image", imageValue);
    return formData;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("نام کلمه کلیدی را وارد کنید", { id: "save-game-keyword" });
      return;
    }

    if (!form.slug.trim()) {
      toast.error("اسلاگ را وارد کنید", { id: "save-game-keyword" });
      return;
    }

    try {
      toast.loading(isEdit ? "در حال به‌روزرسانی..." : "در حال ثبت...", {
        id: "save-game-keyword",
      });

      const formData = buildFormData();
      const response = isEdit
        ? await updateKeyword({ id, formData }).unwrap()
        : await createKeyword(formData).unwrap();

      toast.success(response.description || "کلمه کلیدی بازی ذخیره شد", {
        id: "save-game-keyword",
      });
      navigate("/game-keywords");
    } catch (error) {
      toast.error(error?.data?.description || "ذخیره کلمه کلیدی انجام نشد", {
        id: "save-game-keyword",
      });
    }
  };

  return (
    <ControlPanel>
      <section className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-black/80">
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">کلمات کلیدی بازی</p>
            <h1 className="mt-1 text-2xl font-bold text-zinc-950 dark:text-white">
              {isEdit ? "ویرایش کلمه کلیدی بازی" : "افزودن کلمه کلیدی بازی"}
            </h1>
          </div>
          <Link
            className="rounded-xl border border-zinc-200 px-4 py-2 text-sm text-zinc-600 transition hover:border-zinc-400 hover:text-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-white dark:hover:text-white"
            to="/game-keywords"
          >
            بازگشت به لیست
          </Link>
        </div>

        <form className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-950" onSubmit={handleSubmit}>
          {isLoadingItem ? (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-black">
              در حال دریافت...
            </div>
          ) : (
            <>
              <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-black">
                <div className="mb-4">
                  <span className="mb-3 block text-sm text-zinc-700 dark:text-zinc-300">تصویر کلمه کلیدی</span>
                  <p className="mb-3 text-xs text-zinc-500">اندازه پیشنهادی: 768 × 768</p>
                </div>
                <ThumbnailUpload
                  immediateUpload
                  immediateUploadOptions={{
                    entityName: form.name || form.slug,
                    entityType: "game-keyword",
                    requireEntityName: false,
                  }}
                  name="image"
                  onRemove={() => {
                    setForm((prev) => ({ ...prev, image: null }));
                    setImagePreview("");
                  }}
                  preview={imagePreview}
                  profilePreview
                  setThumbnail={(file) => setForm((prev) => ({ ...prev, image: file }))}
                  setThumbnailPreview={setImagePreview}
                  title="انتخاب"
                />
              </section>

              <section className="grid gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-black/60 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs text-zinc-600 dark:text-zinc-400">نام</label>
                  <input
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-950 outline-none transition focus:border-blue-500 dark:border-zinc-800 dark:bg-black dark:text-white"
                    name="name"
                    onChange={handleChange}
                    placeholder="مثلا اکشن"
                    value={form.name}
                  />
                </div>
                <div>
                  <label className="mb-2 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                    <span>اسلاگ</span>
                    {generateSlugState.isLoading ? <span className="text-blue-400">در حال ساخت...</span> : null}
                  </label>
                  <input
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-left text-zinc-950 outline-none transition focus:border-blue-500 dark:border-zinc-800 dark:bg-black dark:text-white"
                    dir="ltr"
                    name="slug"
                    onChange={handleChange}
                    placeholder="action"
                    value={form.slug}
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-black/60">
                <label className="mb-3 block text-xs text-zinc-600 dark:text-zinc-400">توضیحات</label>
                <div className="game-summary-editor min-w-0 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-gray-600 dark:bg-[#0a2d4d]">
                  <MyEditor
                    onChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
                    value={form.description}
                  />
                </div>
              </section>

              <div className="flex justify-end border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <SendButton
                  isLoading={mutationState.isLoading}
                  label={isEdit ? "ذخیره کلمه کلیدی" : "ثبت کلمه کلیدی"}
                  loadingLabel="در حال ارسال..."
                />
              </div>
            </>
          )}
        </form>
      </section>
    </ControlPanel>
  );
}

export default GameKeywordForm;
