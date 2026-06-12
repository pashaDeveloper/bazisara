import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ControlPanel from "../ControlPanel";
import StatusSwitch from "@/components/shared/button/StatusSwitch";
import {
  useGetAdminQuery,
  useUpdateAdminMutation,
} from "@/services/adminApi";

const roleLabels = {
  owner: "مدیر کل",
  superAdmin: "مدیر ارشد",
  admin: "مدیر",
  operator: "اپراتور",
  buyer: "خریدار",
};

const initialForm = {
  name: "",
  email: "",
  phone: "",
  role: "buyer",
  position: "",
  department: "",
  nationalCode: "",
  status: "inactive",
};

function Field({ label, name, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-zinc-400">{label}</span>
      <input
        className="h-12 w-full rounded-xl border border-zinc-800 bg-black px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white"
        name={name}
        onChange={onChange}
        type={type}
        value={value}
      />
    </label>
  );
}

function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetAdminQuery(id);
  const [updateAdmin, { isLoading: isSaving }] = useUpdateAdminMutation();
  const [form, setForm] = useState(initialForm);

  const admin = data?.data;
  const isLocked = admin?.role === "owner";

  useEffect(() => {
    if (!admin) return;
    setForm({
      name: admin.name || "",
      email: admin.email || "",
      phone: admin.phone || "",
      role: admin.role || "buyer",
      position: admin.position || "",
      department: admin.department || "",
      nationalCode: admin.nationalCode || "",
      status: admin.status || "inactive",
    });
  }, [admin]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLocked) {
      toast.error("مدیر کل قابل ویرایش نیست");
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value ?? ""));
      const response = await updateAdmin({ id, formData }).unwrap();
      toast.success(response.description || "کاربر با موفقیت ذخیره شد");
      navigate("/users", { replace: true });
    } catch (error) {
      toast.error(error?.data?.description || "ذخیره کاربر انجام نشد");
    }
  };

  if (isLoading) {
    return (
      <ControlPanel>
        <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-6 text-sm text-zinc-400">
          در حال دریافت...
        </div>
      </ControlPanel>
    );
  }

  if (!admin) {
    return (
      <ControlPanel>
        <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-6 text-sm text-zinc-400">
          کاربر یافت نشد.
        </div>
      </ControlPanel>
    );
  }

  return (
    <ControlPanel>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-zinc-700 bg-black/80 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-zinc-400">ویرایش کاربر</p>
              <h1 className="mt-1 text-2xl font-bold text-white">{admin.name || "بدون نام"}</h1>
              <p className="mt-2 text-sm text-zinc-500">{admin.email || admin.phone || "-"}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300">
              {roleLabels[admin.role] || admin.role || "مهمان"}
            </div>
          </div>
        </div>

        {isLocked ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            مدیر کل قابل ویرایش نیست.
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="نام" name="name" onChange={handleChange} value={form.name} />
              <Field label="ایمیل" name="email" onChange={handleChange} value={form.email} type="email" />
              <Field label="تلفن" name="phone" onChange={handleChange} value={form.phone} />
              <Field label="کد ملی" name="nationalCode" onChange={handleChange} value={form.nationalCode} />
              <Field label="سمت" name="position" onChange={handleChange} value={form.position} />
              <Field label="واحد" name="department" onChange={handleChange} value={form.department} />

              <label className="block">
                <span className="mb-2 block text-xs font-bold text-zinc-400">نقش</span>
                <select
                  className="h-12 w-full rounded-xl border border-zinc-800 bg-black px-4 text-sm text-white outline-none transition focus:border-white disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isLocked}
                  name="role"
                  onChange={handleChange}
                  value={form.role}
                >
                  <option value="buyer">خریدار</option>
                  <option value="operator">اپراتور</option>
                  <option value="admin">مدیر</option>
                  <option value="superAdmin">مدیر ارشد</option>
                  <option value="owner">مدیر کل</option>
                </select>
              </label>

              <div className="block">
                <span className="mb-2 block text-xs font-bold text-zinc-400">وضعیت حساب</span>
                <StatusSwitch
                  checked={form.status === "active"}
                  className="!border-zinc-800 !bg-black"
                  disabled={isLocked}
                  id="status"
                  label={form.status === "active" ? "فعال" : "غیرفعال"}
                  name="status"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.checked ? "active" : "inactive",
                    }))
                  }
                />
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5">
              <p className="text-xs text-zinc-500">خلاصه</p>
              <div className="mt-4 space-y-3 text-sm text-zinc-300">
                <div className="flex items-center justify-between gap-3">
                  <span>نقش</span>
                  <span className="text-white">{roleLabels[form.role] || form.role}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>سمت</span>
                  <span className="text-white">{form.position || "-"}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>وضعیت</span>
                  <span className="text-white">{form.status === "active" ? "فعال" : "غیرفعال"}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                className="flex h-11 flex-1 items-center justify-center rounded-xl border border-zinc-800 text-sm font-black text-zinc-300 transition hover:border-white hover:text-white"
                to="/users"
              >
                بازگشت
              </Link>
              <button
                type="submit"
                disabled={isSaving || isLocked}
                className="flex h-11 flex-1 items-center justify-center rounded-xl bg-white text-sm font-black text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "در حال ذخیره..." : "ذخیره"}
              </button>
            </div>
          </aside>
        </div>
      </form>
    </ControlPanel>
  );
}

export default UserForm;

