import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ControlPanel from "../ControlPanel";
import StepIndicator from "../categories/components/StepIndicator";
import NavigationButton from "@/components/shared/button/NavigationButton";
import SendButton from "@/components/shared/button/SendButton";
import ThumbnailUpload from "@/components/shared/ThumbnailUpload";
import { SingleSelectDropdown } from "@/components/shared/Dropdown";
import { DatePickerField, TextField, TextareaField } from "../games/components/GameFormFields";
import { useGetBrandsQuery } from "@/services/brandApi";
import {
  useCreatePlatformMutation,
  useGetPlatformQuery,
  useGetPlatformsQuery,
  useUpdatePlatformMutation,
} from "@/services/platformApi";
import { flattenPlatforms, toDateInput } from "./utils";

const initialForm = {
  name_fa: "",
  name_en: "",
  slug: "",
  parent: "",
  brand: "",
  productionDate: "",
  description: "",
  image: null,
};

const steps = [
  { key: "identity", title: "اطلاعات" },
  { key: "image", title: "تصویر" },
  { key: "brand", title: "برند" },
  { key: "parent", title: "والد" },
  { key: "description", title: "توضیح" },
];

function makeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06ff-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function PlatformStepContent({
  currentKey,
  form,
  imagePreview,
  brandOptions,
  isEdit,
  onChange,
  parentOptions,
  setForm,
  setImagePreview,
}) {
  if (currentKey === "identity") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="نام فارسی پلتفرم" name="name_fa" onChange={onChange} value={form.name_fa} />
        <TextField dir="ltr" label="نام انگلیسی پلتفرم" name="name_en" onChange={onChange} value={form.name_en} />
        <TextField dir="ltr" label="اسلاگ" name="slug" onChange={onChange} value={form.slug} />
        <DatePickerField
          label="تاریخ تولید"
          onChange={(value) => setForm((prev) => ({ ...prev, productionDate: value }))}
          value={form.productionDate}
        />
      </div>
    );
  }

  if (currentKey === "image") {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-black p-5">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-white">تصویر پلتفرم</h2>
          <p className="mt-1 text-xs text-zinc-500">برای هر پلتفرم تصویر الزامی است و در ساختار فروشگاه نمایش داده می‌شود.</p>
        </div>
        <ThumbnailUpload
          imageSize={160}
          name="image"
          preview={imagePreview}
          setThumbnail={(file) => setForm((prev) => ({ ...prev, image: file }))}
          setThumbnailPreview={setImagePreview}
          title={isEdit && imagePreview ? "تغییر تصویر" : "انتخاب تصویر"}
        />
      </div>
    );
  }

  if (currentKey === "brand") {
    return (
      <div className="space-y-4 rounded-2xl border border-zinc-800 bg-black p-5">
        <div>
          <h2 className="text-sm font-bold text-white">برند این پلتفرم</h2>
          <p className="mt-1 text-xs text-zinc-500">هر پلتفرم فقط به یک برند متصل می‌شود.</p>
        </div>
        <SingleSelectDropdown
          label="برند"
          name="brand"
          onChange={onChange}
          options={brandOptions}
          placeholder="برند را انتخاب کنید"
          value={form.brand}
        />
      </div>
    );
  }

  if (currentKey === "parent") {
    return (
      <SingleSelectDropdown
        label="والد"
        name="parent"
        onChange={onChange}
        options={[{ label: "بدون والد", value: "" }, ...parentOptions]}
        value={form.parent}
      />
    );
  }

  return <TextareaField label="توضیح" name="description" onChange={onChange} rows={6} value={form.description} />;
}

