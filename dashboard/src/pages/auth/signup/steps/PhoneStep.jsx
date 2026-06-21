import React from "react";
import Telephone from "@/components/icons/Telephone";
import AuthInput from "@/components/shared/AuthInput";

const PhoneStep = ({ register, errors }) => {
  return (
    <>
      <label htmlFor="phone" className="flex flex-col gap-y-1">
        <span className="text-sm">شماره تلفن خود را وارد کنید</span>
        <AuthInput
          id="phone"
          icon={Telephone}
          name="phone"
          placeholder="شماره تلفن"
          type="tel"
          {...register("phone", {
            required: "وارد کردن شماره تلفن الزامی است",
            pattern: {
              value: /^\+?[0-9]{10,15}$/,
              message: "شماره تلفن صحیح نیست",
            },
          })}
        />
        {errors.phone && (
          <span className="text-sm text-red-500">{errors.phone.message}</span>
        )}
      </label>
    </>
  );
};

export default PhoneStep;
