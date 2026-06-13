import Minus from "@/components/icons/Minus";
import Plus from "@/components/icons/Plus";

function ArrayInput({
  title,
  values = [],
  onChange,
  placeholder = "مقدار را وارد کنید",
  emptyValue = "",
  renderItem,
}) {
  const handleAddItem = () => {
    onChange?.([...(Array.isArray(values) ? values : []), emptyValue]);
  };

  const handleRemoveItem = (index) => {
    const next = [...values];
    next.splice(index, 1);
    onChange?.(next);
  };

  const handleItemChange = (index, value) => {
    const next = [...values];
    next[index] = value;
    onChange?.(next);
  };

  return (
    <div className="space-y-3 rounded-xl border border-zinc-300 bg-white p-4 dark:border-zinc-800 dark:bg-black">
      {title ? (
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{title}</span>
            <p className="mt-1 text-xs text-zinc-500">برای هر مورد، مقدار را وارد کنید و در صورت نیاز حذف کنید.</p>
          </div>
          <button
            aria-label="افزودن مورد"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-300 text-zinc-700 transition hover:border-zinc-700 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-200 dark:hover:border-white dark:hover:text-white"
            onClick={handleAddItem}
            type="button"
          >
            <Plus />
          </button>
        </div>
      ) : null}

      <div className="space-y-3">
        {values.map((item, index) => (
          <div
            className="rounded-2xl border border-zinc-300 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950"
            key={`${String(item)}-${index}`}
          >
            {renderItem ? (
              renderItem({
                item,
                index,
                placeholder,
                handleItemChange,
                handleRemoveItem,
              })
            ) : (
              <div className="flex items-start gap-2">
                <input
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-700 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-white"
                  onChange={(event) => handleItemChange(index, event.target.value)}
                  placeholder={placeholder}
                  type="text"
                  value={item ?? ""}
                />
                <button
                  aria-label="حذف مورد"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-300 text-zinc-500 transition hover:border-red-500 hover:text-red-400 dark:border-zinc-800 dark:text-zinc-300"
                  onClick={() => handleRemoveItem(index)}
                  type="button"
                >
                  <Minus />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ArrayInput;
