import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ControlPanel from "../ControlPanel";
import StepIndicator from "@/components/shared/StepIndicator";
import { SingleSelectDropdown } from "@/components/shared/Dropdown";
import SendButton from "@/components/shared/button/SendButton";
import ThumbnailUpload from "@/components/shared/ThumbnailUpload";
import { useGetCategoriesQuery } from "@/services/category/categoryApi";
import {
  useCreateSliderMutation,
  useGetSliderQuery,
  useUpdateSliderMutation,
} from "@/services/sliderApi";

const initialForm = {
  title: "",
  subtitle: "",
  link: "",
  category: "",
  image: null,
};

const steps = [
  { key: "basic", title: "اطلاعات" },
  { key: "category", title: "دسته‌بندی" },
  { key: "media", title: "رسانه" },
];

function Field({ label, name, onChange, placeholder, type = "text", value }) {
  return (
    <label className="space-y-2">
      <span className="text-sm text-zinc-300">{label}</span>
      <input
        className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-white outline-none transition focus:border-white"
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}

function SliderForm({ mode = "create" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === "edit";
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [imagePreview, setImagePreview] = useState("");
  const { data, isLoading } = useGetSliderQuery(id, { skip: !isEdit || !id });
  const { data: categoriesData } = useGetCategoriesQuery({ page: 1, limit: 200 });
  const [createSlider, createState] = useCreateSliderMutation();
  const [updateSlider, updateState] = useUpdateSliderMutation();
  const isSaving = createState.isLoading || updateState.isLoading;
  const categories = categoriesData?.data || [];
  const categoryOptions = useMemo(
    () => [
      { label: "بدون دسته‌بندی", value: "" },
      ...categories.map((item) => ({ label: item.name, value: item._id })),
    ],
    [categories]
  );
  const titleIsValid = Boolean(form.title.trim());
  const isLastStep = currentStep === steps.length - 1;
  const currentStepKey = steps[currentStep].key;
  const canGoNext = currentStepKey === "basic" ? titleIsValid : true;
  const completedSteps = steps.reduce((acc, step, index) => {
    acc[index + 1] = index < currentStep;
    return acc;
  }, {});
  const invalidSteps = {
    1: currentStep >= 0 && !titleIsValid,
  };

  useEffect(() => {
    const slider = data?.data;
    if (!slider) return;

    setForm({
      ...initialForm,
      title: slider.title || "",
      subtitle: slider.subtitle || "",
      link: slider.link || "",
      category: slider.category?._id || slider.category || "",
    });
    setImagePreview(slider.image?.url || "");
  }, [data]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const setCategory = (value) => {
    setForm((prev) => ({ ...prev, category: value }));
  };

  const goToNextStep = () => {
    if (!canGoNext) {
      toast.error("عنوان اسلایدر را وارد کنید", { id: "slider-step" });
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const goToStep = (step) => {
    const nextStep = step - 1;
    if (nextStep > 0 && !titleIsValid) {
      toast.error("عنوان اسلایدر را وارد کنید", { id: "slider-step" });
      setCurrentStep(0);
      return;
    }

    setCurrentStep(nextStep);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isLastStep) {
      goToNextStep();
      return;
    }

    if (!form.title.trim()) {
      toast.error("عنوان اسلایدر را وارد کنید");
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "image") {
        if (value instanceof File) formData.append(key, value);
        return;
      }
      formData.append(key, String(value ?? ""));
    });

    try {
      toast.loading(isEdit ? "در حال به‌روزرسانی اسلایدر..." : "در حال ثبت اسلایدر...", { id: "save-slider" });
      const response = isEdit
        ? await updateSlider({ id, formData }).unwrap()
        : await createSlider(formData).unwrap();
      toast.success(response.description || "اسلایدر ذخیره شد", { id: "save-slider" });
      navigate("/sliders");
    } catch (error) {
      toast.error(error?.data?.description || "ذخیره اسلایدر انجام نشد", { id: "save-slider" });
    }
  };

  return (
    <ControlPanel>
      <section className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between rounded-2xl border border-zinc-700 bg-black/80 p-5">
          <div>
            <p className="text-xs text-zinc-400">مدیریت صفحه اول</p>
            <h1 className="mt-1 text-2xl font-bold text-white">
              {isEdit ? "ویرایش اسلایدر" : "افزودن اسلایدر"}
            </h1>
          </div>
          <Link className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-white hover:text-white" to="/sliders">
            بازگشت
          </Link>
        </div>

        <form className="space-y-5 rounded-2xl border border-zinc-700 bg-zinc-950 p-5" onSubmit={handleSubmit}>
          {isLoading ? (
            <div className="rounded-xl border border-zinc-800 bg-black px-4 py-8 text-center text-sm text-zinc-500">در حال دریافت...</div>
          ) : (
            <>
              <div className="sticky top-16 z-20 rounded-xl border border-gray-200 bg-white/95 p-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
                <StepIndicator
                  completedSteps={completedSteps}
                  currentStep={currentStep + 1}
                  invalidSteps={invalidSteps}
                  onStepClick={goToStep}
                  totalSteps={steps.length}
                />
              </div>
              <div className="space-y-5 rounded-xl border border-zinc-800 bg-black p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-500">فرم اسلایدر</span>
                  <span className="rounded-full border border-zinc-800 px-2 py-1 text-[10px] text-zinc-500">
                    {currentStep + 1} / {steps.length}
                  </span>
                </div>

                {currentStepKey === "basic" ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="عنوان" name="title" onChange={handleChange} placeholder="عنوان بنر" value={form.title} />
                      <Field label="لینک" name="link" onChange={handleChange} placeholder="/products2" value={form.link} />
                    </div>
                    <Field label="زیرعنوان" name="subtitle" onChange={handleChange} placeholder="متن کوتاه بنر" value={form.subtitle} />
                  </div>
                ) : null}

                {currentStepKey === "category" ? (
                  <SingleSelectDropdown
                    label="دسته‌بندی"
                    name="category"
                    onChange={(event) => setCategory(event.target.value)}
                    options={categoryOptions}
                    placeholder="انتخاب دسته‌بندی"
                    value={form.category}
                  />
                ) : null}

                {currentStepKey === "media" ? (
                  <ThumbnailUpload
                    name="image"
                    preview={imagePreview}
                    setThumbnail={(file) => setForm((prev) => ({ ...prev, image: file }))}
                    setThumbnailPreview={setImagePreview}
                    title="تصویر اسلایدر"
                  />
                ) : null}

                <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
                  {isLastStep ? (
                    <SendButton isLoading={isSaving} label="ذخیره اسلایدر" loadingLabel="در حال ذخیره..." />
                  ) : (
                    <button
                      className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-white hover:text-white"
                      disabled={!canGoNext || isSaving}
                      onClick={goToNextStep}
                      type="button"
                    >
                      مرحله بعد
                    </button>
                  )}
                  <button
                    className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-white hover:text-white disabled:opacity-50"
                    disabled={currentStep === 0 || isSaving}
                    onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
                    type="button"
                  >
                    مرحله قبل
                  </button>
                </div>
              </div>
            </>
          )}
        </form>
      </section>
    </ControlPanel>
  );
}

export default SliderForm;

