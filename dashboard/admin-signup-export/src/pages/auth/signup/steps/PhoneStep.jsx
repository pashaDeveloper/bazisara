// components/signup/steps/PhoneStep.jsx
import React from "react";
import NavigationButton from "@/components/shared/button/NavigationButton";

const PhoneStep = ({ register, errors }) => {
  return (
    <>
      <label htmlFor="phone" className="flex flex-col gap-y-1">
        <span className="text-sm">شماره تلفن خود را وارد کنید</span>
        <input
          type="tel"
          name="phone"
          id="phone"
          {...register("phone", {
            required: "وارد کردن شماره تلفن الزامی است",
            pattern: {
              value: /^\+?[0-9]{10,15}$/,
              message: "شماره تلفن صحیح نیست",
            },
          })}
          placeholder="شماره تلفن"
          className="p-2 rounded border "
        />
        {errors.phone && (
          <span className="text-red-500 text-sm">
            {errors.phone.message}
          </span>
        )}
      </label>
    
    </>
  );
};

export default PhoneStep;
