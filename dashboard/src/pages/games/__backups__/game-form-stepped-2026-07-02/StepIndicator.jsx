import React from "react";
import ShieldAlert from "@/components/icons/ShieldAlert";
import ShieldCheck from "@/components/icons/ShieldCheck";

function StepIndicator({
  currentStep,
  totalSteps,
  onStepClick,
  completedSteps,
  invalidSteps,
}) {
  return (
    <div dir="ltr" className="mb-6 flex w-full items-center justify-between">
      {Array.from({ length: totalSteps }, (_, index) => {
        const step = index + 1;
        const isCompleted = completedSteps[step];
        const isCurrent = step === currentStep;
        const isInvalid = invalidSteps[step];

        return (
          <React.Fragment key={step}>
            <button
              type="button"
              onClick={() => onStepClick(step)}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm text-white transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:ring-offset-gray-800 ${
                isInvalid
                  ? "bg-orange-500 ring-orange-400 hover:bg-orange-600 focus:ring-orange-400 dark:bg-orange-500 dark:hover:bg-orange-600"
                  : isCompleted
                  ? "bg-green-500 ring-green-400 hover:bg-green-600 focus:ring-green-400 dark:bg-blue-500 dark:ring-blue-400 dark:hover:bg-blue-600 dark:focus:ring-blue-400"
                  : isCurrent
                  ? "bg-green-500 ring-2 ring-green-400 ring-offset-2 hover:bg-green-600 focus:ring-green-400 dark:bg-blue-500 dark:ring-blue-400 dark:hover:bg-blue-600 dark:focus:ring-blue-400"
                  : "bg-gray-300 ring-gray-400 hover:bg-gray-400 focus:ring-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
              }`}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={`مرحله ${step}`}
            >
              {isInvalid ? (
                <ShieldAlert className="h-6 w-6 text-orange-100" />
              ) : isCompleted ? (
                <ShieldCheck className="h-6 w-6" />
              ) : (
                step
              )}
            </button>

            {step !== totalSteps ? (
              <div
                className={`mx-2 flex-1 border-t-2 transition duration-500 ease-in-out ${
                  isCompleted
                    ? "border-green-500 dark:border-blue-400"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default StepIndicator;

