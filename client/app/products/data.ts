import {
  Gamepad2,
  House,
  TabletSmartphone,
  Trophy,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

export type Platform = "ps5" | "ps4" | "switch" | "xbox";
export type Genre = "همه" | "ماجراجویی" | "ریسنگ" | "اکشن";
export type SortOption = "پرفروش‌ترین" | "ارزان‌ترین" | "گران‌ترین";
export type Maker = "همه" | "Sony" | "Nintendo" | "Xbox";
export type ProductKind =
  | "ps5-digital"
  | "ps5-disk"
  | "ps5-pro"
  | "ps4"
  | "dualsense"
  | "dock"
  | "switch";

export type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export type DesktopProduct = {
  id: number;
  title: string;
  subtitle: string;
  platform: Platform;
  genre: Genre;
  maker: Maker;
  kind: ProductKind;
  price: number;
  oldPrice?: number;
  available: boolean;
  badge?: { label: string; tone: "green" | "orange" | "red" };
};

export type MobileProduct = {
  id: number;
  title: string;
  platform: Platform;
  genre: Genre;
  gradient: string;
  accent: string;
};

export const desktopPlatforms: Array<{
  value: Platform;
  label: string;
  glyph: string;
  icon: IconType;
}> = [
  { value: "ps5", label: "PS5", glyph: "PS5", icon: TabletSmartphone },
  { value: "ps4", label: "PS4", glyph: "PS4", icon: TabletSmartphone },
  { value: "switch", label: "Switch", glyph: "Switch", icon: Gamepad2 },
  { value: "xbox", label: "Xbox One", glyph: "Xbox", icon: Trophy },
];

export const genreChips: Array<{ value: Genre; label: string; icon: IconType }> = [
  { value: "ماجراجویی", label: "ماجراجویی", icon: House },
  { value: "ریسنگ", label: "ریسنگ", icon: Trophy },
  { value: "اکشن", label: "اکشن", icon: Gamepad2 },
];

export const sidebarSections = [
  "دسته بندی",
  "شرکت سازنده",
  "محدوده قیمت مورد نظر",
  "نوع دستگاه",
  "تعداد درگاه",
  "وزن",
] as const;

export const desktopProducts: DesktopProduct[] = [
  {
    id: 1,
    title: "کنسول پلی استیشن 5 اسلیم دیجیتال",
    subtitle: "نسخه اروپا CFI-2016",
    platform: "ps5",
    genre: "ماجراجویی",
    maker: "Sony",
    kind: "ps5-digital",
    price: 44990000,
    oldPrice: 47200000,
    available: true,
    badge: { label: "۲.۵٪", tone: "green" },
  },
  {
    id: 2,
    title: "کنسول پلی استیشن 5 اسلیم دیسک خور",
    subtitle: "نسخه ژاپن 1 ترابایت",
    platform: "ps5",
    genre: "ماجراجویی",
    maker: "Sony",
    kind: "ps5-disk",
    price: 47120000,
    oldPrice: 48900000,
    available: true,
    badge: { label: "۲.۷٪", tone: "orange" },
  },
  {
    id: 3,
    title: "کنسول پلی استیشن 5 پرو",
    subtitle: "با درایو جداگانه",
    platform: "ps5",
    genre: "ماجراجویی",
    maker: "Sony",
    kind: "ps5-pro",
    price: 62350000,
    oldPrice: 64990000,
    available: true,
    badge: { label: "۲.۴٪", tone: "green" },
  },
  {
    id: 4,
    title: "کنترلر دوال سنس",
    subtitle: "رنگ سفید مدل CFI-ZCT1",
    platform: "ps5",
    genre: "ماجراجویی",
    maker: "Sony",
    kind: "dualsense",
    price: 8240000,
    oldPrice: 8790000,
    available: true,
    badge: { label: "۳.۱٪", tone: "red" },
  },
  {
    id: 5,
    title: "پایه شارژر کنترلر",
    subtitle: "مدل CFI-ZDS1",
    platform: "ps5",
    genre: "ماجراجویی",
    maker: "Sony",
    kind: "dock",
    price: 5290000,
    available: false,
  },
  {
    id: 6,
    title: "کنسول پلی استیشن 4 اسلیم",
    subtitle: "1 ترابایت ریجن 2",
    platform: "ps4",
    genre: "اکشن",
    maker: "Sony",
    kind: "ps4",
    price: 29100000,
    oldPrice: 30500000,
    available: true,
    badge: { label: "۲.۳٪", tone: "green" },
  },
  {
    id: 7,
    title: "Nintendo Switch OLED",
    subtitle: "مدل Neon Red / Blue",
    platform: "switch",
    genre: "ماجراجویی",
    maker: "Nintendo",
    kind: "switch",
    price: 26800000,
    oldPrice: 27900000,
    available: true,
    badge: { label: "۱.۸٪", tone: "orange" },
  },
  {
    id: 8,
    title: "ایکس باکس سری اس",
    subtitle: "نسخه 512 گیگابایت",
    platform: "xbox",
    genre: "اکشن",
    maker: "Xbox",
    kind: "ps5-digital",
    price: 24400000,
    available: false,
  },
];

export const mobileProducts: MobileProduct[] = [
  {
    id: 1,
    title: "Alan Wake 2",
    platform: "ps5",
    genre: "ماجراجویی",
    gradient:
      "radial-gradient(circle at 20% 20%, rgba(255,64,64,.32), transparent 35%), linear-gradient(180deg, #291114 0%, #11090d 52%, #050506 100%)",
    accent: "#db4b51",
  },
  {
    id: 2,
    title: "Prince of Persia: The Lost Crown",
    platform: "ps5",
    genre: "اکشن",
    gradient:
      "radial-gradient(circle at 70% 20%, rgba(255,220,140,.45), transparent 35%), linear-gradient(135deg, #1d3bb6 0%, #32b3ff 46%, #f0b85e 100%)",
    accent: "#f4a53f",
  },
  {
    id: 3,
    title: "The Quarry",
    platform: "ps4",
    genre: "ماجراجویی",
    gradient:
      "radial-gradient(circle at 50% 80%, rgba(255,147,76,.35), transparent 40%), linear-gradient(180deg, #20130c 0%, #5c190f 45%, #08070a 100%)",
    accent: "#ff8d50",
  },
  {
    id: 4,
    title: "Dark Pictures: Devil In Me",
    platform: "ps5",
    genre: "ماجراجویی",
    gradient:
      "radial-gradient(circle at 60% 20%, rgba(255,255,255,.35), transparent 30%), linear-gradient(180deg, #d8d0c5 0%, #c4b7a5 55%, #9d8876 100%)",
    accent: "#7b5f4c",
  },
  {
    id: 5,
    title: "Alan Wake",
    platform: "ps5",
    genre: "اکشن",
    gradient:
      "radial-gradient(circle at 20% 18%, rgba(74,177,255,.4), transparent 35%), linear-gradient(180deg, #091223 0%, #18324c 56%, #080b12 100%)",
    accent: "#4ea6f8",
  },
  {
    id: 6,
    title: "House of Ashes",
    platform: "ps4",
    genre: "ماجراجویی",
    gradient:
      "radial-gradient(circle at 50% 18%, rgba(255,255,255,.28), transparent 30%), linear-gradient(180deg, #f1e4d4 0%, #c2a88d 50%, #7c5f4a 100%)",
    accent: "#7f5b42",
  },
  {
    id: 7,
    title: "Dead Space",
    platform: "ps5",
    genre: "ماجراجویی",
    gradient:
      "radial-gradient(circle at 65% 12%, rgba(71,186,255,.35), transparent 32%), linear-gradient(180deg, #0d1c28 0%, #1e3b54 55%, #04080c 100%)",
    accent: "#54c5ff",
  },
  {
    id: 8,
    title: "Silent Hill 2",
    platform: "ps5",
    genre: "ماجراجویی",
    gradient:
      "radial-gradient(circle at 40% 18%, rgba(255,255,255,.28), transparent 36%), linear-gradient(180deg, #c5c9ca 0%, #727b80 48%, #2a2f33 100%)",
    accent: "#b8c2ca",
  },
];

export function formatPrice(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}
