import React, { useEffect, useRef, useState } from "react";
import Cross from "@/components/icons/Cross";

const OUTPUT_WIDTH = 1960;
const OUTPUT_HEIGHT = 1080;
const CROP_WIDTH = 1960;
const CROP_HEIGHT = 540;
const CROP_ASPECT = CROP_WIDTH / CROP_HEIGHT;

function fitAspectCrop(width, height) {
  const cropWidth = width;
  const cropHeight = Math.min(height, cropWidth / CROP_ASPECT);

  return {
    height: cropHeight,
    width: cropWidth,
    x: 0,
    y: (height - cropHeight) / 2,
  };
}

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
      const dy = event.clientY - drag.startY;

      setCrop(() => {
        const box = imageBox;
        let next = { ...drag.startCrop };

        if (drag.type === "move") {
          next.x = 0;
          next.y = Math.min(Math.max(0, drag.startCrop.y + dy), box.height - drag.startCrop.height);
          return next;
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

    setCrop(fitAspectCrop(width, height));
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
    const sourceX = crop.x * scaleX;
    const sourceY = crop.y * scaleY;
    const sourceWidth = crop.width * scaleX;
    const sourceHeight = crop.height * scaleY;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_WIDTH;
    canvas.height = OUTPUT_HEIGHT;

    const context = canvas.getContext("2d");
    context.fillStyle = "#000";
    context.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
    context.save();
    context.filter = "blur(28px)";
    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      -60,
      -40,
      OUTPUT_WIDTH + 120,
      OUTPUT_HEIGHT + 80
    );
    context.restore();
    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      (OUTPUT_HEIGHT - CROP_HEIGHT) / 2,
      CROP_WIDTH,
      CROP_HEIGHT
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const croppedFile = new File([blob], `desktop-1960x1080-${file.name.replace(/\.[^.]+$/, "")}.webp`, {
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
                alt="desktop crop"
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
                    {["left", "right"].map((handle) => (
                      <span
                        className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-white bg-red-500 ${
                          handle === "left" ? "-left-3" : "-right-3"
                        }`}
                        key={handle}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4">
            <div className="space-y-3 text-sm leading-7 text-zinc-400">
              <p>کادر انتخاب همیشه تمام عرض تصویر را می‌گیرد و نسبت آن 1960 در 540 است.</p>
              <p>فقط جای عمودی کادر را تنظیم کنید؛ خروجی نهایی 1960 در 1080 ساخته می‌شود.</p>
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

