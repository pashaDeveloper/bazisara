import React from "react";
import Email from "@/components/icons/Email";
import AuthInput from "@/components/shared/AuthInput";
import NavigationButton from "@/components/shared/button/NavigationButton";

const EmailStep = ({ register, errors, prevStep, nextStep }) => {
  return (
    <>
      <label htmlFor="email" className="flex flex-col gap-y-1">
        <span className="text-sm">ایمیل خود را وارد کنید</span>
        <AuthInput
          id="email"
          icon={Email}
          name="email"
          placeholder="john@example.com"
          type="email"
          {...register("email", {
            required: "وارد کردن ایمیل الزامی است",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "فرمت ایمیل صحیح نیست",
            },
            minLength: {
              value: 6,
              message: "ایمیل باید حداقل ۶ کاراکتر باشد",
            },
            maxLength: {
              value: 50,
              message: "ایمیل نباید بیشتر از ۵۰ کاراکتر باشد",
            },
          })}
        />
        {errors.email && (
          <span className="text-sm text-red-500">{errors.email.message}</span>
        )}
      </label>

      <div className="mt-12 flex justify-between">
        <NavigationButton direction="next" onClick={nextStep} />
        <NavigationButton direction="prev" onClick={prevStep} />
      </div>
    </>
  );
};

export default EmailStep;
