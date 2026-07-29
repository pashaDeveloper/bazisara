import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ControlPanel from "../ControlPanel";
import CloudUpload from "@/components/icons/CloudUpload";
import IconPicker from "@/components/shared/IconPicker";
import SendButton from "@/components/shared/button/SendButton";
import { useCreateCategoryMutation, useGetCategoriesQuery } from "../../services/category/categoryApi";
import { useCreateCompanyMutation, useGetCompaniesQuery } from "../../services/companyApi";
import { useCreateGenreMutation, useGetGenresQuery } from "../../services/genreApi";
import { useCreateTagMutation, useGetTagsQuery } from "../../services/tagApi";
import {
  useCreateGameMutation,
  useFetchPlayStationTrophiesMutation,
  useFetchXboxAchievementsMutation,
  useGetGameQuery,
  useGetGamesQuery,
  useImportGameScoresMutation,
  useTranslateGameIntroMutation,
  useTranslateGameSearchTitleSlugMutation,
  useUpdateGameMutation,
} from "../../services/gameApi";
import {
  ageRatingOptions,
  editionOptions,
  launcherOptions,
  offlinePlayerOptions,
} from "./gameOptions";
import { formatDate, makeGameSlug, normalizeOptionValue, toIdArray } from "./gameFormUtils";
import { useCreatePlatformMutation, useGetPlatformsQuery } from "@/services/platformApi";
import { useCreateGameCollectionMutation, useGetGameCollectionsQuery } from "@/services/gameCollectionApi";
import { useCreateGameKeywordMutation, useGetGameKeywordsQuery } from "@/services/gameKeywordApi";
import { useDeleteUploadMutation, useUploadMutation } from "@/services/upload/uploadApi";
import { useGetBrandsQuery } from "@/services/brandApi";
import { useGetIconsQuery } from "@/services/iconApi";
import { flattenPlatforms } from "../platforms/utils";
import DesktopCoverCropper from "./components/DesktopCoverCropper";
import { GameCardPreview, GameDetailPreview } from "./components/GamePreviews";
import {
  BasicStep,
  DlcStep,
  EditionsStep,
  GameMediaStep,
  PlatformReleasesStep,
  PlatformSizesStep,
  PlayersStep,
  ReleaseStep,
  RelatedGamesStep,
  RelationsStep,
  ReviewStep,
  SeoTagsStep,
  SocialStep,
} from "./components/GameFormSteps";

const initialForm = {
  title: "",
  summary: "",
  slug: "",
  shortDescription: "",
  description: "",
  reviewSiteTitle: "",
  reviewSource: "",
  reviewLink: "",
  reviewItems: [],
  category: "",
  genres: [],
  showGenresInCategories: false,
  developers: [],
  publishers: [],
  tags: [],
  gameKeywords: [],
  searchTitles: [],
  collections: [],
  platforms: [],
  platformReleases: [],
  platformSizes: [],
  gameModes: [],
  offlinePlayers: [],
  onlinePlayers: [],
  onlinePlayerCount: "",
  multiplayerPlayerCount: "",
  relatedGames: [],
  launcher: [],
  edition: "استاندارد",
  hasDubbing: false,
  hasSubtitle: false,
  hasFreePersianSubtitle: false,
  hasPaidPersianSubtitle: false,
  dlcs: [],
  extraEditions: [],
  officialWebsite: "",
  ageRating: "",
  gameplayTime: "",
  metacriticScore: "",
  sonyScore: "",
  steamScore: "",
  xboxScore: "",
  playstationNpCommunicationId: "",
  isFeatured: false,
  showOnlyInCollections: false,
  socialLinks: [],
  trailerVideo: null,
  trailerThumbnail: null,
  patchTitle: "",
  patchImage: null,
  cover: null,
  desktopCover: null,
  mobileCover: null,
  gallery: [],
};

const isFile = (value) => value instanceof File;

const isMediaObject = (value) => Boolean(value && typeof value === "object" && !(value instanceof File) && value.url);
const deletedMediaValue = "__delete__";

const normalizeNpCommunicationId = (value) => {
  const match = String(value || "")
    .trim()
    .toUpperCase()
    .match(/NPWR[-_\s]?(\d{5,})(?:[-_\s]?(\d{2}))?/);
  return match ? `NPWR${match[1]}_${match[2] || "00"}` : "";
};

const normalizeOfflinePlayers = (value) => {
  const items = Array.isArray(value) ? value : value ? [value] : [];

  return items
    .map((item) => {
      if (item && typeof item === "object") {
        const rawKey = String(item.key || item.value || "").trim();
        const legacyMap = {
          offline_1: "single-player",
          offline_1_4: "1-4",
          up_to_4: "1-4",
          "up-to-4": "1-4",
          "3-4": "1-4",
        };
        const key = legacyMap[rawKey] || rawKey;
        const option = offlinePlayerOptions.find((current) => current.value === key || current.key === key);
        return {
          key: key || option?.key || "",
          title_fa: String(item.title_fa || item.titleFa || item.label || option?.title_fa || "").trim(),
          title_en: String(item.title_en || item.titleEn || option?.title_en || "").trim(),
          min: item.min ?? option?.min ?? null,
          max: item.max ?? option?.max ?? null,
        };
      }

      const key = String(item || "").trim();
      const legacyMap = {
        offline_1: "single-player",
        offline_1_4: "1-4",
        up_to_4: "1-4",
        "up-to-4": "1-4",
        "3-4": "1-4",
      };
      const optionKey = legacyMap[key] || key;
      const option = offlinePlayerOptions.find((current) => current.value === optionKey || current.key === optionKey);

      return option
        ? {
            key: option.key,
            title_fa: option.title_fa,
            title_en: option.title_en,
            min: option.min,
            max: option.max,
          }
        : null;
    })
    .filter(Boolean);
};

const normalizeUploadedMedia = (response, fallbackType = "video") => {
  const file = response?.data || response;
  if (!file?.url) return null;

  return {
    url: file.url,
    public_id: file.public_id || file.key || "",
    type: file.resource_type === "video" ? "video" : file.type || fallbackType,
    originalSize: file.original_size || file.originalSize || null,
    uploadedSize: file.size || file.bytes || null,
    storage: file.storage || "",
  };
};

const getUploadErrorMessage = (error) => {
  if (!error) return "خطای نامشخص در آپلود";
  if (typeof error === "string") return error;
  if (error?.data?.description) return error.data.description;
  if (error?.data?.message) return error.data.message;
  if (error?.description) return error.description;
  if (error?.message) return error.message;
  if (error?.status) return `خطای آپلود با کد ${error.status}`;
  return "خطای نامشخص در آپلود";
};

const formatFileSize = (size) => {
  const value = Number(size || 0);
  if (!value) return "";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
};

