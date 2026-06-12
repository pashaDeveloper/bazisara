import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ControlPanel from "../ControlPanel";
import NavigationButton from "@/components/shared/button/NavigationButton";
import SendButton from "@/components/shared/button/SendButton";
import { useGetIconsQuery } from "@/services/iconApi";
import IconPicker from "@/components/shared/IconPicker";
import SocialLinksInput from "@/components/shared/SocialLinksInput";
import StepIndicator from "../categories/components/StepIndicator";
import EntityImageStep from "./EntityImageStep";
import KeywordsStep from "./KeywordsStep";
import SelectStep from "./SelectStep";
import TextareaStep from "./TextareaStep";
import TextInputStep from "./TextInputStep";

function SteppedEntityForm({
  backPath,
  createMutation,
  entityLabel,
  fields,
  getQuery,
  mode = "create",
  title,
  updateMutation,
}) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === "edit";
  const [currentStep, setCurrentStep] = useState(0);
  const [imagePreview, setImagePreview] = useState("");
  const hasIconStep = fields.some((field) => field.type === "icon");
  const { data: iconsData, isLoading: isLoadingIcons } = useGetIconsQuery(
    { page: 1, limit: 100 },
    { skip: !hasIconStep }
  );
  const icons = iconsData?.data || [];

  const initialForm = useMemo(
    () =>
      fields.reduce((acc, field) => {
        acc[field.name] = field.defaultValue ?? "";
        return acc;
      }, {}),
    [fields]
  );

  const [form, setForm] = useState(initialForm);
  const { data: itemData, isLoading: isLoadingItem } = getQuery(id, {
    skip: !isEdit || !id,
  });
  const [createItem, createState] = createMutation();
  const [updateItem, updateState] = updateMutation();
  const mutationState = isEdit ? updateState : createState;
  const requiredNameIndex = fields.findIndex((field) => field.name === "name");
  const lastStepIndex = fields.length - 1;
  const isLastStep = currentStep === lastStepIndex;
  const currentField = fields[currentStep];
  const nameIsValid = Boolean(String(form.name || "").trim());
  const canGoNext = currentField.name !== "name" || nameIsValid;

  useEffect(() => {
    if (!itemData?.data) return;

    const item = itemData.data;
    setForm(
      fields.reduce((acc, field) => {
        if (field.type === "image") {
          acc[field.name] = null;
        } else if (field.type === "icon") {
          acc[field.name] = item[field.name]?._id || item[field.name] || "";
        } else if (field.type === "keywords") {
          acc[field.name] = Array.isArray(item[field.name])
            ? item[field.name]
            : String(item[field.name] || "")
                .split(",")
                .map((keyword) => keyword.trim())
                .filter(Boolean);
        } else if (field.type === "socialLinks") {
          acc[field.name] = Array.isArray(item[field.name]) ? item[field.name] : [];
        } else {
          acc[field.name] = item[field.name] ?? field.defaultValue ?? "";
        }
        return acc;
      }, {})
    );
    const imageField = fields.find((field) => field.type === "image");
    if (imageField) {
      setImagePreview(item[imageField.name]?.url || "");
    }
  }, [fields, itemData]);

  const completedSteps = fields.reduce((acc, field, index) => {
    acc[index + 1] = index < currentStep && (field.name !== "name" || nameIsValid);
    return acc;
  }, {});
  const invalidSteps = fields.reduce((acc, field, index) => {
    acc[index + 1] = field.name === "name" && currentStep >= index && !nameIsValid;
    return acc;
  }, {});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const goToStep = (step) => {
    const targetIndex = step - 1;
    if (targetIndex <= currentStep || nameIsValid) {
      setCurrentStep(targetIndex);
      return;
    }

    toast.error(`نام ${entityLabel} را وارد کنید`, { id: `${mode}-${entityLabel}` });
    setCurrentStep(requiredNameIndex);
  };

  const goToNextStep = () => {
    if (!canGoNext) {
      toast.error(`نام ${entityLabel} را وارد کنید`, { id: `${mode}-${entityLabel}` });
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, lastStepIndex));
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const buildFormData = () => {
    const formData = new FormData();
    fields.forEach((field) => {
      const value = form[field.name];
      if (field.type === "image") {
        if (value instanceof File) formData.append(field.name, value);
        return;
      }
      if (field.type === "keywords") {
        formData.append(
          field.name,
          JSON.stringify(
            (Array.isArray(value) ? value : [])
              .map((keyword) => String(keyword || "").trim())
              .filter(Boolean)
          )
        );
        return;
      }
      if (field.type === "socialLinks") {
        formData.append(
          field.name,
          JSON.stringify(
            (Array.isArray(value) ? value : [])
              .map((item) => ({
                platform: String(item?.platform || "").trim(),
                label: String(item?.label || "").trim(),
                url: String(item?.url || "").trim(),
              }))
              .filter((item) => item.platform && item.url)
          )
        );
        return;
      }
      formData.append(field.name, String(value ?? "").trim());
    });
    return formData;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isLastStep) {
      goToNextStep();
      return;
    }

    if (!nameIsValid) {
      toast.error(`نام ${entityLabel} را وارد کنید`, { id: `${mode}-${entityLabel}` });
      setCurrentStep(requiredNameIndex);
      return;
    }

    try {
      toast.loading(isEdit ? "در حال به‌روزرسانی..." : "در حال ثبت...", {
        id: `${mode}-${entityLabel}`,
      });
      const formData = buildFormData();
      const response = isEdit
        ? await updateItem({ id, formData }).unwrap()
        : await createItem(formData).unwrap();

      toast.success(
        response.description || `${entityLabel} با موفقیت ${isEdit ? "به‌روزرسانی" : "ثبت"} شد`,
        { id: `${mode}-${entityLabel}` }
      );
      navigate(backPath);
    } catch (error) {
      toast.error(error?.data?.description || "عملیات انجام نشد", {
        id: `${mode}-${entityLabel}`,
      });
    }
  };

  const renderStep = (field) => {
    if (field.type === "textarea") {
      return (
        <TextareaStep
          label={field.label}
          name={field.name}
          onChange={handleChange}
          placeholder={field.placeholder}
          value={form[field.name]}
        />
      );
    }
    if (field.type === "icon") {
      return (
        <IconPicker
          icons={icons}
          isLoadingIcons={isLoadingIcons}
          label={field.label || "آیکون‌های ذخیره‌شده"}
          name={field.name}
          onChange={handleChange}
          value={form[field.name]}
        />
      );
    }
    if (field.type === "image") {
      return (
        <EntityImageStep
          fieldName={field.name}
          imagePreview={imagePreview}
          label={field.label}
          setForm={setForm}
          setImagePreview={setImagePreview}
        />
      );
    }
    if (field.type === "select") {
      return (
        <SelectStep
          label={field.label}
          name={field.name}
          onChange={handleChange}
          options={field.options}
          value={form[field.name]}
        />
      );
    }
    if (field.type === "keywords") {
      return (
        <KeywordsStep
          label={field.label}
          onChange={(keywords) =>
            setForm((prev) => ({ ...prev, [field.name]: keywords }))
          }
          value={form[field.name]}
        />
      );
    }
    if (field.type === "socialLinks") {
      return (
        <SocialLinksInput
          label={field.label}
          onChange={(links) => setForm((prev) => ({ ...prev, [field.name]: links }))}
          value={form[field.name]}
        />
      );
    }
    return (
      <TextInputStep
        label={field.label}
        name={field.name}
        onChange={handleChange}
        placeholder={field.placeholder}
        type={field.type || "text"}
        value={form[field.name]}
      />
    );
  };

  return (
    <ControlPanel>
      <section className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between rounded-2xl border border-zinc-700 bg-black/80 p-5">
          <div>
            <h1 className="mt-1 text-2xl font-bold text-white">{title}</h1>
          </div>
          <Link
            className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-white hover:text-white"
            to={backPath}
          >
            بازگشت به لیست
          </Link>
        </div>

        <form className="space-y-5 rounded-2xl border border-zinc-700 bg-zinc-950 p-5" onSubmit={handleSubmit}>
          {isLoadingItem ? (
            <div className="rounded-xl border border-zinc-800 bg-black px-4 py-8 text-center text-sm text-zinc-500">
              در حال دریافت...
            </div>
          ) : (
            <>
              <StepIndicator
                completedSteps={completedSteps}
                currentStep={currentStep + 1}
                invalidSteps={invalidSteps}
                onStepClick={goToStep}
                totalSteps={fields.length}
              />
              {renderStep(currentField)}
              <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
                {isLastStep ? (
                  <SendButton
                    isLoading={mutationState.isLoading}
                    label={isEdit ? `ذخیره ${entityLabel}` : `ثبت ${entityLabel}`}
                    loadingLabel="در حال ارسال..."
                  />
                ) : (
                  <NavigationButton
                    direction="next"
                    disabled={!canGoNext || mutationState.isLoading}
                    onClick={goToNextStep}
                  />
                )}
                <NavigationButton
                  direction="prev"
                  disabled={currentStep === 0 || mutationState.isLoading}
                  onClick={goToPreviousStep}
                />
              </div>
            </>
          )}
        </form>
      </section>
    </ControlPanel>
  );
}

export default SteppedEntityForm;

