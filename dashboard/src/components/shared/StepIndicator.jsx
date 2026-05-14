import React from "react";
import ShieldCheck from "@/components/icons/ShieldCheck";
import ShieldAlert from "@/components/icons/ShieldAlert";

function StepIndicator({
  currentStep = 1,
  totalSteps = 1,
  onStepClick,
  completedSteps = {},
  invalidSteps = {},
  className = "",
}) {
  return (
    <div
      className={`mb-6 flex w-full items-center justify-between ${className}`.trim()}
    >
      {Array.from({ length: totalSteps }, (_, index) => {
        const step = index + 1;
        const isCompleted = Boolean(completedSteps[step]);
        const isCurrent = step === currentStep;
        const isInvalid = Boolean(invalidSteps[step]);

        return (
          <React.Fragment key={step}>
            <div className="flex flex-1 items-center">
              <button
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`مرحله ${step}`}
                className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black ${
                  isInvalid
                    ? "border-orange-400 bg-orange-500 hover:bg-orange-600 focus:ring-orange-400"
                    : isCompleted
                      ? "border-white bg-white text-black hover:bg-zinc-200 focus:ring-white"
                      : isCurrent
                        ? "border-white bg-zinc-950 text-white ring-2 ring-white/50 focus:ring-white"
                        : "border-zinc-700 bg-black text-zinc-400 hover:border-zinc-500 hover:text-white focus:ring-zinc-500"
                }`}
                onClick={() => onStepClick?.(step)}
                type="button"
              >
                {isInvalid ? (
                  <ShieldAlert className="h-5 w-5 text-orange-100" />
                ) : isCompleted ? (
                  <ShieldCheck className="h-5 w-5" />
                ) : (
                  step
                )}
              </button>

              {step !== totalSteps && (
                <div
                  className={`mx-3 h-0.5 flex-1 transition ${
                    isCompleted ? "bg-white" : "bg-zinc-800"
                  }`}
                />
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default StepIndicator;
