import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ControlPanel from "../ControlPanel";
import SendButton from "@/components/shared/button/SendButton";
import { useGetCategoriesQuery } from "../../services/category/categoryApi";
import { useGetCompaniesQuery } from "../../services/companyApi";
import { useGetGenresQuery } from "../../services/genreApi";
import { useGetTagsQuery } from "../../services/tagApi";
import { useCreateGameMutation, useGetGameQuery, useGetGamesQuery, useUpdateGameMutation } from "../../services/gameApi";
import {
  ageRatingOptions,
  editionOptions,
  launcherOptions,
  offlinePlayerOptions,
} from "./gameOptions";
import { formatDate, normalizeOptionValue, toIdArray } from "./gameFormUtils";
import { useGetPlatformsQuery } from "@/services/platformApi";
import { useGetGameCollectionsQuery } from "@/services/gameCollectionApi";
import { useGetGameKeywordsQuery } from "@/services/gameKeywordApi";
import { useDeleteUploadMutation, useUploadMutation } from "@/services/upload/uploadApi";
import { flattenPlatforms } from "../platforms/utils";
import DesktopCoverCropper from "./components/DesktopCoverCropper";
import { GameCardPreview, GameDetailPreview } from "./components/GamePreviews";
import {
  BasicStep,
  DlcStep,
  EditionsStep,
  GameMediaStep,
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
  hasOnlineMode: false,
  onlinePlayerCount: "",
  hasMultiplayerMode: false,
  multiplayerPlayerCount: "",
  relatedGames: [],
  launcher: [],
  edition: "استاندارد",
  hasDubbing: false,
  hasSubtitle: false,
  dlcs: [],
  extraEditions: [],
  releaseDate: "",
  officialWebsite: "",
  ageRating: "",
  gameplayTime: "",
  metacriticScore: "",
  isFeatured: false,
  isPs5ProEnhanced: false,
  socialLinks: [],
  trailerVideo: null,
  trailerThumbnail: null,
  patchTitle: "",
  patchImage: null,
  cover: null,
  cardDesktopCover: null,
  cardMobileCover: null,
  desktopCover: null,
  gallery: [],
};

const isFile = (value) => value instanceof File;

const isMediaObject = (value) => Boolean(value && typeof value === "object" && !(value instanceof File) && value.url);

const normalizeUploadedMedia = (response, fallbackType = "video") => {
  const file = response?.data || response;
  if (!file?.url) return null;

  return {
    url: file.url,
    public_id: file.public_id || file.key || "",
    storage: file.storage || "arvan",
    type: file.resource_type === "video" ? "video" : file.type || fallbackType,
  };
};

