import React from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import ControlPanel from "../ControlPanel";
import AddButton from "@/components/shared/button/AddButton";
import DeleteModal from "@/components/shared/DeleteModal";
import Edit from "@/components/icons/Edit";
import { useDeletePlatformMutation, useGetPlatformsQuery } from "@/services/platformApi";
import { flattenPlatforms } from "./utils";

function platformLabel(item) {
  return item?.name_fa || item?.name || item?.name_en || "-";
}

function renderTreePreview(nodes, depth = 0) {
  return nodes.map((node) => (
    <div key={node._id} className="space-y-2">
      <div className="rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-zinc-200">
        <div className="flex items-center gap-3">
          {node.image?.url ? (
            <img alt={platformLabel(node)} className="h-10 w-10 rounded-lg border border-zinc-800 object-cover" src={node.image.url} />
          ) : (
            <div className="h-10 w-10 rounded-lg border border-zinc-800 bg-zinc-950" />
          )}
          <div className="min-w-0">
            <div className="truncate">
              <span className="text-zinc-500">{`${"- ".repeat(depth)}`}</span>
              <span>{platformLabel(node)}</span>
            </div>
            <div className="mt-1 truncate text-xs text-zinc-500">{node.name_en || node.slug || "-"}</div>
          </div>
        </div>
      </div>
      {node.children?.length ? (
        <div className="mr-4 space-y-2 border-r border-zinc-800 pr-4">
          {renderTreePreview(node.children, depth + 1)}
        </div>
      ) : null}
    </div>
  ));
}

function collectParentPaths(nodes, parentNames = [], paths = {}) {
  nodes.forEach((node) => {
    paths[node._id] = parentNames;
    if (node.children?.length) {
      collectParentPaths(node.children, [...parentNames, platformLabel(node)], paths);
    }
  });

  return paths;
}

function getPlatformParentPath(item, parentPathById) {
  const parentNames = parentPathById[item._id];
  if (parentNames?.length) return parentNames.join(" / ");
  return item.parent ? platformLabel(item.parent) : "ندارد";
}

function Platforms() {
  const { data, isLoading } = useGetPlatformsQuery({ tree: true, limit: 500 });
  const [deletePlatform, { isLoading: isDeleting }] = useDeletePlatformMutation();
  const tree = data?.data || [];
  const platforms = flattenPlatforms(tree);
  const parentPathById = React.useMemo(() => collectParentPaths(tree), [tree]);

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

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-5">
            <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">درخت پلتفرم‌ها</h2>
                <span className="text-xs text-zinc-500">{tree.length} مورد</span>
              </div>
              <div className="mt-4 space-y-3">
                {isLoading ? (
                  <div className="rounded-xl border border-zinc-800 bg-black px-4 py-6 text-sm text-zinc-500">در حال دریافت...</div>
                ) : tree.length ? (
                  renderTreePreview(tree)
                ) : (
                  <div className="rounded-xl border border-zinc-800 bg-black px-4 py-6 text-sm text-zinc-500">
                    هنوز پلتفرمی ثبت نشده است.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5 xl:col-span-7">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">لیست پلتفرم‌ها</h2>
              <span className="text-xs text-zinc-500">{platforms.length} مورد</span>
            </div>
            <div className="mt-4 overflow-hidden">
              <table className="w-full table-fixed text-right text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500">
                    <th className="w-16 pb-3 font-medium">تصویر</th>
                    <th className="w-[34%] pb-3 font-medium">نام</th>
                    <th className="hidden pb-3 font-medium xl:table-cell">برند</th>
                    <th className="hidden pb-3 font-medium md:table-cell">مسیر والد</th>
                    <th className="hidden pb-3 font-medium lg:table-cell">تاریخ تولید</th>
                    <th className="w-24 pb-3 text-center font-medium">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td className="py-6 text-center text-zinc-500" colSpan="6">در حال دریافت...</td>
                    </tr>
                  ) : platforms.length ? (
                    platforms.map((item) => (
                      <tr key={item._id} className="border-b border-zinc-900 text-zinc-200">
                        <td className="py-4 pl-3">
                          {item.image?.url ? (
                            <img alt={platformLabel(item)} className="h-11 w-11 rounded-xl border border-zinc-800 object-cover" src={item.image.url} />
                          ) : (
                            <div className="h-11 w-11 rounded-xl border border-zinc-800 bg-black" />
                          )}
                        </td>
                        <td className="py-4 pl-3">
                          <span className="block truncate" style={{ paddingRight: `${item.depth * 20}px` }}>{platformLabel(item)}</span>
                          <span className="mt-1 block truncate text-xs text-zinc-500">{item.name_en || item.slug}</span>
                        </td>
                        <td className="hidden py-4 text-zinc-400 xl:table-cell">
                          {item.brand ? (
                            <span className="line-clamp-1">{item.brand.title_fa || item.brand.name || item.brand.title_en}</span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="hidden py-4 text-zinc-400 md:table-cell">{getPlatformParentPath(item, parentPathById)}</td>
                        <td className="hidden py-4 text-zinc-400 lg:table-cell">
                          {item.productionDate ? new Date(item.productionDate).toLocaleDateString("fa-IR") : "-"}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              aria-label="ویرایش پلتفرم"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 transition hover:border-white hover:text-white"
                              to={`/platforms/edit/${item._id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <DeleteModal
                              ariaLabel="حذف پلتفرم"
                              isLoading={isDeleting}
                              itemTitle={platformLabel(item)}
                              message="این پلتفرم حذف شود؟"
                              onDelete={() => handleDelete(item._id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-6 text-center text-zinc-500" colSpan="6">هنوز پلتفرمی ثبت نشده است.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </ControlPanel>
  );
}

export default Platforms;
