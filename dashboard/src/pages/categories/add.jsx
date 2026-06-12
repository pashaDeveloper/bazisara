import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ControlPanel from "../ControlPanel";
import NavigationButton from "@/components/shared/button/NavigationButton";
import SendButton from "@/components/shared/button/SendButton";
import CategoryStepContent from "./components/CategoryStepContent";
import StepIndicator from "./components/StepIndicator";
import {
  useCreateCategoryMutation,
  useGetCategoryTreeQuery,
} from "../../services/category/categoryApi";
import { useGetIconsQuery } from "../../services/iconApi";

function CategoryAdd() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    icon: "",
    parent: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  const { data: treeData } = useGetCategoryTreeQuery();
  const { data: iconsData, isLoading: isLoadingIcons } = useGetIconsQuery({ page: 1, limit: 100 });
  const [createCategory, mutationState] = useCreateCategoryMutation();
  const tree = treeData?.data || [];
  const icons = iconsData?.data || [];
  const steps = [
    { key: "name", title: "???" },
    { key: "image", title: "?????" },
    { key: "icon", title: "?????" },
    { key: "description", title: "?????" },
    { key: "parent", title: "????" },
  ];
  const lastStepIndex = steps.length - 1;
  const isLastStep = currentStep === lastStepIndex;
  const canGoNext = steps[currentStep].key !== "name" || Boolean(form.name.trim());
  const nameStepIndex = steps.findIndex(({ key }) => key === "name");
  const completedSteps = steps.reduce((acc, step, index) => {
    const stepNumber = index + 1;
    const isPastStep = index < currentStep;

    acc[stepNumber] =
      isPastStep && (step.key !== "name" || Boolean(form.name.trim()));

    return acc;
  }, {});
  const invalidSteps = steps.reduce((acc, step, index) => {
    const stepNumber = index + 1;
    acc[stepNumber] =
      step.key === "name" && currentStep >= index && !form.name.trim();
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
        toast.error("??? ????????? ?? ???? ????", { id: "create-category" });
      }
      return;
    }

    if (!form.name.trim()) {
      toast.error("??? ????????? ?? ???? ????", { id: "create-category" });
      setCurrentStep(nameStepIndex);
      return;
    }

    try {
      toast.loading("?? ??? ??? ?????????...", { id: "create-category" });

      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      if (form.icon) formData.append("icon", form.icon);
      if (form.parent) formData.append("parent", form.parent);
      if (form.image) formData.append("image", form.image);

      const response = await createCategory(formData).unwrap();

      toast.success(response.description || "????????? ?? ?????? ??? ??", {
        id: "create-category",
      });
      navigate("/categories");
    } catch (error) {
      toast.error(error?.data?.description || "??? ????????? ????? ???", {
        id: "create-category",
      });
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const goToNextStep = () => {
    if (!canGoNext) {
      toast.error("??? ????????? ?? ???? ????", { id: "create-category" });
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
      toast.error("??? ????????? ?? ???? ????", { id: "create-category" });
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
            <h1 className="mt-1 text-2xl text-white">?????? ?????????</h1>
          </div>
          <Link
            className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-white hover:text-white"
            to="/categories"
          >
            ?????? ?? ????
          </Link>
        </div>

        <form
          className="space-y-5 rounded-2xl border border-zinc-700 bg-zinc-950 p-5"
          onSubmit={handleSubmit}
        >
          <StepIndicator
            currentStep={currentStep + 1}
            totalSteps={steps.length}
            onStepClick={goToStep}
            completedSteps={completedSteps}
            invalidSteps={invalidSteps}
          />

          <CategoryStepContent
            stepKey={steps[currentStep].key}
            form={form}
            imagePreview={imagePreview}
            setForm={setForm}
            setImagePreview={setImagePreview}
            tree={tree}
            icons={icons}
            isLoadingIcons={isLoadingIcons}
            onChange={handleChange}
          />

          <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
            {isLastStep ? (
              <SendButton
                isLoading={mutationState.isLoading}
                label="??? ?????????"
                loadingLabel="?? ??? ???..."
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
        </form>
      </section>
    </ControlPanel>
  );
}

export default CategoryAdd;

