import React, { useState } from "react";
import OutlineEye from "@/components/icons/OutlineEye";
import OutlineEyeInvisible from "@/components/icons/OutlineEyeInvisible";
import Password from "@/components/icons/Password";
import AuthInput from "@/components/shared/AuthInput";
import NavigationButton from "@/components/shared/button/NavigationButton";

const PasswordStep = ({ register, errors, prevStep, nextStep }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <label htmlFor="password" className="relative flex flex-col gap-y-1">
        <span className="text-sm">رمز عبور خود را وارد کنید</span>
        <AuthInput
          className="pl-10"
          id="password"
          icon={Password}
          name="password"
          placeholder="رمز عبور"
          type={showPassword ? "text" : "password"}
          {...register("password", {
            required: "وارد کردن رمز عبور الزامی است",
            minLength: {
              value: 8,
              message: "رمز عبور باید حداقل ۸ کاراکتر باشد",
            },
            maxLength: {
              value: 20,
              message: "رمز عبور نباید بیشتر از ۲۰ کاراکتر باشد",
            },
            validate: {
              pattern: (value) =>
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+/])[A-Za-z\d!@#$%^&*()_+/]{8,20}$/.test(
                  value
                ) ||
                "رمز عبور باید حداقل شامل یک حرف بزرگ، یک حرف کوچک، یک نماد و یک عدد باشد",
            },
          })}
        >
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500"
            onClick={() => setShowPassword((prev) => !prev)}
            type="button"
          >
            {showPassword ? <OutlineEye /> : <OutlineEyeInvisible />}
          </button>
        </AuthInput>
        {errors.password && (
          <span className="text-sm text-red-500">{errors.password.message}</span>
        )}
      </label>

      <div className="mt-12 flex justify-between">
        <NavigationButton direction="next" onClick={nextStep} />
        <NavigationButton direction="prev" onClick={prevStep} />
      </div>
    </>
  );
};

export default PasswordStep;
