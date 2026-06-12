import Plus from "@/components/icons/Plus";
import X from "@/components/icons/X";

function KeywordsStep({ label = "کلمات کلیدی", onChange, value = [] }) {
  const keywords = value.length ? value : [""];

  const updateKeyword = (index, nextValue) => {
    onChange(
      keywords.map((keyword, keywordIndex) =>
        keywordIndex === index ? nextValue : keyword
      )
    );
  };

  const addKeyword = () => {
    onChange([...keywords, ""]);
  };

  const removeKeyword = (index) => {
    const nextKeywords = keywords.filter((_, keywordIndex) => keywordIndex !== index);
    onChange(nextKeywords.length ? nextKeywords : [""]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-zinc-300">{label}</span>
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 transition hover:border-white hover:text-white"
          onClick={addKeyword}
          type="button"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        {keywords.map((keyword, index) => (
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]" key={index}>
            <input
              className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white"
              onChange={(event) => updateKeyword(index, event.target.value)}
              placeholder="مثلا خرید بازی اکشن"
              value={keyword}
            />
            <button
              aria-label="حذف کلمه کلیدی"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-red-900/70 text-red-300 transition hover:border-red-400 hover:text-red-200 sm:w-11"
              onClick={() => removeKeyword(index)}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <span className="block text-xs text-zinc-500">
        هر کلمه یا عبارت کلیدی را در یک ردیف جدا وارد کنید.
      </span>
    </div>
  );
}

export default KeywordsStep;

