import React from "react";
import Plus from "@/components/icons/Plus";
import X from "@/components/icons/X";

const emptyOption = { label: "", value: "" };
const hexColorPattern = /^#[0-9a-f]{6}$/i;

function DynamicOptionsInput({
  label = "گزینه‌ها",
  onChange,
  value = [],
  helperText,
  isColor = false,
}) {
  const options = value.length ? value : [emptyOption];

  const updateOption = (index, field, fieldValue) => {
    const nextOptions = options.map((option, optionIndex) =>
      optionIndex === index ? { ...option, [field]: fieldValue } : option
    );
    onChange(nextOptions);
  };

  const addOption = () => {
    onChange([...options, emptyOption]);
  };

  const removeOption = (index) => {
    const nextOptions = options.filter((_, optionIndex) => optionIndex !== index);
    onChange(nextOptions.length ? nextOptions : [emptyOption]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-zinc-300">{label}</span>
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 transition hover:border-white hover:text-white"
          onClick={addOption}
          type="button"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        {options.map((option, index) => (
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]" key={index}>
            <input
              className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white"
              onChange={(event) => updateOption(index, "label", event.target.value)}
              placeholder={isColor ? "عنوان، مثلا مشکی" : "عنوان، مثلا ۱۲ ماه"}
              value={option.label}
            />
            <div className="flex gap-2">
              {isColor ? (
                <input
                  aria-label="انتخاب رنگ"
                  className="h-11 w-14 shrink-0 cursor-pointer rounded-xl border border-zinc-800 bg-black p-1"
                  onChange={(event) => updateOption(index, "value", event.target.value)}
                  type="color"
                  value={hexColorPattern.test(option.value) ? option.value : "#000000"}
                />
              ) : null}
              <input
                className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-3 text-left text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white"
                dir="ltr"
                onChange={(event) => updateOption(index, "value", event.target.value)}
                placeholder={isColor ? "#000000" : "value, مثل 12_months"}
                value={option.value}
              />
            </div>
            <button
              aria-label="حذف گزینه"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-red-900/70 text-red-300 transition hover:border-red-400 hover:text-red-200 sm:w-11"
              onClick={() => removeOption(index)}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {helperText ? <span className="block text-xs text-zinc-500">{helperText}</span> : null}
    </div>
  );
}

export default DynamicOptionsInput;
