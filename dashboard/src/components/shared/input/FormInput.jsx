import React from "react";

function FormInput({
  className = "",
  label,
  textarea = false,
  type = "text",
  ...props
}) {
  const inputClassName = `w-full rounded-primary border border-gray-300 bg-white px-3 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-gray-500 focus:border-green-400 focus:ring-0 dark:border-gray-600 dark:bg-[#0a2d4d] dark:text-gray-100 dark:placeholder:text-gray-300 dark:focus:border-blue-500 ${className}`.trim();

  const field = textarea ? (
    <textarea className={inputClassName} {...props} />
  ) : (
    <input className={inputClassName} type={type} {...props} />
  );

  if (!label) return field;

  return (
    <label className="space-y-2">
      <span className="text-sm text-zinc-700 dark:text-gray-100">{label}</span>
      {field}
    </label>
  );
}

export default FormInput;

