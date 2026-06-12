import { Search, ShoppingBag } from "lucide-react";
import type { DesktopProduct, IconType, MobileProduct, ProductKind } from "./data";
import { formatPrice } from "./data";

export function BrandWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-right leading-none">
        <div
          className={`font-black tracking-tight ${
            compact ? "text-[2rem]" : "text-[2.25rem]"
          }`}
        >
          <span className="text-[#f05e52]">بازی</span>{" "}
          <span className="text-[#4ab3e7]">بازار</span>
        </div>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4fbff] text-[#2f91d6] ring-1 ring-[#d2edf9]">
        <ShoppingBag className="h-6 w-6" strokeWidth={2.25} />
      </div>
    </div>
  );
}

export function PlatformPill({
  label,
  glyph,
  icon: Icon,
  selected,
  onClick,
}: {
  label: string;
  glyph: string;
  icon: IconType;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex min-w-0 items-center justify-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
        selected
          ? "border-zinc-900 bg-zinc-900 text-white shadow-[0_16px_30px_-20px_rgba(0,0,0,.65)]"
          : "border-[#e6eaf0] bg-white text-zinc-800 hover:border-[#d5dbe5] hover:bg-[#f8fafc]"
      }`}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
          selected
            ? "bg-white/12 text-white"
            : "bg-[#f4f6f9] text-zinc-700 group-hover:bg-[#eef2f7]"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-right">
        <div className="text-sm font-bold">{glyph}</div>
        <div className={`text-xs ${selected ? "text-zinc-300" : "text-zinc-500"}`}>
          {label}
        </div>
      </div>
    </button>
  );
}

export function FilterChip({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: IconType;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
        active
          ? "border-zinc-900 bg-zinc-900 text-white shadow-[0_12px_24px_-18px_rgba(0,0,0,.7)]"
          : "border-[#e6eaf0] bg-white text-zinc-700 hover:border-[#d5dbe5] hover:bg-[#f8fafc]"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

function ProductArtwork({ kind }: { kind: ProductKind }) {
  if (kind === "dualsense") {
    return (
      <div className="relative h-52 w-full">
        <div className="absolute inset-x-8 bottom-7 h-20 rounded-[45%] bg-white shadow-[0_24px_40px_-24px_rgba(22,28,45,.45)]" />
        <div className="absolute bottom-12 right-12 h-14 w-10 rotate-[18deg] rounded-[35px] bg-[#edf2ff]" />
        <div className="absolute bottom-12 left-12 h-14 w-10 -rotate-[18deg] rounded-[35px] bg-[#edf2ff]" />
        <div className="absolute inset-x-[37%] bottom-11 h-10 rounded-2xl bg-[#121726]" />
        <div className="absolute bottom-[4.2rem] right-[44%] h-3 w-3 rounded-full bg-[#1d2230]" />
        <div className="absolute bottom-[4.2rem] left-[44%] h-3 w-3 rounded-full bg-[#1d2230]" />
      </div>
    );
  }

  if (kind === "ps4") {
    return (
      <div className="relative h-52 w-full">
        <div className="absolute inset-x-8 bottom-10 h-28 rounded-[2rem] bg-gradient-to-br from-[#383838] via-[#1f1f1f] to-[#090909] shadow-[0_26px_50px_-24px_rgba(0,0,0,.65)]" />
        <div className="absolute inset-x-10 bottom-[5.7rem] h-[2px] bg-[#4d4d4d]" />
        <div className="absolute bottom-8 left-8 h-12 w-20 rounded-[45%] bg-[#151515]" />
        <div className="absolute bottom-10 left-11 h-3 w-3 rounded-full bg-zinc-800" />
        <div className="absolute bottom-10 left-21 h-3 w-3 rounded-full bg-zinc-800" />
      </div>
    );
  }

  if (kind === "switch") {
    return (
      <div className="relative h-52 w-full">
        <div className="absolute inset-x-12 bottom-10 h-28 rounded-[1.75rem] bg-[#171717] shadow-[0_24px_42px_-24px_rgba(0,0,0,.65)]" />
        <div className="absolute inset-x-[27%] bottom-[3.3rem] h-20 rounded-2xl bg-[#2a2f36]" />
        <div className="absolute bottom-9 right-[18%] h-24 w-9 rounded-[1.3rem] bg-[#e74c5c]" />
        <div className="absolute bottom-9 left-[18%] h-24 w-9 rounded-[1.3rem] bg-[#22a2ef]" />
        <div className="absolute bottom-[7.2rem] right-[20.5%] h-2.5 w-2.5 rounded-full bg-white/90" />
        <div className="absolute bottom-[7.2rem] left-[20.5%] h-2.5 w-2.5 rounded-full bg-white/90" />
      </div>
    );
  }

  if (kind === "dock") {
    return (
      <div className="relative h-52 w-full">
        <div className="absolute bottom-10 left-1/2 h-24 w-40 -translate-x-1/2 skew-x-[-22deg] rounded-[1.8rem] bg-gradient-to-br from-white via-[#fafafa] to-[#dfe4ec] shadow-[0_30px_45px_-30px_rgba(0,0,0,.45)]" />
        <div className="absolute bottom-16 left-1/2 h-4 w-24 -translate-x-1/2 rounded-full bg-[#111827]" />
      </div>
    );
  }

  const centerStrip =
    kind === "ps5-pro"
      ? "bg-[linear-gradient(180deg,#101114_0%,#27292d_100%)]"
      : "bg-[linear-gradient(180deg,#191c22_0%,#0d1015_100%)]";

  return (
    <div className="relative h-52 w-full">
      <div className="absolute bottom-8 right-[29%] h-36 w-16 rotate-[7deg] rounded-[2rem] bg-white shadow-[0_26px_44px_-26px_rgba(0,0,0,.45)]" />
      <div className="absolute bottom-8 left-[29%] h-36 w-16 -rotate-[7deg] rounded-[2rem] bg-white shadow-[0_26px_44px_-26px_rgba(0,0,0,.45)]" />
      <div className={`absolute inset-x-[41%] bottom-8 h-36 rounded-[1rem] ${centerStrip}`} />
      {kind === "ps5-pro" ? (
        <>
          <div className="absolute inset-x-[41.5%] bottom-[10.8rem] h-[2px] bg-white/20" />
          <div className="absolute inset-x-[41.5%] bottom-[9.9rem] h-[2px] bg-white/20" />
        </>
      ) : null}
      <div className="absolute bottom-6 right-[34%] h-10 w-16 rounded-[45%] bg-white shadow-[0_18px_25px_-18px_rgba(0,0,0,.5)]" />
      <div className="absolute bottom-5 left-[34%] h-10 w-16 rounded-[45%] bg-white shadow-[0_18px_25px_-18px_rgba(0,0,0,.5)]" />
      <div className="absolute bottom-[2.4rem] right-[38%] h-3 w-3 rounded-full bg-[#1c2331]" />
      <div className="absolute bottom-[2.4rem] left-[38%] h-3 w-3 rounded-full bg-[#1c2331]" />
    </div>
  );
}

function PosterArtwork({
  title,
  gradient,
  accent,
}: {
  title: string;
  gradient: string;
  accent: string;
}) {
  const titleSize =
    title.length > 20 ? "text-[1.2rem] leading-[1.25]" : "text-[1.65rem] leading-none";

  return (
    <div
      className="relative aspect-[0.84] overflow-hidden rounded-[1.4rem] shadow-[0_22px_42px_-30px_rgba(0,0,0,.65)]"
      style={{ backgroundImage: gradient }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_20%,rgba(0,0,0,.46)_100%)]" />
      <div
        className="absolute inset-x-4 bottom-4 h-24 rounded-full blur-3xl"
        style={{ backgroundColor: `${accent}55` }}
      />
      <div className="absolute inset-x-4 top-4 h-px bg-white/20" />
      <div className="absolute bottom-5 right-4 left-4 text-white">
        <div className={`font-black tracking-tight ${titleSize}`}>{title}</div>
      </div>
    </div>
  );
}

export function ProductCard({ product }: { product: DesktopProduct }) {
  return (
    <article className="group rounded-[2rem] border border-[#e8ecf1] bg-white p-4 shadow-[0_18px_34px_-28px_rgba(0,0,0,.45)] transition-transform hover:-translate-y-1">
      <div className="mb-4 flex items-center justify-between text-xs font-bold">
        {product.badge ? (
          <span
            className={`rounded-full px-2.5 py-1 ${
              product.badge.tone === "green"
                ? "bg-[#e8f8ef] text-[#17a357]"
                : product.badge.tone === "orange"
                  ? "bg-[#fff3e4] text-[#ef8f2f]"
                  : "bg-[#ffe9eb] text-[#e25866]"
            }`}
          >
            {product.badge.label}
          </span>
        ) : (
          <span />
        )}
        <span className="text-zinc-400">{product.platform.toUpperCase()}</span>
      </div>

      <div className="rounded-[1.75rem] bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fc_100%)]">
        <ProductArtwork kind={product.kind} />
      </div>

      <div className="mt-4 space-y-2">
        <h3 className="line-clamp-2 min-h-12 text-sm font-bold leading-6 text-zinc-900">
          {product.title}
        </h3>
        <p className="text-xs leading-5 text-zinc-500">{product.subtitle}</p>
      </div>

      <div className="mt-5 border-t border-dashed border-[#edf1f5] pt-4">
        {product.available ? (
          <>
            {product.oldPrice ? (
              <div className="mb-1 text-xs text-zinc-400 line-through">
                {formatPrice(product.oldPrice)} تومان
              </div>
            ) : null}
            <div className="text-base font-black text-zinc-950">
              {formatPrice(product.price)}{" "}
              <span className="text-sm font-medium text-zinc-500">تومان</span>
            </div>
          </>
        ) : (
          <div className="rounded-full bg-[#f4f6fb] px-3 py-2 text-center text-sm font-medium text-[#5d6a8a]">
            موجود نیست، بعداً خبرم کن
          </div>
        )}
      </div>
    </article>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-[2rem] border border-[#e8ecf1] bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-6 w-12 animate-pulse rounded-full bg-[#f3eee6]" />
        <div className="h-4 w-10 animate-pulse rounded-full bg-[#f3eee6]" />
      </div>
      <div className="h-52 animate-pulse rounded-[1.75rem] bg-[linear-gradient(180deg,#f7f9fc_0%,#eef2f7_100%)]" />
      <div className="mt-4 space-y-3">
        <div className="h-4 w-3/4 animate-pulse rounded-full bg-[#eef2f6]" />
        <div className="h-4 w-1/2 animate-pulse rounded-full bg-[#eef2f6]" />
        <div className="h-3 w-5/6 animate-pulse rounded-full bg-[#eef2f6]" />
      </div>
      <div className="mt-6 space-y-2 border-t border-dashed border-[#edf1f5] pt-4">
        <div className="h-3 w-1/3 animate-pulse rounded-full bg-[#eef2f6]" />
        <div className="h-5 w-2/3 animate-pulse rounded-full bg-[#eef2f6]" />
      </div>
    </div>
  );
}

export function MobilePosterCard({ product }: { product: MobileProduct }) {
  return (
    <article className="space-y-3">
      <PosterArtwork
        title={product.title}
        gradient={product.gradient}
        accent={product.accent}
      />
      <h3 className="text-[1.15rem] font-black leading-8 tracking-tight text-zinc-800">
        {product.title}
      </h3>
    </article>
  );
}

export function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-dashed border-[#d8e0e8] bg-white p-12 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f4f7fb] text-zinc-500">
        <Search className="h-6 w-6" />
      </div>
      <h2 className="mt-5 text-xl font-black">محصولی پیدا نشد</h2>
      <p className="mt-2 text-sm text-zinc-500">
        فیلترها را تغییر بده یا عبارت دیگری جستجو کن.
      </p>
    </div>
  );
}