const uploadImageWithProgress = (file, onProgress, options = {}) => {
  const baseUrl = String(import.meta.env.VITE_BASE_URL || "").replace(/\/$/, "");
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  const formData = new FormData();
  formData.append("file", file);
  if (options.entityType) formData.append("entityType", options.entityType);
  if (options.entityName) formData.append("entityName", options.entityName);
  if (options.requireEntityName) formData.append("requireEntityName", "true");
  if (options.resizeWidth) formData.append("resizeWidth", String(options.resizeWidth));
  if (options.resizeHeight) formData.append("resizeHeight", String(options.resizeHeight));
  if (options.resizeFit) formData.append("resizeFit", String(options.resizeFit));

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${baseUrl}/uploads/arvan/create`);
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        onProgress?.(35);
        return;
      }
      onProgress?.(Math.min(95, Math.round((event.loaded / event.total) * 100)));
    };

    xhr.onload = () => {
      let payload = null;
      try {
        payload = JSON.parse(xhr.responseText || "{}");
      } catch (_) {
        payload = { description: xhr.responseText };
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve(payload);
        return;
      }

      reject({
        status: xhr.status,
        message: payload?.description || payload?.message || xhr.statusText,
        data: payload,
      });
    };

    xhr.onerror = () => reject({ message: "ارتباط با سرور آپلود برقرار نشد؛ CORS یا شبکه را بررسی کنید" });
    xhr.onabort = () => reject({ message: "آپلود لغو شد" });
    xhr.send(formData);
  });
};

const formSections = [
  { key: "basic", title: "مشخصات اولیه بازی" },
  { key: "media", title: "عکس و فیلم" },
  { key: "specs", title: "مشخصات بازی" },
  { key: "sizes", title: "پلتفرم، تاریخ انتشار و حجم بازی" },
  { key: "dlc", title: "محتویات اضافی (DLC)" },
  { key: "editions", title: "نسخه‌های بازی" },
  { key: "relatedGames", title: "بازی‌های مشابه" },
  { key: "review", title: "نقد و بررسی بازی توسط رسانه‌ها" },
  { key: "seo", title: "تگ‌های سئو" },
  { key: "social", title: "شبکه‌های اجتماعی" },
];

const previewTabs = [
  { key: "form", label: "فرم" },
  { key: "card", label: "کارت" },
  { key: "mobile", label: "موبایل" },
  { key: "desktop", label: "دسکتاپ" },
];

const quickCreateInitialValues = {
  name: "",
  title_fa: "",
  title_en: "",
  name_fa: "",
  name_en: "",
  slug: "",
  brand: "",
  country: "",
  description: "",
  foundedYear: "",
  icon: "",
  image: null,
  logo: null,
  parent: "",
  placement: "homepage",
  svgIcon: "",
  type: "developer_publisher",
  website: "",
};

const quickCreateLabels = {
  category: "دسته‌بندی",
  genre: "ژانر",
  tag: "تگ",
  company: "شرکت",
  gameKeyword: "کلمه کلیدی بازی",
  gameCollection: "کالکشن بازی",
  platform: "پلتفرم",
};

const quickCreateUploadTypes = {
  category: "category",
  company: "company",
  gameCollection: "game-collection",
  gameKeyword: "game-keyword",
  genre: "genre",
  platform: "platform",
  tag: "tag",
};

const getQuickCreateEntityName = (values) =>
  [
    values.name,
    values.title_fa,
    values.name_fa,
    values.title_en,
    values.name_en,
    values.slug,
  ]
    .map((value) => String(value || "").trim())
    .find(Boolean) || "";

function QuickCreateImageUpload({ label = "تصویر", name, onRemove, onSelect, preview, state }) {
  const isUploading = state?.status === "uploading";
  const progress = Math.max(0, Math.min(100, Number(state?.progress || 0)));

  return (
    <div className="space-y-3 md:col-span-2">
      <span className="text-sm text-zinc-700 dark:text-zinc-300">{label}</span>
      <div className="flex flex-wrap items-center gap-3">
        <label className="py-1 px-4 flex flex-row gap-x-2 dark:bg-blue-100 bg-green-100 border dark:text-blue-700 dark:border-blue-900 border-green-900 text-green-900 rounded-secondary w-fit text-sm cursor-pointer">
          <CloudUpload className="h-5 w-5 dark:!text-blue-700" />
          <span>انتخاب {label}</span>
          <input
            accept="image/*"
            className="hidden"
            name={name}
            onChange={(event) => onSelect?.(event.target.files?.[0] || null)}
            type="file"
          />
        </label>
        {preview ? (
          <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
            <img alt="" className="h-full w-full object-cover" src={preview} />
            {(state?.originalSize || state?.uploadedSize) ? (
              <div className="absolute bottom-1 left-1 right-1 z-20 flex flex-wrap gap-1">
                {state.originalSize ? <span className="rounded-md bg-red-600/90 px-1.5 py-0.5 text-[9px] !text-white">{formatFileSize(state.originalSize)}</span> : null}
                {state.uploadedSize ? <span className="rounded-md bg-emerald-600/90 px-1.5 py-0.5 text-[9px] !text-white">{formatFileSize(state.uploadedSize)}</span> : null}
              </div>
            ) : null}
            {isUploading ? (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/45">
                <span
                  className="h-8 w-8 animate-spin rounded-full"
                  style={{
                    background: `conic-gradient(rgb(255 255 255) ${progress * 3.6}deg, rgba(255,255,255,.24) 0deg)`,
                    WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))",
                    mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))",
                  }}
                />
              </div>
            ) : null}
            {onRemove ? (
              <button
                aria-label="حذف تصویر"
                className="absolute left-1 top-1 z-40 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-red-600/90 text-white transition hover:bg-red-500"
                onClick={onRemove}
                type="button"
              >
                ×
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function GameFormSection({ children, index, title }) {
  return (
    <section className="relative grid gap-4 pr-12 md:grid-cols-[190px_minmax(0,1fr)] md:gap-3 md:pr-0" dir="rtl">
      <div>
        <div className="sticky top-28 flex items-center gap-3">
          <h2 className="min-w-0 flex-1 text-right text-sm font-bold leading-6 text-zinc-700 dark:text-zinc-200">{title}</h2>
          <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-500 bg-white text-sm font-bold text-emerald-600 shadow-sm dark:border-blue-500 dark:bg-zinc-900 dark:text-blue-300">
            {index + 1}
          </span>
        </div>
      </div>
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70 dark:shadow-none md:p-5" dir="rtl">
        {children}
      </div>
    </section>
  );
}

function toObjectArray(value, fallback = []) {
  if (!value) return fallback;
  if (Array.isArray(value)) {
    return value
      .map((item) => ({
        platform: item?.platform?._id || item?.platform || "",
        variant: item?.variant || "",
        size: item?.size || "",
      }))
      .filter((item) => item.platform || item.variant || item.size);
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return toObjectArray(parsed, fallback);
  } catch (_) {}

  return fallback;
}

function toSearchTitleArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      title: String(item?.title || item?.name || "").trim(),
      slug: String(item?.slug || "").trim(),
    }))
    .filter((item) => item.title || item.slug);
}

function toPlatformReleaseArray(value, fallbackPlatforms = [], fallbackReleaseDate = "") {
  if (Array.isArray(value) && value.length) {
    return value
      .map((item) => ({
        platform: item?.platform?._id || item?.platform || "",
        releaseDate: formatDate(item?.releaseDate),
      }))
      .filter((item) => item.platform || item.releaseDate);
  }

  return fallbackPlatforms
    .map((platform) => ({
      platform: platform?._id || platform || "",
      releaseDate: formatDate(fallbackReleaseDate),
    }))
    .filter((item) => item.platform || item.releaseDate);
}

function toLinkArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => ({
        title: String(item?.title || "").trim(),
        link: String(item?.link || "").trim(),
      }))
      .filter((item) => item.title || item.link);
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return toLinkArray(parsed);
  } catch (_) {}

  return [];
}

function GameForm({ mode = "create" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === "edit";
  const [form, setForm] = useState(initialForm);
  const [coverPreview, setCoverPreview] = useState("");
  const [desktopCoverPreview, setDesktopCoverPreview] = useState("");
  const [mobileCoverPreview, setMobileCoverPreview] = useState("");
  const [desktopCoverPositionSource, setDesktopCoverPositionSource] = useState(null);
  const [galleryPreview, setGalleryPreview] = useState([]);
  const [trailerVideoPreview, setTrailerVideoPreview] = useState("");
  const [trailerThumbnailPreview, setTrailerThumbnailPreview] = useState("");
  const [activePreviewTab, setActivePreviewTab] = useState("form");
  const [isSlugTouched, setIsSlugTouched] = useState(false);
  const [scoreImportState, setScoreImportState] = useState({ message: "", status: "idle", title: "" });
  const [xboxAchievementsState, setXboxAchievementsState] = useState({
    achievements: [],
    message: "",
    sourceTitle: "",
    status: "idle",
    title: "",
    titleId: "",
    total: 0,
  });
  const [playStationTrophiesState, setPlayStationTrophiesState] = useState({
    achievements: [],
    message: "",
    npCommunicationId: "",
    platform: "",
    sourceTitle: "",
    status: "idle",
    title: "",
    total: 0,
  });
  const [quickCreate, setQuickCreate] = useState(null);
  const [quickCreateForm, setQuickCreateForm] = useState(quickCreateInitialValues);
  const [quickCreateImagePreview, setQuickCreateImagePreview] = useState("");
  const [videoUploadState, setVideoUploadState] = useState({
    trailerVideo: false,
  });
  const [imageUploadState, setImageUploadState] = useState({});
  const tempUploadedVideosRef = useRef(new Map());
  const tempUploadedImagesRef = useRef(new Map());
  const didSaveRef = useRef(false);
  const didUnmountRef = useRef(false);

  const { data: gameData, isLoading: isLoadingGame } = useGetGameQuery(id, {
    skip: !isEdit || !id,
  });
  const { data: categoriesData, refetch: refetchCategories } = useGetCategoriesQuery({ page: 1, limit: 200 });
  const { data: genresData, refetch: refetchGenres } = useGetGenresQuery({ page: 1, limit: 200 });
  const { data: companiesData, refetch: refetchCompanies } = useGetCompaniesQuery({ page: 1, limit: 200 });
  const { data: tagsData, refetch: refetchTags } = useGetTagsQuery({ page: 1, limit: 200 });
  const { data: gameKeywordsData, refetch: refetchGameKeywords } = useGetGameKeywordsQuery({ page: 1, limit: 300 });
  const { data: platformsData, refetch: refetchPlatforms } = useGetPlatformsQuery({ tree: true, limit: 500 });
  const { data: collectionsData, refetch: refetchCollections } = useGetGameCollectionsQuery({ page: 1, limit: 300 });
  const { data: brandsData } = useGetBrandsQuery({ page: 1, limit: 500 });
  const { data: iconsData, isLoading: isLoadingIcons } = useGetIconsQuery({ page: 1, limit: 300 });
  const { data: relatedGamesData } = useGetGamesQuery({ page: 1, limit: 500 });
  const [uploadFile] = useUploadMutation();
  const [deleteUpload] = useDeleteUploadMutation();
  const [createCategory, createCategoryState] = useCreateCategoryMutation();
  const [createGenre, createGenreState] = useCreateGenreMutation();
  const [createTag, createTagState] = useCreateTagMutation();
  const [createCompany, createCompanyState] = useCreateCompanyMutation();
  const [createGameKeyword, createGameKeywordState] = useCreateGameKeywordMutation();
  const [createGameCollection, createGameCollectionState] = useCreateGameCollectionMutation();
  const [createPlatform, createPlatformState] = useCreatePlatformMutation();
  const [createGame, createState] = useCreateGameMutation();
  const [updateGame, updateState] = useUpdateGameMutation();
  const [importGameScores] = useImportGameScoresMutation();
  const [fetchXboxAchievements] = useFetchXboxAchievementsMutation();
  const [fetchPlayStationTrophies] = useFetchPlayStationTrophiesMutation();
  const [translateGameIntro] = useTranslateGameIntroMutation();
  const [translateSearchTitleSlug] = useTranslateGameSearchTitleSlugMutation();

  useEffect(() => {
    const title = String(form.title || "").trim();
    if (title.length < 3) {
      setScoreImportState((prev) => (prev.status === "idle" ? prev : { message: "", status: "idle", title: "" }));
      return undefined;
    }

    if (scoreImportState.title === title && scoreImportState.status !== "idle") {
      return undefined;
    }

    const timer = window.setTimeout(async () => {
      setScoreImportState({ message: "در حال دریافت خودکار امتیازها...", status: "loading", title });
      try {
        const response = await importGameScores({ source: "all", title }).unwrap();
        const data = response?.data || {};
        const labels = [];
        setForm((prev) => {
          const next = { ...prev };
          if (data.metacriticScore !== null && data.metacriticScore !== undefined) {
            next.metacriticScore = data.metacriticScore;
            labels.push("متاکریتیک");
          }
          if (data.steamScore !== null && data.steamScore !== undefined) {
            next.steamScore = data.steamScore;
            labels.push("استیم");
          }
          if (data.xboxScore !== null && data.xboxScore !== undefined) {
            next.xboxScore = data.xboxScore;
            labels.push("Xbox");
          }
          if (data.sonyScore !== null && data.sonyScore !== undefined) {
            next.sonyScore = data.sonyScore;
            labels.push("سونی");
          }
          return next;
        });
        setScoreImportState({
          message: labels.length ? `${labels.join("، ")} خودکار دریافت شد` : "امتیازی برای این عنوان پیدا نشد",
          status: labels.length ? "success" : "error",
          title,
        });
      } catch (error) {
        setScoreImportState({
          message: error?.data?.description || "دریافت خودکار امتیازها انجام نشد",
          status: "error",
          title,
        });
      }
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [form.title, importGameScores, scoreImportState.status, scoreImportState.title]);

  useEffect(() => {
    const title = String(form.title || "").trim();
    if (title.length < 3) {
      setXboxAchievementsState((prev) =>
        prev.status === "idle"
          ? prev
          : { achievements: [], message: "", sourceTitle: "", status: "idle", title: "", titleId: "", total: 0 }
      );
      return undefined;
    }

    if (xboxAchievementsState.title === title && xboxAchievementsState.status !== "idle") {
      return undefined;
    }

    const timer = window.setTimeout(async () => {
      setXboxAchievementsState((prev) => ({
        ...prev,
        achievements: [],
        message: "در حال دریافت تروفی‌های Xbox...",
        sourceTitle: "",
        status: "loading",
        title,
        titleId: "",
        total: 0,
      }));

      try {
        const response = await fetchXboxAchievements({ title }).unwrap();
        const data = response?.data || {};
        const achievements = Array.isArray(data.achievements) ? data.achievements : [];

        setXboxAchievementsState({
          achievements,
          message: achievements.length ? `${achievements.length} تروفی دریافت شد` : "برای این عنوان تروفی پیدا نشد",
          sourceTitle: data.sourceTitle || "",
          status: achievements.length ? "success" : "error",
          title,
          titleId: data.titleId || "",
          total: data.total || achievements.length || 0,
        });
      } catch (error) {
        setXboxAchievementsState({
          achievements: [],
          message: error?.data?.description || "دریافت تروفی‌های Xbox انجام نشد",
          sourceTitle: "",
          status: "error",
          title,
          titleId: "",
          total: 0,
        });
      }
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [fetchXboxAchievements, form.title, xboxAchievementsState.status, xboxAchievementsState.title]);

  useEffect(() => {
    const title = String(form.title || "").trim();
    const npCommunicationId = normalizeNpCommunicationId(form.playstationNpCommunicationId);
    if (title.length < 3 && !npCommunicationId) {
      setPlayStationTrophiesState((prev) =>
        prev.status === "idle"
          ? prev
          : { achievements: [], message: "", npCommunicationId: "", platform: "", sourceTitle: "", status: "idle", title: "", total: 0 }
      );
      return undefined;
    }

    if (
      playStationTrophiesState.title === title &&
      playStationTrophiesState.npCommunicationId === npCommunicationId &&
      playStationTrophiesState.status !== "idle"
    ) {
      return undefined;
    }

    const timer = window.setTimeout(async () => {
      setPlayStationTrophiesState((prev) => ({
        ...prev,
        achievements: [],
        message: "در حال دریافت تروفی‌های PlayStation...",
        npCommunicationId,
        platform: "",
        sourceTitle: "",
        status: "loading",
        title,
        total: 0,
      }));

      try {
        const response = await fetchPlayStationTrophies({
          npCommunicationId,
          title,
        }).unwrap();
        const data = response?.data || {};
        const achievements = Array.isArray(data.trophies) ? data.trophies : [];

        setPlayStationTrophiesState({
          achievements,
          message: achievements.length ? `${achievements.length} تروفی دریافت شد` : "برای این عنوان تروفی پیدا نشد",
          npCommunicationId: data.npCommunicationId || "",
          platform: data.platform || "",
          sourceTitle: data.sourceTitle || "",
          status: achievements.length ? "success" : "error",
          title,
          total: data.total || achievements.length || 0,
        });
      } catch (error) {
        setPlayStationTrophiesState({
          achievements: [],
          message: error?.data?.description || "دریافت تروفی‌های PlayStation انجام نشد",
          npCommunicationId: "",
          platform: "",
          sourceTitle: "",
          status: "error",
          title,
          total: 0,
        });
      }
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [
    fetchPlayStationTrophies,
    form.playstationNpCommunicationId,
    form.title,
    playStationTrophiesState.npCommunicationId,
    playStationTrophiesState.status,
    playStationTrophiesState.title,
  ]);

  const categories = categoriesData?.data || [];
  const genres = genresData?.data || [];
  const companies = companiesData?.data || [];
  const tags = tagsData?.data || [];
  const gameKeywords = gameKeywordsData?.data || [];
  const platforms = useMemo(() => flattenPlatforms(platformsData?.data || []), [platformsData]);
  const collections = collectionsData?.data || [];
  const brands = brandsData?.data || [];
  const icons = iconsData?.data || [];
  const isSaving = createState.isLoading || updateState.isLoading;
  const isQuickCreateSaving =
    createCategoryState.isLoading ||
    createGenreState.isLoading ||
    createTagState.isLoading ||
    createCompanyState.isLoading ||
    createGameKeywordState.isLoading ||
    createGameCollectionState.isLoading ||
    createPlatformState.isLoading;
  const isUploadingVideo = videoUploadState.trailerVideo;
  const isUploadingImage = Object.values(imageUploadState).some((item) => item?.status === "uploading");
  const titleIsValid = Boolean(form.title.trim());
  const categoryIsValid = Boolean(form.category);

  const categoryOptions = useMemo(() => categories.map((item) => ({ label: item.name, value: item._id })), [categories]);
  const genreOptions = useMemo(() => genres.map((item) => ({ label: item.name, value: item._id })), [genres]);
  const companyOptions = useMemo(() => companies.map((item) => ({ label: item.name, value: item._id })), [companies]);
  const tagOptions = useMemo(() => tags.map((item) => ({ label: item.name, value: item._id })), [tags]);
  const gameKeywordOptions = useMemo(
    () => gameKeywords.map((item) => ({ label: item.title_en ? `${item.name} / ${item.title_en}` : item.name, value: item._id })),
    [gameKeywords]
  );
  const collectionOptions = useMemo(() => collections.map((item) => ({ label: item.title_fa, value: item._id })), [collections]);
  const platformOptions = useMemo(() => platforms.map((item) => ({ label: item.label, value: item._id })), [platforms]);
  const brandOptions = useMemo(
    () => brands.map((item) => ({ label: item.title_fa || item.title_en || item.name || item.code || item._id, value: item._id })),
    [brands]
  );
  const relatedGameOptions = useMemo(
    () =>
      (relatedGamesData?.data || [])
        .filter((game) => game._id !== id)
        .map((game) => ({ label: game.title, value: game._id })),
    [id, relatedGamesData]
  );

  useEffect(() => {
    const game = gameData?.data;
    if (!game) return;

    const existingGallery = (game.gallery || []).map((item, index) => ({
      id: `existing-${item.public_id || item.url || index}`,
      url: item.url,
      public_id: item.public_id || "",
      type: item.type || "image",
      kind: "existing",
    }));

    setForm({
      ...initialForm,
      title: game.title || "",
      summary: game.summary || "",
      slug: game.slug || "",
      shortDescription: game.shortDescription || "",
      description: game.description || "",
      reviewSiteTitle: game.reviewSiteTitle || "",
      reviewSource: game.reviewSource || "",
      reviewLink: game.reviewLink || "",
      reviewItems: toLinkArray(game.reviewItems),
      category: game.category?._id || game.category || "",
      genres: toIdArray(game.genres),
      showGenresInCategories: Boolean(game.showGenresInCategories),
      developers: toIdArray(game.developers),
      publishers: toIdArray(game.publishers),
      tags: toIdArray(game.tags),
      gameKeywords: toIdArray(game.gameKeywords),
      searchTitles: toSearchTitleArray(game.searchTitles),
      collections: toIdArray(game.collections),
      platforms: toIdArray(game.platforms),
      platformReleases: toPlatformReleaseArray(game.platformReleases, game.platforms, game.releaseDate),
      platformSizes: toObjectArray(game.platformSizes),
      gameModes: game.gameModes || [],
      offlinePlayers: normalizeOfflinePlayers(game.offlinePlayers),
      onlinePlayers: game.onlinePlayers || [],
      onlinePlayerCount: game.onlinePlayerCount || "",
      multiplayerPlayerCount: game.multiplayerPlayerCount || "",
      relatedGames: toIdArray(game.relatedGames),
      launcher: normalizeOptionValue(game.launcher, launcherOptions, []),
      edition: normalizeOptionValue(game.edition, editionOptions, "استاندارد"),
      dlcs: Array.isArray(game.dlcs)
        ? game.dlcs.map((item) => ({
            title: String(item?.title || "").trim(),
            type: String(item?.type || "").trim(),
            versionSize: String(item?.versionSize || "").trim(),
            image: item?.image?.url ? item.image : item?.image || "",
          }))
        : [],
      extraEditions: Array.isArray(game.extraEditions)
        ? game.extraEditions.map((item) => ({
            title: typeof item === "string" ? String(item).trim() : String(item?.title || "").trim(),
            versionTitles: String(item?.versionTitles || "").trim(),
            items: Array.isArray(item?.items)
              ? item.items.map((entry) => ({
                  platform: entry?.platform?._id || entry?.platform || "",
                  capacityType: String(entry?.capacityType || "").trim(),
                  price: entry?.price ?? "",
                  discountPercent: entry?.discountPercent ?? "",
                  discountedPrice: entry?.discountedPrice ?? "",
                }))
              : [],
            image: item?.image?.url ? item.image : item?.image || "",
          }))
        : [],
      hasDubbing: Boolean(game.hasDubbing),
      hasSubtitle: Boolean(game.hasSubtitle),
      hasFreePersianSubtitle: Boolean(game.hasFreePersianSubtitle),
      hasPaidPersianSubtitle: Boolean(game.hasPaidPersianSubtitle),
      officialWebsite: game.officialWebsite || "",
      ageRating: normalizeOptionValue(game.ageRating, ageRatingOptions),
      gameplayTime: game.gameplayTime || "",
      metacriticScore: game.metacriticScore ?? "",
      sonyScore: game.sonyScore ?? "",
      steamScore: game.steamScore ?? "",
      xboxScore: game.xboxScore ?? "",
      playstationNpCommunicationId: game.playstationNpCommunicationId || "",
      isFeatured: Boolean(game.isFeatured),
      showOnlyInCollections: Boolean(game.showOnlyInCollections),
      socialLinks: Array.isArray(game.socialLinks) ? game.socialLinks : [],
      trailerVideo: game.trailerVideo?.url ? game.trailerVideo : null,
      trailerThumbnail: null,
      patchTitle: game.patchTitle || "",
      patchImage: null,
      cover: null,
      desktopCover: game.desktopCover?.url ? game.desktopCover : null,
      mobileCover: null,
      gallery: existingGallery,
    });
    setCoverPreview(game.cover?.url || game.cardDesktopCover?.url || "");
    setDesktopCoverPreview(game.desktopCover?.url || "");
    setMobileCoverPreview(game.mobileCover?.url || game.cardMobileCover?.url || "");
    setGalleryPreview(existingGallery);
    setTrailerVideoPreview(game.trailerVideo?.url || "");
    setTrailerThumbnailPreview(game.trailerThumbnail?.url || "");
    setIsSlugTouched(Boolean(game.slug));
  }, [gameData]);

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target;
    if (name === "slug") {
      setIsSlugTouched(true);
      setForm((prev) => ({ ...prev, slug: makeGameSlug(value) }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "title" && !isSlugTouched ? { slug: makeGameSlug(value) } : {}),
    }));
  };

  const setArrayField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openQuickCreate = (type, target = {}) => {
    setQuickCreate({ type, target });
    setQuickCreateForm(quickCreateInitialValues);
    setQuickCreateImagePreview("");
  };

  const closeQuickCreate = () => {
    if (isQuickCreateSaving) return;
    setQuickCreate(null);
    setQuickCreateForm(quickCreateInitialValues);
    setQuickCreateImagePreview("");
  };

  const setQuickCreateValue = (name, value) => {
    setQuickCreateForm((prev) => {
      const next = { ...prev, [name]: value };
      if ((name === "name" || name === "title_en" || name === "title_fa" || name === "name_en") && !prev.slug) {
        next.slug = makeGameSlug(value);
      }
      return next;
    });
  };

  const setQuickCreateImageFile = async (file, field = "image") => {
    if (!(file instanceof File)) {
      setQuickCreateValue(field, null);
      setQuickCreateImagePreview("");
      return;
    }

    const entityName = getQuickCreateEntityName(quickCreateForm);
    if (!entityName) {
      toast.error("ابتدا نام را وارد کنید", { id: "quick-create-upload-name" });
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setQuickCreateImagePreview(localPreview);

    const media = await handleImageUpload(`quickCreate-${quickCreate?.type || field}-${field}`, file, {
      entityName,
      entityType: quickCreateUploadTypes[quickCreate?.type] || quickCreate?.type || field,
      requireEntityName: true,
    });
    URL.revokeObjectURL(localPreview);
    if (!media) {
      setQuickCreateImagePreview("");
      return;
    }

    setQuickCreateValue(field, media);
    setQuickCreateImagePreview(media.url);
  };

  const appendCreatedItemToForm = (createdId) => {
    if (!createdId || !quickCreate?.target?.field) return;

    const { field, index } = quickCreate.target;
    setForm((prev) => {
      if (field === "category") return { ...prev, category: createdId };

      if (field === "platformReleases" || field === "platformSizes") {
        const fallbackRow = field === "platformReleases" ? { platform: "", releaseDate: "" } : { platform: "", variant: "", size: "" };
        const rows = Array.isArray(prev[field]) && prev[field].length ? [...prev[field]] : [fallbackRow];
        const rowIndex = Number.isInteger(index) ? index : 0;
        while (rows.length <= rowIndex) rows.push({ ...fallbackRow });
        rows[rowIndex] = { ...rows[rowIndex], platform: createdId };
        return { ...prev, [field]: rows };
      }

      const currentValues = Array.isArray(prev[field]) ? prev[field] : [];
      return currentValues.includes(createdId) ? prev : { ...prev, [field]: [...currentValues, createdId] };
    });
  };

  const refetchQuickCreateList = async (type) => {
    const refetchMap = {
      category: refetchCategories,
      genre: refetchGenres,
      tag: refetchTags,
      company: refetchCompanies,
      gameKeyword: refetchGameKeywords,
      gameCollection: refetchCollections,
      platform: refetchPlatforms,
    };
    await refetchMap[type]?.();
  };

  const buildQuickCreateRequest = (type) => {
    const trimmed = Object.fromEntries(Object.entries(quickCreateForm).map(([key, value]) => [key, String(value || "").trim()]));
    const name = trimmed.name || trimmed.title_fa || trimmed.name_fa || trimmed.title_en || trimmed.name_en;
    const slug = makeGameSlug(trimmed.slug || trimmed.title_en || trimmed.name_en || name);
    const appendMedia = (formData, key, value) => {
      if (value instanceof File) formData.append(key, value);
      else if (isMediaObject(value)) formData.append(key, JSON.stringify(value));
    };

    if (type === "gameCollection") {
      const formData = new FormData();
      formData.append("title_fa", trimmed.title_fa || name);
      if (trimmed.title_en) formData.append("title_en", trimmed.title_en);
      formData.append("slug", slug);
      if (trimmed.description) formData.append("description", trimmed.description);
      if (trimmed.placement) formData.append("placement", trimmed.placement);
      appendMedia(formData, "image", quickCreateForm.image);
      return formData;
    }

    const formData = new FormData();
    const append = (key, value) => {
      if (value !== undefined && value !== null && String(value).trim() !== "") formData.append(key, String(value).trim());
    };

    if (type === "platform") {
      append("name_fa", trimmed.name_fa || name);
      append("name_en", trimmed.name_en || trimmed.name_fa || name);
      append("slug", slug);
      append("brand", trimmed.brand);
      append("description", trimmed.description);
      append("svgIcon", trimmed.svgIcon);
      appendMedia(formData, "image", quickCreateForm.image);
      return formData;
    }

    append("name", name);
    append("slug", slug);
    append("title_en", type === "gameKeyword" ? trimmed.title_en : "");
    append("description", trimmed.description);
    append("icon", trimmed.icon);
    append("parent", type === "category" ? trimmed.parent : "");
    append("website", type === "company" ? trimmed.website : "");
    append("country", type === "company" ? trimmed.country : "");
    append("foundedYear", type === "company" ? trimmed.foundedYear : "");
    append("type", type === "company" ? trimmed.type : "");
    appendMedia(formData, "image", quickCreateForm.image);
    appendMedia(formData, "logo", quickCreateForm.logo);
    return formData;
  };

  const handleQuickCreateSubmit = async (event) => {
    event.preventDefault();
    if (!quickCreate?.type) return;
    if (Object.entries(imageUploadState).some(([key, item]) => key.startsWith("quickCreate-") && item?.status === "uploading")) {
      toast.error("تا پایان آپلود تصویر صبر کنید", { id: "quick-create" });
      return;
    }

    const type = quickCreate.type;
    const label = quickCreateLabels[type] || "مورد";
    const hasName = Boolean(
      quickCreateForm.name.trim() ||
        quickCreateForm.title_fa.trim() ||
        quickCreateForm.name_fa.trim() ||
        quickCreateForm.title_en.trim() ||
        quickCreateForm.name_en.trim()
    );

    if (!hasName) {
      toast.error(`عنوان ${label} را وارد کنید`, { id: "quick-create" });
      return;
    }
    if (type === "platform" && !quickCreateForm.brand) {
      toast.error("برای ساخت پلتفرم، برند را انتخاب کنید", { id: "quick-create" });
      return;
    }

    const createMap = {
      category: createCategory,
      genre: createGenre,
      tag: createTag,
      company: createCompany,
      gameKeyword: createGameKeyword,
      gameCollection: createGameCollection,
      platform: createPlatform,
    };

    try {
      toast.loading(`در حال افزودن ${label}...`, { id: "quick-create" });
      const response = await createMap[type](buildQuickCreateRequest(type)).unwrap();
      const createdId = response?.data?._id || response?.data?.id;
      await refetchQuickCreateList(type);
      appendCreatedItemToForm(createdId);
      setQuickCreate(null);
      setQuickCreateForm(quickCreateInitialValues);
      toast.success(response?.description || `${label} اضافه شد`, { id: "quick-create" });
    } catch (error) {
      toast.error(error?.data?.description || `افزودن ${label} ناموفق بود`, { id: "quick-create" });
    }
  };

  const deleteTemporaryMedia = async (media) => {
    if (!media?.public_id) return;

    try {
      await deleteUpload({
        public_id: media.public_id,
        resource_type: media.type || "video",
      }).unwrap();
    } catch (_) {}
  };

  const handleVideoUpload = async (field, file) => {
    if (!file) return;

    const gameTitle = String(form.title || "").trim();
    if (!gameTitle) {
      toast.error("ابتدا نام بازی را وارد کنید", { id: `${field}-upload` });
      return;
    }

    const previousTempMedia = tempUploadedVideosRef.current.get(field);
    const localPreview = URL.createObjectURL(file);

    setVideoUploadState((prev) => ({ ...prev, [field]: true }));
    setTrailerVideoPreview(localPreview);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("entityType", "game");
      uploadFormData.append("entityName", gameTitle);
      uploadFormData.append("requireEntityName", "true");
      const response = await uploadFile(uploadFormData).unwrap();
      const media = normalizeUploadedMedia(response, "video");

      if (!media) {
        throw new Error("Uploaded video response is invalid");
      }

      if (didUnmountRef.current && !didSaveRef.current) {
        await deleteTemporaryMedia(media);
        return;
      }

      setForm((prev) => ({ ...prev, [field]: media }));
      setTrailerVideoPreview(media.url);
      tempUploadedVideosRef.current.set(field, media);

      if (previousTempMedia?.public_id && previousTempMedia.public_id !== media.public_id) {
        await deleteTemporaryMedia(previousTempMedia);
      }

      toast.success("تریلر آپلود شد", { id: `${field}-upload` });
    } catch (error) {
      if (!didUnmountRef.current) {
        setForm((prev) => ({ ...prev, [field]: previousTempMedia || null }));
        setTrailerVideoPreview(previousTempMedia?.url || "");
        toast.error(error?.data?.description || "آپلود ویدئو ناموفق بود", { id: `${field}-upload` });
      }
    } finally {
      URL.revokeObjectURL(localPreview);
      if (!didUnmountRef.current) {
        setVideoUploadState((prev) => ({ ...prev, [field]: false }));
      }
    }
  };

  const handleImageUpload = async (
    uploadKey,
    file,
    {
      entityName,
      entityType = "game",
      fallbackType = "image",
      requireEntityName = true,
      resizeFit,
      resizeHeight,
      resizeWidth,
    } = {}
  ) => {
    if (!(file instanceof File)) return null;

    const uploadEntityName = String(entityName || form.title || "").trim();
    if (requireEntityName && !uploadEntityName) {
      toast.error(entityType === "game" ? "ابتدا نام بازی را وارد کنید" : "ابتدا نام را وارد کنید", { id: `${uploadKey}-upload` });
      return null;
    }

    const previousTempMedia = tempUploadedImagesRef.current.get(uploadKey);
    const localPreview = URL.createObjectURL(file);
    setImageUploadState((prev) => ({
      ...prev,
      [uploadKey]: {
        error: "",
        localPreview,
        originalSize: file.size,
        progress: 1,
        status: "uploading",
        uploadedSize: null,
      },
    }));

    try {
      const response = await uploadImageWithProgress(
        file,
        (progress) => {
          if (didUnmountRef.current) return;
          setImageUploadState((prev) => ({
            ...prev,
            [uploadKey]: {
              ...(prev[uploadKey] || {}),
              progress,
              status: "uploading",
            },
          }));
        },
        {
          entityName: uploadEntityName,
          entityType,
          requireEntityName,
          resizeFit,
          resizeHeight,
          resizeWidth,
        }
      );
      const media = normalizeUploadedMedia(response, fallbackType);

      if (!media) {
        throw new Error("پاسخ آپلود معتبر نیست و آدرس فایل برنگشت");
      }

      if (!didUnmountRef.current) {
        setImageUploadState((prev) => ({
          ...prev,
          [uploadKey]: {
            ...(prev[uploadKey] || {}),
            error: "",
            originalSize: media.originalSize || file.size,
            progress: 100,
            status: "done",
            uploadedSize: media.uploadedSize || null,
          },
        }));
      }

      tempUploadedImagesRef.current.set(uploadKey, media);
      if (previousTempMedia?.public_id && previousTempMedia.public_id !== media.public_id) {
        await deleteTemporaryMedia(previousTempMedia);
      }

      return media;
    } catch (error) {
      const message = getUploadErrorMessage(error);
      if (!didUnmountRef.current) {
        setImageUploadState((prev) => ({
          ...prev,
          [uploadKey]: {
            ...(prev[uploadKey] || {}),
            error: message,
            progress: 0,
            status: "error",
          },
        }));
        toast.error(message, { id: `${uploadKey}-upload` });
      }
      if (previousTempMedia) tempUploadedImagesRef.current.set(uploadKey, previousTempMedia);
      return null;
    }
  };

  const deleteTemporaryImage = async (uploadKey) => {
    const media = tempUploadedImagesRef.current.get(uploadKey);
    if (!media) return;
    tempUploadedImagesRef.current.delete(uploadKey);
    await deleteTemporaryMedia(media);
  };

  const deleteUploadedImage = async (uploadKey, media) => {
    const temporaryMedia = tempUploadedImagesRef.current.get(uploadKey);
    if (temporaryMedia) {
      tempUploadedImagesRef.current.delete(uploadKey);
      await deleteTemporaryMedia(temporaryMedia);
      return;
    }

    await deleteTemporaryMedia(media);
  };

  const deleteMainImage = async (field, setPreview) => {
    const game = gameData?.data || {};
    const media = isMediaObject(form[field]) ? form[field] : game[field];
    await deleteUploadedImage(field, media);
    setForm((prev) => ({ ...prev, [field]: deletedMediaValue }));
    setPreview("");

  };

  useEffect(() => {
    didUnmountRef.current = false;

    return () => {
      didUnmountRef.current = true;
      if (didSaveRef.current) return;

      tempUploadedVideosRef.current.forEach((media) => {
        deleteTemporaryMedia(media);
      });
      tempUploadedVideosRef.current.clear();
      tempUploadedImagesRef.current.forEach((media) => {
        deleteTemporaryMedia(media);
      });
      tempUploadedImagesRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildFormData = () => {
    const formData = new FormData();
    const arrayFields = [
      "genres",
      "developers",
      "publishers",
      "tags",
      "gameKeywords",
      "searchTitles",
      "collections",
      "platforms",
      "platformReleases",
      "platformSizes",
      "gameModes",
      "offlinePlayers",
      "onlinePlayers",
      "relatedGames",
      "socialLinks",
      "dlcs",
      "extraEditions",
      "reviewItems",
    ];

    const derivedPlatforms = [
      ...new Set(
        [
          ...(form.platforms || []),
          ...(form.platformReleases || []).map((item) => item.platform),
          ...(form.platformSizes || []).map((item) => item.platform),
        ].filter(Boolean)
      ),
    ];
    const normalizedForm = {
      ...form,
      platforms: derivedPlatforms,
    };

    Object.entries(normalizedForm).forEach(([key, value]) => {
      if (key === "cover" || key === "desktopCover" || key === "mobileCover" || key === "patchImage") {
        if (value instanceof File) formData.append(key, value);
        else if (isMediaObject(value)) formData.append(key, JSON.stringify(value));
        else if (value === deletedMediaValue) formData.append(key, deletedMediaValue);
        return;
      }
      if (key === "gallery") {
        const galleryItems = [];
        (Array.isArray(value) ? value : []).forEach((item) => {
          if (item?.kind === "error") return;
          if (item instanceof File) {
            formData.append("gallery", item);
            galleryItems.push({ kind: "new" });
            return;
          }

          if (item?.file instanceof File) {
            formData.append("gallery", item.file);
            galleryItems.push({ kind: "new" });
            return;
          }

          if (item?.url && !String(item.url).startsWith("blob:") && !String(item.url).startsWith("data:")) {
            galleryItems.push({
              kind: "existing",
              media: {
                url: item.url,
                public_id: item.public_id || "",
                type: item.type || "image",
              },
            });
          }
        });
        formData.append("galleryItems", JSON.stringify(galleryItems));
        return;
      }
      if (key === "trailerVideo" || key === "trailerThumbnail") {
        if (isFile(value)) {
          formData.append(key, value);
        } else if (isMediaObject(value)) {
          formData.append(key, JSON.stringify(value));
        }
        return;
      }
      if (key === "dlcs") {
        const dlcPayload = (value || []).map((item) => ({
          title: String(item?.title || "").trim(),
          type: String(item?.type || "").trim(),
          versionSize: String(item?.versionSize || "").trim(),
          image: isMediaObject(item?.image) ? item.image : typeof item?.image === "string" ? item.image : item?.image?.url || "",
        }));
        formData.append("dlcs", JSON.stringify(dlcPayload));
        (Array.isArray(value) ? value : []).forEach((item) => {
          if (item?.image instanceof File) {
            formData.append("dlcImages", item.image);
          }
        });
        return;
      }
      if (key === "extraEditions") {
        const extraPayload = (value || []).map((item) => ({
          title: String(item?.title || "").trim(),
          versionTitles: String(item?.versionTitles || "").trim(),
          items: Array.isArray(item?.items)
            ? item.items.map((entry) => ({
                platform: entry?.platform || "",
                capacityType: String(entry?.capacityType || "").trim(),
                price: entry?.price ?? "",
                discountPercent: entry?.discountPercent ?? "",
              }))
            : [],
          image: isMediaObject(item?.image) ? item.image : typeof item?.image === "string" ? item.image : item?.image?.url || "",
        }));
        formData.append("extraEditions", JSON.stringify(extraPayload));
        (Array.isArray(value) ? value : []).forEach((item) => {
          if (item?.image instanceof File) {
            formData.append("extraEditionImages", item.image);
          }
        });
        return;
      }
      if (arrayFields.includes(key)) {
        formData.append(key, JSON.stringify(value || []));
        return;
      }
      formData.append(key, String(value ?? ""));
    });

    return formData;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isUploadingVideo) {
      toast.error("تا پایان آپلود ویدئوها صبر کنید", { id: "game-video-upload" });
      return;
    }

    if (isUploadingImage) {
      toast.error("تا پایان آپلود تصاویر صبر کنید", { id: "game-image-upload" });
      return;
    }

    if (!titleIsValid || !categoryIsValid) {
      toast.error(!titleIsValid ? "عنوان بازی را وارد کنید" : "دسته‌بندی بازی را انتخاب کنید", { id: "save-game" });
      return;
    }

    try {
      toast.loading(isEdit ? "در حال به‌روزرسانی بازی..." : "در حال ثبت بازی...", {
        id: "save-game",
      });
      const formData = buildFormData();
      const response = isEdit ? await updateGame({ id, formData }).unwrap() : await createGame(formData).unwrap();

      didSaveRef.current = true;
      tempUploadedVideosRef.current.clear();
      tempUploadedImagesRef.current.clear();
      toast.success(response.description || "بازی ذخیره شد", { id: "save-game" });
      navigate("/games");
    } catch (error) {
      toast.error(error?.data?.description || "ذخیره بازی ناموفق بود", {
        id: "save-game",
      });
    }
  };

  const renderSection = (sectionKey) => {
    switch (sectionKey) {
      case "basic":
        return (
          <BasicStep
            form={form}
            onChange={handleChange}
            setArrayField={setArrayField}
            setForm={setForm}
            translateGameIntro={translateGameIntro}
            translateSearchTitleSlug={translateSearchTitleSlug}
            playStationTrophiesState={playStationTrophiesState}
            xboxAchievementsState={xboxAchievementsState}
          />
        );
      case "media":
        return (
          <GameMediaStep
            coverPreview={coverPreview}
            desktopCoverPreview={desktopCoverPreview}
            gameTitle={form.title}
            mobileCoverPreview={mobileCoverPreview}
            galleryPreview={galleryPreview}
            imageUploadState={imageUploadState}
            isTrailerVideoUploading={videoUploadState.trailerVideo}
            onDeleteMainImage={deleteMainImage}
            onDeleteUploadedImage={deleteUploadedImage}
            onImageUpload={handleImageUpload}
            onVideoUpload={handleVideoUpload}
            setCoverPreview={setCoverPreview}
            setDesktopCoverPreview={setDesktopCoverPreview}
            setMobileCoverPreview={setMobileCoverPreview}
            onEditDesktopCoverPosition={() => {
              if (!desktopCoverPreview) return;
              setDesktopCoverPositionSource({ sourceUrl: desktopCoverPreview });
            }}
            setDesktopCoverCropFile={(file) => setDesktopCoverPositionSource(file instanceof File ? { file } : null)}
            setForm={setForm}
            setGalleryPreview={setGalleryPreview}
            setTrailerThumbnailPreview={setTrailerThumbnailPreview}
            trailerThumbnailPreview={trailerThumbnailPreview}
            trailerVideoPreview={trailerVideoPreview}
          />
        );
      case "specs":
        return (
          <div className="space-y-5">
            <RelationsStep
              categoryOptions={categoryOptions}
              companyOptions={companyOptions}
              collectionOptions={collectionOptions}
              form={form}
              gameKeywordOptions={gameKeywordOptions}
              genreOptions={genreOptions}
              onChange={handleChange}
              onQuickCreate={openQuickCreate}
              platformOptions={platformOptions}
              setArrayField={setArrayField}
              tagOptions={tagOptions}
            />
            <PlayersStep
              form={form}
              offlinePlayerOptions={offlinePlayerOptions}
              onChange={handleChange}
              setArrayField={setArrayField}
            />
            <ReleaseStep ageRatingOptions={ageRatingOptions} form={form} onChange={handleChange} scoreImportState={scoreImportState} setForm={setForm} />
          </div>
        );
      case "sizes":
        return (
          <div className="space-y-4">
            <PlatformReleasesStep form={form} onQuickCreate={openQuickCreate} platformOptions={platformOptions} setArrayField={setArrayField} />
            <PlatformSizesStep form={form} onQuickCreate={openQuickCreate} platformOptions={platformOptions} setArrayField={setArrayField} />
          </div>
        );
      case "dlc":
        return <DlcStep form={form} imageUploadState={imageUploadState} onDeleteUploadedImage={deleteUploadedImage} onImageUpload={handleImageUpload} setArrayField={setArrayField} />;
      case "editions":
        return <EditionsStep form={form} imageUploadState={imageUploadState} onDeleteUploadedImage={deleteUploadedImage} onImageUpload={handleImageUpload} platformOptions={platformOptions} setArrayField={setArrayField} />;
      case "relatedGames":
        return <RelatedGamesStep form={form} relatedGameOptions={relatedGameOptions} setArrayField={setArrayField} />;
      case "review":
        return <ReviewStep form={form} onChange={handleChange} setArrayField={setArrayField} />;
      case "seo":
        return <SeoTagsStep form={form} onQuickCreate={openQuickCreate} setArrayField={setArrayField} tagOptions={tagOptions} />;
      case "social":
        return <SocialStep form={form} setArrayField={setArrayField} />;
      default:
        return null;
    }
  };

  const selectedPlatformIds = [
    ...new Set(
      [
        ...(form.platforms || []),
        ...(form.platformReleases || []).map((item) => item.platform),
        ...(form.platformSizes || []).map((item) => item.platform),
      ].filter(Boolean)
    ),
  ];
  const selectedPlatformLabels = platformOptions.filter((option) => selectedPlatformIds.includes(option.value)).map((option) => option.label);
  const selectedPlatformReleases = (form.platformReleases || [])
    .map((item) => ({
      label: platformOptions.find((option) => option.value === item.platform)?.label || "",
      releaseDate: item.releaseDate,
    }))
    .filter((item) => item.label || item.releaseDate);
  const selectedGenreLabels = genreOptions.filter((option) => form.genres.includes(option.value)).map((option) => option.label);
  const selectedTagLabels = tagOptions.filter((option) => form.tags.includes(option.value)).map((option) => option.label);

  const renderPreview = () => {
    if (activePreviewTab === "card") {
      return (
        <div className="flex justify-center">
          <GameCardPreview coverPreview={coverPreview} form={form} genres={selectedGenreLabels} platforms={selectedPlatformLabels} />
        </div>
      );
    }

    return (
      <GameDetailPreview
        coverPreview={coverPreview}
        desktopCoverPreview={desktopCoverPreview}
        mobileCoverPreview={mobileCoverPreview}
        form={form}
        galleryPreview={galleryPreview}
        genres={selectedGenreLabels}
        isSticky={false}
        platformReleases={selectedPlatformReleases}
        platforms={selectedPlatformLabels}
        reviewItems={form.reviewItems}
        seoTags={selectedTagLabels}
        variant={activePreviewTab === "mobile" ? "mobile" : "desktop"}
      />
    );
  };

  return (
    <ControlPanel>
      <section className="mx-auto max-w-[1800px] space-y-6">
        <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-black/80 dark:shadow-none">
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">مدیریت محتوای بازی‌ها</p>
            <h1 className="mt-1 text-2xl font-bold text-zinc-950 dark:text-white">{isEdit ? "ویرایش بازی" : "افزودن بازی"}</h1>
          </div>
          <Link className="rounded-xl border border-zinc-200 px-4 py-2 text-sm text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-white dark:hover:text-white" to="/games">
            بازگشت به لیست
          </Link>
        </div>

        <form className="space-y-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-700 dark:bg-zinc-950" onSubmit={handleSubmit}>
          {isLoadingGame ? (
            <div className="rounded-xl border border-zinc-200 bg-white px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-black">در حال دریافت...</div>
          ) : (
            <>
              <div className="space-y-0" dir="rtl">
                <div className="sticky top-16 z-30 -mb-px flex justify-start rounded-t-xl border border-zinc-200 bg-white/95 p-1 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
                  <div className="inline-flex max-w-full overflow-x-auto">
                    {previewTabs.map((tab) => {
                      const isActive = activePreviewTab === tab.key;

                      return (
                        <button
                          className={`min-w-16 shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition-all duration-200 ease-out sm:min-w-20 ${
                            isActive ? "bg-emerald-500 !text-white shadow-sm dark:bg-blue-500 dark:!text-white" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-black dark:hover:text-white"
                          }`}
                          key={tab.key}
                          onClick={() => setActivePreviewTab(tab.key)}
                          style={isActive ? { color: "#fff" } : undefined}
                          type="button"
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {activePreviewTab !== "form" ? (
                  <div className="flex justify-center overflow-hidden rounded-b-xl rounded-t-none border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                    <div className={activePreviewTab === "desktop" ? "w-full max-w-5xl" : "w-full max-w-[390px]"}>
                      {renderPreview()}
                    </div>
                  </div>
                ) : null}

                {activePreviewTab === "form" ? (
                <div className="relative space-y-10 rounded-b-xl rounded-t-none border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-black dark:shadow-none md:p-6" dir="rtl">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-500">فرم اطلاعات بازی</span>
                    <span className="rounded-full border border-zinc-800 px-2 py-1 text-[10px] text-zinc-500">
                      {formSections.length} بخش
                    </span>
                  </div>
                  <div className="pointer-events-none absolute bottom-8 right-[34px] top-8 w-px bg-emerald-500 dark:bg-blue-500 md:right-[196px]" />
                  {formSections.map((section, index) => (
                    <GameFormSection index={index} key={section.key} title={section.title}>
                      {renderSection(section.key)}
                    </GameFormSection>
                  ))}
                  <div className="sticky bottom-4 z-20 flex justify-end border-t border-zinc-200 bg-white/90 pt-4 backdrop-blur dark:border-zinc-800 dark:bg-black/90">
                    <SendButton
                      isLoading={isSaving || isUploadingVideo || isUploadingImage}
                      label={isEdit ? "ذخیره بازی" : "ثبت بازی"}
                      loadingLabel={isUploadingImage ? "در حال آپلود تصویر..." : isUploadingVideo ? "در حال آپلود ویدئو..." : "در حال ذخیره..."}
                    />
                  </div>
                </div>
                ) : null}
              </div>
            </>
          )}
        </form>

        {quickCreate ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6" dir="rtl">
            <form
              className="w-full max-w-2xl space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
              onSubmit={handleQuickCreateSubmit}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-zinc-500">افزودن سریع</p>
                  <h2 className="text-lg font-bold text-zinc-950 dark:text-white">{quickCreateLabels[quickCreate.type]}</h2>
                </div>
                <button
                  className="rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-600 transition hover:border-red-400 hover:text-red-500 dark:border-zinc-800 dark:text-zinc-300"
                  onClick={closeQuickCreate}
                  type="button"
                >
                  بستن
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {["category", "genre", "tag", "gameKeyword", "gameCollection", "platform", "company"].includes(quickCreate.type) ? (
                  <QuickCreateImageUpload
                    label={quickCreate.type === "company" ? "لوگو" : quickCreate.type === "platform" ? "تصویر پلتفرم" : quickCreate.type === "genre" ? "تصویر ژانر" : "تصویر"}
                    name={`quick-create-${quickCreate.type}-image`}
                    onRemove={async () => {
                      const field = quickCreate.type === "company" ? "logo" : "image";
                      await deleteUploadedImage(`quickCreate-${quickCreate.type}-${field}`, quickCreateForm[field]);
                      setQuickCreateValue(field, null);
                      setQuickCreateImagePreview("");
                    }}
                    onSelect={(file) => setQuickCreateImageFile(file, quickCreate.type === "company" ? "logo" : "image")}
                    preview={quickCreateImagePreview}
                    state={imageUploadState[`quickCreate-${quickCreate.type}-${quickCreate.type === "company" ? "logo" : "image"}`]}
                  />
                ) : null}

                {quickCreate.type === "gameCollection" ? (
                  <>
                    <label className="space-y-2">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">عنوان فارسی</span>
                      <input
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-blue-500"
                        onChange={(event) => setQuickCreateValue("title_fa", event.target.value)}
                        value={quickCreateForm.title_fa}
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">اسلاگ</span>
                      <input
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-blue-500"
                        dir="ltr"
                        onChange={(event) => setQuickCreateValue("slug", event.target.value)}
                        value={quickCreateForm.slug}
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">عنوان انگلیسی</span>
                      <input
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-blue-500"
                        dir="ltr"
                        onChange={(event) => setQuickCreateValue("title_en", event.target.value)}
                        value={quickCreateForm.title_en}
                      />
                    </label>
                  </>
                ) : quickCreate.type === "platform" ? (
                  <>
                    <label className="space-y-2">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">نام فارسی</span>
                      <input
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-blue-500"
                        onChange={(event) => setQuickCreateValue("name_fa", event.target.value)}
                        value={quickCreateForm.name_fa}
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">اسلاگ</span>
                      <input
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-blue-500"
                        dir="ltr"
                        onChange={(event) => setQuickCreateValue("slug", event.target.value)}
                        value={quickCreateForm.slug}
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">نام انگلیسی</span>
                      <input
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-blue-500"
                        dir="ltr"
                        onChange={(event) => setQuickCreateValue("name_en", event.target.value)}
                        value={quickCreateForm.name_en}
                      />
                    </label>
                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">برند</span>
                      <select
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-blue-500"
                        onChange={(event) => setQuickCreateValue("brand", event.target.value)}
                        value={quickCreateForm.brand}
                      >
                        <option value="">انتخاب برند</option>
                        {brandOptions.map((brand) => (
                          <option key={brand.value} value={brand.value}>
                            {brand.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">SVG آیکون</span>
                      <textarea
                        className="min-h-24 w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-blue-500"
                        dir="ltr"
                        onChange={(event) => setQuickCreateValue("svgIcon", event.target.value)}
                        value={quickCreateForm.svgIcon}
                      />
                    </label>
                  </>
                ) : quickCreate.type === "genre" ? (
                  <>
                    <label className="space-y-2">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">عنوان</span>
                      <input
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-blue-500"
                        onChange={(event) => setQuickCreateValue("name", event.target.value)}
                        value={quickCreateForm.name}
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">اسلاگ</span>
                      <input
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-blue-500"
                        dir="ltr"
                        onChange={(event) => setQuickCreateValue("slug", event.target.value)}
                        value={quickCreateForm.slug}
                      />
                    </label>
                    <div className="md:col-span-2">
                      <IconPicker
                        icons={icons}
                        isLoadingIcons={isLoadingIcons}
                        label="آیکون"
                        name="icon"
                        onChange={(event) => setQuickCreateValue("icon", event.target.value)}
                        value={quickCreateForm.icon}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <label className="space-y-2">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">عنوان</span>
                      <input
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-blue-500"
                        onChange={(event) => setQuickCreateValue("name", event.target.value)}
                        value={quickCreateForm.name}
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">اسلاگ</span>
                      <input
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-blue-500"
                        dir="ltr"
                        onChange={(event) => setQuickCreateValue("slug", event.target.value)}
                        value={quickCreateForm.slug}
                      />
                    </label>
                  </>
                )}

                {quickCreate.type === "gameKeyword" ? (
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">عنوان انگلیسی</span>
                    <input
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-blue-500"
                      dir="ltr"
                      onChange={(event) => setQuickCreateValue("title_en", event.target.value)}
                      value={quickCreateForm.title_en}
                    />
                  </label>
                ) : null}

                {["category", "company"].includes(quickCreate.type) ? (
                  <div className="md:col-span-2">
                    <IconPicker
                      icons={icons}
                      isLoadingIcons={isLoadingIcons}
                      label="آیکون"
                      name="icon"
                      onChange={(event) => setQuickCreateValue("icon", event.target.value)}
                      value={quickCreateForm.icon}
                    />
                  </div>
                ) : null}

                {quickCreate.type === "category" ? (
                  <label className="space-y-2">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">والد</span>
                    <select
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-blue-500"
                      onChange={(event) => setQuickCreateValue("parent", event.target.value)}
                      value={quickCreateForm.parent}
                    >
                      <option value="">بدون والد</option>
                      {categoryOptions.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                {quickCreate.type === "company" ? (
                  <>
                    <label className="space-y-2">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">نوع شرکت</span>
                      <select
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-blue-500"
                        onChange={(event) => setQuickCreateValue("type", event.target.value)}
                        value={quickCreateForm.type}
                      >
                        <option value="developer_publisher">سازنده و ناشر</option>
                        <option value="developer">سازنده</option>
                        <option value="publisher">ناشر</option>
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">کشور</span>
                      <input
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-blue-500"
                        onChange={(event) => setQuickCreateValue("country", event.target.value)}
                        value={quickCreateForm.country}
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">وب‌سایت</span>
                      <input
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-blue-500"
                        dir="ltr"
                        onChange={(event) => setQuickCreateValue("website", event.target.value)}
                        value={quickCreateForm.website}
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">سال تاسیس</span>
                      <input
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-blue-500"
                        onChange={(event) => setQuickCreateValue("foundedYear", event.target.value)}
                        type="number"
                        value={quickCreateForm.foundedYear}
                      />
                    </label>
                  </>
                ) : null}

                {quickCreate.type === "gameCollection" ? (
                  <label className="space-y-2">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">محل نمایش</span>
                    <input
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-blue-500"
                      onChange={(event) => setQuickCreateValue("placement", event.target.value)}
                      value={quickCreateForm.placement}
                    />
                  </label>
                ) : null}

                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">توضیحات</span>
                  <textarea
                    className="min-h-24 w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-blue-500"
                    onChange={(event) => setQuickCreateValue("description", event.target.value)}
                    value={quickCreateForm.description}
                  />
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <button
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-sm text-zinc-600 transition hover:border-zinc-400 hover:text-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-white dark:hover:text-white"
                  disabled={isQuickCreateSaving}
                  onClick={closeQuickCreate}
                  type="button"
                >
                  انصراف
                </button>
                <button
                  className="rounded-xl border border-emerald-600 bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
                  disabled={isQuickCreateSaving}
                  type="submit"
                >
                  {isQuickCreateSaving ? "در حال ثبت..." : "ثبت و انتخاب"}
                </button>
              </div>
            </form>
          </div>
        ) : null}

        <DesktopCoverCropper
          file={desktopCoverPositionSource?.file}
          sourceUrl={desktopCoverPositionSource?.sourceUrl || ""}
          initialPosition={form.desktopCover?.position}
          onCancel={() => setDesktopCoverPositionSource(null)}
          onSelect={async (selectedFile, position) => {
            setDesktopCoverPositionSource(null);
            if (!selectedFile) {
              setForm((prev) => ({
                ...prev,
                desktopCover: prev.desktopCover?.url ? { ...prev.desktopCover, position } : prev.desktopCover,
              }));
              return;
            }

            const media = await handleImageUpload("desktopCover", selectedFile);
            if (!media) return;
            const positionedMedia = { ...media, position };
            setForm((prev) => ({ ...prev, desktopCover: positionedMedia }));
            setDesktopCoverPreview(media.url);
          }}
        />
      </section>
    </ControlPanel>
  );
}

export default GameForm;
