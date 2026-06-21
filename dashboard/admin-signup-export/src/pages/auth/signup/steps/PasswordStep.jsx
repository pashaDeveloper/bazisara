// components/signup/steps/PasswordStep.jsx
import React from "react";
import NavigationButton from "@/components/shared/button/NavigationButton";
import  OutlineEye  from "@/components/icons/OutlineEye";
import  OutlineEyeInvisible  from "@/components/icons/OutlineEyeInvisible";
import { useState } from "react";

const PasswordStep = ({ register, errors, prevStep, nextStep }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  return (
    <>
   <label htmlFor="password" className="flex flex-col gap-y-1 relative">
      <span className="text-sm">رمز عبور خود را وارد کنید</span>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          id="password"
          {...register("password", {
            required: "وارد کردن رمز عبور الزامی است",
            minLength: {
              value: 8,
              message: "رمز عبور باید حداقل 8 کاراکتر باشد",
            },
            maxLength: {
              value: 20,
              message: "رمز عبور نباید بیشتر از 20 کاراکتر باشد",
            },
            validate: {
              pattern: (value) =>
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+/])[A-Za-z\d!@#$%^&*()_+/]{8,20}$/.test(
                  value
                ) || "رمز عبور باید حداقل شامل یک حرف بزرگ، یک حرف کوچک، یک نماد و یک عدد باشد ",
            },
          })}
          placeholder="رمز عبور"
          className="p-2 pr-10 w-full rounded border bg-white dark-text-black"
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
        >
          {showPassword ? <OutlineEye /> : <OutlineEyeInvisible />}        </button>
      </div>
      {errors.password && (
        <span className="text-red-500 text-sm">{errors.password.message}</span>
      )}
      </label>
      <div className="flex justify-between mt-12">
      <NavigationButton direction="next" onClick={nextStep} />

<NavigationButton direction="prev" onClick={prevStep} />
      </div>
    </>
  );
};

export default PasswordStep;
