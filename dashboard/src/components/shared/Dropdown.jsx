import React, { useEffect, useMemo, useRef, useState } from "react";
import ChevronDown from "@/components/icons/ChevronDown";

const emptyText = "موردی پیدا نشد";

function optionValue(option) {
  return option?._id ?? option?.value ?? "";
}

function optionLabel(option) {
  return option?.label ?? option?.name ?? "";
}

function SvgIcon({ icon, label }) {
  const svgMarkup = typeof icon === "string" ? icon : icon?.svg;

  if (!svgMarkup?.trim()) {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-xs text-zinc-500">
        -
      </span>
    );
  }

  return (
    <span
      aria-label={label}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white [&_svg]:h-4 [&_svg]:w-4"
      style={{ color: icon?.color || undefined }}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}

function DropdownShell({
  buttonContent,
  children,
  disabled = false,
  label,
  placeholder,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

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
      {label ? <label className="mb-2 block text-xs text-zinc-400">{label}</label> : null}
      <button
        aria-expanded={isOpen}
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-black px-3 py-2 text-right text-sm text-white outline-none transition hover:border-zinc-600 focus:border-white disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
      >
        <span className="min-w-0 flex-1">{buttonContent || <span className="text-zinc-600">{placeholder}</span>}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-zinc-500 transition ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 p-1 shadow-2xl shadow-black/40">
          {children({ close: () => setIsOpen(false) })}
        </div>
      ) : null}
    </div>
  );
}

export function SingleSelectDropdown({
  disabled,
  label,
  name,
  onChange,
  options = [],
  placeholder = "انتخاب کنید",
  value,
}) {
  const selectedOption = useMemo(
    () => options.find((option) => optionValue(option) === value),
    [options, value]
  );

  return (
    <DropdownShell
      disabled={disabled}
      label={label}
      placeholder={placeholder}
      buttonContent={selectedOption ? optionLabel(selectedOption) : null}
    >
      {({ close }) =>
        options.length ? (
          options.map((option) => {
            const currentValue = optionValue(option);
            const isSelected = currentValue === value;

            return (
              <button
                className={`flex w-full items-center rounded-lg px-3 py-2 text-right text-sm transition ${
                  isSelected ? "bg-white text-black" : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                }`}
                key={currentValue}
                onClick={() => {
                  onChange?.({ target: { name, value: currentValue } });
                  close();
                }}
                type="button"
              >
                {optionLabel(option)}
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

export function MultiSelectDropdown({
  disabled,
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
      label={label}
      placeholder={placeholder}
      buttonContent={
        selectedLabels.length ? (
          <span className="flex flex-wrap gap-2">
            {selectedLabels.slice(0, 3).map((item) => (
              <span className="rounded-lg bg-zinc-900 px-2 py-1 text-xs text-zinc-200" key={item}>
                {item}
              </span>
            ))}
            {selectedLabels.length > 3 ? (
              <span className="rounded-lg bg-zinc-900 px-2 py-1 text-xs text-zinc-400">
                +{selectedLabels.length - 3}
              </span>
            ) : null}
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

export function IconSelectDropdown({
  disabled,
  label,
  name,
  onChange,
  options = [],
  placeholder = "انتخاب آیکون",
  value,
}) {
  const selectedIcon = useMemo(
    () => options.find((option) => optionValue(option) === value),
    [options, value]
  );

  const renderOption = (option) => (
    <span className="flex min-w-0 items-center gap-3">
      <SvgIcon icon={option} label={optionLabel(option)} />
      <span className="min-w-0 flex-1 truncate">{optionLabel(option)}</span>
    </span>
  );

  return (
    <DropdownShell
      disabled={disabled}
      label={label}
      placeholder={placeholder}
      buttonContent={selectedIcon ? renderOption(selectedIcon) : null}
    >
      {({ close }) =>
        options.length ? (
          options.map((option) => {
            const currentValue = optionValue(option);
            const isSelected = currentValue === value;

            return (
              <button
                className={`flex w-full items-center rounded-lg px-3 py-2 text-right text-sm transition ${
                  isSelected ? "bg-white text-black" : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                }`}
                key={currentValue}
                onClick={() => {
                  onChange?.({ target: { name, value: currentValue } });
                  close();
                }}
                type="button"
              >
                {renderOption(option)}
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

export default SingleSelectDropdown;
