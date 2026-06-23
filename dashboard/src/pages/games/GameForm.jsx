import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ControlPanel from "../ControlPanel";
import Cross from "@/components/icons/Cross";
import NavigationButton from "@/components/shared/button/NavigationButton";
import SendButton from "@/components/shared/button/SendButton";
import StepIndicator from "../categories/components/StepIndicator";
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
import { useDeleteUploadMutation, useUploadMutation } from "@/services/upload/uploadApi";
import { flattenPlatforms } from "../platforms/utils";
import DesktopCoverCropper from "./components/DesktopCoverCropper";
import { GameCardPreview, GameDetailPreview } from "./components/GamePreviews";
import {
  BasicStep,
  DescriptionStep,
  DlcEditionStep,
  MediaStep,
  PlatformSizesStep,
  PlatformReleasesStep,
  PlayersStep,
  RelatedGamesStep,
  RelationsStep,
  ReleaseStep,
  ReviewStep,
  SocialStep,
  SummaryStep,
  VideosStep,
} from "./components/GameFormSteps";

const initialForm = {
  title: "",
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
  officialWebsite: "",
  ageRating: "",
  gameplayTime: "",
  metacriticScore: "",
  isFeatured: false,
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

const steps = [
  { key: "basic", title: "پایه" },
  { key: "relations", title: "ارتباطات" },
  { key: "platformReleases", title: "انتشار پلتفرم‌ها" },
  { key: "players", title: "بازیکنان" },
  { key: "release", title: "انتشار" },
  { key: "sizes", title: "حجم پلتفرم‌ها" },
  { key: "dlcEdition", title: "DLC / Edition" },
  { key: "social", title: "شبکه‌ها" },
  { key: "summary", title: "خلاصه" },
  { key: "review", title: "نقد و بررسی" },
  { key: "description", title: "توضیح کامل" },
  { key: "media", title: "رسانه" },
  { key: "videos", title: "ویدیوها" },
  { key: "relatedGames", title: "بازی‌های مشابه" },
];

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
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [coverPreview, setCoverPreview] = useState("");
  const [cardDesktopCoverPreview, setCardDesktopCoverPreview] = useState("");
  const [cardMobileCoverPreview, setCardMobileCoverPreview] = useState("");
  const [desktopCoverPreview, setDesktopCoverPreview] = useState("");
  const [desktopCoverCropFile, setDesktopCoverCropFile] = useState(null);
  const [galleryPreview, setGalleryPreview] = useState([]);
  const [trailerVideoPreview, setTrailerVideoPreview] = useState("");
  const [trailerThumbnailPreview, setTrailerThumbnailPreview] = useState("");
  const [isDesktopPreviewOpen, setIsDesktopPreviewOpen] = useState(false);
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
  const platforms = useMemo(() => flattenPlatforms(platformsData?.data || []), [platformsData]);
  const collections = collectionsData?.data || [];
  const isSaving = createState.isLoading || updateState.isLoading;
  const isUploadingVideo = videoUploadState.trailerVideo;
  const isLastStep = currentStep === steps.length - 1;
  const titleIsValid = Boolean(form.title.trim());
  const categoryIsValid = Boolean(form.category);
  const canGoNext =
    steps[currentStep].key === "basic"
      ? titleIsValid
      : steps[currentStep].key === "relations"
        ? categoryIsValid
        : steps[currentStep].key === "videos"
          ? !isUploadingVideo
          : true;

  const categoryOptions = useMemo(() => categories.map((item) => ({ label: item.name, value: item._id })), [categories]);
  const genreOptions = useMemo(() => genres.map((item) => ({ label: item.name, value: item._id })), [genres]);
  const companyOptions = useMemo(() => companies.map((item) => ({ label: item.name, value: item._id })), [companies]);
  const tagOptions = useMemo(() => tags.map((item) => ({ label: item.name, value: item._id })), [tags]);
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

    setForm({
      ...initialForm,
      title: game.title || "",
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
      officialWebsite: game.officialWebsite || "",
      ageRating: normalizeOptionValue(game.ageRating, ageRatingOptions),
      gameplayTime: game.gameplayTime || "",
      metacriticScore: game.metacriticScore ?? "",
      isFeatured: Boolean(game.isFeatured),
      socialLinks: Array.isArray(game.socialLinks) ? game.socialLinks : [],
      trailerVideo: game.trailerVideo?.url ? game.trailerVideo : null,
      trailerThumbnail: null,
      patchTitle: game.patchTitle || "",
      patchImage: null,
      cover: null,
      cardDesktopCover: null,
      cardMobileCover: null,
      desktopCover: null,
      gallery: [],
    });
    setCoverPreview(game.cover?.url || "");
    setCardDesktopCoverPreview(game.cardDesktopCover?.url || game.cover?.url || "");
    setCardMobileCoverPreview(game.cardMobileCover?.url || game.cover?.url || "");
    setDesktopCoverPreview(game.desktopCover?.url || "");
    setGalleryPreview((game.gallery || []).map((item) => ({ url: item.url, type: item.type })));
    setTrailerVideoPreview(game.trailerVideo?.url || "");
    setTrailerThumbnailPreview(game.trailerThumbnail?.url || "");
  }, [gameData]);

  const completedSteps = steps.reduce((acc, step, index) => {
    acc[index + 1] = index < currentStep;
    return acc;
  }, {});

  const invalidSteps = {
    1: currentStep >= 0 && !titleIsValid,
    2: currentStep >= 1 && !categoryIsValid,
  };

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
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

  const goToStep = (step) => {
    const targetIndex = step - 1;

    if (steps[currentStep].key === "videos" && targetIndex !== currentStep && isUploadingVideo) {
      toast.error("تا پایان آپلود ویدئوها صبر کنید", { id: "game-video-upload" });
      return;
    }

    if (targetIndex > 0 && !titleIsValid) {
      toast.error("عنوان بازی را وارد کنید", { id: "game-step" });
      setCurrentStep(0);
      return;
    }

    if (targetIndex > 1 && !categoryIsValid) {
      toast.error("دسته‌بندی بازی را انتخاب کنید", { id: "game-step" });
      setCurrentStep(1);
      return;
    }

    setCurrentStep(targetIndex);
  };

  const goToNextStep = () => {
    if (steps[currentStep].key === "videos" && isUploadingVideo) {
      toast.error("تا پایان آپلود ویدئوها صبر کنید", { id: "game-video-upload" });
      return;
    }

    if (!canGoNext) {
      toast.error(steps[currentStep].key === "basic" ? "عنوان بازی را وارد کنید" : "دسته‌بندی بازی را انتخاب کنید", { id: "game-step" });
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const buildFormData = () => {
    const formData = new FormData();
    const arrayFields = [
      "genres",
      "developers",
      "publishers",
      "tags",
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
      ...new Set((form.platformReleases || []).map((item) => item.platform).filter(Boolean)),
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
        (Array.isArray(value) ? value : []).forEach((file) => {
          if (file instanceof File) formData.append("gallery", file);
        });
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

    if (!isLastStep) {
      goToNextStep();
      return;
    }

    if (isUploadingVideo) {
      toast.error("تا پایان آپلود ویدئوها صبر کنید", { id: "game-video-upload" });
      return;
    }

    if (!titleIsValid || !categoryIsValid) {
      toast.error(!titleIsValid ? "عنوان بازی را وارد کنید" : "دسته‌بندی بازی را انتخاب کنید", { id: "save-game" });
      setCurrentStep(!titleIsValid ? 0 : 1);
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

  const renderStep = () => {
    switch (steps[currentStep].key) {
      case "basic":
        return (
          <BasicStep
            cardDesktopCoverPreview={cardDesktopCoverPreview}
            cardMobileCoverPreview={cardMobileCoverPreview}
            coverPreview={coverPreview}
            desktopCoverPreview={desktopCoverPreview}
            form={form}
            onChange={handleChange}
            setCardDesktopCoverPreview={setCardDesktopCoverPreview}
            setCardMobileCoverPreview={setCardMobileCoverPreview}
            setCoverPreview={setCoverPreview}
            setDesktopCoverCropFile={setDesktopCoverCropFile}
            setForm={setForm}
          />
        );
      case "relations":
        return (
          <RelationsStep
            categoryOptions={categoryOptions}
            companyOptions={companyOptions}
            collectionOptions={collectionOptions}
            form={form}
            genreOptions={genreOptions}
            onChange={handleChange}
            setArrayField={setArrayField}
            tagOptions={tagOptions}
          />
        );
      case "platformReleases":
        return <PlatformReleasesStep form={form} platformOptions={platformOptions} setArrayField={setArrayField} />;
      case "players":
        return (
          <PlayersStep
            form={form}
            offlinePlayerOptions={offlinePlayerOptions}
            onChange={handleChange}
            setArrayField={setArrayField}
          />
        );
      case "release":
        return <ReleaseStep ageRatingOptions={ageRatingOptions} form={form} onChange={handleChange} setForm={setForm} />;
      case "sizes":
        return <PlatformSizesStep form={form} platformOptions={platformOptions} setArrayField={setArrayField} />;
      case "dlcEdition":
        return <DlcEditionStep form={form} onChange={handleChange} setArrayField={setArrayField} />;
      case "social":
        return <SocialStep form={form} setArrayField={setArrayField} />;
      case "summary":
        return <SummaryStep form={form} onChange={handleChange} />;
      case "review":
        return <ReviewStep form={form} onChange={handleChange} setArrayField={setArrayField} />;
      case "description":
        return <DescriptionStep form={form} setForm={setForm} />;
      case "media":
        return <MediaStep galleryPreview={galleryPreview} setForm={setForm} setGalleryPreview={setGalleryPreview} />;
      case "videos":
        return (
          <VideosStep
            isTrailerVideoUploading={videoUploadState.trailerVideo}
            onVideoUpload={handleVideoUpload}
            setForm={setForm}
            setTrailerThumbnailPreview={setTrailerThumbnailPreview}
            trailerThumbnailPreview={trailerThumbnailPreview}
            trailerVideoPreview={trailerVideoPreview}
          />
        );
      case "relatedGames":
        return <RelatedGamesStep form={form} relatedGameOptions={relatedGameOptions} setArrayField={setArrayField} />;
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

  return (
    <ControlPanel>
      <section className="mx-auto max-w-[1800px] space-y-6">
        <div className="flex items-center justify-between rounded-2xl border border-zinc-700 bg-black/80 p-5">
          <div>
            <p className="text-xs text-zinc-400">مدیریت محتوای بازی‌ها</p>
            <h1 className="mt-1 text-2xl font-bold text-white">{isEdit ? "ویرایش بازی" : "افزودن بازی"}</h1>
          </div>
          <Link className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-white hover:text-white" to="/games">
            بازگشت به لیست
          </Link>
        </div>

        <form className="space-y-5 rounded-2xl border border-zinc-700 bg-zinc-950 p-5" onSubmit={handleSubmit}>
          {isLoadingGame ? (
            <div className="rounded-xl border border-zinc-800 bg-black px-4 py-8 text-center text-sm text-zinc-500">در حال دریافت...</div>
          ) : (
            <>
              <div className="sticky top-16 z-20 rounded-xl border border-gray-200 bg-white/95 p-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
                <StepIndicator completedSteps={completedSteps} currentStep={currentStep + 1} invalidSteps={invalidSteps} onStepClick={goToStep} totalSteps={steps.length} />
              </div>
              <div className="grid gap-5 xl:grid-cols-[minmax(460px,660px)_minmax(260px,340px)_minmax(420px,1fr)]" dir="ltr">
                <div className="space-y-5 rounded-xl border border-zinc-800 bg-black p-4" dir="rtl">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-500">فرم اطلاعات بازی</span>
                    <span className="rounded-full border border-zinc-800 px-2 py-1 text-[10px] text-zinc-500">
                      {currentStep + 1} / {steps.length}
                    </span>
                  </div>
                  {renderStep()}
                  <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
                    {isLastStep ? (
                      <SendButton
                        isLoading={isSaving || isUploadingVideo}
                        label={isEdit ? "ذخیره بازی" : "ثبت بازی"}
                        loadingLabel={isUploadingVideo ? "در حال آپلود ویدئو..." : "در حال ذخیره..."}
                      />
                    ) : (
                      <NavigationButton direction="next" disabled={!canGoNext || isSaving} onClick={goToNextStep} />
                    )}
                    <NavigationButton direction="prev" disabled={currentStep === 0 || isSaving} onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))} />
                  </div>
                </div>

                <GameCardPreview coverPreview={cardDesktopCoverPreview || coverPreview} form={form} genres={selectedGenreLabels} platforms={selectedPlatformLabels} />

                <div className="sticky top-24 flex flex-col items-center space-y-3 self-start" dir="rtl">
                  <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-black px-3 py-2">
                    <button
                      className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-xs text-zinc-300 transition hover:border-white hover:text-white"
                      onClick={() => setIsDesktopPreviewOpen(true)}
                      type="button"
                    >
                      <span className="text-base leading-none">?</span>
                    </button>
                  </div>
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
                    variant="mobile"
                  />
                </div>
              </div>
            </>
          )}
        </form>

        {isDesktopPreviewOpen ? (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur" dir="rtl">
            <button
              aria-label="بستن پیش‌نمایش دسکتاپ"
              className="fixed left-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-black/70 text-white backdrop-blur transition hover:border-white"
              onClick={() => setIsDesktopPreviewOpen(false)}
              type="button"
            >
              <Cross />
            </button>
            <div className="mx-auto w-full max-w-7xl px-4 pb-8">
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
              />
            </div>
          </div>
        ) : null}

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

