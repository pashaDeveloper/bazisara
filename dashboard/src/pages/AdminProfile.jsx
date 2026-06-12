import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import ControlPanel from "./ControlPanel";
import { addAdmin } from "@/features/auth/authSlice";
import { useUpdateAdminProfileMutation } from "@/services/auth/authApi";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  nationalCode: "",
  position: "",
  department: "",
  gender: "",
  birthDate: "",
  landline: "",
  emergencyPhone: "",
  province: "",
  city: "",
  address: "",
  plateNumber: "",
  unit: "",
  postalCode: "",
  biography: "",
  avatarUrl: "",
};

const steps = [
  { key: "profile", title: "نمایه", hint: "تصویر و سطح" },
  { key: "main", title: "اطلاعات اصلی", hint: "نام و سمت" },
  { key: "identity", title: "هویتی و تماس", hint: "کد ملی و تلفن" },
  { key: "address", title: "آدرس", hint: "نشانی کامل" },
  { key: "review", title: "تایید نهایی", hint: "بیوگرافی و ذخیره" },
];

const completionFields = [
  "name",
  "email",
  "phone",
  "nationalCode",
  "position",
  "department",
  "gender",
  "birthDate",
  "landline",
  "emergencyPhone",
  "province",
  "city",
  "address",
  "plateNumber",
  "unit",
  "postalCode",
  "biography",
];

const roleLabels = {
  owner: "مدیر کل",
  superAdmin: "مدیر ارشد",
  admin: "مدیر",
  operator: "اپراتور",
  buyer: "خریدار",
};

function toDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function fieldIsFilled(value) {
  return String(value ?? "").trim().length > 0;
}

function getProfileLevel(percent) {
  if (percent >= 90) {
    return {
      level: 3,
      title: "سطح سه",
      description: "پروفایل کامل و آماده استفاده اداری است.",
      badgeClass: "bg-emerald-500 text-white",
    };
  }
  if (percent >= 50) {
    return {
      level: 2,
      title: "سطح دو",
      description: "اطلاعات اصلی کامل شده و چند مورد تکمیلی باقی مانده است.",
      badgeClass: "bg-blue-500 text-white",
    };
  }
  return {
    level: 1,
    title: "سطح یک",
    description: "برای ارتقای سطح، اطلاعات هویتی، تماس و آدرس را کامل کنید.",
    badgeClass: "bg-amber-500 text-white",
  };
}

function TextField({ label, name, value, onChange, type = "text", placeholder = "" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-zinc-600 dark:text-zinc-400">{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder || label}
        className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 dark:border-zinc-800 dark:bg-black dark:text-white dark:placeholder:text-zinc-600 dark:focus:border-white"
      />
    </label>
  );
}

function SelectField({ label, name, value, onChange, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-zinc-600 dark:text-zinc-400">{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-white"
      >
        {children}
      </select>
    </label>
  );
}

