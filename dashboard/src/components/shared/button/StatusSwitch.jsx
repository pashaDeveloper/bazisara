import React from "react";

const toneStyles = {
  dark: {
    wrapper: "border-zinc-800 bg-zinc-950",
    trackOff: "border-zinc-700 bg-zinc-800",
    trackOn: "border-emerald-500 bg-emerald-500",
    text: "text-zinc-100",
  },
  light: {
    wrapper: "border-zinc-200 bg-white",
    trackOff: "border-zinc-300 bg-zinc-100",
    trackOn: "border-emerald-500 bg-emerald-500",
    text: "text-zinc-900",
  },
};

const StatusSwitch = ({
  checked,
  defaultChecked,
  disabled = false,
  dir = "rtl",
  id,
  label,
  name,
  onChange,
  register,
  className = "",
  labelClassName = "",
  tone = "dark",
}) => {
  const isControlled = typeof checked === "boolean";
  const isOn = isControlled ? checked : Boolean(defaultChecked);
  const styles = toneStyles[tone] || toneStyles.dark;
  const isRtl = dir === "rtl";

  const handleToggle = () => {
    if (disabled) return;

    if (typeof onChange === "function") {
      onChange({
        target: {
          checked: !isOn,
          name: name || id,
          type: "checkbox",
          value: !isOn,
        },
      });
    }
  };

  return (
    <div
      className={`group flex w-full items-center justify-between gap-4 rounded-3xl border px-4 py-3 transition ${styles.wrapper} ${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-zinc-700 hover:bg-zinc-900"
      } ${className}`}
      dir="ltr"
    >
      {label ? (
        <span className={`min-w-0 flex-1 text-right text-sm font-medium ${styles.text} ${labelClassName}`} dir={dir}>
          {label}
        </span>
      ) : null}

      <input
        aria-label={label || name || id}
        checked={isControlled ? checked : undefined}
        className="sr-only"
        defaultChecked={isControlled ? undefined : defaultChecked}
        disabled={disabled}
        id={id}
        name={name || id}
        type="checkbox"
        {...(register ? register(id) : {})}
        onChange={onChange}
        readOnly={isControlled}
      />

      <button
        aria-checked={isOn}
        aria-label={label || name || id}
        className={`relative shrink-0 rounded-full outline-none ${
          disabled ? "opacity-60" : "focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        }`}
        disabled={disabled}
        onClick={handleToggle}
        role="switch"
        type="button"
      >
        <span
          className={`relative flex h-7 w-12 items-center rounded-full border-2 p-1 transition-all duration-200 ${
            isOn ? "border-emerald-500 bg-emerald-500" : "border-zinc-700 bg-zinc-800"
          }`}
        >
          <span
            className={`absolute top-1/2 block h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow transition-all duration-200 ${
              isRtl
                ? isOn
                  ? "right-1"
                  : "left-1"
                : isOn
                  ? "left-1"
                  : "right-1"
            }`}
          />
        </span>
      </button>
    </div>
  );
};

export default StatusSwitch;

