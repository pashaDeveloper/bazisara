import React from "react";

function FormInput({
  className = "",
  label,
  textarea = false,
  type = "text",
  ...props
}) {
  const inputClassName = `w-full rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white ${className}`.trim();

  const field = textarea ? (
    <textarea className={inputClassName} {...props} />
  ) : (
    <input className={inputClassName} type={type} {...props} />
  );

  if (!label) return field;

  return (
    <label className="space-y-2">
      <span className="text-sm text-zinc-300">{label}</span>
      {field}
    </label>
  );
}

export default FormInput;
