import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ControlPanel from "../ControlPanel";
import DisplayImages from "@/components/shared/DisplayImages";
import Cross from "@/components/icons/Cross";
import NavigationButton from "@/components/shared/button/NavigationButton";
import SendButton from "@/components/shared/button/SendButton";
import SocialLinksInput from "@/components/shared/SocialLinksInput";
import FormPageBuilder from "@/components/shared/input/FormPageBuilder";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import StepIndicator from "../categories/components/StepIndicator";
import ThumbnailUpload from "@/components/shared/ThumbnailUpload";
import { MultiSelectDropdown, SingleSelectDropdown } from "@/components/shared/Dropdown";
import { useGetCategoriesQuery } from "../../services/category/categoryApi";
import { useGetCompaniesQuery } from "../../services/companyApi";
import { useGetGenresQuery } from "../../services/genreApi";
import { useGetTagsQuery } from "../../services/tagApi";
import {
  useCreateGameMutation,
  useGetGameQuery,
  useUpdateGameMutation,
} from "../../services/gameApi";
import {
  ageRatingOptions,
  editionOptions,
  gameModeOptions,
  languageOptions,
  launcherOptions,
  platformOptions,
  regionOptions,
} from "./gameOptions";

const initialForm = {
  title: "",
  shortDescription: "",
  description: "",
  category: "",
  genres: [],
  developers: [],
  publishers: [],
  tags: [],
  platforms: [],
  gameModes: [],
  languages: [],
  regions: [],
  launcher: "",
  edition: "استاندارد",
  releaseDate: "",
  officialWebsite: "",
  ageRating: "",
  gameplayTime: "",
  metacriticScore: "",
  isFeatured: false,
  socialLinks: [],
  trailerUrl: "",
  trailerVideo: null,
  gameplayVideo: null,
  cover: null,
  cardDesktopCover: null,
  cardMobileCover: null,
  desktopCover: null,
  gallery: [],
};

const steps = [
  { key: "basic", title: "اصلی" },
  { key: "relations", title: "ارتباط‌ها" },
  { key: "platforms", title: "پلتفرم" },
  { key: "release", title: "انتشار" },
  { key: "social", title: "شبکه‌ها" },
  { key: "summary", title: "خلاصه" },
  { key: "description", title: "توضیح کامل" },
  { key: "media", title: "رسانه" },
  { key: "videos", title: "ویدئو" },
];

