import React, { useId, useState } from "react";

const starPath =
  "M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

function clampRating(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(5, Math.round(number * 2) / 2));
}

function Star({ fillPercent }) {
  const clipId = useId();
  const strokeProps = {
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 0.75,
  };

  return (
    <svg aria-hidden="true" className="h-11 w-11 drop-shadow-[0_8px_18px_rgba(251,191,36,.18)]" viewBox="0 0 24 24">
      <path d={starPath} fill="currentColor" className="text-zinc-700" {...strokeProps} />
      <clipPath id={clipId}>
        <rect x={24 - fillPercent * 0.24} y="0" width={fillPercent * 0.24} height="24" />
      </clipPath>
      <path d={starPath} fill="currentColor" className="text-amber-400" clipPath={`url(#${clipId})`} {...strokeProps} />
    </svg>
  );
}

function StarRatingStep({ label, name, onChange, value }) {
  const [previewValue, setPreviewValue] = useState(null);
  const committedValue = clampRating(value);
  const activeValue = previewValue ?? committedValue;

  const emitChange = (nextValue) => {
    onChange?.({ target: { name, value: String(clampRating(nextValue)) } });
  };

  const valueFromPointer = (event, index) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const distanceFromRight = rect.right - event.clientX;
    const isRightHalf = distanceFromRight <= rect.width / 2;
    return clampRating(index + (isRightHalf ? 0.5 : 1));
  };

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-800 bg-black p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-sm text-zinc-300">{label}</span>
          <p className="mt-1 text-xs leading-6 text-zinc-500">امتیاز از راست به چپ انتخاب می‌شود و هر ستاره نیم‌مرحله دارد.</p>
        </div>
        <span className="rounded-full border border-amber-500/30 bg-amber-400/10 px-3 py-1 text-sm font-black text-amber-300">
          {committedValue.toLocaleString("fa-IR")} / ۵
        </span>
      </div>

      <div className="relative">
        <div className="flex select-none flex-row-reverse items-center justify-center gap-1" dir="ltr" onPointerLeave={() => setPreviewValue(null)}>
          {Array.from({ length: 5 }, (_, index) => {
            const fillPercent = Math.max(0, Math.min(1, activeValue - index)) * 100;

            return (
              <button
                aria-label={`${index + 1} ستاره`}
                className="relative rounded-lg p-1 outline-none transition duration-150 hover:scale-110 focus-visible:ring-2 focus-visible:ring-amber-400"
                key={index}
                onClick={() => emitChange(activeValue)}
                onPointerDown={(event) => emitChange(valueFromPointer(event, index))}
                onPointerMove={(event) => setPreviewValue(valueFromPointer(event, index))}
                type="button"
              >
                <Star fillPercent={fillPercent} />
              </button>
            );
          })}
        </div>

        <input
          aria-label={label}
          className="sr-only"
          dir="rtl"
          max="5"
          min="0"
          name={name}
          onChange={(event) => emitChange(event.target.value)}
          step="0.5"
          type="range"
          value={committedValue}
        />
      </div>
    </div>
  );
}

export default StarRatingStep;
