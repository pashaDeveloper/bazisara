import React, { useEffect, useRef, useState } from "react";
import Cross from "@/components/icons/Cross";

export default function DesktopCoverCropper({ file, onCancel, onCrop }) {
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
                    className="absolute cursor-move border-2 border-red-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
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
            <div className="space-y-3 text-sm text-zinc-400" />
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

