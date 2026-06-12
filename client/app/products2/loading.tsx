function LoadingCard() {
  return (
    <div className="rounded-[1.4rem] border border-[#e8ecf1] bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-5 w-12 animate-pulse rounded-full bg-[#eef2f6]" />
        <div className="h-4 w-10 animate-pulse rounded-full bg-[#eef2f6]" />
      </div>
      <div className="h-52 animate-pulse rounded-[1.15rem] bg-[linear-gradient(180deg,#f7f9fc_0%,#eef2f7_100%)]" />
      <div className="mt-4 space-y-3">
        <div className="h-4 w-4/5 animate-pulse rounded-full bg-[#eef2f6]" />
        <div className="h-4 w-3/5 animate-pulse rounded-full bg-[#eef2f6]" />
        <div className="h-4 w-2/5 animate-pulse rounded-full bg-[#eef2f6]" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#fbfcfe]">
      <div className="hidden w-full bg-[#fbfcfe] px-4 pb-16 pt-5 lg:block">
        <div className="rounded-[1.4rem] border border-[#e7ebf0] bg-white p-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-52 animate-pulse rounded-xl bg-[#eef2f6]" />
            <div className="h-14 flex-1 animate-pulse rounded-xl bg-[#eef2f6]" />
            <div className="h-14 w-40 animate-pulse rounded-xl bg-[#eef2f6]" />
            <div className="h-14 w-40 animate-pulse rounded-xl bg-[#eef2f6]" />
          </div>
          <div className="mt-4 h-8 w-full animate-pulse rounded-xl bg-[#f4f7fb]" />
        </div>

        <div className="mt-4 grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-20 animate-pulse rounded-xl bg-white" />
          ))}
        </div>

        <div className="mt-5 grid grid-cols-[300px_minmax(0,1fr)] gap-4">
          <div className="rounded-[1.4rem] border border-[#e7ebf0] bg-white p-5">
            <div className="h-6 w-28 animate-pulse rounded-full bg-[#eef2f6]" />
            <div className="mt-5 h-8 w-full animate-pulse rounded-full bg-[#f4f7fb]" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="h-12 animate-pulse rounded-xl bg-[#f4f7fb]" />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 8 }, (_, index) => (
              <LoadingCard key={index} />
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pb-28 pt-5 lg:hidden">
        <div className="h-14 w-48 animate-pulse rounded-xl bg-white" />
        <div className="mt-4 h-14 w-full animate-pulse rounded-[1rem] bg-white" />
        <div className="mt-4 flex gap-3 overflow-hidden">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-24 min-w-[92px] animate-pulse rounded-[1rem] bg-white"
            />
          ))}
        </div>
        <div className="mt-4 flex gap-2 overflow-hidden">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="h-11 min-w-[96px] animate-pulse rounded-full bg-white"
            />
          ))}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="space-y-3">
              <div className="aspect-[0.84] animate-pulse rounded-[1rem] bg-white" />
              <div className="h-4 w-5/6 animate-pulse rounded-full bg-white" />
              <div className="h-4 w-2/3 animate-pulse rounded-full bg-white" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
