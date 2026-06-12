"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "../data";
import type { Product } from "../data";

export function ProductCard({
  product,
  isPriority = false,
}: {
  product: Product;
  isPriority?: boolean;
}) {
  return (
    <Link href={`/products2/${product.id}`} className="group block w-full" dir="rtl">
      <div className="rounded-xl border border-[#e8ecf1] bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:border-[#dce3eb] hover:shadow-[0_18px_32px_-28px_rgba(24,35,55,.28)]">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-[#eef2f7]">
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(min-width: 1280px) 18rem, (min-width: 768px) 40vw, 90vw"
            loading={isPriority ? "eager" : "lazy"}
            className="object-contain p-6 transition-transform duration-300 group-hover:scale-[1.04]"
          />
        </div>

        <div className="mt-4 space-y-2">
          <h3 className="line-clamp-2 text-right text-[13px] font-black leading-6 text-[#444d68]">{product.title}</h3>
          <p className="line-clamp-1 text-right text-[12px] font-medium text-[#7f879c]">{product.subtitle}</p>
          {product.available ? (
            <div className="pt-1 text-left text-[14px] font-black text-[#2f3446]">
              {formatPrice(product.price)} <span className="text-[10px] font-bold text-[#7f879c]">تومان</span>
            </div>
          ) : (
            <div className="pt-1 text-left text-[11px] font-bold text-[#ff5268]">ناموجود</div>
          )}
        </div>
      </div>
    </Link>
  );
}
