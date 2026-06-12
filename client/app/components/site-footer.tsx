import { Phone, ShoppingBag } from "lucide-react";
import Link from "next/link";

const footerLinks = [
  { href: "/products2", label: "فروشگاه" },
  { href: "/games", label: "بازی‌ها" },
  { href: "/articles", label: "مجله" },
  { href: "/contact", label: "تماس با ما" },
  { href: "/about", label: "ارتباط با ما" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[#e6e9ee] bg-white">
      <div className="mx-auto grid max-w-[1440px] gap-6 px-5 py-8 md:grid-cols-[1fr_auto] md:items-center">
        <div className="text-right">
          <Link href="/" className="inline-flex flex-row-reverse items-center gap-3">
            <span className="text-xl font-black">
              <span className="text-[#f05e52]">بازی </span>
              <span className="text-[#4ab3e7]">بازار</span>
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4fbff] text-[#2f91d6] ring-1 ring-[#d2edf9]">
              <ShoppingBag className="h-5 w-5" />
            </span>
          </Link>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-500">
            فروشگاه و مجله بازی بازار؛ انتخاب، مقایسه و دنبال کردن جدیدترین بازی‌ها و کالاهای گیمینگ.
          </p>
        </div>

        <div className="space-y-4">
          <nav className="flex flex-wrap justify-start gap-3 text-sm font-bold text-zinc-600 md:justify-end">
            {footerLinks.map((item) => (
              <Link key={item.label} href={item.href} className="transition hover:text-zinc-950">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center justify-start gap-2 text-sm font-medium text-[#16a34a] md:justify-end" dir="ltr">
            <Phone className="h-4 w-4" />
            <span>021 - 423 0000 63</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

