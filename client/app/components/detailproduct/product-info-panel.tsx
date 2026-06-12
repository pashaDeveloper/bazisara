import { CircleHelp, MessageCircle, Palette, ShieldCheck, Star } from "lucide-react";
import { formatPrice } from "../../products2/data";
import type { ProductDetail } from "../../products2/detail-data";

export function ProductInfoPanel({
  detail,
}: {
  detail: ProductDetail;
}) {
  const {
    product,
    englishTitle,
    rating,
    ratingCount,
    reviewCount,
    questionsCount,
    colorLabel,
    colors,
    selectedColor,
    variantGroups,
    insurance,
  } = detail;

  return (
    <section dir="rtl" className="space-y-4">
      <div>
        <h1 className="text-[1.8rem] font-black leading-[1.6] text-[#29467c]">{product.title}</h1>
        <p className="mt-1.5 text-sm text-[#97a1b8]">{englishTitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 text-sm">
        <div className="flex items-center gap-2 rounded-full border border-[#e9edf3] px-4 py-2 text-[#21a365]">
          <Star className="h-4 w-4 fill-current" />
          <span className="font-black">{rating.toLocaleString("fa-IR")}</span>
          <span className="text-[#7f8796]">({ratingCount.toLocaleString("fa-IR")} رای)</span>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#e9edf3] px-4 py-2 text-[#59627a]">
          <MessageCircle className="h-4 w-4" />
          {reviewCount.toLocaleString("fa-IR")} دیدگاه
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#e9edf3] px-4 py-2 text-[#59627a]">
          <CircleHelp className="h-4 w-4" />
          {questionsCount.toLocaleString("fa-IR")} سوال
        </div>
      </div>

      <div className="space-y-3 rounded-[1.35rem] border border-[#e8edf3] bg-white p-4 shadow-[0_24px_48px_-38px_rgba(15,23,42,.18)]">
        <div>
          <div className="flex items-center gap-2 text-lg font-black text-[#111827]">
            <Palette className="h-4 w-4 text-[#64748b]" />
            <span>{colorLabel}</span>
          </div>
          <div className="mt-2.5 flex items-center gap-2.5">
            {colors.map((color) => (
              <button
                key={color.label}
                type="button"
                className={`flex h-11 w-11 items-center justify-center rounded-full border-2 ${
                  color.label === selectedColor ? "border-[#0f172a]" : "border-[#dce2eb]"
                }`}
              >
                <span
                  className="h-7 w-7 rounded-full border border-black/5"
                  style={{ backgroundColor: color.value }}
                />
              </button>
            ))}
          </div>
        </div>

        {variantGroups.map((group) => (
          <div key={group.name}>
            <div className="text-base font-black text-[#111827]">
              {group.name}: {group.valueLabel}
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {group.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`rounded-[0.85rem] border px-3.5 py-2 text-sm font-bold ${
                    option === group.selected
                      ? "border-[#344054] bg-white text-[#111827] shadow-[0_18px_34px_-26px_rgba(15,23,42,.35)]"
                      : "border-[#e5eaf2] bg-white text-[#4b557a]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div>
          <div className="flex items-center gap-2 text-lg font-black text-[#111827]">
            <ShieldCheck className="h-4 w-4 text-[#64748b]" />
            <span>بیمه</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between rounded-[1rem] border border-[#e8edf3] bg-[#fbfcff] p-3.5">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-[#2f3c61]">{insurance.title}</div>
              <div className="mt-1.5 text-xs text-[#7f879a]">{insurance.description}</div>
              <div className="mt-1.5 text-base font-black text-[#2f3c61]">
                {formatPrice(insurance.price)} <span className="text-xs font-medium">تومان</span>
              </div>
            </div>
            <input type="checkbox" className="mr-4 h-5 w-5 rounded border-[#d9e0ea]" />
          </div>
          <button className="mt-2.5 rounded-full border border-[#e7ebf1] bg-white px-4 py-2 text-sm font-bold text-[#5b647b]">
            بیشتر بدانید
          </button>
        </div>
      </div>
    </section>
  );
}
