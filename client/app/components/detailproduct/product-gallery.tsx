import Image from "next/image";

export function ProductGallery({
  title,
  gallery,
}: {
  title: string;
  gallery: string[];
}) {
  return (
    <section
      dir="rtl"
      className="rounded-[1.9rem] border border-[#e7ebf1] bg-white p-5 shadow-[0_30px_60px_-40px_rgba(15,23,42,.24)]"
    >
      <div className="flex gap-3">
        <div className="flex min-w-[72px] flex-col gap-3">
          {gallery.map((item, index) => (
            <button
              key={`${item}-${index}`}
              type="button"
              className={`relative h-[92px] rounded-[1rem] border ${
                index === 0 ? "border-[#cad5e7] bg-[#f8fafc]" : "border-[#edf1f6] bg-white"
              }`}
            >
              <Image
                src={item}
                alt={`${title} ${index + 1}`}
                fill
                sizes="5rem"
                className="object-contain p-2"
              />
            </button>
          ))}
        </div>
        <div className="relative flex-1 overflow-hidden rounded-[1.6rem] bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fd_100%)]">
          <Image
            src={gallery[0]}
            alt={title}
            width={900}
            height={900}
            className="mx-auto h-full max-h-[520px] w-full object-contain p-10"
            priority
          />
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
            {gallery.slice(0, 3).map((_, index) => (
              <span
                key={index}
                className={`h-3 rounded-full ${index === 0 ? "w-10 bg-[#8b8f99]" : "w-3 bg-[#cfd4dd]"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
