import Image from "next/image";
import Link from "next/link";
import { HomeHeroSlider } from "./components/home-hero-slider";
import { HomeProductStrip } from "./components/home-product-strip";
import { HomeCollections } from "./components/home-collections";
import type { Article, Game, Slider } from "./lib/api";
import { getApiList } from "./lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const categoryTiles = [
  { title: "کنسول بازی", image: "/products/png/ps5-slim-disc.png" },
  { title: "لوازم جانبی", image: "/products/png/dualsense.png" },
  { title: "عینک مجازی", image: "/products/png/ps5-pro.png" },
  { title: "کنسول بازی", image: "/products/png/ps5-slim-disc.png" },
  { title: "لوازم جانبی", image: "/products/png/dualsense.png" },
  { title: "عینک مجازی", image: "/products/png/ps5-pro.png" },
];

function CategoryRow() {
  return (
    <section className="mx-6 mt-9">
      <h2 className="mb-4 text-right text-2xl font-black text-[#25335f]">لوازم جانبی کامپیوتر</h2>
      <div className="grid grid-cols-6 gap-4">
        {categoryTiles.map((item, index) => (
          <Link href="/products2" className="text-center" key={`${item.title}-${index}`}>
            <div className="relative aspect-square overflow-hidden rounded-xl bg-[linear-gradient(145deg,#006cdb,#0048a8)] shadow-[0_18px_30px_-28px_rgba(0,72,168,.8)]">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="12rem"
                className="object-contain p-8 brightness-0 invert"
              />
            </div>
            <p className="mt-3 text-base font-black text-[#273153]">{item.title}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default async function Home() {
  const [sliders, games, articles] = await Promise.all([
    getApiList<Slider>("/sliders/all", 8),
    getApiList<Game>("/games/all", 24),
    getApiList<Article>("/articles/all", 24),
  ]);

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <HomeHeroSlider sliders={sliders} />
      <main className="mx-auto max-w-[1440px] pb-12">
        <HomeProductStrip />
        <CategoryRow />
        <HomeCollections articles={articles} games={games} />
      </main>
    </div>
  );
}
