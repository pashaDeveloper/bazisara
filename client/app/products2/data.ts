import { Gamepad2, House, Trophy } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

export type Platform =
  | "ps5"
  | "ps4"
  | "ps3"
  | "ps2"
  | "ps-vr"
  | "switch"
  | "switch-lite"
  | "xbox-series"
  | "xbox-one"
  | "xbox"
  | "pc"
  | "steam-deck";
export type Genre = "همه" | "ماجراجویی" | "ریسینگ" | "اکشن";
export type SortOption = "پرفروش‌ترین" | "ارزان‌ترین" | "گران‌ترین";
export type Maker = "همه" | "Sony" | "Nintendo" | "Xbox";

export type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export type Product = {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  platform: Platform;
  genre: Genre;
  maker: Maker;
  price: number;
  oldPrice?: number;
  available: boolean;
  badge?: { label: string; tone: "green" | "orange" | "red" };
};

export const desktopPlatforms: Array<{
  value: Platform;
  label: string;
  image: string;
  accent: string;
}> = [
  {
    value: "ps5",
    label: "PS5",
    image: "/products/png/ps5-slim-digital.png",
    accent: "#343434",
  },
  {
    value: "ps4",
    label: "PS4",
    image: "/products/png/ps4-slim.png",
    accent: "#1f4f9a",
  },
  {
    value: "ps3",
    label: "PS3",
    image: "/products/png/ps4-slim.png",
    accent: "#6b7280",
  },
  {
    value: "ps2",
    label: "PS2",
    image: "/products/png/ps4-slim.png",
    accent: "#2d405f",
  },
  {
    value: "ps-vr",
    label: "PS VR",
    image: "/products/png/ps5-slim-digital.png",
    accent: "#2563eb",
  },
  {
    value: "switch",
    label: "Switch",
    image: "/products/png/nintendo-switch-oled.png",
    accent: "#e60012",
  },
  {
    value: "switch-lite",
    label: "Switch Lite",
    image: "/products/png/nintendo-switch-oled.png",
    accent: "#00a7e0",
  },
  {
    value: "xbox-series",
    label: "Xbox Series",
    image: "/products/png/xbox-series-s.png",
    accent: "#107c10",
  },
  {
    value: "xbox-one",
    label: "Xbox One",
    image: "/products/png/xbox-series-s.png",
    accent: "#0e7a0d",
  },
  {
    value: "xbox",
    label: "Xbox",
    image: "/products/png/xbox-series-s.png",
    accent: "#16a34a",
  },
  {
    value: "pc",
    label: "PC",
    image: "/products/png/dualsense.png",
    accent: "#7c3aed",
  },
  {
    value: "steam-deck",
    label: "Steam Deck",
    image: "/products/png/dualsense-charging-dock.png",
    accent: "#111827",
  },
];

