function SvgPreview({ svg, label }) {
  const svgMarkup = typeof svg === "string" ? svg : svg?.svg;

  if (!svgMarkup?.trim()) {
    return <span className="text-zinc-500">ندارد</span>;
  }

  return (
    <div
      aria-label={label}
      className="flex h-12 w-12 items-center justify-center rounded-lg border border-zinc-800 bg-black text-white [&_svg]:h-6 [&_svg]:w-6"
      style={{ color: svg?.color || undefined }}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}

export default SvgPreview;

