import React, { useEffect, useState } from "react";

export function useDebouncedValue(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debouncedValue;
}

function SearchBox({
  onChange,
  placeholder = "جستجو...",
  value,
}) {
  return (
    <div className="relative w-full md:w-80">
      <input
        className="h-11 w-full rounded-xl border border-zinc-800 bg-black px-4 pl-10 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="search"
        value={value}
      />
      {value ? (
        <button
          aria-label="پاک کردن جستجو"
          className="absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-900 hover:text-white"
          onClick={() => onChange("")}
          type="button"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}

export default SearchBox;

