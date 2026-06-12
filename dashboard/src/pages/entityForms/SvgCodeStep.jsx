function SvgCodeStep({ value, onChange }) {
  const svg = value?.trim();

  return (
    <div className="space-y-3">
      <label className="block text-xs text-zinc-400">کد SVG آیکون</label>
      <textarea
        className="w-full rounded-xl border border-zinc-800 bg-black text-white"
        name="icon"
        onChange={onChange}
        placeholder="<svg ...>...</svg>"
        rows="7"
        value={value}
      />
      <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-black px-3 py-3">
        <span className="text-xs text-zinc-500">پیش‌نمایش</span>
        {svg ? (
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg border border-zinc-800 text-white [&_svg]:h-6 [&_svg]:w-6"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <span className="text-sm text-zinc-500">ندارد</span>
        )}
      </div>
    </div>
  );
}

export default SvgCodeStep;

