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
  alt?: string;
  blur?: {
    hash?: string;
    public_id?: string;
    url?: string;
    width?: number | null;
    height?: number | null;
  };
  mobile?: {
    url?: string;
    public_id?: string;
    width?: number | null;
    height?: number | null;
  };
  position?: {
    x?: number | null;
    y?: number | null;
  };
  url?: string;
  public_id?: string;
  storage?: string;
  type?: "image" | "video";
};

export type NamedEntity = {
  _id?: string;
  name?: string;
  name_fa?: string;
  name_en?: string;
  slug?: string;
  parent?: NamedEntity | null;
  icon?: Media;
  image?: Media;
  logo?: Media;
};

export type Game = {
  _id: string;
  gameId?: string;
  playstationTitleId?: string;
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
  showGenresInCategories?: boolean;
  developers?: NamedEntity[];
  publishers?: NamedEntity[];
  tags?: NamedEntity[];
  gameKeywords?: NamedEntity[];
  platforms?: Array<string | NamedEntity>;
  platformSizes?: Array<{
    platform?: string | NamedEntity;
    variant?: string;
    size?: string;
  }>;
  dlcs?: Array<{
    title?: string;
    type?: string;
    versionSize?: string;
    image?: Media;
  }>;
  extraEditions?: Array<{
    title?: string;
    versionTitles?: string;
    versionSize?: string;
    items?: Array<{
      platform?: string | NamedEntity;
      capacityType?: string;
      price?: number | null;
      discountPercent?: number | null;
      discountedPrice?: number | null;
    }>;
    image?: Media;
  }>;
  gameModes?: string[];
  offlinePlayers?: string[];
  onlinePlayers?: string[];
  onlinePlayerCount?: string;
  multiplayerPlayerCount?: string;
  hasOnlineMode?: boolean;
  hasMultiplayerMode?: boolean;
  relatedGames?: Game[];
  languages?: string[];
  regions?: string[];
  launcher?: string[];
  edition?: string;
  releaseDate?: string | null;
  ageRating?: string;
  gameplayTime?: string;
  metacriticScore?: number | null;
  sonyScore?: number | null;
  steamScore?: number | null;
  xboxScore?: number | null;
  playstationNpCommunicationId?: string;
  cover?: Media;
  cardDesktopCover?: Media;
  cardMobileCover?: Media;
  desktopCover?: Media;
  mobileCover?: Media;
  trailerVideo?: Media;
  trailerThumbnail?: Media;
  gallery?: Media[];
  isFeatured?: boolean;
  showOnlyInCollections?: boolean;
  views?: number;
  likes?: number;
  commentsCount?: number;
  shares?: number;
  createdAt?: string;
};

export type Article = {
  _id: string;
  magazineId?: string;
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
  platforms?: NamedEntity[];
  relatedGames?: Game[];
  faqs?: Array<{
    question?: string;
    answer?: string;
    media?: Media[];
  }>;
  cover?: Media;
  cardCover?: Media;
  contentCover?: Media;
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
  mobileImage?: Media;
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

export function mediaBlurUrl(media?: Media | string | null) {
  if (!media || typeof media === "string") return "";
  return mediaUrl(media.blur?.url || "");
}

export function mediaBlurHash(media?: Media | string | null) {
  if (!media || typeof media === "string") return "";
  return media.blur?.hash || "";
}

export function mediaMobileUrl(media?: Media | string | null) {
  if (!media || typeof media === "string") return "";
  return mediaUrl(media.mobile?.url || "");
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

export function gameRouteId(game: Pick<Game, "_id" | "gameId" | "playstationTitleId">) {
  return game.playstationTitleId ? String(game.playstationTitleId) : game.gameId ? String(game.gameId) : game._id;
}

export function articleRouteId(article: Pick<Article, "_id" | "magazineId">) {
  return article.magazineId ? String(article.magazineId) : article._id;
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
