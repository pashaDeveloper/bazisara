"use client";


import React from "react";

const Plus = ({ className, ...props }) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={"w-5 h-5" + (className ? " " + className : "")}
    >
      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
    </svg>
  );
};

const Trash = (props) => {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><path fill="none" d="M296 64h-80a7.91 7.91 0 0 0-8 8v24h96V72a7.91 7.91 0 0 0-8-8"/><path fill="currentColor" d="M432 96h-96V72a40 40 0 0 0-40-40h-80a40 40 0 0 0-40 40v24H80a16 16 0 0 0 0 32h17l19 304.92c1.42 26.85 22 47.08 48 47.08h184c26.13 0 46.3-19.78 48-47l19-305h17a16 16 0 0 0 0-32M192.57 416H192a16 16 0 0 1-16-15.43l-8-224a16 16 0 1 1 32-1.14l8 224A16 16 0 0 1 192.57 416M272 400a16 16 0 0 1-32 0V176a16 16 0 0 1 32 0Zm32-304h-96V72a7.91 7.91 0 0 1 8-8h80a7.91 7.91 0 0 1 8 8Zm32 304.57A16 16 0 0 1 320 416h-.58A16 16 0 0 1 304 399.43l8-224a16 16 0 1 1 32 1.14Z"/></svg>
  );
};

function splitListValue(value) {
  return String(value || "")
    .split(/[،,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinListValue(items) {
  return items.map((item) => String(item || "").trim()).filter(Boolean).join("، ");
}

export function ListTextField({ label, name, onChange, placeholder, value }) {
  const [draft, setDraft] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const rootRef = React.useRef(null);
  const items = splitListValue(value);

  const emit = (nextItems) => onChange?.(joinListValue(nextItems));

  const addDraft = () => {
    const nextValue = draft.trim();
    if (!nextValue) return;
    emit([...items, nextValue]);
    setDraft("");
    setIsOpen(true);
  };

  const removeItem = (index) => {
    emit(items.filter((_, itemIndex) => itemIndex !== index));
  };

  React.useEffect(() => {
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div className="relative flex flex-col gap-y-1" ref={rootRef}>
      <span className="text-sm text-zinc-700 dark:text-gray-100">{label}</span>
      <div className="relative">
        <button
          aria-label={`باز کردن ${label}`}
          className="absolute right-0 top-0 z-10 flex h-full w-12 items-center justify-center rounded-r-[1.5rem] rounded-l-none border border-l border-gray-300 bg-gray-200 text-gray-700 shadow-sm transition hover:bg-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          <Plus className="h-5 w-5" />
        </button>
        <input
          className="h-10 w-full cursor-default border bg-white py-2 pl-3 pr-14 text-sm text-zinc-900 outline-none transition focus:border-green-400 focus:ring-0 dark:bg-[#0a2d4d] dark:text-gray-100 dark:focus:border-blue-500"
          name={name}
          onClick={() => setIsOpen(true)}
          placeholder={placeholder || label}
          readOnly
          value={items.length ? items.join("، ") : ""}
        />
      </div>
      {isOpen ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-gray-600 dark:bg-[#08243d]">
          <div className="max-h-44 space-y-1 overflow-y-auto">
            {items.length ? (
              items.map((item, index) => (
                <div
                  className="flex min-h-9 items-center justify-between gap-2 rounded-lg bg-zinc-50 px-2 text-sm text-zinc-800 dark:bg-gray-800 dark:text-gray-100"
                  key={`${name}-dropdown-item-${index}-${item}`}
                >
                  <span className="min-w-0 flex-1 truncate">{item}</span>
                  <button
                    aria-label="حذف مورد"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition hover:bg-red-100 hover:text-red-600 dark:text-gray-300 dark:hover:bg-red-950"
                    onClick={() => removeItem(index)}
                    type="button"
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="rounded-lg bg-zinc-50 px-2 py-2 text-xs text-zinc-500 dark:bg-gray-800 dark:text-gray-300">
                موردی ثبت نشده است
              </div>
            )}
          </div>
          <div className="mt-2 flex gap-2 border-t border-zinc-100 pt-2 dark:border-gray-700">
            <input
              autoFocus
              className="h-9 min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-green-400 dark:border-gray-600 dark:bg-[#0a2d4d] dark:text-gray-100"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addDraft();
                }
              }}
              placeholder={placeholder || label}
              value={draft}
            />
            <button
              aria-label={`افزودن ${label}`}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-gray-100 text-zinc-700 transition hover:border-green-500 hover:text-green-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              onClick={addDraft}
              type="button"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ListTextField;
