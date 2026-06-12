"use client";

import { ChevronLeft, Percent } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatPrice, products } from "../products2/data";

function getDiscountPercent(product: (typeof products)[number]) {
  if (!product.oldPrice || product.oldPrice <= product.price) return null;
  return Math.round((1 - product.price / product.oldPrice) * 100);
}

function ProductDealCard({ product }: { product: (typeof products)[number] }) {
  const discount = getDiscountPercent(product);

  return (
    <Link
      href={`/products2/${product.id}`}
      className="group flex h-full w-[clamp(162px,48vw,188px)] shrink-0 flex-col overflow-hidden rounded-[10px] bg-white p-3 text-right shadow-[0_10px_24px_-20px_rgba(0,0,0,.35)] transition hover:-translate-y-0.5 sm:w-[clamp(172px,42vw,194px)] md:w-[195px] lg:h-[277px] lg:w-[198px]"
    >
      <div className="relative h-[120px] w-full lg:h-[150px]">
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="210px"
          className="object-contain drop-shadow-[0_18px_22px_rgba(28,35,50,.12)] transition-transform duration-300 group-hover:scale-[1.04]"
        />
      </div>

      <h3 className="mt-2 min-h-[44px] line-clamp-2 text-[13px] leading-6 text-[#4b557a]">
        {product.title}
      </h3>

      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="text-left">
          {product.oldPrice ? (
            <div className="text-[11px] text-[#ff5d67] line-through">
              {formatPrice(product.oldPrice)} تومان
            </div>
          ) : null}
          <div className="text-[15px] font-black text-[#23315a]">
            {formatPrice(product.price)}
            <span className="mr-1 text-[10px] font-medium text-zinc-500">تومان</span>
          </div>
        </div>

        <span className="rounded-lg bg-[#f73c54] px-2 py-1 text-[11px] font-black text-white">
          {discount ? `${discount}٪` : product.badge?.label || "٪"}
        </span>
      </div>
    </Link>
  );
}

export function HomeProductStrip() {
  const offerProducts = useMemo(
    () =>
      products
        .filter((product) => product.image !== "/products/png/dualsense-charging-dock.png")
        .slice(0, 8),
    [],
  );
  const [desktopIndex, setDesktopIndex] = useState(0);
  const desktopVisibleCards = 5;
  const maxDesktopIndex = Math.max(0, offerProducts.length - desktopVisibleCards);
  const canGoBack = desktopIndex > 0;
  const canGoForward = desktopIndex < maxDesktopIndex;
  const desktopCardStep = 206;

  const moveDesktop = (direction: number) => {
    setDesktopIndex((current) => Math.min(maxDesktopIndex, Math.max(0, current + direction)));
  };

  return (
    <section className="relative mx-4 mt-6 overflow-visible md:mx-6">
      <div className="overflow-hidden rounded-[1.5rem] border border-[#f4b8c2] bg-[#f33b53] shadow-[0_20px_45px_-28px_rgba(0,0,0,.45)] lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 pt-4" dir="rtl">
          <h2 className="text-right text-[1.05rem] font-black leading-8 text-white">پیشنهادات شگفت‌انگیز!</h2>
          <Link href="/products2" className="rounded-lg bg-white px-4 py-2 text-sm font-black text-[#cb2f46] shadow-[0_10px_20px_-16px_rgba(0,0,0,.35)]">
            مشاهده همه
          </Link>
        </div>

        <div className="px-3 pb-4 pt-3">
          <div className="flex gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" dir="ltr">
            {offerProducts.map((product) => (
              <ProductDealCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>

      <div className="relative hidden rounded-[1.35rem] border border-[#f4b8c2] bg-[#f33b53] p-4 shadow-[0_20px_45px_-28px_rgba(0,0,0,.45)] xl:block">
        <div className="hidden items-stretch gap-3 xl:grid xl:grid-cols-[190px_minmax(0,1fr)]" dir="rtl">
          <aside className="relative z-10 h-[277px] overflow-hidden rounded-[1.15rem] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,.12),transparent_45%),linear-gradient(180deg,#ff2f4c_0%,#f31f45_100%)] px-4 py-6 text-center text-white xl:px-5">
            <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_center,_rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:30px_30px]" />
            <div className="relative flex min-h-[188px] flex-col items-center justify-between">
              <Percent className="h-20 w-20 drop-shadow-[0_10px_14px_rgba(0,0,0,.15)]" strokeWidth={2.2} />
              <div>
                <p className="text-[1.1rem] font-black leading-8 md:text-[1.35rem]">
                  پیشنهادات
                  <br />
                  شگفت‌انگیز!
                </p>
                <Link
                  href="/products2"
                  className="mt-4 inline-flex items-center rounded-full bg-[#cb2f46] px-4 py-2 text-sm font-black text-white"
                >
                  مشاهده همه
                  <ChevronLeft className="mr-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </aside>

          <div className="relative z-0 min-w-0 overflow-visible">
            {canGoForward ? (
              <button
                type="button"
                aria-label="محصول بعدی"
                onClick={() => moveDesktop(1)}
                className="absolute left-0 top-1/2 z-[100] flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white bg-white text-[#44506c] shadow-[0_14px_28px_-14px_rgba(0,0,0,.55)]"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            ) : null}
            {canGoBack ? (
              <button
                type="button"
                aria-label="محصول قبلی"
                onClick={() => moveDesktop(-1)}
                className="absolute right-0 top-1/2 z-[100] flex h-12 w-12 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white bg-white text-[#44506c] shadow-[0_14px_28px_-14px_rgba(0,0,0,.55)]"
              >
                <ChevronLeft className="h-6 w-6 rotate-180" />
              </button>
            ) : null}
            <div
              className="overflow-hidden"
              dir="rtl"
            >
              <div
                className="flex gap-2 transition-transform duration-300 ease-out"
                style={{ transform: `translateX(${desktopIndex * desktopCardStep}px)` }}
              >
                {offerProducts.map((product) => (
                  <ProductDealCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
