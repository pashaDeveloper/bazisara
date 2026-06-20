import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ControlPanel from "../ControlPanel";
import { MultiSelectDropdown } from "@/components/shared/Dropdown";
import { TextField, TextareaField } from "../games/components/GameFormFields";
import {
  useCreateGameCollectionMutation,
  useGetGameCollectionQuery,
  useUpdateGameCollectionMutation,
} from "@/services/gameCollectionApi";
import { useGetGamesQuery } from "@/services/gameApi";

const initialForm = {
  title_fa: "",
  title_en: "",
  slug: "",
  placement: "homepage",
  description: "",
  visibility: true,
  games: [],
};

function makeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06ff-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function GameRows({ gameOptions, items, onChange }) {
  const selectedIds = items.map((item) => item.game).filter(Boolean);
  const selectedMap = useMemo(() => new Map(gameOptions.map((item) => [item.value, item.label])), [gameOptions]);

  const setSelected = (ids) => {
    onChange(
      ids.map((id, index) => {
        const current = items.find((item) => item.game === id);
        return current || { game: id, sortOrder: index, visible: true };
      })
    );
  };

  const update = (index, patch) => {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  };

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-800 bg-black p-4">
      <MultiSelectDropdown label="بازی‌ها" onChange={setSelected} options={gameOptions} value={selectedIds} />
      <div className="space-y-2">
        {items.length ? (
          items.map((item, index) => (
            <div className="grid gap-3 rounded-xl border border-zinc-900 bg-zinc-950 p-3 md:grid-cols-[minmax(0,1fr)_120px_120px]" key={item.game}>
              <span className="truncate text-sm font-bold text-zinc-100">{selectedMap.get(item.game) || item.game}</span>
              <input
                className="h-10 rounded-lg border border-zinc-800 bg-black px-3 text-sm text-white outline-none focus:border-white"
                inputMode="numeric"
                onChange={(event) => update(index, { sortOrder: Number(event.target.value) || 0 })}
                value={item.sortOrder ?? index}
              />
              <label className="flex h-10 items-center gap-2 text-sm text-zinc-300">
                <input
                  checked={item.visible !== false}
                  onChange={(event) => update(index, { visible: event.target.checked })}
                  type="checkbox"
                />
                نمایش
              </label>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4 text-center text-sm text-zinc-500">بازی‌ای انتخاب نشده است.</div>
        )}
      </div>
    </div>
  );
}

function GameCollectionForm({ mode = "create" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === "edit";
  const [form, setForm] = useState(initialForm);
  const { data: collectionData, isLoading } = useGetGameCollectionQuery(id, { skip: !isEdit || !id });
  const { data: gamesData } = useGetGamesQuery({ page: 1, limit: 500 });
  const [createCollection, createState] = useCreateGameCollectionMutation();
  const [updateCollection, updateState] = useUpdateGameCollectionMutation();
  const isSaving = createState.isLoading || updateState.isLoading;

  const gameOptions = useMemo(
    () => (gamesData?.data || []).map((item) => ({ label: item.title, value: item._id })),
    [gamesData]
  );

  useEffect(() => {
    const item = collectionData?.data;
    if (!item) return;
    setForm({
      title_fa: item.title_fa || "",
      title_en: item.title_en || "",
      slug: item.slug || "",
      placement: item.placement || "homepage",
      description: item.description || "",
      visibility: item.visibility !== false,
      games: (item.games || []).map((entry, index) => ({
        game: entry.game?._id || entry.game || "",
        sortOrder: entry.sortOrder ?? index,
        visible: entry.visible !== false,
      })).filter((entry) => entry.game),
    });
  }, [collectionData]);

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "title_en" && !isEdit ? { slug: makeSlug(value) } : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title_fa.trim()) {
      toast.error("عنوان فارسی کالکشن را وارد کنید", { id: "collection-form" });
      return;
    }
    try {
      toast.loading("در حال ذخیره کالکشن...", { id: "collection-form" });
      const body = {
        ...form,
        slug: form.slug || makeSlug(form.title_en || form.title_fa),
      };
      const response = isEdit
        ? await updateCollection({ id, body }).unwrap()
        : await createCollection(body).unwrap();
      toast.success(response.description || "کالکشن ذخیره شد", { id: "collection-form" });
      navigate("/game-collections");
    } catch (error) {
      toast.error(error?.data?.description || "ذخیره کالکشن انجام نشد", { id: "collection-form" });
    }
  };

  return (
    <ControlPanel>
      <section className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between rounded-2xl border border-zinc-700 bg-black/80 p-5">
          <h1 className="text-2xl font-bold text-white">{isEdit ? "ویرایش کالکشن بازی" : "افزودن کالکشن بازی"}</h1>
          <Link className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-white hover:text-white" to="/game-collections">
            بازگشت
          </Link>
        </div>

        <form className="space-y-5 rounded-2xl border border-zinc-700 bg-zinc-950 p-5" onSubmit={handleSubmit}>
          {isLoading ? (
            <div className="rounded-xl border border-zinc-800 bg-black px-4 py-8 text-center text-sm text-zinc-500">در حال دریافت...</div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <TextField label="عنوان فارسی" name="title_fa" onChange={handleChange} value={form.title_fa} />
                <TextField dir="ltr" label="عنوان انگلیسی" name="title_en" onChange={handleChange} value={form.title_en} />
                <TextField dir="ltr" label="اسلاگ" name="slug" onChange={handleChange} value={form.slug} />
                <TextField label="جایگاه نمایش" name="placement" onChange={handleChange} value={form.placement} />
              </div>
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input checked={form.visibility} name="visibility" onChange={handleChange} type="checkbox" />
                نمایش کالکشن
              </label>
              <TextareaField label="توضیح" name="description" onChange={handleChange} rows={4} value={form.description} />
              <GameRows gameOptions={gameOptions} items={form.games} onChange={(games) => setForm((prev) => ({ ...prev, games }))} />
              <div className="flex justify-end border-t border-zinc-800 pt-4">
                <button
                  className="h-11 rounded-xl bg-white px-5 text-sm font-black text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving ? "در حال ذخیره..." : "ذخیره کالکشن"}
                </button>
              </div>
            </>
          )}
        </form>
      </section>
    </ControlPanel>
  );
}

export default GameCollectionForm;
