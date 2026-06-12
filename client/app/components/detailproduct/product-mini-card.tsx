import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "../../products2/data";

export function ProductMiniCard({
  title,
  image,
  price,
  href,
}: {
  title: string;
  image: string;
  price: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[1.5rem] border border-[#e8ecf2] bg-white p-4 shadow-[0_18px_40px_-32px_rgba(15,23,42,.32)] transition hover:-translate-y-1"
    >
      <div className="relative aspect-[1.05] overflow-hidden rounded-[1.2rem] bg-[linear-gradient(180deg,#ffffff_0%,#f5f7fb_100%)]">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 1024px) 16rem, 50vw"
          className="object-contain p-5 transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="mt-4 line-clamp-2 min-h-14 text-sm font-bold leading-7 text-[#3e4b71]">
        {title}
      </div>
      <div className="mt-4 text-lg font-black text-[#2f467f]">
        {formatPrice(price)} <span className="text-sm font-medium">تومان</span>
      </div>
    </Link>
  );
}