function toIdArray(value) {
  return (value || []).map((item) => item?._id || item).filter(Boolean);
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseInputDate(value) {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

function normalizeOptionValue(value, options, fallback = "") {
  if (!value) return fallback;
  const selectedOption = options.find((option) => {
    return option.value === value || option.legacyValues?.includes(value);
  });

  return selectedOption?.value || value;
}

function TextField({ label, name, onChange, placeholder, type = "text", value, dir }) {
  return (
    <label className="space-y-2">
      <span className="text-sm text-zinc-300">{label}</span>
      <input
        className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-white outline-none transition focus:border-white"
        dir={dir}
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}

function TextareaField({ label, name, onChange, rows = 4, value }) {
  return (
    <label className="space-y-2">
      <span className="text-sm text-zinc-300">{label}</span>
      <textarea
        className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-white outline-none transition focus:border-white"
        name={name}
        onChange={onChange}
        rows={rows}
        value={value}
      />
    </label>
  );
}

function DatePickerField({ label, onChange, value }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = parseInputDate(value);

  return (
    <div className="space-y-2">
      <span className="text-sm text-zinc-300">{label}</span>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className="flex min-h-12 w-full items-center justify-between rounded-xl border border-zinc-800 bg-black px-3 py-3 text-right text-sm text-white outline-none transition hover:border-zinc-600 focus:border-white"
            type="button"
          >
            <span>{selectedDate ? selectedDate.toLocaleDateString("fa-IR") : "انتخاب تاریخ"}</span>
            <span className="text-xs text-zinc-500">{value || ""}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto border-zinc-800 bg-zinc-950 p-0">
          <Calendar
            mode="single"
            onSelect={(date) => {
              if (!date) return;
              onChange?.(formatDateForInput(date));
              setIsOpen(false);
            }}
            selected={selectedDate}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function stripHtml(value) {
  return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-zinc-800/20 ${className}`} />;
}

function GameCardPreview({ coverPreview, form }) {
  const title = form.title.trim();

  return (
    <div className="sticky  flex justify-center top-24 space-y-4" dir="rtl">
        <div className="w-full max-w-[230px] space-y-2" dir="ltr">
          <div className="aspect-square overflow-hidden rounded-xl bg-zinc-900">
            {coverPreview ? (
              <img alt={title} className="h-full w-full object-cover" src={coverPreview} />
            ) : (
              <SkeletonBlock className="h-full w-full rounded-xl" />
            )}
          </div>
          {title ? (
            <h3 className="line-clamp-2 text-left text-md font-bold leading-5 text-white">{title}</h3>
          ) : (
            <SkeletonBlock className="h-4 w-2/3" />
          )}
        </div>
    </div>
  );
}

function GameDetailPreview({ cardMobileCoverPreview = "", coverPreview, desktopCoverPreview = "", form, galleryPreview, genres, isSticky = true, platforms, variant = "desktop" }) {
  const isMobile = variant === "mobile";
  const heroImage =
    (isMobile ? cardMobileCoverPreview || coverPreview : desktopCoverPreview || coverPreview) ||
    galleryPreview[0]?.url ||
    "";
  const title = form.title.trim();
  const description = stripHtml(form.description) || form.shortDescription.trim();
  const specs = [
    ["پلتفرم", platforms.join("، ")],
    ["نسخه", form.edition],
    ["سرویس انتشار", form.launcher],
    ["تاریخ انتشار", form.releaseDate ? parseInputDate(form.releaseDate)?.toLocaleDateString("fa-IR") : ""],
    ["رده سنی", form.ageRating],
    ["زمان گیم‌پلی", form.gameplayTime],
    ["امتیاز متاکریتیک", form.metacriticScore],
    ["ژانرها", genres.join("، ")],
  ];

  return (
    <div
      className={`overflow-hidden border border-zinc-800 bg-zinc-950 ${
        isMobile
          ? "no-scrollbar max-h-[720px] w-full max-w-[360px] overflow-y-auto"
          : `${isSticky ? "sticky top-24" : ""}`
      }`}
      dir="rtl"
    >
      <div className={`relative bg-zinc-900 ${isMobile ? "h-52" : "h-64"}`}>
        {heroImage ? (
          <img
            alt={title}
            className="h-full w-full object-cover"
            src={heroImage}
          />
        ) : (
          <SkeletonBlock className="h-full w-full rounded-none" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
        <div
          className={`absolute rounded-xl border border-white/10 bg-white/90 text-zinc-950 shadow-xl ${
            isMobile ? "inset-x-3 bottom-3 p-3" : "bottom-4 left-4 w-72 p-4"
          }`}
        >
          {title ? (
            <h3 className={`line-clamp-2 font-black ${isMobile ? "text-base" : "text-lg"}`}>
              {title}
            </h3>
          ) : (
            <SkeletonBlock className="h-6 w-3/4 bg-zinc-300/25" />
          )}
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px]">
            {[form.edition, form.ageRating, form.metacriticScore].map((value, index) => (
              <span className="rounded-lg bg-zinc-100 p-2" key={index}>
                {value || <SkeletonBlock className="mx-auto h-3 w-10 bg-zinc-300/25" />}
              </span>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button className="flex-1 rounded-lg bg-red-500 px-3 py-2 text-xs font-bold text-white" type="button">
              افزودن به سبد
            </button>
            <button className="flex-1 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-bold text-white" type="button">
              مشاهده ویدئو
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-zinc-800 bg-black px-4 py-3">
        <div className={`flex text-xs text-zinc-400 ${isMobile ? "gap-4 overflow-x-auto whitespace-nowrap" : "gap-6"}`}>
          <span>معرفی</span>
          <span>نقد و بررسی</span>
          <span className="border-b-2 border-red-500 pb-2 text-white">مشخصات</span>
          <span>دیدگاه‌ها</span>
        </div>
      </div>

      <div className={`space-y-5 ${isMobile ? "p-3" : "p-4"}`}>
        {description ? (
          <p className="line-clamp-4 text-sm leading-7 text-zinc-300">{description}</p>
        ) : (
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-11/12" />
            <SkeletonBlock className="h-4 w-3/4" />
          </div>
        )}
        <div className="overflow-hidden rounded-xl border border-zinc-800">
          {specs.map(([label, value]) => (
            <div
              className={`grid border-b border-zinc-800 last:border-b-0 ${
                isMobile ? "grid-cols-[96px_1fr]" : "grid-cols-[120px_1fr]"
              }`}
              key={label}
            >
              <div className="bg-black px-3 py-3 text-xs text-zinc-500">{label}</div>
              <div className="px-3 py-3 text-xs text-zinc-200">
                {value ? value : <SkeletonBlock className="h-4 w-20" />}
              </div>
            </div>
          ))}
        </div>
        <div>
          <p className="mb-3 text-xs font-bold text-zinc-500">محصولات مرتبط</p>
          <div className={`grid gap-3 ${isMobile ? "grid-cols-2" : "grid-cols-4"}`}>
            {[0, 1, 2, 3].map((item) => (
              <div className="h-24 rounded-xl border border-zinc-800 bg-black" key={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopCoverCropper({ file, onCancel, onCrop }) {
  const imageRef = useRef(null);
  const dragRef = useRef(null);
  const [source, setSource] = useState("");
  const [imageBox, setImageBox] = useState({ width: 0, height: 0 });
  const [crop, setCrop] = useState({ x: 40, y: 40, width: 260, height: 150 });

  useEffect(() => {
    if (!file) {
      setSource("");
      return;
    }

    const url = URL.createObjectURL(file);
    setSource(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const handlePointerMove = (event) => {
      const drag = dragRef.current;
      if (!drag) return;

      event.preventDefault();
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;

      setCrop(() => {
        const minSize = 60;
        const box = imageBox;
        let next = { ...drag.startCrop };

        if (drag.type === "move") {
          next.x = Math.min(Math.max(0, drag.startCrop.x + dx), box.width - drag.startCrop.width);
          next.y = Math.min(Math.max(0, drag.startCrop.y + dy), box.height - drag.startCrop.height);
        }

        if (drag.type.includes("e")) {
          next.width = Math.min(Math.max(minSize, drag.startCrop.width + dx), box.width - drag.startCrop.x);
        }
        if (drag.type.includes("s")) {
          next.height = Math.min(Math.max(minSize, drag.startCrop.height + dy), box.height - drag.startCrop.y);
        }
        if (drag.type.includes("w")) {
          const nextX = Math.min(
            Math.max(0, drag.startCrop.x + dx),
            drag.startCrop.x + drag.startCrop.width - minSize
          );
          next.width = drag.startCrop.width + (drag.startCrop.x - nextX);
          next.x = nextX;
        }
        if (drag.type.includes("n")) {
          const nextY = Math.min(
            Math.max(0, drag.startCrop.y + dy),
            drag.startCrop.y + drag.startCrop.height - minSize
          );
          next.height = drag.startCrop.height + (drag.startCrop.y - nextY);
          next.y = nextY;
        }

        return next;
      });
    };

    const handlePointerUp = () => {
      dragRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [imageBox]);

  const handleImageLoad = () => {
    const image = imageRef.current;
    if (!image) return;

    const { width, height } = image.getBoundingClientRect();
    setImageBox({ width, height });

    const cropWidth = width * 0.82;
    const cropHeight = Math.min(height * 0.7, cropWidth * 0.58);
    setCrop({
      x: (width - cropWidth) / 2,
      y: (height - cropHeight) / 2,
      width: cropWidth,
      height: cropHeight,
    });
  };

  const startDrag = (event, type) => {
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = {
      type,
      startX: event.clientX,
      startY: event.clientY,
      startCrop: crop,
    };
  };

  const handleCrop = async () => {
    const image = imageRef.current;
    if (!image || !imageBox.width || !imageBox.height) return;

    const scaleX = image.naturalWidth / imageBox.width;
    const scaleY = image.naturalHeight / imageBox.height;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(crop.width * scaleX);
    canvas.height = Math.round(crop.height * scaleY);

    const context = canvas.getContext("2d");
    context.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const croppedFile = new File([blob], `desktop-${file.name.replace(/\.[^.]+$/, "")}.webp`, {
          type: "image/webp",
        });
        onCrop(croppedFile, URL.createObjectURL(blob));
      },
      "image/webp",
      0.92
    );
  };

  if (!file || !source) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur" dir="rtl">
      <div className="w-full max-w-5xl overflow-hidden border border-zinc-800 bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
          <div>
            <p className="text-xs text-zinc-500">تصویر جزئیات دسکتاپ</p>
            <h2 className="text-base font-bold text-white">برش تصویر</h2>
          </div>
          <button
            aria-label="بستن crop"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 text-zinc-300 transition hover:border-white hover:text-white"
            onClick={onCancel}
            type="button"
          >
            <Cross />
          </button>
        </div>

        <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="no-scrollbar max-h-[72vh] overflow-auto bg-black">
            <div className="relative mx-auto w-fit select-none">
              <img
                alt="mobile crop"
                className="block max-h-[72vh] max-w-full"
                onLoad={handleImageLoad}
                ref={imageRef}
                src={source}
              />
              {imageBox.width ? (
                <>
                  <div className="pointer-events-none absolute inset-0 bg-black/45" />
                  <div
                    className="absolute cursor-move border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
                    onPointerDown={(event) => startDrag(event, "move")}
                    style={{
                      height: crop.height,
                      right: imageBox.width - crop.x - crop.width,
                      top: crop.y,
                      width: crop.width,
                    }}
                  >
                    <div className="grid h-full w-full grid-cols-3 grid-rows-3">
                      {Array.from({ length: 9 }).map((_, index) => (
                        <span className="border border-white/25" key={index} />
                      ))}
                    </div>
                    {["nw", "ne", "sw", "se"].map((handle) => (
                      <button
                        aria-label={`resize ${handle}`}
                        className={`absolute h-5 w-5 rounded-full border-2 border-white bg-red-500 ${
                          handle.includes("n") ? "-top-3" : "-bottom-3"
                        } ${handle.includes("w") ? "-left-3 cursor-nwse-resize" : "-right-3 cursor-nesw-resize"}`}
                        key={handle}
                        onPointerDown={(event) => startDrag(event, handle)}
                        type="button"
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4">
            <div className="space-y-3 text-sm text-zinc-400">
              {/* <p>کادر سفید را جابه‌جا کن یا از گوشه‌ها اندازه آن را تغییر بده.</p>
              <p>فایل نهایی واقعاً crop می‌شود و همان نسخه‌ی برش‌خورده برای جزئیات دسکتاپ آپلود خواهد شد.</p> */}
            </div>
            <div className="grid gap-2">
              <button
                className="rounded-lg bg-red-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-400"
                onClick={handleCrop}
                type="button"
              >
                ثبت 
              </button>
              <button
                className="rounded-lg border border-zinc-800 px-4 py-3 text-sm text-zinc-300 transition hover:border-white hover:text-white"
                onClick={onCancel}
                type="button"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
  const [gameplayVideoPreview, setGameplayVideoPreview] = useState("");
  const [isDesktopPreviewOpen, setIsDesktopPreviewOpen] = useState(false);

  const { data: gameData, isLoading: isLoadingGame } = useGetGameQuery(id, {
    skip: !isEdit || !id,
  });
  const { data: categoriesData } = useGetCategoriesQuery({ page: 1, limit: 200 });
  const { data: genresData } = useGetGenresQuery({ page: 1, limit: 200 });
  const { data: companiesData } = useGetCompaniesQuery({ page: 1, limit: 200 });
  const { data: tagsData } = useGetTagsQuery({ page: 1, limit: 200 });
  const [createGame, createState] = useCreateGameMutation();
  const [updateGame, updateState] = useUpdateGameMutation();

  const categories = categoriesData?.data || [];
  const genres = genresData?.data || [];
  const companies = companiesData?.data || [];
  const tags = tagsData?.data || [];
  const isSaving = createState.isLoading || updateState.isLoading;
  const isLastStep = currentStep === steps.length - 1;
  const titleIsValid = Boolean(form.title.trim());
  const categoryIsValid = Boolean(form.category);
  const canGoNext =
    steps[currentStep].key === "basic"
      ? titleIsValid
      : steps[currentStep].key === "relations"
        ? categoryIsValid
        : true;

  const categoryOptions = useMemo(
    () => categories.map((item) => ({ label: item.name, value: item._id })),
    [categories]
  );
  const genreOptions = useMemo(
    () => genres.map((item) => ({ label: item.name, value: item._id })),
    [genres]
  );
  const companyOptions = useMemo(
    () => companies.map((item) => ({ label: item.name, value: item._id })),
    [companies]
  );
  const tagOptions = useMemo(
    () => tags.map((item) => ({ label: item.name, value: item._id })),
    [tags]
  );

  useEffect(() => {
    const game = gameData?.data;
    if (!game) return;

    setForm({
      ...initialForm,
      title: game.title || "",
      shortDescription: game.shortDescription || "",
      description: game.description || "",
      category: game.category?._id || game.category || "",
      genres: toIdArray(game.genres),
      developers: toIdArray(game.developers),
      publishers: toIdArray(game.publishers),
      tags: toIdArray(game.tags),
      platforms: game.platforms || [],
      gameModes: game.gameModes || [],
      languages: game.languages || [],
      regions: game.regions || [],
      launcher: normalizeOptionValue(game.launcher, launcherOptions),
      edition: normalizeOptionValue(game.edition, editionOptions, "استاندارد"),
      releaseDate: formatDate(game.releaseDate),
      officialWebsite: game.officialWebsite || "",
      ageRating: normalizeOptionValue(game.ageRating, ageRatingOptions),
      gameplayTime: game.gameplayTime || "",
      metacriticScore: game.metacriticScore ?? "",
      isFeatured: Boolean(game.isFeatured),
      socialLinks: Array.isArray(game.socialLinks) ? game.socialLinks : [],
      trailerUrl: game.trailerUrl || "",
      trailerVideo: null,
      gameplayVideo: null,
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
    setGameplayVideoPreview(game.gameplayVideo?.url || "");
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

  const goToStep = (step) => {
    const targetIndex = step - 1;

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
    if (!canGoNext) {
      toast.error(
        steps[currentStep].key === "basic"
          ? "عنوان بازی را وارد کنید"
          : "دسته‌بندی بازی را انتخاب کنید",
        { id: "game-step" }
      );
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
      "platforms",
      "gameModes",
      "languages",
      "regions",
      "socialLinks",
    ];

    Object.entries(form).forEach(([key, value]) => {
      if (key === "cover") {
        if (value instanceof File) formData.append("cover", value);
        return;
      }
      if (key === "cardDesktopCover") {
        if (value instanceof File) formData.append("cardDesktopCover", value);
        return;
      }
      if (key === "cardMobileCover") {
        if (value instanceof File) formData.append("cardMobileCover", value);
        return;
      }
      if (key === "desktopCover") {
        if (value instanceof File) formData.append("desktopCover", value);
        return;
      }
      if (key === "gallery") {
        (Array.isArray(value) ? value : []).forEach((file) => {
          if (file instanceof File) formData.append("gallery", file);
        });
        return;
      }
      if (key === "trailerVideo" || key === "gameplayVideo") {
        if (value instanceof File) formData.append(key, value);
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

    if (!titleIsValid || !categoryIsValid) {
      toast.error(!titleIsValid ? "عنوان بازی را وارد کنید" : "دسته‌بندی بازی را انتخاب کنید", {
        id: "save-game",
      });
      setCurrentStep(!titleIsValid ? 0 : 1);
      return;
    }

    try {
      toast.loading(isEdit ? "در حال به‌روزرسانی بازی..." : "در حال ثبت بازی...", {
        id: "save-game",
      });
      const formData = buildFormData();
      const response = isEdit
        ? await updateGame({ id, formData }).unwrap()
        : await createGame(formData).unwrap();

      toast.success(response.description || "بازی ذخیره شد", { id: "save-game" });
      navigate("/games");
    } catch (error) {
      toast.error(error?.data?.description || "ذخیره بازی انجام نشد", {
        id: "save-game",
      });
    }
  };

  const renderStep = () => {
    switch (steps[currentStep].key) {
      case "basic":
        return (
          <div className="grid gap-4">
            <TextField label="عنوان" name="title" onChange={handleChange} value={form.title} />
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-xl border border-zinc-800 bg-black p-4">
                <span className="mb-3 block text-sm text-zinc-300">تصویر کارت دسکتاپ</span>
                <ThumbnailUpload
                  name="cardDesktopCover"
                  preview={cardDesktopCoverPreview}
                  setThumbnail={(file) => {
                    setForm((prev) => ({
                      ...prev,
                      cardDesktopCover: file,
                      cover: prev.cover || file,
                    }));
                  }}
                  setThumbnailPreview={(preview) => {
                    setCardDesktopCoverPreview(preview);
                    if (!coverPreview) setCoverPreview(preview);
                  }}
                  title="انتخاب کارت دسکتاپ"
                />
              </div>
              <div className="rounded-xl border border-zinc-800 bg-black p-4">
                <span className="mb-3 block text-sm text-zinc-300">تصویر کارت موبایل</span>
                <ThumbnailUpload
                  name="cardMobileCover"
                  preview={cardMobileCoverPreview}
                  setThumbnail={(file) => setForm((prev) => ({ ...prev, cardMobileCover: file }))}
                  setThumbnailPreview={setCardMobileCoverPreview}
                  title="انتخاب کارت موبایل"
                />
              </div>
              <div className="rounded-xl border border-zinc-800 bg-black p-4">
                <span className="mb-3 block text-sm text-zinc-300">تصویر جزئیات دسکتاپ</span>
                <ThumbnailUpload
                  name="desktopCover"
                  preview={desktopCoverPreview}
                  setThumbnail={(file) => {
                    if (file instanceof File) setDesktopCoverCropFile(file);
                  }}
                  setThumbnailPreview={() => {}}
                  title="انتخاب و crop"
                />
                <p className="mt-3 text-xs leading-6 text-zinc-500">
                  بعد از انتخاب تصویر، ابزار crop باز می‌شود.
                </p>
              </div>
            </div>
          </div>
        );
      case "relations":
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <SingleSelectDropdown label="دسته‌بندی" name="category" onChange={handleChange} options={categoryOptions} value={form.category} />
            <MultiSelectDropdown label="ژانرها" onChange={(value) => setArrayField("genres", value)} options={genreOptions} value={form.genres} />
            <MultiSelectDropdown label="سازنده‌ها" onChange={(value) => setArrayField("developers", value)} options={companyOptions} value={form.developers} />
            <MultiSelectDropdown label="ناشرها" onChange={(value) => setArrayField("publishers", value)} options={companyOptions} value={form.publishers} />
            <MultiSelectDropdown label="تگ‌های سئو" onChange={(value) => setArrayField("tags", value)} options={tagOptions} value={form.tags} />
          </div>
        );
      case "platforms":
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <MultiSelectDropdown label="پلتفرم‌ها" onChange={(value) => setArrayField("platforms", value)} options={platformOptions} value={form.platforms} />
            <MultiSelectDropdown label="حالت‌های بازی" onChange={(value) => setArrayField("gameModes", value)} options={gameModeOptions} value={form.gameModes} />
            <MultiSelectDropdown label="زبان‌ها" onChange={(value) => setArrayField("languages", value)} options={languageOptions} value={form.languages} />
            <MultiSelectDropdown label="ریجن‌ها" onChange={(value) => setArrayField("regions", value)} options={regionOptions} value={form.regions} />
            <SingleSelectDropdown label="سرویس / پلتفرم انتشار" name="launcher" onChange={handleChange} options={launcherOptions} value={form.launcher} />
            <SingleSelectDropdown label="نسخه" name="edition" onChange={handleChange} options={editionOptions} value={form.edition} />
          </div>
        );
      case "release":
        return (
          <div className="grid gap-4 md:grid-cols-3">
            <DatePickerField
              label="تاریخ انتشار"
              onChange={(value) => setForm((prev) => ({ ...prev, releaseDate: value }))}
              value={form.releaseDate}
            />
            <SingleSelectDropdown label="رده سنی" name="ageRating" onChange={handleChange} options={ageRatingOptions} value={form.ageRating} />
            <TextField label="زمان تقریبی گیم‌پلی" name="gameplayTime" onChange={handleChange} placeholder="مثلا 25 ساعت" value={form.gameplayTime} />
            <TextField label="امتیاز متاکریتیک" name="metacriticScore" onChange={handleChange} type="number" value={form.metacriticScore} />
            <TextField dir="ltr" label="وب‌سایت رسمی" name="officialWebsite" onChange={handleChange} value={form.officialWebsite} />
            <label className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-zinc-300 md:col-span-3">
              <input checked={form.isFeatured} className="h-4 w-4 accent-white" name="isFeatured" onChange={handleChange} type="checkbox" />
              بازی ویژه
            </label>
          </div>
        );
      case "summary":
        return (
          <div className="grid gap-4">
            <TextareaField label="خلاصه" name="shortDescription" onChange={handleChange} rows={4} value={form.shortDescription} />
          </div>
        );
      case "social":
        return (
          <SocialLinksInput
            label="شبکه‌های اجتماعی بازی"
            onChange={(value) => setArrayField("socialLinks", value)}
            value={form.socialLinks}
          />
        );
      case "description":
        return (
          <div className="grid gap-4">
            <FormPageBuilder
              label="توضیح مفصل"
              onChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
              value={form.description}
            />
          </div>
        );
      case "media":
        return (
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="rounded-xl border border-zinc-800 bg-black p-4">
                <span className="mb-3 block text-sm text-zinc-300">گالری</span>
                <ThumbnailUpload
                  multiple
                  name="gallery"
                  preview=""
                  setThumbnail={(files) => setForm((prev) => ({ ...prev, gallery: files || [] }))}
                  setThumbnailPreview={(preview) => {
                    if (preview) setGalleryPreview((prev) => [...prev, { url: preview, type: "image" }]);
                  }}
                  title="انتخاب تصاویر گالری"
                />
                {galleryPreview.length ? <DisplayImages galleryPreview={galleryPreview} imageSize={86} /> : null}
              </div>
            </div>
          </div>
        );
      case "videos":
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-zinc-800 bg-black p-4">
                <span className="mb-3 block text-sm text-zinc-300">تریلر</span>
                <ThumbnailUpload
                  accept="video/*"
                  name="trailerVideo"
                  preview={trailerVideoPreview}
                  setThumbnail={(file) => setForm((prev) => ({ ...prev, trailerVideo: file }))}
                  setThumbnailPreview={setTrailerVideoPreview}
                  title="انتخاب ویدئوی تریلر"
                />
              </div>
              <div className="rounded-xl border border-zinc-800 bg-black p-4">
                <span className="mb-3 block text-sm text-zinc-300">گیم‌پلی</span>
                <ThumbnailUpload
                  accept="video/*"
                  name="gameplayVideo"
                  preview={gameplayVideoPreview}
                  setThumbnail={(file) => setForm((prev) => ({ ...prev, gameplayVideo: file }))}
                  setThumbnailPreview={setGameplayVideoPreview}
                  title="انتخاب ویدئوی گیم‌پلی"
                />
              </div>
            </div>
            <TextField dir="ltr" label="لینک تریلر" name="trailerUrl" onChange={handleChange} value={form.trailerUrl} />
          </div>
        );
      default:
        return null;
    }
  };

  const selectedPlatformLabels = platformOptions
    .filter((option) => form.platforms.includes(option.value))
    .map((option) => option.label);
  const selectedGenreLabels = genreOptions
    .filter((option) => form.genres.includes(option.value))
    .map((option) => option.label);

  return (
    <ControlPanel>
      <section className="mx-auto max-w-[1800px] space-y-6">
        <div className="flex items-center justify-between rounded-2xl border border-zinc-700 bg-black/80 p-5">
          <div>
            <p className="text-xs text-zinc-400">مدیریت معرفی بازی‌ها</p>
            <h1 className="mt-1 text-2xl font-bold text-white">
              {isEdit ? "ویرایش بازی" : "افزودن بازی"}
            </h1>
          </div>
          <Link
            className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-white hover:text-white"
            to="/games"
          >
            بازگشت به لیست
          </Link>
        </div>

        <form className="space-y-5 rounded-2xl border border-zinc-700 bg-zinc-950 p-5" onSubmit={handleSubmit}>
          {isLoadingGame ? (
            <div className="rounded-xl border border-zinc-800 bg-black px-4 py-8 text-center text-sm text-zinc-500">
              در حال دریافت...
            </div>
          ) : (
            <>
              <div className="sticky top-16 z-20 rounded-xl border border-gray-200 bg-white/95 p-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
                <StepIndicator
                  completedSteps={completedSteps}
                  currentStep={currentStep + 1}
                  invalidSteps={invalidSteps}
                  onStepClick={goToStep}
                  totalSteps={steps.length}
                />
              </div>
              <div className="grid gap-5 xl:grid-cols-[minmax(460px,660px)_minmax(260px,340px)_minmax(420px,1fr)]" dir="ltr">
                <div className="space-y-5 rounded-xl border border-zinc-800 bg-black p-4" dir="rtl">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-500">فرم تکمیل بازی</span>
                    <span className="rounded-full border border-zinc-800 px-2 py-1 text-[10px] text-zinc-500">
                      {currentStep + 1} / {steps.length}
                    </span>
                  </div>
                  {renderStep()}
                  <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
                    {isLastStep ? (
                      <SendButton isLoading={isSaving} label={isEdit ? "ذخیره بازی" : "ثبت بازی"} loadingLabel="در حال ذخیره..." />
                    ) : (
                      <NavigationButton direction="next" disabled={!canGoNext || isSaving} onClick={goToNextStep} />
                    )}
                    <NavigationButton
                      direction="prev"
                      disabled={currentStep === 0 || isSaving}
                      onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
                    />
                  </div>
                </div>

                <GameCardPreview
                  coverPreview={cardDesktopCoverPreview || coverPreview}
                  form={form}
                  genres={selectedGenreLabels}
                  platforms={selectedPlatformLabels}
                />

                <div className="sticky top-24 flex flex-col items-center space-y-3 self-start" dir="rtl">
                  <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-black px-3 py-2">
                    <button
                      className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-xs text-zinc-300 transition hover:border-white hover:text-white"
                      onClick={() => setIsDesktopPreviewOpen(true)}
                      type="button"
                    >
                      <span className="text-base leading-none">⛶</span>
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
                    platforms={selectedPlatformLabels}
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
                platforms={selectedPlatformLabels}
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
