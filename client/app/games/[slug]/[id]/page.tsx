import {
  ArrowLeft,
  ArrowRight,
  Download,
  Filter,
  Gamepad2,
  Heart,
  Home,
  MessageCircle,
  Play,
  Search,
  Share2,
  ShoppingBag,
  Smile,
  ThumbsDown,
  ThumbsUp,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlurImage } from "../../../components/blur-image";
import { SkeletonBlock } from "../../../components/cards";
import { productRoutePath, products } from "../../../products2/data";
import type { Game, Media, NamedEntity } from "../../../lib/api";
import { formatPersianDate, gameRouteId, getApiItem, getApiList, mediaBlurUrl, mediaUrl } from "../../../lib/api";
import { slugify } from "../../../lib/slug";
import { GameMediaSwiper, type GameMediaSlide } from "./media-swiper";
import { TrailerPlayOverlay } from "./trailer-play-overlay";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{ slug: string; id: string }>;
};

type SpecRow = {
  label: string;
  value?: string | number | null;
};

const reactionItems = [
  { label: "Hate", icon: ThumbsDown },
  { label: "Dislike", icon: ThumbsDown },
  { label: "Neutral", icon: Smile },
  { label: "Like", icon: ThumbsUp },
  { label: "Love", icon: Heart },
];

const comments = [
  {
    author: "کمس کبیر",
    handle: "@koms",
    time: "۱۱ ماه پیش",
    body: "ترول ای ترول بی ترول سه حالا پخیال قصه",
    likes: 17,
    tone: "#5a2b16",
  },
  {
    author: "آرتین هم‌فکر",
    handle: "@artin",
    time: "۱۱ ماه پیش",
    body: "واقعا مخالف این بازی بود؟ الان برم از خودش بپرسم یا تشکر کنم؟",
    likes: 11,
    tone: "#334155",
  },
  {
    author: "A.mxaz",
    handle: "@amaxaz",
    time: "۵ دقیقه پیش",
    body: "سوال نو مبارک، به امید روزهای خوب",
    likes: 6,
    tone: "#1d9bf0",
  },
];

function stripHtml(value?: string) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function entityLabel(value?: string | NamedEntity | null) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.name_fa || value.name || value.name_en || value.slug || "";
}

function formatCount(value?: number) {
  return new Intl.NumberFormat("fa-IR").format(value || 0);
}

function joinValues(values?: Array<string | NamedEntity | null>) {
  return values?.map((item) => entityLabel(item || null)).filter(Boolean).join("، ") || "";
}

function joinText(values?: string[]) {
  return values?.filter(Boolean).join("، ") || "";
}

function mixedLabel(value: unknown) {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value !== "object") return "";

  const record = value as Record<string, unknown>;
  return String(record.title_fa || record.title || record.name_fa || record.name || record.key || "").trim();
}

function joinMixed(values?: unknown[]) {
  return values?.map(mixedLabel).filter(Boolean).join("، ") || "";
}

function formatGameEditions(game: Game) {
  const editions = game.extraEditions
    ?.map((item) => [item.title, item.versionTitles, item.versionSize].filter(Boolean).join(" - "))
    .filter(Boolean);

  return editions?.join("، ") || "";
}

