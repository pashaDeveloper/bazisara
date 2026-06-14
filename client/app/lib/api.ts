type ApiEnvelope<T> = {
  acknowledgement?: boolean;
  data?: T;
  pagination?: {
    currentPage?: number;
    totalPages?: number;
    totalItems?: number;
    limit?: number;
  };
};

export type Media = {
  url?: string;
  public_id?: string;
  storage?: string;
  type?: "image" | "video";
};

export type NamedEntity = {
  _id?: string;
  name?: string;
  slug?: string;
  parent?: NamedEntity | null;
  icon?: Media;
  image?: Media;
  logo?: Media;
};

export type Game = {
  _id: string;
  title: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  reviewSiteTitle?: string;
  reviewSource?: string;
  reviewLink?: string;
  reviewItems?: Array<{
    title?: string;
    link?: string;
  }>;
  category?: NamedEntity | null;
  genres?: NamedEntity[];
  developers?: NamedEntity[];
  publishers?: NamedEntity[];
  tags?: NamedEntity[];
  platforms?: string[];
  platformSizes?: Array<{
    platform?: string;
    variant?: string;
    size?: string;
  }>;
  gameModes?: string[];
  languages?: string[];
  regions?: string[];
  launcher?: string[];
  edition?: string;
  releaseDate?: string | null;
  ageRating?: string;
  gameplayTime?: string;
  metacriticScore?: number | null;
  cover?: Media;
  cardDesktopCover?: Media;
  cardMobileCover?: Media;
  desktopCover?: Media;
  mobileCover?: Media;
  gallery?: Media[];
  isFeatured?: boolean;
  views?: number;
  likes?: number;
  commentsCount?: number;
  shares?: number;
  createdAt?: string;
};

export type Article = {
  _id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  author?: string;
  creator?: {
    _id?: string;
    name?: string;
    email?: string;
    avatar?: Media;
  } | null;
  readingTime?: string;
  category?: NamedEntity | null;
  tags?: NamedEntity[];
  relatedGames?: Game[];
  faqs?: Array<{
    question?: string;
    answer?: string;
  }>;
  cover?: Media;
  publishedAt?: string | null;
  isFeatured?: boolean;
  views?: number;
  likes?: number;
  commentsCount?: number;
  shares?: number;
  createdAt?: string;
};

export type Slider = {
  _id: string;
  title: string;
  subtitle?: string;
  link?: string;
  category?: NamedEntity | null;
  order?: number;
  status?: string;
  image?: Media;
  createdAt?: string;
};

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.SERVER_API_URL ||
  "http://localhost:8080/api";

export function mediaUrl(media?: Media | string | null) {
  const url = typeof media === "string" ? media : media?.url;
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;

  const origin = API_BASE.replace(/\/api\/?$/, "");
  return `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
}

export async function getApiList<T>(path: string, limit = 24) {
  try {
    const response = await fetch(`${API_BASE}${path}?limit=${limit}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
      },
      next: {
        revalidate: 0,
      },
    });

    if (!response.ok) return [];

    const json = (await response.json()) as ApiEnvelope<T[]>;
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

export async function getApiItem<T>(path: string, id: string) {
  try {
    const response = await fetch(`${API_BASE}${path}/${id}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
      },
      next: {
        revalidate: 0,
      },
    });

    if (!response.ok) return null;

    const json = (await response.json()) as ApiEnvelope<T>;
    return json.data || null;
  } catch {
    return null;
  }
}

export function formatPersianDate(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
