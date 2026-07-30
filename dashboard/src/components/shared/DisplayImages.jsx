import React, { useEffect, useState } from "react";

function formatFileSize(size) {
  const value = Number(size || 0);
  if (!value) return "";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

function UploadOverlay({ state }) {
  if (!state) return null;

  const isUploading = state.status === "uploading";
  const progress = Math.max(0, Math.min(100, Number(state.progress || 0)));

  return (
    <>
      {(state.originalSize || state.uploadedSize) ? (
        <div className="absolute bottom-1 left-1 right-1 z-20 flex flex-wrap gap-1">
          {state.originalSize ? (
            <span className="rounded-md bg-red-600/90 px-1.5 py-0.5 text-[9px] !text-white">
              {formatFileSize(state.originalSize)}
            </span>
          ) : null}
          {state.uploadedSize ? (
            <span className="rounded-md bg-emerald-600/90 px-1.5 py-0.5 text-[9px] !text-white">
              {formatFileSize(state.uploadedSize)}
            </span>
          ) : null}
        </div>
      ) : null}

      {isUploading ? (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/45 text-white">
          <div
            className="h-8 w-8 animate-spin rounded-full"
            style={{
              background: `conic-gradient(rgb(255 255 255) ${progress * 3.6}deg, rgba(255,255,255,.24) 0deg)`,
              WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))",
              mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))",
            }}
          />
        </div>
      ) : null}
    </>
  );
}

function AltOverlay({ onChange, value }) {
  const [isOpen, setIsOpen] = useState(false);

  if (typeof onChange !== "function") return null;

  return (
    <div className="absolute bottom-1 left-1 right-1 z-50">
      {isOpen ? (
        <input
          autoFocus
          className="h-7 w-full rounded-md border border-white/70 bg-white px-2 text-[11px] font-bold text-zinc-950 outline-none shadow-lg"
          onBlur={() => setIsOpen(false)}
          onChange={(event) => onChange(event.target.value)}
          onClick={(event) => event.stopPropagation()}
          placeholder="Alt"
          value={value || ""}
        />
      ) : (
        <button
          className="h-6 w-full rounded-md bg-white/90 px-2 text-[10px] font-black text-zinc-950 shadow transition hover:bg-white"
          onClick={(event) => {
            event.stopPropagation();
            setIsOpen(true);
          }}
          type="button"
        >
          Alt
        </button>
      )}
    </div>
  );
}

function DisplayImages({ altValue = "", galleryPreview = [], imageSize = 96, className = "", onAltChange, onRemove, rounded = "square" }) {
  const [loadedMap, setLoadedMap] = useState({});
  const hasMedia = galleryPreview?.length > 0;
  const roundedClass = rounded === "square" ? "rounded-xl" : "rounded-full";

  useEffect(() => {
    setLoadedMap({});
  }, [galleryPreview]);

  const markLoaded = (key) => {
    setLoadedMap((prev) => {
      if (prev[key]) return prev;
      return { ...prev, [key]: true };
    });
  };

  return (
    <div className={`mt-4 flex flex-row gap-x-2 overflow-x-auto ${className}`.trim()}>
      {!hasMedia ? (
        <div
          className={`relative mb-2 flex-shrink-0 overflow-hidden border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 ${roundedClass} shine-effect`}
          style={{
            width: imageSize,
            height: imageSize,
            minWidth: imageSize,
            minHeight: imageSize,
          }}
        >
          <div className={`absolute inset-[4%] animate-pulse ${roundedClass} bg-white/50 dark:bg-white/20`} />
        </div>
      ) : (
        galleryPreview.map((item, index) => {
          const isVideo =
            item.type === "video" || /\.(mp4|webm|ogg)$/i.test(item.url || "");
          const mediaKey = `${item?.url || "media"}-${index}`;
          const isLoaded = Boolean(loadedMap[mediaKey]);
          const uploadState = item.uploadState;

          return (
            <div
              key={mediaKey}
              className={`group relative mb-2 flex-shrink-0 overflow-hidden border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 ${roundedClass} ${
                !isLoaded ? "shine-effect" : ""
              }`}
              style={{
                width: imageSize,
                height: imageSize,
                minWidth: imageSize,
                minHeight: imageSize,
              }}
            >
              {!isLoaded ? (
                <div className={`absolute inset-[4%] animate-pulse ${roundedClass} bg-white/50 dark:bg-white/20`} />
              ) : null}

              {isVideo ? (
                <video
                  className={`h-full w-full ${roundedClass} object-cover transition-opacity duration-200 ${
                    isLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  controls
                  height={imageSize}
                  onCanPlay={() => markLoaded(mediaKey)}
                  onLoadedData={() => markLoaded(mediaKey)}
                  poster={item.poster || ""}
                  src={item.url}
                  width={imageSize}
                >
                  مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                </video>
              ) : (
                <img
                  alt="gallery"
                  className={`h-full w-full ${roundedClass} object-cover`}
                  height={imageSize}
                  onLoad={() => markLoaded(mediaKey)}
                  src={item.url}
                  width={imageSize}
                />
              )}
              <UploadOverlay state={uploadState} />
              <AltOverlay onChange={onAltChange} value={item.alt || altValue} />
              {typeof onRemove === "function" ? (
                <button
                  aria-label="حذف تصویر"
                  className="absolute left-2 top-2 z-40 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/90 !text-white opacity-0 shadow-lg transition hover:bg-red-500 group-hover:opacity-100 [&_svg]:!text-white [&_svg]:stroke-white"
                  onClick={() => onRemove(item, index)}
                  type="button"
                >
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "#fff" }} viewBox="0 0 24 24">
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M6 6l1 16h10l1-16" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                  </svg>
                </button>
              ) : null}
            </div>
          );
        })
      )}
    </div>
  );
}

export default DisplayImages;