function latinToPersian(value: string | number) {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

function gameMedia(game: Game, preferred: "desktop" | "mobile" | "card" = "card"): Media | undefined {
  if (preferred === "desktop") {
    return [game.desktopCover, game.cover, game.cardDesktopCover, game.gallery?.[0]].find((item) => mediaUrl(item));
  }

  if (preferred === "mobile") {
    return [game.mobileCover, game.cover, game.cardMobileCover, game.gallery?.[0]].find((item) => mediaUrl(item));
  }

  return [game.cardDesktopCover, game.cover, game.desktopCover, game.gallery?.[0]].find((item) => mediaUrl(item));
}

function buildMediaSlides(game: Game): GameMediaSlide[] {
  const gallerySlides: GameMediaSlide[] =
    game.gallery?.reduce<GameMediaSlide[]>((slides, item, index) => {
      const imageSrc = mediaUrl(item);
      if (!imageSrc) return slides;

      slides.push({
        alt: item.alt || `${game.title} screenshot ${index + 1}`,
        blurSrc: mediaBlurUrl(item),
        imageSrc,
        kind: "image",
      });

      return slides;
    }, []) || [];

  const trailerVideo = mediaUrl(game.trailerVideo);
  const trailerPosterMedia = [game.trailerThumbnail, gameMedia(game, "desktop"), gameMedia(game, "card")].find((item) => mediaUrl(item));
  const trailerPoster = mediaUrl(trailerPosterMedia);

  if (trailerVideo && trailerPoster) {
    gallerySlides.push({
      alt: `${game.title} trailer`,
      blurSrc: mediaBlurUrl(trailerPosterMedia),
      imageSrc: trailerPoster,
      kind: "trailer",
      videoSrc: trailerVideo,
    });
  }

  return gallerySlides;
}

function objectPosition(media?: Media) {
  const x = Number(media?.position?.x);
  const y = Number(media?.position?.y);
  const safeX = Number.isFinite(x) ? Math.min(100, Math.max(0, x)) : 50;
  const safeY = Number.isFinite(y) ? Math.min(100, Math.max(0, y)) : 50;
  return `${safeX}% ${safeY}%`;
}

function compactValue(value?: string | number | null) {
  if (value === null || value === undefined || value === "") return "-";
  return latinToPersian(value);
}

function formatBadgeScore(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "--";
  return new Intl.NumberFormat("fa-IR").format(Number(value));
}

function HeroCornerBadges({
  metacriticScore,
  flush = false,
}: {
  metacriticScore?: number | null;
  flush?: boolean;
}) {
  return (
    <div
      className={`absolute z-10 flex items-end gap-1.5 ${
        flush ? "bottom-0 right-0" : "bottom-5 right-5 lg:bottom-8 lg:right-8"
      }`}
      dir="ltr"
    >
      <span className="grid h-[58px] w-10 overflow-hidden rounded-lg bg-black/25 text-center text-white  backdrop-blur-md">
        <span className="flex h-9 items-center justify-center ">
          <BlurImage src="/games/icons/dlc.svg" alt="" className="h-7 w-7" imageClassName="object-contain" />
        </span>
        <span className="flex items-center justify-center text-[14px] font-medium leading-none">DLC</span>
      </span>
      <span className="grid h-[58px] w-10 overflow-hidden rounded-lg bg-black/25 text-center text-white  backdrop-blur-md">
        <span className="flex h-9 items-center justify-center">
          <BlurImage src="/games/icons/Metacritic.svg" alt="" className="h-7 w-7" imageClassName="object-contain" />
        </span>
        <span className="flex items-center justify-center text-[14px] font-black leading-none">
          {formatBadgeScore(metacriticScore)}
        </span>
      </span>
    </div>
  );
}

function PillRow({
  items,
  fallback,
  dir = "rtl",
}: {
  items: string[];
  fallback?: string[];
  dir?: "rtl" | "ltr";
}) {
  const visibleItems = (items.length ? items : fallback || []).slice(0, 4);

  if (!visibleItems.length) return null;

  return (
    <div className="flex flex-wrap justify-start gap-2">
      {visibleItems.map((item) => (
        <span
          key={item}
          className="rounded-full border border-[#e6ebf2] bg-[#f6f8fb] px-3 py-1 text-[10px] font-black uppercase text-[#8a92a3]"
          dir={dir}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function HeroActions() {
  return (
    <div className="grid gap-3" dir="ltr">
      <button
        type="button"
        className="flex h-11 min-w-0 items-center justify-center gap-2 rounded-lg bg-[#ff3f68] px-2 text-[12px] font-black text-white shadow-[0_10px_22px_-16px_rgba(255,63,104,.75)] sm:text-[13px]"
        dir="rtl"
      >
        <Download className="h-4 w-4" />
        دانلود بازی
      </button>
    </div>
  );
}

function IconStat({
  iconSrc,
  label,
  value,
}: {
  iconSrc: string;
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1 text-center">
      <div className="flex items-center gap-1 text-[13px] font-black text-[#15234a]">
        <BlurImage src={iconSrc} alt="" className="h-5 w-5" imageClassName="object-contain" />
        <span>{compactValue(value)}</span>
      </div>
      <span className="text-[11px] font-medium text-[#596277]">{label}</span>
    </div>
  );
}

function HeroInfoPanel({ game, keywords, platforms }: { game: Game; keywords: string[]; platforms: string[] }) {
  const genre = keywords[0] || (!game.showGenresInCategories ? game.genres?.map(entityLabel).filter(Boolean)[0] : "") || "اکشن";
  const stats = [
    { iconSrc: "/games/icons/ps.svg", value: game.sonyScore || "۴.۵", label: `${formatCount(game.likes || 17)} رای` },
    { iconSrc: "/games/icons/steam.svg", value: game.steamScore || "۳.۹", label: `${formatCount(game.views || 12401)} رای` },
    { iconSrc: "/games/icons/xbox.svg", value: game.xboxScore || "۶.۹", label: `${formatCount(game.commentsCount || 18175)} رای` },
  ];

  return (
    <>
      <div className="mt-5 grid grid-cols-3 gap-4">
        {stats.map((item) => (
          <IconStat key={item.iconSrc} iconSrc={item.iconSrc} value={item.value} label={item.label} />
        ))}
      </div>
      <div className="mt-4 flex items-center justify-end gap-2">
        <PillRow items={platforms} fallback={["PS5", "PS4"]} dir="ltr" />
      </div>
      <div className="mt-3 flex justify-end">
        <span className="rounded-full border border-[#d6dce6] bg-white px-4 py-1.5 text-[12px] font-bold text-[#30384d] shadow-sm">{genre}</span>
      </div>
      <div className="mt-8 flex items-center justify-between text-[12px] font-bold text-[#30384d]">
        <ArrowLeft className="h-4 w-4" />
        <span>ویژگی‌ها:</span>
      </div>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-12 rounded-md border border-[#d8dde6] bg-[#f3f5f9]" />
        ))}
      </div>
    </>
  );
}

function DesktopHero({ game, platforms, keywords }: { game: Game; platforms: string[]; keywords: string[] }) {
  const heroMedia = gameMedia(game, "desktop");
  const heroImage = mediaUrl(heroMedia);
  const trailerUrl = mediaUrl(game.trailerVideo);

  return (
    <section className="relative hidden h-[480px] overflow-hidden bg-[#dbe5ed] lg:block" dir="ltr">
      {heroImage ? (
        <BlurImage
          alt={heroMedia?.alt || game.title}
          blurSrc={mediaBlurUrl(heroMedia)}
          className="absolute inset-0 h-full w-full"
          imageStyle={{ objectPosition: objectPosition(heroMedia) }}
          src={heroImage}
        />
      ) : (
        <SkeletonBlock className="absolute inset-0 h-full w-full rounded-none" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-white/65" />
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/20 to-transparent" />
      <TrailerPlayOverlay title={game.title} trailerUrl={trailerUrl} />

      <div className="absolute left-6 top-1/2 w-[392px] -translate-y-1/2 rounded-xl border border-white/75 bg-white p-5 shadow-[0_22px_50px_-30px_rgba(15,23,42,.55)]" dir="rtl" style={{ zIndex: 30 }}>
        <h1 className="line-clamp-2 text-left text-[21px] font-black leading-8 text-[#29467c]" dir="ltr">
          {game.title}
        </h1>
        <HeroInfoPanel game={game} platforms={platforms} keywords={keywords} />
        <div className="mt-5">
          <HeroActions />
        </div>
      </div>

      <HeroCornerBadges metacriticScore={game.metacriticScore} />
    </section>
  );
}

function MobileHero({ game, platforms, keywords }: { game: Game; platforms: string[]; keywords: string[] }) {
  const heroMedia = gameMedia(game, "mobile") || gameMedia(game, "desktop");
  const heroImage = mediaUrl(heroMedia);
  const trailerUrl = mediaUrl(game.trailerVideo);

  return (
    <section className="lg:hidden" dir="rtl">
      <div className="sticky top-0 z-20 flex h-12 items-center justify-between border-b border-[#eef1f5] bg-white px-4">
        <button type="button" aria-label="بازگشت" className="text-[#4f596a]">
          <ArrowRight className="h-5 w-5" />
        </button>
        <div className="text-[14px] font-black text-[#283348]">کالای دیجیتال</div>
        <div className="flex items-center gap-5 text-[#4f596a]">
          <Search className="h-5 w-5" />
          <Share2 className="h-5 w-5" />
        </div>
      </div>

      <div className="relative overflow-hidden bg-[#f2f5f8] pb-5">
        <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_center,#cfd7e4_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-white shadow-[0_22px_48px_-36px_rgba(15,23,42,.55)]">
          {heroImage ? (
            <BlurImage alt={heroMedia?.alt || game.title} blurSrc={mediaBlurUrl(heroMedia)} className="h-full w-full" imageClassName="object-cover" src={heroImage} />
          ) : (
            <SkeletonBlock className="h-full w-full rounded-none" />
          )}
          <HeroCornerBadges metacriticScore={game.metacriticScore} flush />
        </div>
        <div className="absolute bottom-5 left-5 flex flex-col items-center">
          <a
            href={trailerUrl || "#"}
            aria-disabled={!trailerUrl}
            className={`inline-flex h-10 min-w-[98px] items-center justify-center gap-1.5 rounded-xl px-3 text-[11px] font-black leading-none !text-white shadow-[0_10px_24px_-14px_rgba(255,63,104,.9)] ${
              trailerUrl ? "bg-[#ff3f68]" : "pointer-events-none bg-[#d8dee8] shadow-none"
            }`}
            target={trailerUrl ? "_blank" : undefined}
            rel={trailerUrl ? "noreferrer" : undefined}
          >
            <Play className="h-4 w-4 fill-white text-white" />
            تماشای تریلر
          </a>
          <div className="mt-2 flex h-7 items-center gap-2 rounded-full bg-black/25 px-3 backdrop-blur-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-white/85 shadow-sm" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/70" />
            <span className="h-2.5 w-8 rounded-full bg-white/85 shadow-sm" />
          </div>
        </div>
      </div>

      <div className="bg-white px-5 pb-5">
        <h1 className="break-words pt-4 text-left text-[24px] font-black leading-8 text-[#2b477d]" dir="ltr">
          {game.title}
        </h1>
        <HeroInfoPanel game={game} platforms={platforms} keywords={keywords} />
        <div className="mt-5">
          <HeroActions />
        </div>
      </div>
    </section>
  );
}

function FeatureStrip({ specs }: { specs: SpecRow[] }) {
  return (
    <section className="bg-white px-4 py-5 lg:mx-auto lg:mt-8 lg:max-w-[1440px] lg:rounded-xl lg:border lg:border-[#e8ecf3] lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[15px] font-black text-[#2d3d66]">ویژگی‌ها</h2>
        <button type="button" className="flex items-center gap-1 text-[12px] font-bold text-[#5b6476]">
          <ArrowLeft className="h-4 w-4" />
          مشاهده همه
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:grid-cols-6 lg:overflow-visible" dir="ltr">
        {specs.slice(0, 6).map((item) => (
          <div
            key={item.label}
            className="min-w-[126px] rounded-lg border border-[#edf0f5] bg-[#fafbfe] px-3 py-3 text-center lg:min-w-0"
            dir="rtl"
          >
            <div className="text-[11px] font-black text-[#6d7890]">{item.label}</div>
            <div className="mt-2 line-clamp-2 min-h-8 text-[12px] font-medium leading-4 text-[#303b53]">{compactValue(item.value)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReactionBox() {
  return (
    <section className="border-y border-[#edf1f6] bg-[#f8fafc] px-4 py-5 lg:mx-auto lg:mt-8 lg:max-w-[1440px] lg:rounded-xl lg:border">
      <h2 className="mb-3 text-[14px] font-black text-[#2d3d66]">امتیاز شما :</h2>
      <div className="rounded-xl border border-[#e6ebf2] bg-white p-4 shadow-[0_18px_36px_-34px_rgba(15,23,42,.45)] lg:max-w-xl">
        <div className="grid grid-cols-5 gap-2 text-center text-[10px] text-[#707b91]">
          {reactionItems.map(({ label, icon: Icon }) => (
            <button key={label} type="button" className="flex flex-col items-center gap-2 rounded-lg py-2 hover:bg-[#f7f9fc]">
              <Icon className="h-5 w-5 text-[#707b91]" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function TabsBar({ active = "معرفی" }: { active?: string }) {
  const tabs = [
    { label: "معرفی", href: "#intro" },
    { label: "نقد و بررسی", href: "#review" },
    { label: "مشخصات", href: "#specs" },
    { label: "دیدگاه‌ها", href: "#comments" },
  ];

  return (
    <nav className="sticky top-12 mt-4 z-10 flex justify-start gap-8 overflow-x-auto border-y border-[#edf1f6] bg-white px-4 text-[13px] font-bold text-[#7c8598] lg:top-0 lg:mx-auto lg:max-w-[1440px] lg:rounded-xl lg:border lg:px-8" dir="rtl">
      {tabs.map((tab) => (
        <a
          key={tab.label}
          href={tab.href}
          className={`relative shrink-0 py-4 ${tab.label === active ? "text-[#ef476f]" : ""}`}
        >
          {tab.label}
          {tab.label === active ? <span className="absolute bottom-0 right-0 h-0.5 w-full rounded-full bg-[#ff3f68]" /> : null}
        </a>
      ))}
    </nav>
  );
}

function SpecsTable({ specs }: { specs: SpecRow[] }) {
  return (
    <section id="specs" className="bg-white px-4 py-5 lg:mx-auto lg:mt-4 lg:max-w-[1440px] lg:rounded-xl lg:border lg:border-[#e8ecf3] lg:p-6">
      <div className="overflow-hidden rounded-xl border border-[#e9edf4]">
        {specs.map((item) => (
          <div key={item.label} className="grid grid-cols-[116px_minmax(0,1fr)] border-b border-[#eef2f6] last:border-b-0 lg:grid-cols-[180px_minmax(0,1fr)]" dir="rtl">
            <div className="bg-[#fbfcfe] px-4 py-4 text-right text-[12px] font-black text-[#29467c]">{item.label}</div>
            <div className="px-4 py-4 text-right text-[12px] font-medium leading-6 text-[#3d465b]">{compactValue(item.value)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductRail() {
  const related = products.slice(0, 6);

  return (
    <section className="bg-[#f8fafc] px-4 py-6 lg:mx-auto lg:mt-10 lg:max-w-[1440px] lg:rounded-xl lg:p-6">
      <h2 className="mb-4 text-[15px] font-black text-[#29467c]">محصولات مرتبط</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {related.map((product) => (
          <Link
            key={product.id}
            href={productRoutePath(product)}
            className="w-[150px] shrink-0 rounded-lg border border-[#e4e9f1] bg-white p-3 shadow-[0_14px_30px_-28px_rgba(15,23,42,.45)] lg:w-[180px]"
          >
            <div className="relative mx-auto aspect-square w-full">
              <BlurImage alt={product.title} className="h-full w-full" imageClassName="object-contain p-2" src={product.image} />
            </div>
            <h3 className="mt-3 line-clamp-2 min-h-10 text-[12px] font-bold leading-5 text-[#30394f]">{product.title}</h3>
            <div className="mt-2 text-left text-[12px] font-black text-[#29467c]">
              {product.price.toLocaleString("fa-IR")} تومان
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function GameRail({ title, games }: { title: string; games: Game[] }) {
  if (!games.length) return null;

  return (
    <section className="bg-[#f8fafc] px-4 py-6 lg:mx-auto lg:mt-10 lg:max-w-[1440px] lg:rounded-xl lg:p-6">
      <h2 className="mb-4 text-[15px] font-black text-[#29467c]">{title}</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {games.slice(0, 8).map((item) => {
          const routeId = gameRouteId(item);
          const media = gameMedia(item, "card");
          const image = mediaUrl(media);
          return (
            <Link
              key={item._id}
              href={`/games/${slugify(item.slug || item.title) || routeId}/${routeId}`}
              className="w-[150px] shrink-0 rounded-lg border border-[#e4e9f1] bg-white p-3 shadow-[0_14px_30px_-28px_rgba(15,23,42,.45)] lg:w-[180px]"
              dir="ltr"
            >
              <div className="aspect-square overflow-hidden rounded-md bg-[#edf1f6]">
                {image ? <BlurImage alt={item.title} blurSrc={mediaBlurUrl(media)} className="h-full w-full" src={image} /> : <SkeletonBlock className="h-full w-full" />}
              </div>
              <h3 className="mt-3 line-clamp-2 min-h-10 text-left text-[13px] font-bold leading-5 text-[#2e394f]">{item.title}</h3>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function CommentsSection({ count }: { count?: number }) {
  const titleCount = count ? formatCount(count) : "۱۵۳";

  return (
    <section id="comments" className="bg-white px-4 py-6 lg:mx-auto lg:mt-10 lg:max-w-[1000px]">
      <div className="mb-4 flex items-center justify-between gap-4 text-[13px]">
        <h2 className="font-black text-[#2d3d66]">{titleCount} دیدگاه ثبت شده، نظر تو چیه؟</h2>
        <label className="flex items-center gap-2 font-bold text-[#ef476f]">
          <input type="checkbox" defaultChecked className="h-3.5 w-3.5 accent-[#ef476f]" />
          قوانین و مقررات را پذیرفتم
        </label>
      </div>
      <div className="rounded-xl border border-[#e5eaf2] bg-white">
        <div className="flex justify-end gap-8 border-b border-[#eef2f6] px-4 text-[13px] font-black text-[#7c8598]">
          <button type="button" className="relative py-3 text-[#ef476f]">
            دیدگاه
            <span className="absolute bottom-0 right-0 h-0.5 w-full rounded-full bg-[#ef476f]" />
          </button>
          <button type="button" className="py-3">سوال دارم</button>
        </div>
        <textarea
          className="h-28 w-full resize-none rounded-b-xl px-4 py-4 text-[13px] outline-none placeholder:text-[#a2aaba]"
          placeholder="متن را اینجا وارد کنید"
        />
      </div>
      <div className="mt-3 flex justify-end">
        <button type="button" className="rounded-full bg-[#2f3342] px-8 py-3 text-[13px] font-black text-white">
          ارسال نظر
        </button>
      </div>
      <div className="mt-5 flex gap-3">
        <button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[#edf1f6] py-3 text-[12px] font-bold text-[#657086]">
          <Filter className="h-4 w-4" />
          فیلتر
        </button>
        <button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[#edf1f6] py-3 text-[12px] font-bold text-[#657086]">
          مرتب‌سازی
        </button>
      </div>
      <div className="mt-4 divide-y divide-[#eef2f6]">
        {comments.map((comment) => (
          <article key={comment.author} className="py-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black text-white" style={{ backgroundColor: comment.tone }}>
                {comment.author.slice(0, 1)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-[#8b94a7]">
                  <span>{comment.handle}</span>
                  <span>{comment.time}</span>
                </div>
                <h3 className="mt-1 text-[13px] font-black text-[#253a66]">{comment.author}</h3>
                <p className="mt-3 text-[13px] leading-7 text-[#2f3d62]">{comment.body}</p>
                <div className="mt-4 flex items-center gap-5 text-[12px] text-[#7b8496]">
                  <button type="button" className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {comment.likes.toLocaleString("fa-IR")}
                  </button>
                  <button type="button" className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    نمایش ۱ پاسخ
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
      <button type="button" className="mt-3 w-full rounded-full border border-[#edf1f6] py-3 text-[12px] font-black text-[#5f697d]">
        مشاهده نظرات بیشتر
      </button>
    </section>
  );
}

function MobileBottomNav() {
  const items = [
    { label: "صفحه نخست", icon: Home },
    { label: "دسته‌بندی‌ها", icon: Gamepad2 },
    { label: "سبد خرید", icon: ShoppingBag },
    { label: "ناحیه کاربری", icon: UserRound },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-4 border-t border-[#e9edf4] bg-white px-2 py-2 text-[10px] font-bold text-[#6d7688] lg:hidden" dir="rtl">
      {items.map(({ label, icon: Icon }) => (
        <Link key={label} href="/" className="flex flex-col items-center gap-1">
          <Icon className="h-5 w-5" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const game = await getApiItem<Game>("/games", id);

  return {
    title: game ? `${game.title} | بازی سرا` : "بازی | بازی سرا",
    ...(game?.seoTitle ? { title: game.seoTitle } : {}),
    description: game?.seoDescription || stripHtml(game?.description) || game?.shortDescription,
    keywords: game?.seoKeywords,
  };
}

export default async function GameDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [game, allGames] = await Promise.all([
    getApiItem<Game>("/games", id),
    getApiList<Game>("/games/all", 24),
  ]);

  if (!game) notFound();

  const description = stripHtml(game.description) || game.shortDescription || "";
  const platforms = game.platforms?.map(entityLabel).filter(Boolean) || [];
  const keywords = game.gameKeywords?.map(entityLabel).filter(Boolean) || [];
  const genres = game.showGenresInCategories ? "" : game.genres?.map(entityLabel).filter(Boolean).join("، ") || "";
  const platformSizes = game.platformSizes
    ?.map((item) => {
      const platform = entityLabel(item.platform);
      return [platform, item.variant, item.size].filter(Boolean).join(" - ");
    })
    .filter(Boolean)
    .join("، ");
  const extraEditions = formatGameEditions(game);
  const relatedGames =
    game.relatedGames?.length
      ? game.relatedGames
      : allGames.filter((item) => item._id !== game._id).slice(0, 8);
  const mediaSlides = buildMediaSlides(game);

  const specs: SpecRow[] = [
    { label: "پلتفرم", value: platforms.join("، ") },
    { label: "نسخه", value: game.edition },
    { label: "لانچر", value: joinText(game.launcher) },
    { label: "تاریخ انتشار", value: formatPersianDate(game.releaseDate) },
    { label: "مدت گیم‌پلی", value: game.gameplayTime ? `${game.gameplayTime} ساعت` : "" },
    { label: "امتیاز متاکریتیک", value: game.metacriticScore },
    { label: "ژانرها", value: genres },
    { label: "توسعه‌دهنده", value: joinValues(game.developers) },
    { label: "ناشر", value: joinValues(game.publishers) },
    { label: "حالت‌های بازی", value: joinMixed(game.gameModes) },
    { label: "بازیکن آفلاین", value: joinMixed(game.offlinePlayers) },
    { label: "بازیکن آنلاین", value: game.hasOnlineMode ? game.onlinePlayerCount || joinMixed(game.onlinePlayers) : "" },
    { label: "چندنفره", value: game.hasMultiplayerMode ? game.multiplayerPlayerCount || "دارد" : "" },
    { label: "زبان‌ها", value: joinText(game.languages) },
    { label: "ریجن", value: joinText(game.regions) },
    { label: "حجم نسخه‌ها", value: platformSizes },
    { label: "نسخه‌های بازی", value: extraEditions },
  ].filter((item) => item.value !== "");

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f6f8fb] pb-16 text-zinc-950 lg:pb-0" dir="ltr">
      <DesktopHero game={game} platforms={platforms} keywords={keywords} />
      <MobileHero game={game} platforms={platforms} keywords={keywords} />

      <main dir="rtl">
        <GameMediaSwiper title={game.title} slides={mediaSlides} />
        <TabsBar />

        <section id="intro" className="bg-white px-4 py-5 lg:mx-auto lg:mt-4 lg:max-w-[1440px] lg:rounded-xl lg:border lg:border-[#e8ecf3] lg:p-6">
          {description ? (
            <>
            <h2 className="mb-3 text-[15px] font-black text-[#29467c]">معرفی</h2>
            <p className="line-clamp-5 text-[13px] leading-8 text-[#475166]">{description}</p>
            </>
          ) : (
            <div className="min-h-28 rounded-lg bg-white" />
          )}
        </section>

        {(game.reviewSiteTitle || game.reviewSource || game.reviewLink || game.reviewItems?.length) ? (
          <section id="review" className="bg-white px-4 py-5 lg:mx-auto lg:mt-4 lg:max-w-[1440px] lg:rounded-xl lg:border lg:border-[#e8ecf3] lg:p-6">
            <h2 className="mb-4 text-[15px] font-black text-[#29467c]">نقد و بررسی</h2>
            <div className="grid gap-3 text-[13px] leading-7 text-[#475166]">
              {game.reviewSiteTitle ? <p>{game.reviewSiteTitle}</p> : null}
              {game.reviewSource ? <p>منبع: {game.reviewSource}</p> : null}
              {game.reviewLink ? <p className="break-all">لینک: {game.reviewLink}</p> : null}
              {game.reviewItems?.map((item, index) => (
                <p key={`${item.title}-${index}`}>{item.title || item.link}</p>
              ))}
            </div>
          </section>
        ) : null}

        <SpecsTable specs={specs} />
        <FeatureStrip specs={specs} />
        <ReactionBox />

        <ProductRail />
        <CommentsSection count={game.commentsCount} />
        <GameRail title="بازی های مشابه" games={relatedGames} />
      </main>

      <MobileBottomNav />
    </div>
  );
}
