import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import ControlPanel from "../ControlPanel";
import AddButton from "@/components/shared/button/AddButton";
import DeleteModal from "@/components/shared/DeleteModal";
import Edit from "@/components/icons/Edit";
import { useDeletePlatformMutation, useGetPlatformsQuery } from "@/services/platformApi";
import { flattenPlatforms } from "./utils";

function Platforms() {
  const { data, isLoading } = useGetPlatformsQuery({ tree: true, limit: 500 });
  const [deletePlatform, { isLoading: isDeleting }] = useDeletePlatformMutation();
  const platforms = flattenPlatforms(data?.data || []);

  const handleDelete = async (id) => {
    try {
      const response = await deletePlatform(id).unwrap();
      toast.success(response.description || "پلتفرم حذف شد");
    } catch (error) {
      toast.error(error?.data?.description || "حذف پلتفرم انجام نشد");
    }
  };

  return (
    <ControlPanel>
      <section className="space-y-6">
        <div className="rounded-2xl border border-zinc-700 bg-black/80 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs text-zinc-400">مدیریت ساختار بازی</p>
              <h1 className="mt-1 text-2xl font-bold text-white">پلتفرم‌ها</h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-500">
                پلتفرم‌ها به صورت درختی ذخیره می‌شوند و در فرم بازی به عنوان انتخاب اصلی و حجم نسخه‌ها استفاده می‌شوند.
              </p>
            </div>
            <AddButton link="/platforms/create" />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5">
          <h2 className="text-sm font-bold text-white">لیست درختی پلتفرم‌ها</h2>
          <div className="mt-4 overflow-hidden">
            <table className="w-full table-fixed text-right text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="pb-3 font-medium">نام</th>
                  <th className="hidden pb-3 font-medium md:table-cell">والد</th>
                  <th className="hidden pb-3 font-medium lg:table-cell">تاریخ تولید</th>
                  <th className="w-24 pb-3 text-center font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="py-6 text-center text-zinc-500" colSpan="4">در حال دریافت...</td>
                  </tr>
                ) : platforms.length ? (
                  platforms.map((item) => (
                    <tr key={item._id} className="border-b border-zinc-900 text-zinc-200">
                      <td className="py-4 pl-3">
                        <span className="block truncate" style={{ paddingRight: `${item.depth * 20}px` }}>{item.name}</span>
                        <span className="mt-1 block truncate text-xs text-zinc-500">{item.slug}</span>
                      </td>
                      <td className="hidden py-4 text-zinc-400 md:table-cell">{item.parent?.name || "-"}</td>
                      <td className="hidden py-4 text-zinc-400 lg:table-cell">
                        {item.productionDate ? new Date(item.productionDate).toLocaleDateString("fa-IR") : "-"}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 transition hover:border-white hover:text-white"
                            to={`/platforms/edit/${item._id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <DeleteModal
                            isLoading={isDeleting}
                            itemTitle={item.name}
                            message="این پلتفرم حذف شود؟"
                            onDelete={() => handleDelete(item._id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-6 text-center text-zinc-500" colSpan="4">هنوز پلتفرمی ثبت نشده است.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </ControlPanel>
  );
}

export default Platforms;

