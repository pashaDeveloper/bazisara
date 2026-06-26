import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ControlPanel from "../ControlPanel";
import NavigationButton from "@/components/shared/button/NavigationButton";
import SendButton from "@/components/shared/button/SendButton";
import ThumbnailUpload from "@/components/shared/ThumbnailUpload";
import StepIndicator from "../categories/components/StepIndicator";
import { TextField, TextareaField } from "../games/components/GameFormFields";
import {
  useCreateGameCollectionMutation,
  useGetGameCollectionQuery,
  useUpdateGameCollectionMutation,
} from "@/services/gameCollectionApi";

const initialForm = {
  title_fa: "",
  title_en: "",
  slug: "",
  placement: "homepage",
  description: "",
  visibility: true,
  image: null,
};

const steps = [
  { key: "title", title: "نام" },
  { key: "image", title: "تصویر" },
  { key: "description", title: "توضیح" },
  { key: "settings", title: "تنظیمات" },
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

function buildFormData(form) {
  const formData = new FormData();
  formData.append("title_fa", form.title_fa.trim());
  formData.append("title_en", form.title_en.trim());
  formData.append("slug", form.slug || makeSlug(form.title_en || form.title_fa));
  formData.append("placement", form.placement.trim() || "homepage");
  formData.append("description", form.description.trim());
  formData.append("visibility", String(form.visibility));
  if (form.image) formData.append("image", form.image);
  return formData;
}

function GameCollectionStepContent({ form, imagePreview, onChange, setForm, setImagePreview, stepKey }) {
  if (stepKey === "title") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="عنوان فارسی" name="title_fa" onChange={onChange} value={form.title_fa} />
        <TextField dir="ltr" label="عنوان انگلیسی" name="title_en" onChange={onChange} value={form.title_en} />
        <TextField dir="ltr" label="اسلاگ" name="slug" onChange={onChange} value={form.slug} />
      </div>
    );
  }

  if (stepKey === "image") {
    return (
      <div>
        <label className="mb-2 block text-xs text-zinc-400">تصویر</label>
        <ThumbnailUpload
          name="image"
          preview={imagePreview}
          setThumbnail={(file) => setForm((prev) => ({ ...prev, image: file }))}
          setThumbnailPreview={setImagePreview}
          title="انتخاب تصویر کالکشن"
        />
      </div>
    );
  }

  if (stepKey === "description") {
    return <TextareaField label="توضیح" name="description" onChange={onChange} rows={5} value={form.description} />;
  }

  if (stepKey === "settings") {
    return (
      <div className="space-y-4">
        <TextField label="جایگاه نمایش" name="placement" onChange={onChange} value={form.placement} />
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input checked={form.visibility} name="visibility" onChange={onChange} type="checkbox" />
          نمایش کالکشن
        </label>
      </div>
    );
  }

  return null;
}

function GameCollectionForm({ mode = "create" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === "edit";
  const [form, setForm] = useState(initialForm);
  const [imagePreview, setImagePreview] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const { data: collectionData, isLoading } = useGetGameCollectionQuery(id, { skip: !isEdit || !id });
  const [createCollection, createState] = useCreateGameCollectionMutation();
  const [updateCollection, updateState] = useUpdateGameCollectionMutation();
  const isSaving = createState.isLoading || updateState.isLoading;
  const lastStepIndex = steps.length - 1;
  const isLastStep = currentStep === lastStepIndex;
  const titleStepIndex = steps.findIndex(({ key }) => key === "title");
  const canGoNext = steps[currentStep].key !== "title" || Boolean(form.title_fa.trim());

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
      image: null,
    });
    setImagePreview(item.image?.url || "");
  }, [collectionData]);

  const completedSteps = steps.reduce((acc, step, index) => {
    const stepNumber = index + 1;
    acc[stepNumber] = index < currentStep && (step.key !== "title" || Boolean(form.title_fa.trim()));
    return acc;
  }, {});

  const invalidSteps = steps.reduce((acc, step, index) => {
    const stepNumber = index + 1;
    acc[stepNumber] = step.key === "title" && currentStep >= index && !form.title_fa.trim();
    return acc;
  }, {});

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "title_en" && !isEdit ? { slug: makeSlug(value) } : {}),
    }));
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const goToNextStep = () => {
    if (!canGoNext) {
      toast.error("عنوان فارسی کالکشن را وارد کنید", { id: "collection-form" });
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, lastStepIndex));
  };

  const goToStep = (step) => {
    const targetIndex = step - 1;
    if (targetIndex <= currentStep) {
      setCurrentStep(targetIndex);
      return;
    }
    if (!form.title_fa.trim() && targetIndex > titleStepIndex) {
      toast.error("عنوان فارسی کالکشن را وارد کنید", { id: "collection-form" });
      setCurrentStep(titleStepIndex);
      return;
    }
    setCurrentStep(targetIndex);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isLastStep) {
      goToNextStep();
      return;
    }

    if (!form.title_fa.trim()) {
      toast.error("عنوان فارسی کالکشن را وارد کنید", { id: "collection-form" });
      setCurrentStep(titleStepIndex);
      return;
    }

    try {
      toast.loading("در حال ذخیره کالکشن...", { id: "collection-form" });
      const body = buildFormData(form);
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
              <StepIndicator
                completedSteps={completedSteps}
                currentStep={currentStep + 1}
                invalidSteps={invalidSteps}
                onStepClick={goToStep}
                totalSteps={steps.length}
              />

              <GameCollectionStepContent
                form={form}
                imagePreview={imagePreview}
                onChange={handleChange}
                setForm={setForm}
                setImagePreview={setImagePreview}
                stepKey={steps[currentStep].key}
              />

              <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
                {isLastStep ? (
                  <SendButton isLoading={isSaving} />
                ) : (
                  <NavigationButton direction="next" disabled={!canGoNext || isSaving} onClick={goToNextStep} />
                )}

                <NavigationButton direction="prev" disabled={currentStep === 0 || isSaving} onClick={goToPreviousStep} />
              </div>
            </>
          )}
        </form>
      </section>
    </ControlPanel>
  );
}

export default GameCollectionForm;
