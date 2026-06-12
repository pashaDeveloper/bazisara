import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ControlPanel from "../ControlPanel";
import { SingleSelectDropdown } from "@/components/shared/Dropdown";
import { DatePickerField, TextField, TextareaField } from "../games/components/GameFormFields";
import {
  useCreatePlatformMutation,
  useGetPlatformQuery,
  useGetPlatformsQuery,
  useUpdatePlatformMutation,
} from "@/services/platformApi";
import { flattenPlatforms, toDateInput } from "./utils";

const initialForm = {
  name: "",
  slug: "",
  parent: "",
  productionDate: "",
  description: "",
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

function PlatformForm({ mode = "create" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === "edit";
  const [form, setForm] = useState(initialForm);
  const { data: platformData, isLoading } = useGetPlatformQuery(id, { skip: !isEdit || !id });
  const { data: treeData } = useGetPlatformsQuery({ tree: true, limit: 500 });
  const [createPlatform, createState] = useCreatePlatformMutation();
  const [updatePlatform, updateState] = useUpdatePlatformMutation();
  const isSaving = createState.isLoading || updateState.isLoading;

  const parentOptions = useMemo(
    () => flattenPlatforms(treeData?.data || []).filter((item) => item._id !== id),
    [id, treeData]
  );

  useEffect(() => {
    const platform = platformData?.data;
    if (!platform) return;
    setForm({
      name: platform.name || "",
      slug: platform.slug || "",
      parent: platform.parent?._id || platform.parent || "",
      productionDate: toDateInput(platform.productionDate),
      description: platform.description || "",
    });
  }, [platformData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "name" && !isEdit ? { slug: makeSlug(value) } : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error("نام پلتفرم را وارد کنید");
      return;
    }

    const body = {
      ...form,
      slug: form.slug || makeSlug(form.name),
    };

    try {
      const response = isEdit
        ? await updatePlatform({ id, body }).unwrap()
        : await createPlatform(body).unwrap();
      toast.success(response.description || "پلتفرم ذخیره شد");
      navigate("/platforms");
    } catch (error) {
      toast.error(error?.data?.description || "ذخیره پلتفرم انجام نشد");
    }
  };

  return (
    <ControlPanel>
      <section className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between rounded-2xl border border-zinc-700 bg-black/80 p-5">
          <h1 className="text-2xl font-bold text-white">{isEdit ? "ویرایش پلتفرم" : "افزودن پلتفرم"}</h1>
          <Link className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-white hover:text-white" to="/platforms">
            بازگشت
          </Link>
        </div>

        <form className="space-y-5 rounded-2xl border border-zinc-700 bg-zinc-950 p-5" onSubmit={handleSubmit}>
          {isLoading ? (
            <div className="rounded-xl border border-zinc-800 bg-black px-4 py-8 text-center text-sm text-zinc-500">در حال دریافت...</div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <TextField label="نام پلتفرم" name="name" onChange={handleChange} value={form.name} />
                <TextField dir="ltr" label="اسلاگ" name="slug" onChange={handleChange} value={form.slug} />
                <SingleSelectDropdown
                  label="والد"
                  name="parent"
                  onChange={handleChange}
                  options={[{ label: "بدون والد", value: "" }, ...parentOptions]}
                  value={form.parent}
                />
                <DatePickerField
                  label="تاریخ تولید"
                  onChange={(value) => setForm((prev) => ({ ...prev, productionDate: value }))}
                  value={form.productionDate}
                />
              </div>
              <TextareaField label="توضیح" name="description" onChange={handleChange} rows={5} value={form.description} />
              <div className="flex justify-end border-t border-zinc-800 pt-4">
                <button
                  className="h-11 rounded-xl bg-white px-5 text-sm font-black text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving ? "در حال ذخیره..." : "ذخیره پلتفرم"}
                </button>
              </div>
            </>
          )}
        </form>
      </section>
    </ControlPanel>
  );
}

export default PlatformForm;

