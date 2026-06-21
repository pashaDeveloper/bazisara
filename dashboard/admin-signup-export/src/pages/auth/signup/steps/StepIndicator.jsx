// components/signup/steps/StepIndicator.jsx
import React from "react";
import ShieldCheck from "@/components/icons/ShieldCheck";
import ShieldAlert from "@/components/icons/ShieldAlert";

const StepIndicator = ({ currentStep, totalSteps, onStepClick, completedSteps, invalidSteps }) => {
  return (
    <div className="flex items-center justify-between mb-6 w-full">
      {Array.from({ length: totalSteps }, (_, index) => {
        const step = index + 1;
        const isCompleted = completedSteps[step];
        const isCurrent = step === currentStep;
        const isInvalid = invalidSteps[step];

        return (
          <React.Fragment key={step}>
            <div className="flex items-center">
              {/* دایره مرحله */}
              <button
                type="button"
                onClick={() => onStepClick(step)}
                className={`flex items-center justify-center rounded-full h-10 w-10 ${
                  isInvalid
                    ? "dark:bg-orange-500 dark:hover:bg-orange-600 ring-orange-500 dark:ring-orange-400 bg-orange-500 hover:bg-orange-600"
                    : isCompleted
                    ? "dark:bg-blue-500 dark:hover:bg-blue-600 ring-reen-500 dark:ring-blue-400 bg-green-500 hover:bg-green-600"
                    : isCurrent
                    ? "dark:bg-blue-500 dark:hover:bg-blue-600 ring-green-400 transition duration-300 ease-in-out dark:ring-blue-400 bg-green-500 outline-none ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800"
                    : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 ring-gray-400"
                } text-white font-semibold transition duration-300 ease-in-out focus:outline-none focus:ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ${
                  isInvalid
                    ? "dark:focus:ring-orange-400 focus:ring-orange-400"
                    : isCompleted || isCurrent
                    ? isCompleted
                      ? "dark:focus:ring-blue-400 focus:ring-green-400"
                      : "dark:focus:ring-blue-400 focus:ring-green-400"
                    : "focus:ring-gray-400"
                }`}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`مرحله ${step}`}
              >
                {isInvalid ? (
                  <ShieldAlert className="h-6 w-6 text-orange-200" />
                ) : isCompleted ? (
                  <ShieldCheck className="h-6 w-6" />
                ) : (
                  step
                )}
              </button>
              {step !== totalSteps && (
                <div
                  className={`flex-auto border-t-2 transition duration-500 ease-in-out ${
                    isCompleted
                      ? "border-blue-500 dark:border-blue-400"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                ></div>
              )}
            </div>
            {step !== totalSteps && <div className="w-4"></div>}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;
