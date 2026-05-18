import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ControlPanel from "../ControlPanel";
import NavigationButton from "@/components/shared/button/NavigationButton";
import SendButton from "@/components/shared/button/SendButton";
import CategoryStepContent from "./components/CategoryStepContent";
import StepIndicator from "./components/StepIndicator";
import {
  useGetCategoryQuery,
  useGetCategoryTreeQuery,
  useUpdateCategoryMutation,
} from "../../services/category/categoryApi";
import { useGetIconsQuery } from "../../services/iconApi";

function removeCategoryFromTree(nodes = [], categoryId) {
  return nodes
    .filter((node) => node._id !== categoryId)
    .map((node) => ({
      ...node,
      children: removeCategoryFromTree(node.children || [], categoryId),
    }));
}

function CategoryEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    name: "",
    description: "",
    icon: "",
    parent: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  const { data: categoryData, isLoading: isLoadingCategory } = useGetCategoryQuery(id);
  const { data: treeData } = useGetCategoryTreeQuery();
  const { data: iconsData, isLoading: isLoadingIcons } = useGetIconsQuery({ page: 1, limit: 100 });
  const [updateCategory, mutationState] = useUpdateCategoryMutation();

  const category = categoryData?.data;
  const tree = removeCategoryFromTree(treeData?.data || [], id);
  const icons = iconsData?.data || [];
  const steps = [
    { key: "name", title: "نام" },
    { key: "image", title: "تصویر" },
    { key: "icon", title: "آیکون" },
    { key: "description", title: "توضیح" },
    { key: "parent", title: "والد" },
  ];
  const lastStepIndex = steps.length - 1;
  const isLastStep = currentStep === lastStepIndex;
  const canGoNext = steps[currentStep].key !== "name" || Boolean(form.name.trim());
  const nameStepIndex = steps.findIndex(({ key }) => key === "name");

  useEffect(() => {
    if (!category) return;

    setForm({
      name: category.name || "",
      description: category.description || "",
      icon: category.icon?._id || "",
      parent: category.parent?._id || "",
      image: null,
    });
    setImagePreview(category.image?.url || "");
  }, [category]);

  const completedSteps = steps.reduce((acc, step, index) => {
    const stepNumber = index + 1;
    const isPastStep = index < currentStep;
    acc[stepNumber] = isPastStep && (step.key !== "name" || Boolean(form.name.trim()));
    return acc;
  }, {});

  const invalidSteps = steps.reduce((acc, step, index) => {
    const stepNumber = index + 1;
    acc[stepNumber] = step.key === "name" && currentStep >= index && !form.name.trim();
    return acc;
  }, {});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isLastStep) {
      if (canGoNext) {
        setCurrentStep((prev) => Math.min(prev + 1, lastStepIndex));
      } else {
        toast.error("نام دسته‌بندی را وارد کنید", { id: "update-category" });
      }
      return;
    }

    if (!form.name.trim()) {
      toast.error("نام دسته‌بندی را وارد کنید", { id: "update-category" });
      setCurrentStep(nameStepIndex);
      return;
    }

    try {
      toast.loading("در حال ذخیره دسته‌بندی...", { id: "update-category" });

      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("icon", form.icon || "");
      formData.append("parent", form.parent || "");
      if (form.image) formData.append("image", form.image);

      const response = await updateCategory({ id, formData }).unwrap();

      toast.success(response.description || "دسته‌بندی با موفقیت به‌روزرسانی شد", {
        id: "update-category",
      });
      navigate("/categories");
    } catch (error) {
      toast.error(error?.data?.description || "ویرایش دسته‌بندی انجام نشد", {
        id: "update-category",
      });
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const goToNextStep = () => {
    if (!canGoNext) {
      toast.error("نام دسته‌بندی را وارد کنید", { id: "update-category" });
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

    if (!form.name.trim() && targetIndex > nameStepIndex) {
      toast.error("نام دسته‌بندی را وارد کنید", { id: "update-category" });
      setCurrentStep(nameStepIndex);
      return;
    }

    setCurrentStep(targetIndex);
  };

  return (
    <ControlPanel>
      <section className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between rounded-2xl border border-zinc-700 bg-black/80 p-5">
          <div>
            <h1 className="mt-1 text-2xl text-white">ویرایش دسته‌بندی</h1>
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
          {isLoadingCategory ? (
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
                totalSteps={steps.length}
              />

              <CategoryStepContent
                form={form}
                icons={icons}
                imagePreview={imagePreview}
                isLoadingIcons={isLoadingIcons}
                onChange={handleChange}
                setForm={setForm}
                setImagePreview={setImagePreview}
                stepKey={steps[currentStep].key}
                tree={tree}
              />

              <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
                {isLastStep ? (
                  <SendButton
                    isLoading={mutationState.isLoading}
                    label="ذخیره تغییرات"
                    loadingLabel="در حال ذخیره..."
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

export default CategoryEdit;
