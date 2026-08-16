"use client";

import type { CSSProperties } from "react";
import { useRef, useState } from "react";

type BlurImageProps = {
  alt: string;
  blurSrc?: string;
  className?: string;
  imageClassName?: string;
  imageStyle?: CSSProperties;
  onError?: () => void;
  src: string;
};

export function BlurImage({
  alt,
  blurSrc,
  className = "",
  imageClassName = "object-cover",
  imageStyle,
  onError,
  src,
}: BlurImageProps) {
  const [loadedSrc, setLoadedSrc] = useState("");
  const imageRef = useRef<HTMLImageElement>(null);
  const loaded = loadedSrc === src;
  const setImageNode = (node: HTMLImageElement | null) => {
    imageRef.current = node;
    if (node?.complete && loadedSrc !== src) {
      setLoadedSrc(src);
    }
  };

  return (
    <span
      className={`relative block overflow-hidden ${className}`}
      style={
        blurSrc
          ? {
              backgroundImage: `url("${blurSrc}")`,
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
            }
          : undefined
      }
    >
      {(blurSrc || src) && !loaded ? (
        <img
          aria-hidden
          alt=""
          className={`absolute inset-0 h-full w-full scale-110 blur-md ${imageClassName}`}
          decoding="async"
          src={blurSrc || src}
          style={imageStyle}
        />
      ) : null}
      <img
        alt={alt}
        className={`absolute inset-0 h-full w-full transition-opacity duration-150 ${imageClassName} ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        decoding="async"
        onError={onError}
        onLoad={() => setLoadedSrc(src)}
        ref={setImageNode}
        src={src}
        style={imageStyle}
      />
    </span>
  );
}
