// components/signup/steps/EmailStep.jsx
import React from "react";
import NavigationButton from "@/components/shared/button/NavigationButton";

const EmailStep = ({ register, errors, prevStep, nextStep }) => {
  return (
    <>
      <label htmlFor="email" className="flex flex-col gap-y-1">
        <span className="text-sm">ایمیل خود را وارد کنید</span>
        <input
          type="email"
          name="email"
          id="email"
          {...register("email", {
            required: "وارد کردن ایمیل الزامی است",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "فرمت ایمیل صحیح نیست",
            },
            minLength: {
              value: 6,
              message: "ایمیل باید حداقل 6 کاراکتر باشد",
            },
            maxLength: {
              value: 50,
              message: "ایمیل  نباید بیشتر از 50 کاراکتر باشد",
            },
          })}
          placeholder="john@example.com"
          className="p-2 rounded   "
        />
        {errors.email && (
          <span className="text-red-500 text-sm">{errors.email.message}</span>
        )}
      </label>
      <div className="flex justify-between mt-12">
      <NavigationButton direction="next" onClick={nextStep} />

      <NavigationButton direction="prev" onClick={prevStep} />

      </div>
    </>
  );
};

export default EmailStep;
