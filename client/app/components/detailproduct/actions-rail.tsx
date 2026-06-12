import { ACTION_ITEMS } from "./constants";

export function ActionsRail() {
  return (
    <aside dir="rtl" className="space-y-3">
      {ACTION_ITEMS.map(({ label, icon: Icon }) => (
        <button
          key={label}
          type="button"
          className="flex h-[86px] w-full flex-col items-center justify-center gap-2 rounded-[1.2rem] border border-[#e7ebf1] bg-white px-2 text-sm font-medium text-[#4c5672]"
        >
          <Icon className="h-5 w-5 text-[#2f467f]" />
          <span>{label}</span>
        </button>
      ))}
    </aside>
  );
}
