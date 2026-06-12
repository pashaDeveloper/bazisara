function IconPreview({
  className = "",
  emptyLabel = "ندارد",
  icon,
  label,
  sizeClass = "h-12 w-12 [&_svg]:h-6 [&_svg]:w-6",
}) {
  const svgMarkup = typeof icon === "string" ? icon : icon?.svg;
  const color = typeof icon === "string" ? undefined : icon?.color;

  if (!svgMarkup?.trim()) {
    return <span className="text-zinc-500">{emptyLabel}</span>;
  }

  return (
    <div
      aria-label={label}
      className={`flex items-center justify-center rounded-lg border border-gray-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-black dark:text-white ${sizeClass} ${className}`.trim()}
      style={{ color: color || undefined }}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}

export default IconPreview;

