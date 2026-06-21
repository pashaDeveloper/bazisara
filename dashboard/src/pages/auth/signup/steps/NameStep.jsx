import React from "react";
import User from "@/components/icons/User";
import AuthInput from "@/components/shared/AuthInput";
import NavigationButton from "@/components/shared/button/NavigationButton";

const NameStep = ({ register, errors, prevStep, nextStep }) => {
  return (
    <>
      <label htmlFor="name" className="flex flex-col gap-y-1">
        <span className="text-sm">نام خود را وارد کنید</span>
        <AuthInput
          id="name"
          icon={User}
          maxLength="100"
          name="name"
          placeholder="نام"
          type="text"
          {...register("name", {
            required: "وارد کردن نام الزامی است",
            minLength: {
              value: 3,
              message: "نام باید حداقل ۳ حرف داشته باشد",
            },
            maxLength: {
              value: 30,
              message: "نام نباید بیشتر از ۳۰ حرف باشد",
            },
          })}
        />
        {errors.name && (
          <span className="text-sm text-red-500">{errors.name.message}</span>
        )}
      </label>

      <div className="mt-12 flex justify-between">
        <NavigationButton direction="next" onClick={nextStep} />
        <NavigationButton direction="prev" onClick={prevStep} />
      </div>
    </>
  );
};

export default NameStep;
