import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ControlPanel from "../ControlPanel";
import ArrayInput from "@/components/shared/ArrayInput";
import NavigationButton from "@/components/shared/button/NavigationButton";
import SendButton from "@/components/shared/button/SendButton";
import { SingleSelectDropdown } from "@/components/shared/Dropdown";
import {
  useCreateInsuranceMutation,
  useCreateWarrantyMutation,
  useGetInsuranceCompaniesQuery,
  useGetInsuranceQuery,
  useGetWarrantyCompaniesQuery,
  useGetWarrantyQuery,
  useUpdateInsuranceMutation,
  useUpdateWarrantyMutation,
} from "@/services/catalogEntityApi";

const initialForm = {
  title_fa: "",
  title_en: "",
  duration_months: "",
  provider: "",
  coverage: [],
  exclusions: [],
  conditions: [],
  refund_policy: [],
  activation_method: [],
  global_discount_percent: "",
  status: "pending",
};

function Field({ label, children }) {
  return (
    <label className="space-y-2">
      <span className="text-sm text-zinc-600 dark:text-zinc-300">{label}</span>
      {children}
    </label>
  );
}

function Input(props) {
  return <input className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-white outline-none transition focus:border-white" {...props} />;
}

function PolicyForm({ kind = "warranty", mode = "create" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === "edit";
  const isWarranty = kind === "warranty";
  const [form, setForm] = useState(initialForm);
  const warrantyCompaniesQuery = useGetWarrantyCompaniesQuery({ page: 1, limit: 300 }, { skip: !isWarranty });
  const insuranceCompaniesQuery = useGetInsuranceCompaniesQuery({ page: 1, limit: 300 }, { skip: isWarranty });
  const warrantyQuery = useGetWarrantyQuery(id, { skip: !isWarranty || !isEdit || !id });
  const insuranceQuery = useGetInsuranceQuery(id, { skip: isWarranty || !isEdit || !id });
  const [createWarranty, createWarrantyState] = useCreateWarrantyMutation();
  const [createInsurance, createInsuranceState] = useCreateInsuranceMutation();
  const [updateWarranty, updateWarrantyState] = useUpdateWarrantyMutation();
  const [updateInsurance, updateInsuranceState] = useUpdateInsuranceMutation();
  const companiesData = isWarranty ? warrantyCompaniesQuery.data : insuranceCompaniesQuery.data;
  const itemData = isWarranty ? warrantyQuery.data : insuranceQuery.data;
  const isLoading = isWarranty ? warrantyQuery.isLoading : insuranceQuery.isLoading;
  const createItem = isWarranty ? createWarranty : createInsurance;
  const updateItem = isWarranty ? updateWarranty : updateInsurance;
  const createState = isWarranty ? createWarrantyState : createInsuranceState;
  const updateState = isWarranty ? updateWarrantyState : updateInsuranceState;
  const isSaving = createState.isLoading || updateState.isLoading;
  const backPath = isWarranty ? "/warranties" : "/insurances";
  const label = isWarranty ? "گارانتی" : "بیمه";
  const companyOptions = (companiesData?.data || []).map((item) => ({ value: item._id, label: item.name_fa || item.name_en }));

  useEffect(() => {
    const item = itemData?.data;
    if (!item) return;
    setForm({
      ...initialForm,
      title_fa: item.title_fa || "",
      title_en: item.title_en || "",
      duration_months: item.duration_months ?? "",
      provider: item.provider?._id || item.provider || "",
      coverage: item.coverage || [],
      exclusions: item.exclusions || [],
      conditions: item.conditions || [],
      refund_policy: item.refund_policy || [],
      activation_method: item.activation_method || [],
      global_discount_percent: item.global_discount_percent ?? "",
      status: item.status || "pending",
    });
  }, [itemData]);

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));
  const handleChange = (event) => setField(event.target.name, event.target.value);

  const buildFormData = () => {
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, Array.isArray(value) ? JSON.stringify(value) : String(value ?? ""));
    });
    return formData;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title_fa.trim() || !form.provider || !form.duration_months) {
      toast.error("عنوان، شرکت ارائه‌دهنده و مدت الزامی است", { id: "save-policy" });
      return;
    }
    try {
      toast.loading("در حال ذخیره...", { id: "save-policy" });
      const formData = buildFormData();
      const response = isEdit ? await updateItem({ id, formData }).unwrap() : await createItem(formData).unwrap();
      toast.success(response.description || `${label} ذخیره شد`, { id: "save-policy" });
      navigate(backPath);
    } catch (error) {
      toast.error(error?.data?.description || "ذخیره انجام نشد", { id: "save-policy" });
    }
  };

  return (
    <ControlPanel>
      <section className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between rounded-2xl border border-zinc-700 bg-black/80 p-5">
          <h1 className="text-2xl font-bold text-white">{isEdit ? `ویرایش ${label}` : `افزودن ${label}`}</h1>
          <Link className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-white hover:text-white" to={backPath}>بازگشت به لیست</Link>
        </div>

        <form className="space-y-5 rounded-2xl border border-zinc-700 bg-zinc-950 p-5" onSubmit={handleSubmit}>
          {isLoading ? (
            <div className="rounded-xl border border-zinc-800 bg-black px-4 py-8 text-center text-sm text-zinc-500">در حال دریافت...</div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="عنوان فارسی"><Input name="title_fa" onChange={handleChange} value={form.title_fa} /></Field>
                <Field label="عنوان انگلیسی"><Input dir="ltr" name="title_en" onChange={handleChange} value={form.title_en} /></Field>
                <Field label="مدت به ماه"><Input name="duration_months" onChange={handleChange} type="number" value={form.duration_months} /></Field>
                <Field label="درصد تخفیف"><Input name="global_discount_percent" onChange={handleChange} type="number" value={form.global_discount_percent} /></Field>
              </div>
              <SingleSelectDropdown label={`شرکت ${label}`} name="provider" onChange={handleChange} options={companyOptions} value={form.provider} />
              <ArrayInput title="پوشش‌ها" values={form.coverage} onChange={(value) => setField("coverage", value)} />
              <ArrayInput title="استثناها" values={form.exclusions} onChange={(value) => setField("exclusions", value)} />
              {isWarranty ? <ArrayInput title="شرایط" values={form.conditions} onChange={(value) => setField("conditions", value)} /> : null}
              <ArrayInput title="سیاست بازگشت وجه" values={form.refund_policy} onChange={(value) => setField("refund_policy", value)} />
              <ArrayInput title="روش فعال‌سازی" values={form.activation_method} onChange={(value) => setField("activation_method", value)} />
              <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
                <SendButton isLoading={isSaving} label={`ذخیره ${label}`} loadingLabel="در حال ذخیره..." />
                <NavigationButton direction="prev" label="بازگشت" onClick={() => navigate(backPath)} />
              </div>
            </>
          )}
        </form>
      </section>
    </ControlPanel>
  );
}

export default PolicyForm;
