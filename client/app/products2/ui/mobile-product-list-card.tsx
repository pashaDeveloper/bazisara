"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "../data";
import type { Product } from "../data";

export function MobilePosterCard({ product }: { product: Product }) {
  return <MobileProductListCard product={product} />;
}

export function MobileProductListCard({
  product,
  isPriority = false,
}: {
  product: Product;
  isPriority?: boolean;
}) {
  return (
    <Link href={`/products2/${product.id}`} className="flex min-h-[190px] flex-row-reverse items-center gap-4 border-b border-[#eef1f5] bg-white px-5 py-6">
      <div className="relative h-36 w-32 shrink-0">
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="8rem"
          loading={isPriority ? "eager" : "lazy"}
          className="object-contain drop-shadow-[0_18px_22px_rgba(28,35,50,.12)]"
        />
      </div>

      <div className="min-w-0 flex-1 text-right">
        <h3 className="line-clamp-2 text-[13px] font-black leading-7 text-[#4b557a]">{product.title}</h3>
        <p className="mt-1 line-clamp-2 text-[12px] font-bold leading-6 text-[#4b557a]">{product.subtitle}</p>
        {product.available ? (
          <div className="mt-5">
            <div className="text-[15px] font-black tracking-tight text-[#333955]">
              {formatPrice(product.price)} <span className="text-[10px] font-bold text-[#333955]">تومان</span>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-lg bg-[#f7f8fc] px-3 py-2 text-center text-[13px] font-black text-[#4b557a]">
            موجود شد اطلاع بده
          </div>
        )}
      </div>
    </Link>
  );
}