const formSections = [
  { key: "basic", title: "مشخصات اولیه بازی" },
  { key: "media", title: "عکس و فیلم" },
  { key: "specs", title: "مشخصات بازی" },
  { key: "sizes", title: "حجم بازی" },
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

function makeGameSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06ff\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function GameFormSection({ children, index, title }) {
  return (
    <section className="relative grid gap-4 pr-12 md:grid-cols-[190px_minmax(0,1fr)] md:gap-8 md:pr-0" dir="rtl">
      <div>
        <div className="sticky top-28 flex items-center gap-3">
          <h2 className="min-w-0 flex-1 text-right text-sm font-bold leading-6 text-zinc-700 dark:text-zinc-200">{title}</h2>
          <span className="hidden h-px w-8 shrink-0 bg-emerald-500 dark:bg-blue-500 md:block" />
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
  const [cardDesktopCoverPreview, setCardDesktopCoverPreview] = useState("");
  const [cardMobileCoverPreview, setCardMobileCoverPreview] = useState("");
  const [desktopCoverPreview, setDesktopCoverPreview] = useState("");
  const [desktopCoverCropFile, setDesktopCoverCropFile] = useState(null);
  const [galleryPreview, setGalleryPreview] = useState([]);
  const [trailerVideoPreview, setTrailerVideoPreview] = useState("");
  const [trailerThumbnailPreview, setTrailerThumbnailPreview] = useState("");
  const [activePreviewTab, setActivePreviewTab] = useState("form");
  const [isSlugTouched, setIsSlugTouched] = useState(false);
  const [videoUploadState, setVideoUploadState] = useState({
    trailerVideo: false,
  });
  const tempUploadedVideosRef = useRef(new Map());
  const didSaveRef = useRef(false);
  const didUnmountRef = useRef(false);

  const { data: gameData, isLoading: isLoadingGame } = useGetGameQuery(id, {
    skip: !isEdit || !id,
  });
  const { data: categoriesData } = useGetCategoriesQuery({ page: 1, limit: 200 });
  const { data: genresData } = useGetGenresQuery({ page: 1, limit: 200 });
  const { data: companiesData } = useGetCompaniesQuery({ page: 1, limit: 200 });
  const { data: tagsData } = useGetTagsQuery({ page: 1, limit: 200 });
  const { data: gameKeywordsData } = useGetGameKeywordsQuery({ page: 1, limit: 300 });
  const { data: platformsData } = useGetPlatformsQuery({ tree: true, limit: 500 });
  const { data: collectionsData } = useGetGameCollectionsQuery({ page: 1, limit: 300 });
  const { data: relatedGamesData } = useGetGamesQuery({ page: 1, limit: 500 });
  const [uploadFile] = useUploadMutation();
  const [deleteUpload] = useDeleteUploadMutation();
  const [createGame, createState] = useCreateGameMutation();
  const [updateGame, updateState] = useUpdateGameMutation();

  const categories = categoriesData?.data || [];
  const genres = genresData?.data || [];
  const companies = companiesData?.data || [];
  const tags = tagsData?.data || [];
  const gameKeywords = gameKeywordsData?.data || [];
  const platforms = useMemo(() => flattenPlatforms(platformsData?.data || []), [platformsData]);
  const collections = collectionsData?.data || [];
  const isSaving = createState.isLoading || updateState.isLoading;
  const isUploadingVideo = videoUploadState.trailerVideo;
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
      storage: item.storage || "",
      type: item.type || "image",
      kind: "existing",
    }));

    setForm({
      ...initialForm,
      title: game.title || "",
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
      offlinePlayers: game.offlinePlayers || [],
      onlinePlayers: game.onlinePlayers || [],
      hasOnlineMode: Boolean(game.hasOnlineMode),
      onlinePlayerCount: game.onlinePlayerCount || "",
      hasMultiplayerMode: Boolean(game.hasMultiplayerMode),
      multiplayerPlayerCount: game.multiplayerPlayerCount || "",
      relatedGames: toIdArray(game.relatedGames),
      launcher: normalizeOptionValue(game.launcher, launcherOptions, []),
      edition: normalizeOptionValue(game.edition, editionOptions, "استاندارد"),
      dlcs: Array.isArray(game.dlcs)
        ? game.dlcs.map((item) => ({
            title: String(item?.title || "").trim(),
            type: String(item?.type || "").trim(),
            versionSize: String(item?.versionSize || "").trim(),
            image: item?.image?.url || item?.image || "",
          }))
        : [],
      extraEditions: Array.isArray(game.extraEditions)
        ? game.extraEditions.map((item) => ({
            title: typeof item === "string" ? String(item).trim() : String(item?.title || "").trim(),
            versionSize: String(item?.versionSize || "").trim(),
            price: item?.price ?? "",
            image: item?.image?.url || item?.image || "",
          }))
        : [],
      hasDubbing: Boolean(game.hasDubbing),
      hasSubtitle: Boolean(game.hasSubtitle),
      releaseDate: formatDate(game.releaseDate),
      officialWebsite: game.officialWebsite || "",
      ageRating: normalizeOptionValue(game.ageRating, ageRatingOptions),
      gameplayTime: game.gameplayTime || "",
      metacriticScore: game.metacriticScore ?? "",
      isFeatured: Boolean(game.isFeatured),
      isPs5ProEnhanced: Boolean(game.isPs5ProEnhanced),
      socialLinks: Array.isArray(game.socialLinks) ? game.socialLinks : [],
      trailerVideo: game.trailerVideo?.url ? game.trailerVideo : null,
      trailerThumbnail: null,
      patchTitle: game.patchTitle || "",
      patchImage: null,
      cover: null,
      cardDesktopCover: null,
      cardMobileCover: null,
      desktopCover: null,
      gallery: existingGallery,
    });
    setCoverPreview(game.cover?.url || "");
    setCardDesktopCoverPreview(game.cardDesktopCover?.url || game.cover?.url || "");
    setCardMobileCoverPreview(game.cardMobileCover?.url || game.cover?.url || "");
    setDesktopCoverPreview(game.desktopCover?.url || "");
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

    const previousTempMedia = tempUploadedVideosRef.current.get(field);
    const localPreview = URL.createObjectURL(file);

    setVideoUploadState((prev) => ({ ...prev, [field]: true }));
    setTrailerVideoPreview(localPreview);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
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

  useEffect(() => {
    didUnmountRef.current = false;

    return () => {
      didUnmountRef.current = true;
      if (didSaveRef.current) return;

      tempUploadedVideosRef.current.forEach((media) => {
        deleteTemporaryMedia(media);
      });
      tempUploadedVideosRef.current.clear();
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
      if (key === "cover" || key === "cardDesktopCover" || key === "cardMobileCover" || key === "desktopCover" || key === "patchImage") {
        if (value instanceof File) formData.append(key, value);
        return;
      }
      if (key === "gallery") {
        const galleryItems = [];
        (Array.isArray(value) ? value : []).forEach((item) => {
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

          if (item?.url) {
            galleryItems.push({
              kind: "existing",
              media: {
                url: item.url,
                public_id: item.public_id || "",
                storage: item.storage || "",
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
          image: typeof item?.image === "string" ? item.image : item?.image?.url || "",
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
          versionSize: String(item?.versionSize || "").trim(),
          price: item?.price ?? "",
          image: typeof item?.image === "string" ? item.image : item?.image?.url || "",
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
          />
        );
      case "media":
        return (
          <GameMediaStep
            cardDesktopCoverPreview={cardDesktopCoverPreview}
            cardMobileCoverPreview={cardMobileCoverPreview}
            coverPreview={coverPreview}
            desktopCoverPreview={desktopCoverPreview}
            galleryPreview={galleryPreview}
            isTrailerVideoUploading={videoUploadState.trailerVideo}
            onVideoUpload={handleVideoUpload}
            setCardDesktopCoverPreview={setCardDesktopCoverPreview}
            setCardMobileCoverPreview={setCardMobileCoverPreview}
            setCoverPreview={setCoverPreview}
            setDesktopCoverCropFile={setDesktopCoverCropFile}
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
              setArrayField={setArrayField}
              tagOptions={tagOptions}
            />
            <PlayersStep
              form={form}
              offlinePlayerOptions={offlinePlayerOptions}
              onChange={handleChange}
              setArrayField={setArrayField}
            />
            <ReleaseStep ageRatingOptions={ageRatingOptions} form={form} onChange={handleChange} setForm={setForm} />
          </div>
        );
      case "sizes":
        return <PlatformSizesStep form={form} platformOptions={platformOptions} setArrayField={setArrayField} />;
      case "dlc":
        return <DlcStep form={form} setArrayField={setArrayField} />;
      case "editions":
        return <EditionsStep form={form} setArrayField={setArrayField} />;
      case "relatedGames":
        return <RelatedGamesStep form={form} relatedGameOptions={relatedGameOptions} setArrayField={setArrayField} />;
      case "review":
        return <ReviewStep form={form} onChange={handleChange} setArrayField={setArrayField} />;
      case "seo":
        return <SeoTagsStep form={form} setArrayField={setArrayField} tagOptions={tagOptions} />;
      case "social":
        return <SocialStep form={form} setArrayField={setArrayField} />;
      default:
        return null;
    }
  };

  const selectedPlatformIds = (form.platformReleases || []).map((item) => item.platform).filter(Boolean);
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
          <GameCardPreview coverPreview={cardDesktopCoverPreview || coverPreview} form={form} genres={selectedGenreLabels} platforms={selectedPlatformLabels} />
        </div>
      );
    }

    return (
      <GameDetailPreview
        cardMobileCoverPreview={cardMobileCoverPreview}
        coverPreview={coverPreview}
        desktopCoverPreview={desktopCoverPreview}
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
              <div className="space-y-5" dir="rtl">
                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-black dark:shadow-none">
                  <div className="mb-4 flex flex-wrap items-center justify-start gap-3">
                    <span className="text-xs font-bold text-zinc-500">پیش‌نمایش</span>
                    <div className="order-first inline-flex rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-950">
                      {previewTabs.map((tab) => {
                        const isActive = activePreviewTab === tab.key;

                        return (
                          <button
                            className={`min-w-20 rounded-lg px-3 py-2 text-xs font-bold transition ${
                              isActive ? "bg-emerald-500 text-white dark:bg-blue-500" : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                            }`}
                            key={tab.key}
                            onClick={() => setActivePreviewTab(tab.key)}
                            type="button"
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {activePreviewTab !== "form" ? (
                    <div className="flex justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                      <div className={activePreviewTab === "desktop" ? "w-full max-w-5xl" : "w-full max-w-[390px]"}>
                        {renderPreview()}
                      </div>
                    </div>
                  ) : null}
                </div>

                {activePreviewTab === "form" ? (
                <div className="relative space-y-10 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-black dark:shadow-none md:p-6" dir="rtl">
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
                      isLoading={isSaving || isUploadingVideo}
                      label={isEdit ? "ذخیره بازی" : "ثبت بازی"}
                      loadingLabel={isUploadingVideo ? "در حال آپلود ویدئو..." : "در حال ذخیره..."}
                    />
                  </div>
                </div>
                ) : null}
              </div>
            </>
          )}
        </form>

        <DesktopCoverCropper
          file={desktopCoverCropFile}
          onCancel={() => setDesktopCoverCropFile(null)}
          onCrop={(croppedFile, previewUrl) => {
            setForm((prev) => ({ ...prev, desktopCover: croppedFile }));
            setDesktopCoverPreview(previewUrl);
            setDesktopCoverCropFile(null);
          }}
        />
      </section>
    </ControlPanel>
  );
}

export default GameForm;

