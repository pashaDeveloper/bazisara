import React from "react";
import { IconSelectDropdown } from "@/components/shared/Dropdown";
import { useGetIconsQuery } from "@/services/iconApi";

function IconSelect({
  className = "",
  onChange,
  placeholder = "انتخاب آیکون",
  value,
}) {
  const { data, isLoading } = useGetIconsQuery({ page: 1, limit: 200 });
  const icons = data?.data || [];
  const currentValue = value?._id || "";

  return (
    <div className={className}>
      <IconSelectDropdown
        disabled={isLoading}
        name="pageBuilderIcon"
        onChange={(event) => {
          const selectedIcon = icons.find((icon) => icon._id === event.target.value);
          onChange?.(selectedIcon || null);
        }}
        options={icons}
        placeholder={isLoading ? "در حال دریافت آیکون‌ها..." : placeholder}
        value={currentValue}
      />
      {currentValue ? (
        <button
          className="mt-2 text-xs text-zinc-400 transition hover:text-white"
          onClick={() => onChange?.(null)}
          type="button"
        >
          حذف آیکون
        </button>
      ) : null}
    </div>
  );
}

export default IconSelect;