function Stepper({ currentStep, setCurrentStep, completedSteps }) {
  return (
    <div className="grid gap-2 md:grid-cols-5">
      {steps.map((step, index) => {
        const isActive = currentStep === index;
        const isCompleted = completedSteps[index];
        return (
          <button
            key={step.key}
            type="button"
            onClick={() => setCurrentStep(index)}
            className={`rounded-xl border px-3 py-3 text-right transition ${
              isActive
                ? "border-zinc-950 bg-zinc-950 text-white shadow-lg shadow-zinc-950/10 dark:border-white dark:bg-white dark:text-black"
                : isCompleted
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 dark:border-zinc-800 dark:bg-black dark:text-zinc-300 dark:hover:border-zinc-500"
            }`}
          >
            <span className="block text-sm font-black">{step.title}</span>
            <span className={`mt-1 block text-[11px] ${isActive ? "text-white/70 dark:text-black/60" : "text-zinc-500"}`}>
              {step.hint}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Panel({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-black text-zinc-950 dark:text-white">{title}</h2>
        {description ? <p className="mt-1 text-xs leading-6 text-zinc-500 dark:text-zinc-400">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-black">
      <span className="block text-[11px] font-bold text-zinc-500">{label}</span>
      <span className="mt-1 block min-h-5 text-sm font-bold text-zinc-900 dark:text-white">{value || "تکمیل نشده"}</span>
    </div>
  );
}

export default function AdminProfile() {
  const dispatch = useDispatch();
  const admin = useSelector((state) => state.auth.admin);
  const [updateProfile, { isLoading }] = useUpdateAdminProfileMutation();
  const [form, setForm] = useState(initialForm);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("https://placehold.co/300x300.png");
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const address = admin?.address || {};
    const nextForm = {
      name: admin?.name || "",
      email: admin?.email || "",
      phone: admin?.phone || "",
      nationalCode: admin?.nationalCode || "",
      position: admin?.position || "",
      department: admin?.department || "",
      gender: admin?.gender || "",
      birthDate: toDateInput(admin?.birthDate),
      landline: admin?.landline || "",
      emergencyPhone: admin?.emergencyPhone || "",
      province: address?.province || "",
      city: address?.city || "",
      address: address?.address || "",
      plateNumber: address?.plateNumber || "",
      unit: address?.unit || "",
      postalCode: address?.postalCode || "",
      biography: admin?.biography || "",
      avatarUrl: admin?.avatar?.url || "",
    };
    setForm(nextForm);
    if (!avatarFile) setAvatarPreview(nextForm.avatarUrl || "https://placehold.co/300x300.png");
  }, [admin, avatarFile]);

  useEffect(() => {
    if (!avatarFile) return undefined;
    const previewUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [avatarFile]);

  const completion = useMemo(() => {
    const avatarCompleted = Boolean(avatarFile || form.avatarUrl);
    const completedCount = completionFields.filter((field) => fieldIsFilled(form[field])).length + (avatarCompleted ? 1 : 0);
    const total = completionFields.length + 1;
    const percent = Math.round((completedCount / total) * 100);
    return { completedCount, total, percent };
  }, [avatarFile, form]);

  const profileLevel = useMemo(() => getProfileLevel(completion.percent), [completion.percent]);
  const isLastStep = currentStep === steps.length - 1;
  const completedSteps = useMemo(
    () =>
      steps.map((step) => {
        if (step.key === "profile") return Boolean(avatarFile || form.avatarUrl);
        if (step.key === "main") return ["name", "email", "position", "department"].every((field) => fieldIsFilled(form[field]));
        if (step.key === "identity") return ["phone", "nationalCode", "gender", "birthDate"].every((field) => fieldIsFilled(form[field]));
        if (step.key === "address") return ["province", "city", "address", "postalCode"].every((field) => fieldIsFilled(form[field]));
        return fieldIsFilled(form.biography);
      }),
    [avatarFile, form]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      payload.append(key, value ?? "");
    });
    if (avatarFile) payload.append("avatar", avatarFile);

    try {
      const response = await updateProfile(payload).unwrap();
      if (response?.data) dispatch(addAdmin(response.data));
      toast.success(response?.description || "پروفایل با موفقیت ذخیره شد");
    } catch (error) {
      toast.error(error?.data?.description || "ذخیره پروفایل انجام نشد");
    }
  };

  const goNext = () => setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  const goPrev = () => setCurrentStep((step) => Math.max(step - 1, 0));

  const renderStep = () => {
    switch (steps[currentStep].key) {
      case "profile":
        return (
          <Panel title="نمایه ادمین" description="تصویر پروفایل و سطح تکمیل حساب از همین بخش مدیریت می‌شود.">
            <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
              <div className="flex flex-col items-center rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-center dark:border-zinc-800 dark:bg-black">
                <img src={avatarPreview} alt={form.name || "avatar"} className="h-36 w-36 rounded-full border border-zinc-200 object-cover dark:border-zinc-800" />
                <label className="mt-4 inline-flex cursor-pointer rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-bold text-zinc-800 transition hover:border-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:border-white">
                  تغییر تصویر
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => setAvatarFile(event.target.files?.[0] || null)} />
                </label>
                <p className="mt-4 text-sm font-black text-zinc-950 dark:text-white">{form.name || "مدیر"}</p>
                <p className="mt-1 text-xs text-zinc-500">{roleLabels[admin?.role] || "مهمان"}</p>
              </div>

              <div className="flex flex-col justify-center rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-zinc-500">سطح پروفایل</p>
                    <h3 className="mt-1 text-2xl font-black text-zinc-950 dark:text-white">{profileLevel.title}</h3>
                  </div>
                  <span className={`rounded-full px-4 py-2 text-sm font-black ${profileLevel.badgeClass}`}>Level {profileLevel.level}</span>
                </div>
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-xs font-bold text-zinc-500">
                    <span>{completion.completedCount} از {completion.total} مورد کامل شده</span>
                    <span>{completion.percent}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div className="h-full rounded-full bg-zinc-950 transition-all dark:bg-white" style={{ width: `${completion.percent}%` }} />
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400">{profileLevel.description}</p>
              </div>
            </div>
          </Panel>
        );
      case "main":
        return (
          <Panel title="اطلاعات اصلی" description="نام، ایمیل و جایگاه سازمانی مدیر را تکمیل کنید.">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="نام و نام خانوادگی" name="name" value={form.name} onChange={handleChange} />
              <TextField label="ایمیل" name="email" type="email" value={form.email} onChange={handleChange} />
              <TextField label="سمت" name="position" value={form.position} onChange={handleChange} />
              <TextField label="واحد سازمانی" name="department" value={form.department} onChange={handleChange} />
            </div>
          </Panel>
        );
      case "identity":
        return (
          <Panel title="اطلاعات هویتی و تماس" description="کد ملی، شماره‌ها و مشخصات تکمیلی مدیر.">
            <div className="grid gap-4 md:grid-cols-3">
              <TextField label="کد ملی" name="nationalCode" value={form.nationalCode} onChange={handleChange} />
              <TextField label="موبایل" name="phone" value={form.phone} onChange={handleChange} />
              <TextField label="تلفن ثابت" name="landline" value={form.landline} onChange={handleChange} />
              <TextField label="شماره اضطراری" name="emergencyPhone" value={form.emergencyPhone} onChange={handleChange} />
              <TextField label="تاریخ تولد" name="birthDate" type="date" value={form.birthDate} onChange={handleChange} />
              <SelectField label="جنسیت" name="gender" value={form.gender} onChange={handleChange}>
                <option value="">انتخاب نشده</option>
                <option value="male">آقا</option>
                <option value="female">خانم</option>
                <option value="other">سایر</option>
              </SelectField>
            </div>
          </Panel>
        );
      case "address":
        return (
          <Panel title="آدرس" description="نشانی کامل مدیر برای مدارک و مکاتبات داخلی.">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="استان" name="province" value={form.province} onChange={handleChange} />
              <TextField label="شهر" name="city" value={form.city} onChange={handleChange} />
              <TextField label="پلاک" name="plateNumber" value={form.plateNumber} onChange={handleChange} />
              <TextField label="واحد" name="unit" value={form.unit} onChange={handleChange} />
              <TextField label="کد پستی" name="postalCode" value={form.postalCode} onChange={handleChange} />
              <label className="block md:col-span-2">
                <span className="mb-2 block text-xs font-bold text-zinc-600 dark:text-zinc-400">آدرس کامل</span>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-7 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 dark:border-zinc-800 dark:bg-black dark:text-white dark:placeholder:text-zinc-600 dark:focus:border-white"
                  placeholder="آدرس کامل"
                />
              </label>
            </div>
          </Panel>
        );
      default:
        return (
          <Panel title="بیوگرافی" description="در پایان، توضیح کوتاهی درباره نقش و تجربه مدیر ثبت کنید و پروفایل را ذخیره کنید.">
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-zinc-600 dark:text-zinc-400">بیوگرافی</span>
              <textarea
                name="biography"
                value={form.biography}
                onChange={handleChange}
                rows={9}
                className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-7 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 dark:border-zinc-800 dark:bg-black dark:text-white dark:placeholder:text-zinc-600 dark:focus:border-white"
                placeholder="بیوگرافی، تجربه‌ها و مسئولیت‌ها"
              />
            </label>
          </Panel>
        );
    }
  };

  return (
    <ControlPanel>
      <form onSubmit={handleSubmit} className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold text-zinc-500">حساب مدیر</p>
              <h1 className="mt-1 text-2xl font-black text-zinc-950 dark:text-white">پروفایل ادمین</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                اطلاعات پروفایل را مرحله‌ای کامل کنید. سطح پروفایل براساس کامل بودن تصویر، اطلاعات شخصی، تماس، آدرس و بیوگرافی تعیین می‌شود.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-black">
              <span className={`rounded-full px-3 py-1 text-xs font-black ${profileLevel.badgeClass}`}>{profileLevel.title}</span>
              <span className="text-sm font-black text-zinc-950 dark:text-white">{completion.percent}%</span>
            </div>
          </div>
        </div>

        <div className="sticky top-16 z-20 rounded-2xl border border-zinc-200 bg-white/90 p-3 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
          <Stepper completedSteps={completedSteps} currentStep={currentStep} setCurrentStep={setCurrentStep} />
        </div>

        {renderStep()}

        <div className="flex flex-col-reverse gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentStep === 0 || isLoading}
            className="h-11 rounded-xl border border-zinc-200 px-5 text-sm font-black text-zinc-700 transition hover:border-zinc-950 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-white"
          >
            مرحله قبلی
          </button>

          {isLastStep ? (
            <button
              type="submit"
              disabled={isLoading}
              className="h-11 rounded-xl bg-zinc-950 px-6 text-sm font-black text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {isLoading ? "در حال ذخیره..." : "ذخیره پروفایل"}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={isLoading}
              className="h-11 rounded-xl bg-zinc-950 px-6 text-sm font-black text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              مرحله بعد
            </button>
          )}
        </div>
      </form>
    </ControlPanel>
  );
}

