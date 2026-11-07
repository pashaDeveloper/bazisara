"use client";

// Standalone multi-select extracted from the dashboard.
// Requires React and Tailwind CSS. Include this file in Tailwind content.
// Usage: <MultiSelectDropdown label="ژانرها" options={options} value={selected} onChange={setSelected} />
// options: [{ value: "action", label: "اکشن" }] or [{ _id: "action", name: "اکشن" }].
// value is an array of selected IDs; onChange receives the updated array.
// Optional props: placeholder, disabled, controlClassName, iconClassName.
import React, { useEffect, useRef, useState } from "react";

const ChevronDown = ({ className, ...props }) => {
  return (
    <svg
      className={"w-5 h-5 bi bi-chevron-down" + (className ? " " + className : "")}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path
        fillRule="evenodd"
        d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"
      />
    </svg>
  );
};

const emptyText = "موردی پیدا نشد";

function optionValue(option) {
  return option?._id ?? option?.value ?? "";
}

function optionLabel(option) {
  return option?.label ?? option?.name ?? "";
}

function DropdownShell({
  buttonContent,
  children,
  controlClassName = "",
  disabled = false,
  iconClassName = "",
  label,
  placeholder,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const resolvedPlaceholder = !placeholder || /[ØÙÚÛ]/.test(placeholder) ? "انتخاب کنید" : placeholder;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      {label ? <label className="mb-1 block text-sm text-zinc-700 dark:text-gray-100">{label}</label> : null}
      <button
        aria-expanded={isOpen}
        className={`relative h-10 w-full rounded-full border border-gray-300 bg-white py-2 pl-3 pr-14 text-right text-sm text-zinc-900 outline-none transition focus:border-green-400 focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-[#0a2d4d] dark:text-gray-100 dark:focus:border-blue-500 ${controlClassName}`.trim()}
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
      >
        <span className={`pointer-events-none absolute right-0 top-0 flex h-full w-12 items-center justify-center rounded-r-[1.5rem] rounded-l-none border border-l border-gray-300 bg-gray-200 text-gray-700 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 ${iconClassName}`.trim()}>
          <ChevronDown className={`h-5 w-5 transition ${isOpen ? "rotate-180" : ""}`} />
        </span>
        <span className="block min-w-0 truncate">{buttonContent || <span className="text-zinc-500 dark:text-gray-300">{resolvedPlaceholder}</span>}</span>
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-2xl shadow-black/15 dark:border-gray-600 dark:bg-zinc-950 dark:shadow-black/40">
          {children({ close: () => setIsOpen(false) })}
        </div>
      ) : null}
    </div>
  );
}

export function MultiSelectDropdown({
  controlClassName,
  disabled,
  iconClassName,
  label,
  onChange,
  options = [],
  placeholder = "انتخاب کنید",
  value = [],
}) {
  const selectedLabels = options
    .filter((option) => value.includes(optionValue(option)))
    .map((option) => optionLabel(option));

  const toggleOption = (currentValue) => {
    const nextValue = value.includes(currentValue)
      ? value.filter((item) => item !== currentValue)
      : [...value, currentValue];

    onChange?.(nextValue);
  };

  return (
    <DropdownShell
      disabled={disabled}
      controlClassName={controlClassName}
      label={label}
      iconClassName={iconClassName}
      placeholder={placeholder}
      buttonContent={
        selectedLabels.length ? (
          <span className="block truncate">
            {selectedLabels.slice(0, 2).join("، ")}
            {selectedLabels.length > 2 ? ` +${selectedLabels.length - 2}` : ""}
          </span>
        ) : null
      }
    >
      {() =>
        options.length ? (
          options.map((option) => {
            const currentValue = optionValue(option);
            const isSelected = value.includes(currentValue);

            return (
              <button
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-right text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                key={currentValue}
                onClick={() => toggleOption(currentValue)}
                type="button"
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    isSelected ? "border-white bg-white text-black" : "border-zinc-700"
                  }`}
                >
                  {isSelected ? "✓" : ""}
                </span>
                <span className="min-w-0 flex-1 truncate">{optionLabel(option)}</span>
              </button>
            );
          })
        ) : (
          <div className="px-3 py-4 text-center text-sm text-zinc-500">{emptyText}</div>
        )
      }
    </DropdownShell>
  );
}

export default MultiSelectDropdown;
