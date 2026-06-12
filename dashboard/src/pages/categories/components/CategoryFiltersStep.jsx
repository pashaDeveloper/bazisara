import { MultiSelectDropdown } from "@/components/shared/Dropdown";

function CategoryFiltersStep({ definitions = [], selectedFilters = [], setForm }) {
  const handleChange = (nextSelectedFilters) => {
    setForm((prev) => ({
      ...prev,
      selectedFilters: nextSelectedFilters,
    }));
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white">فیلترهای دسته‌بندی</h2>
        <p className="mt-1 text-sm text-zinc-500">
          فیلترهای آماده‌ای را که برای این دسته لازم است انتخاب کنید.
        </p>
      </div>

      <MultiSelectDropdown
        label="فیلترها"
        onChange={handleChange}
        options={definitions.map((filter) => ({
          ...filter,
          label: filter.label,
          value: filter._id,
        }))}
        placeholder="انتخاب فیلترها"
        value={selectedFilters}
      />

      {selectedFilters.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {definitions
            .filter((filter) => selectedFilters.includes(filter._id))
            .map((filter) => (
              <div
                className="rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-zinc-300"
                key={filter._id}
              >
                <span className="block truncate font-medium text-white">{filter.label}</span>
                <span className="mt-1 block truncate text-xs text-zinc-500" dir="ltr">
                  {filter.key}
                </span>
              </div>
            ))}
        </div>
      ) : !definitions.length ? (
        <div className="rounded-xl border border-zinc-800 bg-black px-4 py-6 text-sm text-zinc-500">
          هنوز فیلتر آماده‌ای ثبت نشده است.
        </div>
      ) : null}
    </div>
  );
}

export default CategoryFiltersStep;

