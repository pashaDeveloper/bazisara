import React, { useEffect, useState } from "react";

function DisplayImages({ galleryPreview = [], imageSize = 96, className = "", rounded = "square" }) {
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

          return (
            <div
              key={mediaKey}
              className={`relative mb-2 flex-shrink-0 overflow-hidden border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 ${roundedClass} ${
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
            </div>
          );
        })
      )}
    </div>
  );
}

export default DisplayImages;

