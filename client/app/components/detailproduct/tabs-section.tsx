import type { ProductDetail } from "../../products2/detail-data";

export function TabsSection({ tabs, activeTab, summary }: Pick<ProductDetail, "tabs" | "activeTab" | "summary">) {
  return (
    <>
      <section className="mt-7 hidden lg:block">
        <div className="overflow-hidden rounded-[1.6rem] border border-[#e7ebf1] bg-white">
          <div className="flex flex-row-reverse items-center justify-end gap-10 border-b border-[#eef2f6] px-6 py-5 text-base font-bold text-[#748097]">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`relative py-2 ${tab.key === activeTab ? "text-[#ef476f]" : ""}`}
              >
                {tab.label}
                {tab.key === activeTab ? (
                  <span className="absolute inset-x-0 -bottom-5 h-1 rounded-full bg-[#ef476f]" />
                ) : null}
              </button>
            ))}
          </div>
          <div className="px-8 py-6 text-lg leading-9 text-[#2f3d62]">{summary}</div>
        </div>
      </section>

      <section className="mt-8 border-y border-[#e8ecf3] bg-white lg:hidden">
        <div className="flex flex-row-reverse justify-start gap-6 overflow-x-auto px-1 py-4 text-base font-bold text-[#6b7280]">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`relative shrink-0 px-3 py-2 ${tab.key === activeTab ? "text-[#ef476f]" : ""}`}
            >
              {tab.label}
              {tab.key === activeTab ? (
                <span className="absolute inset-x-0 -bottom-3 h-1 rounded-full bg-[#ef476f]" />
              ) : null}
            </button>
          ))}
        </div>
      </section>

      <div className="mt-5 rounded-[1.5rem] border border-[#e7ebf1] bg-white p-5 text-[1rem] leading-9 text-[#2f3d62] lg:hidden">
        {summary}
      </div>
    </>
  );
}
