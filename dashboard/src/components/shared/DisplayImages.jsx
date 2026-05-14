import React, { useEffect, useState } from "react";

function DisplayImages({ galleryPreview = [], imageSize = 96, className = "" }) {
  const [loadedMap, setLoadedMap] = useState({});
  const hasMedia = galleryPreview?.length > 0;

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
          className="profile-container relative mb-2 flex-shrink-0 overflow-hidden rounded-full shine-effect"
          style={{
            width: imageSize,
          
            height: imageSize,
            minWidth: imageSize,
            minHeight: imageSize,
          }}
        >
          <div className="absolute inset-[4%] animate-pulse rounded-full bg-white/50 dark:bg-white/20" />
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
              className={`profile-container relative mb-2 flex-shrink-0 overflow-hidden rounded-full ${
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
                <div className="absolute inset-[4%] animate-pulse rounded-full bg-white/50 dark:bg-white/20" />
              ) : null}

              {isVideo ? (
                <video
                  className={`profile-pic rounded-full object-cover transition-opacity duration-200 ${
                    isLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  controls
                  height={imageSize}
                  onCanPlay={() => markLoaded(mediaKey)}
                  onLoadedData={() => markLoaded(mediaKey)}
                  src={item.url}
                  width={imageSize}
                >
                  مرورگر شما از پخش این فایل پشتیبانی نمی‌کند.
                </video>
              ) : (
                <img
                  alt="gallery"
                  className="profile-pic h-full w-full rounded-full object-cover"
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
