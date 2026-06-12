import React from "react";
import PageBuilder from "@/components/shared/pageBuilder/PageBuilder";

const FormPageBuilder = ({
  label = "محتوای صفحه",
  id,
  value = "",
  onChange,
  error,
  required = false,
  className = "w-full"
}) => {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-zinc-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <PageBuilder 
        initialValue={value} 
        onChange={onChange} 
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
      
      <div className="mt-3 text-sm text-zinc-500">
        <p>راهنمای ویرایش:</p>
        <ul className="list-disc list-inside">
          <li>برای اضافه کردن نقل قول، از دکمه نقل قول استفاده کنید</li>
          <li>برای اضافه کردن ویدئو یا پادکست، از دکمه‌های مربوطه استفاده کنید</li>
          <li>هر بخش دارای شناسه منحصر به فرد جهت ویرایش آسان است</li>
        </ul>
      </div>
    </div>
  );
};

export default FormPageBuilder;

