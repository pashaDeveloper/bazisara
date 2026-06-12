import { CircleHelp, MessageCircle, Palette, Share2, ShieldCheck, Star } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "../../products2/data";
import type { ProductDetail } from "../../products2/detail-data";
import { ACTION_ITEMS } from "./constants";

export function MobileProductHero({ detail }: { detail: ProductDetail }) {
  const {
    product,
    englishTitle,
    breadcrumbs,
    rating,
    ratingCount,
    reviewCount,
    questionsCount,
    gallery,
    colorLabel,
    colors,
    selectedColor,
    variantGroups,
    insurance,
  } = detail;

  return (
    <div className="lg:hidden">
      <div className="sticky top-0 z-20 -mx-4 border-b border-[#e8ecf3] bg-white px-4 py-4">
        <div className="flex items-center justify-between">
          <button className="text-[#495162]">←</button>
          <div className="text-[1.6rem] font-black text-[#111827]">کالای دیجیتال</div>
          <div className="flex items-center gap-4 text-[#495162]">
            <Share2 className="h-5 w-5" />
            <Star className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {ACTION_ITEMS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex shrink-0 items-center gap-2 rounded-full border border-[#e7ebf1] px-5 py-2 text-sm font-medium text-[#4b557a]"
            >
              <Icon className="h-4 w-4 text-[#2f467f]" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-6">
        <div className="relative rounded-[1.5rem] bg-white py-6">
          <div className="relative mx-auto aspect-square w-full max-w-[420px]">
            <Image
              src={gallery[0]}
              alt={product.title}
              fill
              sizes="90vw"
              className="object-contain p-6"
              priority
            />
          </div>
          <div className="mt-3 flex justify-center gap-2">
            <span className="h-4 w-10 rounded-full bg-[#8b8f99]" />
            <span className="h-4 w-4 rounded-full bg-[#d0d6df]" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap flex-row-reverse items-center justify-start gap-2 text-sm text-[#7a8396]">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb} className="flex flex-row-reverse items-center gap-2">
              <span>{crumb}</span>
              {index < breadcrumbs.length - 1 ? <span>/</span> : null}
            </span>
          ))}
        </div>
        <h1 className="mt-4 text-[1.95rem] font-black leading-[1.7] text-[#29467c]">{product.title}</h1>
        <p className="mt-2 text-[1.05rem] text-[#9ba3ba]">{englishTitle}</p>

        <div className="mt-5 flex flex-wrap gap-2 text-sm">
          <div className="flex items-center gap-2 rounded-full border border-[#e9edf3] px-4 py-2 text-[#20a365]">
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

        <div className="mt-8 rounded-[1.4rem] border border-[#e8edf3] bg-white p-4 shadow-[0_24px_48px_-38px_rgba(15,23,42,.18)]">
          <div className="flex items-center gap-2 text-[1.15rem] font-black text-[#111827]">
            <Palette className="h-4 w-4 text-[#64748b]" />
            <span>{colorLabel}</span>
          </div>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {colors.map((color) => (
              <button
                key={color.label}
                className={`flex shrink-0 items-center gap-2 rounded-[1rem] border px-3 py-2 text-sm font-bold ${
                  color.label === selectedColor ? "border-[#344054]" : "border-[#e7ebf1]"
                }`}
              >
                <span
                  className="h-7 w-7 rounded-lg border border-black/5"
                  style={{ backgroundColor: color.value }}
                />
                {color.label}
              </button>
            ))}
          </div>
        </div>

        {variantGroups.map((group) => (
          <div key={group.name} className="mt-7">
            <div className="text-[1.15rem] font-black text-[#111827]">
              {group.name}: {group.valueLabel}
            </div>
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {group.options.map((option) => (
                <button
                  key={option}
                  className={`shrink-0 rounded-[1rem] border px-4 py-2.5 text-sm font-bold ${
                    option === group.selected ? "border-[#344054]" : "border-[#e7ebf1]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}

        <section className="mt-8 rounded-[1.4rem] border border-[#e8edf3] bg-white p-4 shadow-[0_24px_48px_-38px_rgba(15,23,42,.18)]">
          <div className="mb-3 flex items-center gap-2 text-[1.15rem] font-black text-[#111827]">
            <ShieldCheck className="h-4 w-4 text-[#64748b]" />
            <span>بیمه</span>
          </div>
          <div className="rounded-[1rem] border border-[#e8edf3] bg-[#fbfcff] p-4">
            <div className="text-base font-bold text-[#2f3c61]">{insurance.title}</div>
            <div className="mt-2 text-sm text-[#7f879a]">{insurance.description}</div>
            <div className="mt-2 text-lg font-black text-[#2f3c61]">
              {formatPrice(insurance.price)} <span className="text-xs font-medium">تومان</span>
            </div>
          </div>
          <button className="mt-3 rounded-full border border-[#e7ebf1] bg-white px-4 py-2.5 text-sm font-bold text-[#5b647b]">
            بیشتر بدانید
          </button>
        </section>
      </div>
    </div>
  );
}