export const genreChips: Array<{ value: Genre; label: string; icon: IconType }> = [
  { value: "ماجراجویی", label: "ماجراجویی", icon: House },
  { value: "ریسینگ", label: "ریسینگ", icon: Trophy },
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

export const products: Product[] = [
  {
    id: 1,
    title: "کنسول پلی استیشن 5 اسلیم دیجیتال",
    subtitle: "نسخه اروپا CFI-2016",
    image: "/products/png/ps5-slim-digital.png",
    platform: "ps5",
    genre: "ماجراجویی",
    maker: "Sony",
    price: 44990000,
    oldPrice: 47200000,
    available: true,
    badge: { label: "۲.۵٪", tone: "green" },
  },
  {
    id: 2,
    title: "کنسول پلی استیشن 5 اسلیم دیسک خور",
    subtitle: "نسخه ژاپن 1 ترابایت",
    image: "/products/png/ps5-slim-disc.png",
    platform: "ps5",
    genre: "ماجراجویی",
    maker: "Sony",
    price: 47120000,
    oldPrice: 48900000,
    available: true,
    badge: { label: "۲.۷٪", tone: "orange" },
  },
  {
    id: 3,
    title: "کنسول پلی استیشن 5 پرو",
    subtitle: "با درایو جداگانه",
    image: "/products/png/ps5-pro.png",
    platform: "ps5",
    genre: "ماجراجویی",
    maker: "Sony",
    price: 62350000,
    oldPrice: 64990000,
    available: true,
    badge: { label: "۲.۴٪", tone: "green" },
  },
  {
    id: 4,
    title: "کنترلر دوال سنس",
    subtitle: "رنگ سفید مدل CFI-ZCT1",
    image: "/products/png/dualsense.png",
    platform: "ps5",
    genre: "اکشن",
    maker: "Sony",
    price: 8240000,
    oldPrice: 8790000,
    available: true,
    badge: { label: "۳.۱٪", tone: "red" },
  },
  {
    id: 5,
    title: "پایه شارژر کنترلر",
    subtitle: "مدل CFI-ZDS1",
    image: "/products/png/dualsense-charging-dock.png",
    platform: "ps5",
    genre: "اکشن",
    maker: "Sony",
    price: 5290000,
    available: false,
  },
  {
    id: 6,
    title: "کنسول پلی استیشن 4 اسلیم",
    subtitle: "1 ترابایت ریجن 2",
    image: "/products/png/ps4-slim.png",
    platform: "ps4",
    genre: "اکشن",
    maker: "Sony",
    price: 29100000,
    oldPrice: 30500000,
    available: true,
    badge: { label: "۲.۳٪", tone: "green" },
  },
  {
    id: 7,
    title: "Nintendo Switch OLED",
    subtitle: "مدل Neon Red / Blue",
    image: "/products/png/nintendo-switch-oled.png",
    platform: "switch",
    genre: "ماجراجویی",
    maker: "Nintendo",
    price: 26800000,
    oldPrice: 27900000,
    available: true,
    badge: { label: "۱.۸٪", tone: "orange" },
  },
  {
    id: 8,
    title: "ایکس باکس سری اس",
    subtitle: "نسخه 512 گیگابایت",
    image: "/products/png/xbox-series-s.png",
    platform: "xbox",
    genre: "اکشن",
    maker: "Xbox",
    price: 24400000,
    available: false,
  },
  {
    id: 9,
    title: "کنسول پلی استیشن 5 پرو",
    subtitle: "ظرفیت 2 ترابایت ریجن اروپا",
    image: "/products/png/ps5-pro.png",
    platform: "ps5",
    genre: "ماجراجویی",
    maker: "Sony",
    price: 141125200,
    oldPrice: 145000000,
    available: true,
    badge: { label: "۵", tone: "green" },
  },
  {
    id: 10,
    title: "کنسول پلی استیشن 5 اسلیم دیجیتال",
    subtitle: "Digital Edition ظرفیت 825 گیگابایت ریجن ژاپن",
    image: "/products/png/ps5-slim-digital.png",
    platform: "ps5",
    genre: "ماجراجویی",
    maker: "Sony",
    price: 88000000,
    oldPrice: 89900000,
    available: true,
    badge: { label: "۴", tone: "orange" },
  },
  {
    id: 11,
    title: "کنسول پلی استیشن 5 اسلیم دیسک خور",
    subtitle: "ظرفیت 1 ترابایت با دسته DualSense",
    image: "/products/png/ps5-slim-disc.png",
    platform: "ps5",
    genre: "ماجراجویی",
    maker: "Sony",
    price: 94500000,
    oldPrice: 96800000,
    available: true,
    badge: { label: "۵", tone: "green" },
  },
  {
    id: 12,
    title: "باندل PlayStation 5 Slim",
    subtitle: "نسخه دیسک خور به همراه یک دسته اضافه",
    image: "/products/png/dualsense.png",
    platform: "ps5",
    genre: "ماجراجویی",
    maker: "Sony",
    price: 102900000,
    available: true,
    badge: { label: "۳", tone: "red" },
  },
  {
    id: 13,
    title: "کنسول PlayStation 5 Digital",
    subtitle: "ریجن 2 ظرفیت 1 ترابایت بدون دیسک",
    image: "/products/png/ps5-slim-digital.png",
    platform: "ps5",
    genre: "اکشن",
    maker: "Sony",
    price: 79900000,
    available: false,
  },
  {
    id: 14,
    title: "کنسول پلی استیشن 4 اسلیم",
    subtitle: "ریجن 3 سری CUH-2218B ظرفیت 1 ترابایت",
    image: "/products/png/ps4-slim.png",
    platform: "ps5",
    genre: "ماجراجویی",
    maker: "Sony",
    price: 0,
    available: false,
  },
];

export function formatPrice(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}