function PlatformForm({ mode = "create" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === "edit";
  const [form, setForm] = useState(initialForm);
  const [imagePreview, setImagePreview] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const { data: platformData, isLoading } = useGetPlatformQuery(id, { skip: !isEdit || !id });
  const { data: treeData } = useGetPlatformsQuery({ tree: true, limit: 500 });
  const { data: brandsData } = useGetBrandsQuery({ page: 1, limit: 500 });
  const [createPlatform, createState] = useCreatePlatformMutation();
  const [updatePlatform, updateState] = useUpdatePlatformMutation();
  const isSaving = createState.isLoading || updateState.isLoading;

  const parentOptions = useMemo(
    () => flattenPlatforms(treeData?.data || []).filter((item) => item._id !== id),
    [id, treeData]
  );
  const brandOptions = useMemo(
    () => (brandsData?.data || []).map((item) => ({ label: item.title_fa || item.name || item.title_en, value: item._id })),
    [brandsData]
  );

  useEffect(() => {
    const platform = platformData?.data;
    if (!platform) return;
    setForm({
      name_fa: platform.name_fa || platform.name || "",
      name_en: platform.name_en || platform.slug || "",
      slug: platform.slug || "",
      parent: platform.parent?._id || platform.parent || "",
      brand: platform.brand?._id || platform.brand || platform.brands?.[0]?._id || platform.brands?.[0] || "",
      productionDate: toDateInput(platform.productionDate),
      description: platform.description || "",
      image: null,
    });
    setImagePreview(platform.image?.url || "");
  }, [platformData]);

  const lastStepIndex = steps.length - 1;
  const isLastStep = currentStep === lastStepIndex;
  const currentKey = steps[currentStep].key;
  const hasImage = Boolean(form.image || imagePreview);
  const canGoNext =
    (currentKey !== "identity" || (Boolean(form.name_fa.trim()) && Boolean(form.name_en.trim()))) &&
    (currentKey !== "image" || hasImage) &&
    (currentKey !== "brand" || Boolean(form.brand));

  const completedSteps = steps.reduce((acc, step, index) => {
    const stepNumber = index + 1;
    const isPastStep = index < currentStep;
    acc[stepNumber] =
      isPastStep &&
      (step.key !== "identity" || (Boolean(form.name_fa.trim()) && Boolean(form.name_en.trim()))) &&
      (step.key !== "image" || hasImage) &&
      (step.key !== "brand" || Boolean(form.brand));
    return acc;
  }, {});

  const invalidSteps = steps.reduce((acc, step, index) => {
    const stepNumber = index + 1;
    acc[stepNumber] =
      (step.key === "identity" && currentStep >= index && (!form.name_fa.trim() || !form.name_en.trim())) ||
      (step.key === "image" && currentStep >= index && !hasImage) ||
      (step.key === "brand" && currentStep >= index && !form.brand);
    return acc;
  }, {});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "name_en" && !isEdit ? { slug: makeSlug(value) } : {}),
    }));
  };

  const validateCurrentStep = () => {
    if (currentKey === "identity" && (!form.name_fa.trim() || !form.name_en.trim())) {
      toast.error("نام فارسی و انگلیسی پلتفرم را وارد کنید", { id: "platform-form" });
      return false;
    }
    if (currentKey === "image" && !hasImage) {
      toast.error("تصویر پلتفرم الزامی است", { id: "platform-form" });
      return false;
    }
    if (currentKey === "brand" && !form.brand) {
      toast.error("برند پلتفرم را انتخاب کنید", { id: "platform-form" });
      return false;
    }
    return true;
  };

  const goToNextStep = () => {
    if (!validateCurrentStep()) return;
    setCurrentStep((prev) => Math.min(prev + 1, lastStepIndex));
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const goToStep = (step) => {
    const targetIndex = step - 1;
    if (targetIndex <= currentStep) {
      setCurrentStep(targetIndex);
      return;
    }
    if (!form.name_fa.trim() || !form.name_en.trim()) {
      toast.error("نام فارسی و انگلیسی پلتفرم را وارد کنید", { id: "platform-form" });
      setCurrentStep(0);
      return;
    }
    if (targetIndex > 1 && !hasImage) {
      toast.error("تصویر پلتفرم الزامی است", { id: "platform-form" });
      setCurrentStep(1);
      return;
    }
    if (targetIndex > 2 && !form.brand) {
      toast.error("برند پلتفرم را انتخاب کنید", { id: "platform-form" });
      setCurrentStep(2);
      return;
    }
    setCurrentStep(targetIndex);
  };

  const buildFormData = () => {
    const formData = new FormData();
    formData.append("name_fa", form.name_fa.trim());
    formData.append("name_en", form.name_en.trim());
    formData.append("name", form.name_fa.trim());
    formData.append("slug", form.slug || makeSlug(form.name_en));
    formData.append("parent", form.parent || "");
    formData.append("brand", form.brand || "");
    formData.append("productionDate", form.productionDate || "");
    formData.append("description", form.description.trim());
    if (form.image) formData.append("image", form.image);
    return formData;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isLastStep) {
      goToNextStep();
      return;
    }

    if (!form.name_fa.trim() || !form.name_en.trim()) {
      toast.error("نام فارسی و انگلیسی پلتفرم را وارد کنید", { id: "platform-form" });
      setCurrentStep(0);
      return;
    }
    if (!hasImage) {
      toast.error("تصویر پلتفرم الزامی است", { id: "platform-form" });
      setCurrentStep(1);
      return;
    }
    if (!form.brand) {
      toast.error("برند پلتفرم را انتخاب کنید", { id: "platform-form" });
      setCurrentStep(2);
      return;
    }

    try {
      toast.loading("در حال ذخیره پلتفرم...", { id: "platform-form" });
      const formData = buildFormData();
      const response = isEdit
        ? await updatePlatform({ id, body: formData }).unwrap()
        : await createPlatform(formData).unwrap();
      toast.success(response.description || "پلتفرم ذخیره شد", { id: "platform-form" });
      navigate("/platforms");
    } catch (error) {
      toast.error(error?.data?.description || "ذخیره پلتفرم انجام نشد", { id: "platform-form" });
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
          <StepIndicator
            completedSteps={completedSteps}
            currentStep={currentStep + 1}
            invalidSteps={invalidSteps}
            onStepClick={goToStep}
            totalSteps={steps.length}
          />

          {isLoading ? (
            <div className="rounded-xl border border-zinc-800 bg-black px-4 py-8 text-center text-sm text-zinc-500">در حال دریافت...</div>
          ) : (
            <PlatformStepContent
              currentKey={currentKey}
              form={form}
              brandOptions={brandOptions}
              imagePreview={imagePreview}
              isEdit={isEdit}
              onChange={handleChange}
              parentOptions={parentOptions}
              setForm={setForm}
              setImagePreview={setImagePreview}
            />
          )}

          <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
            {isLastStep ? (
              <SendButton isLoading={isSaving} label="ذخیره پلتفرم" loadingLabel="در حال ذخیره..." />
            ) : (
              <NavigationButton direction="next" disabled={!canGoNext || isSaving || isLoading} onClick={goToNextStep} />
            )}

            <NavigationButton direction="prev" disabled={currentStep === 0 || isSaving || isLoading} onClick={goToPreviousStep} />
          </div>
        </form>
      </section>
    </ControlPanel>
  );
}

export default PlatformForm;
