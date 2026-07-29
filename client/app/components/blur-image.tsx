"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { decode } from "blurhash";

type BlurImageProps = {
  alt: string;
  blurHash?: string;
  blurSrc?: string;
  className?: string;
  imageClassName?: string;
  imageStyle?: CSSProperties;
  onError?: () => void;
  src: string;
};

function BlurHashCanvas({ hash }: { hash: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const width = 32;
      const height = 32;
      const pixels = decode(hash, width, height);
      const context = canvas.getContext("2d");
      if (!context) return;

      const imageData = context.createImageData(width, height);
      imageData.data.set(pixels);
      context.putImageData(imageData, 0, 0);
    } catch {
      const context = canvas.getContext("2d");
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [hash]);

  return <canvas aria-hidden className="absolute inset-0 h-full w-full scale-105 object-cover" height={32} ref={canvasRef} width={32} />;
}

export function BlurImage({
  alt,
  blurHash,
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
      {!loaded && src ? (
        <img
          aria-hidden
          alt=""
          className={`absolute inset-0 h-full w-full scale-105 blur-xl ${imageClassName}`}
          src={src}
          style={imageStyle}
        />
      ) : blurHash && !loaded ? (
        <BlurHashCanvas hash={blurHash} />
      ) : null}
      <img
        alt={alt}
        className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${imageClassName} ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onError={onError}
        onLoad={() => setLoadedSrc(src)}
        ref={setImageNode}
        src={src}
        style={imageStyle}
      />
    </span>
  );
}
