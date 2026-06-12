import React from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import ControlPanel from "./ControlPanel";
import { useApproveApprovalMutation, useGetApprovalsQuery } from "@/services/adminApi";

const typeLabels = {
  game: "بازی",
  article: "مطلب",
  slider: "اسلایدر",
};

function Approvals() {
  const admin = useSelector((state) => state.auth.admin);
  const { data, isLoading } = useGetApprovalsQuery();
  const [approveApproval, { isLoading: isApproving }] = useApproveApprovalMutation();

  const approvals = data?.data || [];

  const handleApprove = async (item) => {
    try {
      const response = await approveApproval({ type: item.type, id: item._id }).unwrap();
      toast.success(response.description || "محتوا تایید شد");
    } catch (error) {
      toast.error(error?.data?.description || "تایید محتوا انجام نشد");
    }
  };

  if (admin?.role !== "owner") {
    return (
      <ControlPanel>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
          این بخش فقط برای مدیر کل در دسترس است.
        </div>
      </ControlPanel>
    );
  }

  return (
    <ControlPanel>
      <section className="space-y-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-bold text-zinc-500">صف تایید</p>
          <h1 className="mt-1 text-2xl font-black text-zinc-950 dark:text-white">محتوای در انتظار تایید</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            بازی‌ها، مطالب و اسلایدرهایی که توسط مدیران سطح سه ثبت شده‌اند اینجا منتظر تایید مدیر کل می‌مانند.
          </p>
        </div>

        <div className="grid gap-4">
          {isLoading ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
              در حال دریافت...
            </div>
          ) : approvals.length ? (
            approvals.map((item) => (
              <div
                key={`${item.type}-${item._id}`}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                        در انتظار تایید
                      </span>
                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-black text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {typeLabels[item.type] || item.type}
                      </span>
                    </div>
                    <h2 className="mt-3 truncate text-lg font-black text-zinc-950 dark:text-white">{item.title}</h2>
                    <p className="mt-1 text-sm leading-7 text-zinc-500 dark:text-zinc-400">{item.excerpt || item.slug || "-"}</p>
                  </div>

                  <button
                    type="button"
                    disabled={isApproving}
                    onClick={() => handleApprove(item)}
                    className="h-11 rounded-xl bg-zinc-950 px-5 text-sm font-black text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                  >
                    تایید
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
              چیزی برای تایید وجود ندارد.
            </div>
          )}
        </div>
      </section>
    </ControlPanel>
  );
}

export default Approvals;

