export function Breadcrumbs({ items }: { items: string[] }) {
  return (
    <div className="hidden text-sm text-[#7a8396] lg:flex lg:flex-row lg:items-center lg:justify-start lg:gap-2">
      {items.map((crumb, index) => (
        <span key={crumb} className="flex flex-row-reverse items-center gap-2">
          <span>{crumb}</span>
          {index < items.length - 1 ? <span>/</span> : null}
        </span>
      ))}
    </div>
  );
}
