import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import ControlPanel from "./ControlPanel";
import StepIndicator from "./categories/components/StepIndicator";
import NavigationButton from "@/components/shared/button/NavigationButton";
import SendButton from "@/components/shared/button/SendButton";
import AuthInput from "@/components/shared/AuthInput";
import ProfileImageSelector from "@/components/shared/gallery/ProfileImageSelector";
import SkeletonImage from "@/components/shared/skeleton/SkeletonImage";
import AddressIcon from "@/components/icons/Address";
import Calendar from "@/components/icons/Calendar";
import Country from "@/components/icons/Country";
import Email from "@/components/icons/Email";
import Post from "@/components/icons/Post";
import Qrc from "@/components/icons/Qrc";
import Telephone from "@/components/icons/Telephone";
import User from "@/components/icons/User";
import CloudUpload from "@/components/icons/CloudUpload";
import { addAdmin } from "@/features/auth/authSlice";
import { useUpdateAdminProfileMutation } from "@/services/auth/authApi";

const initialForm = {
  name: "",
  fatherName: "",
  email: "",
  phone: "",
  nationalCode: "",
  gender: "",
  birthDate: "",
  biography: "",
  avatarUrl: "",
  nationalCardUrl: "",
  province: "",
  city: "",
  address: "",
  plateNumber: "",
  postalCode: "",
};

const steps = [
  { key: "level1", title: "سطح یک", fields: ["avatar", "name", "fatherName", "email", "phone"] },
  { key: "level2", title: "سطح دو", fields: ["nationalCode", "birthDate", "gender", "nationalCard", "province", "city", "address", "plateNumber", "postalCode"] },
  { key: "level3", title: "سطح سه", fields: ["biography"] },
];

const fieldLabels = {
  avatar: "عکس نمایه",
  name: "نام و نام خانوادگی",
  fatherName: "نام پدر",
  email: "ایمیل",
  phone: "شماره موبایل",
  nationalCode: "کد ملی",
  birthDate: "تاریخ تولد",
  gender: "جنسیت",
  nationalCard: "کارت ملی",
  province: "استان",
  city: "شهر",
  address: "آدرس دقیق",
  plateNumber: "پلاک دقیق",
  postalCode: "کد پستی",
  biography: "بیوگرافی",
};

function toDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function isFilled(value) {
  return String(value ?? "").trim().length > 0;
}

function TextField({ icon, label, name, onChange, type = "text", value }) {
  return (
    <label className="flex flex-col gap-y-1">
      <span className="text-sm text-zinc-700 dark:text-gray-100">{label}</span>
      <AuthInput
        icon={icon}
        id={name}
        name={name}
        onChange={onChange}
        placeholder={label}
        type={type}
        value={value}
      />
    </label>
  );
}

function SelectField({ children, icon: Icon, label, name, onChange, value }) {
  return (
    <label className="flex flex-col gap-y-1">
      <span className="text-sm text-zinc-700 dark:text-gray-100">{label}</span>
      <div className="relative">
        {Icon && (
          <span className="pointer-events-none absolute right-0 top-0 flex h-full w-12 items-center justify-center rounded-r-primary rounded-l-none border border-l border-gray-300 bg-gray-200 text-gray-700 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
            <Icon className="h-5 w-5" />
          </span>
        )}
        <select
          className="h-12 w-full border bg-white py-2 pl-3 pr-14 text-sm text-zinc-900 outline-none transition focus:border-green-400 focus:ring-0 dark:bg-[#0a2d4d] dark:text-gray-100 dark:focus:border-blue-500"
          id={name}
          name={name}
          onChange={onChange}
          value={value}
        >
          {children}
        </select>
      </div>
    </label>
  );
}

function FileField({ accept = "image/*", label, onChange, preview }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-black">
      <span className="mb-3 block text-xs font-bold text-zinc-600 dark:text-zinc-400">{label}</span>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="h-28 w-28 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          {preview ? <img alt={label} className="h-full w-full object-cover" src={preview} /> : null}
        </div>
        <label className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 text-sm font-black text-zinc-800 transition hover:border-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:border-white">
          انتخاب فایل
          <input accept={accept} className="hidden" onChange={onChange} type="file" />
        </label>
      </div>
    </div>
  );
}

function AvatarProfileField({ avatarPreview, onImageSelect }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="profile-container profile-avatar-container shine-effect mb-4 flex justify-center rounded-full">
        {avatarPreview && !avatarPreview.includes("placehold.co") ? (
          <img
            alt="avatar"
            className="profile-pic h-[100px] w-[100px] rounded-full"
            height={100}
            src={avatarPreview}
            width={100}
          />
        ) : (
          <SkeletonImage />
        )}
      </div>
      <ProfileImageSelector onImageSelect={onImageSelect} />
    </div>
  );
}

function NationalCardField({ onChange, preview }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="profile-container shine-effect mb-4 flex h-36 w-full max-w-[220px] justify-center rounded-primary">
        {preview ? (
          <img alt="national card" className="h-full w-full rounded-primary object-cover" src={preview} />
        ) : (
          <SkeletonImage />
        )}
      </div>
      <label htmlFor="national-card-file" className="flex w-fit cursor-pointer flex-row gap-x-2 rounded-secondary border border-green-900 bg-green-100 px-4 py-1 text-sm text-green-900 dark:border-blue-900 dark:bg-blue-100 dark:text-blue-700">
        <CloudUpload className="h-5 w-5 dark:!text-blue-700" />
        انتخاب کارت ملی*
        <input
          accept="image/png, image/jpg, image/jpeg"
          className="hidden"
          id="national-card-file"
          name="nationalCard"
          onChange={onChange}
          type="file"
        />
      </label>
    </div>
  );
}

function levelFieldFilled(form, avatarFile, nationalCardFile, field) {
  if (field === "avatar") return Boolean(avatarFile || (form.avatarUrl && !form.avatarUrl.includes("placehold.co")));
  if (field === "nationalCard") return Boolean(nationalCardFile || form.nationalCardUrl);
  return isFilled(form[field]);
}

export default function AdminProfile() {
  const dispatch = useDispatch();
  const admin = useSelector((state) => state.auth.admin || {});
  const [updateProfile, { isLoading }] = useUpdateAdminProfileMutation();
  const [form, setForm] = useState(initialForm);
  const [avatarFile, setAvatarFile] = useState(null);
  const [nationalCardFile, setNationalCardFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [nationalCardPreview, setNationalCardPreview] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  const approvedLevel = Number(admin.approvedLevel || admin.profileApproval?.approvedLevel || 0);
  const pendingLevel = Number(admin.pendingLevel || admin.profileApproval?.pendingLevel || 0);
  const currentLevel = currentStep + 1;
  const hasPendingCurrentLevel = pendingLevel === currentLevel && pendingLevel > approvedLevel;
  const isLastStep = currentStep === steps.length - 1;

  useEffect(() => {
    setForm({
      name: admin.name || "",
      fatherName: admin.fatherName || "",
      email: admin.email || "",
      phone: admin.phone || "",
      nationalCode: admin.nationalCode || "",
      gender: admin.gender || "",
      birthDate: toDateInput(admin.birthDate),
      biography: admin.biography || "",
      avatarUrl: admin.avatar?.url || "",
      nationalCardUrl: admin.nationalCard?.url || "",
      province: admin.address?.province || "",
      city: admin.address?.city || "",
      address: admin.address?.address || "",
      plateNumber: admin.address?.plateNumber || "",
      postalCode: admin.address?.postalCode || "",
    });
    setAvatarPreview(admin.avatar?.url || "https://placehold.co/300x300.png");
    setNationalCardPreview(admin.nationalCard?.url || "");
  }, [admin]);

  useEffect(() => {
    if (!avatarFile) return undefined;
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  useEffect(() => {
    if (!nationalCardFile) return undefined;
    const url = URL.createObjectURL(nationalCardFile);
    setNationalCardPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [nationalCardFile]);

  useEffect(() => {
    const nextEditableStep = Math.min(approvedLevel, steps.length - 1);
    if (currentStep > nextEditableStep && !pendingLevel) setCurrentStep(nextEditableStep);
  }, [approvedLevel, currentStep, pendingLevel]);

  const levelCompletion = useMemo(
    () =>
      steps.map((step) => ({
        total: step.fields.length,
        completed: step.fields.filter((field) => levelFieldFilled(form, avatarFile, nationalCardFile, field)).length,
      })),
    [avatarFile, form, nationalCardFile]
  );

  const completedSteps = steps.reduce((acc, _step, index) => {
    acc[index + 1] = approvedLevel >= index + 1;
    return acc;
  }, {});

  const invalidSteps = steps.reduce((acc, _step, index) => {
    const level = index + 1;
    acc[level] = pendingLevel === level && pendingLevel > approvedLevel;
    return acc;
  }, {});

  const missingFields = steps[currentStep].fields.filter((field) => !levelFieldFilled(form, avatarFile, nationalCardFile, field));
  const currentLevelComplete = missingFields.length === 0;
  const canMoveToPrevious = currentStep > 0;
  const canOpenStep = (step) => step <= approvedLevel + 1 || step <= currentLevel;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleAvatarSelect = (imageOrUrl) => {
    if (imageOrUrl instanceof File) {
      setAvatarFile(imageOrUrl);
      setForm((current) => ({ ...current, avatarUrl: "" }));
      return;
    }

    setAvatarFile(null);
    setAvatarPreview(imageOrUrl);
    setForm((current) => ({ ...current, avatarUrl: imageOrUrl }));
  };

  const buildPayload = () => {
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value ?? ""));
    if (avatarFile) payload.append("avatar", avatarFile);
    if (nationalCardFile) payload.append("nationalCard", nationalCardFile);
    return payload;
  };

  const saveCurrentLevel = async () => {
    if (!currentLevelComplete) {
      toast.error(`این موارد را تکمیل کنید: ${missingFields.map((field) => fieldLabels[field]).join("، ")}`);
      return null;
    }

    try {
      const response = await updateProfile(buildPayload()).unwrap();
      if (response?.data) dispatch(addAdmin(response.data));
      toast.success(response?.description || "پروفایل ذخیره شد و برای تایید ارسال شد");
      return response?.data || null;
    } catch (error) {
      toast.error(error?.data?.description || "ذخیره پروفایل انجام نشد");
      return null;
    }
  };

  const handleNext = async () => {
    if (approvedLevel < currentLevel) {
      await saveCurrentLevel();
      return;
    }
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await saveCurrentLevel();
  };

  const renderStep = () => {
    if (currentStep === 0) {
      return (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-black text-zinc-950 dark:text-white">سطح یک</h2>
          <p className="mt-1 text-sm leading-7 text-zinc-500">عکس نمایه، نام و نام خانوادگی، نام پدر، ایمیل و شماره موبایل را تکمیل کنید.</p>
          <div className="mt-5 grid gap-4 lg:grid-cols-[260px_1fr]">
            <AvatarProfileField avatarPreview={avatarPreview} onImageSelect={handleAvatarSelect} />
            <div className="grid gap-4 md:grid-cols-2">
              <TextField icon={User} label="نام و نام خانوادگی" name="name" onChange={handleChange} value={form.name} />
              <TextField icon={User} label="نام پدر" name="fatherName" onChange={handleChange} value={form.fatherName} />
              <TextField icon={Email} label="ایمیل" name="email" onChange={handleChange} type="email" value={form.email} />
              <TextField icon={Telephone} label="شماره موبایل" name="phone" onChange={handleChange} value={form.phone} />
            </div>
          </div>
        </section>
      );
    }

    if (currentStep === 1) {
      return (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-black text-zinc-950 dark:text-white">سطح دو</h2>
          <p className="mt-1 text-sm leading-7 text-zinc-500">کد ملی، تاریخ تولد، جنسیت، تصویر کارت ملی و نشانی کامل را تکمیل کنید.</p>
          <div className="mt-5 grid gap-4 lg:grid-cols-[260px_1fr]">
            <NationalCardField onChange={(event) => setNationalCardFile(event.target.files?.[0] || null)} preview={nationalCardPreview} />
            <div className="grid gap-4 md:grid-cols-2">
              <TextField icon={Qrc} label="کد ملی" name="nationalCode" onChange={handleChange} value={form.nationalCode} />
              <TextField icon={Calendar} label="تاریخ تولد" name="birthDate" onChange={handleChange} type="date" value={form.birthDate} />
              <div className="md:col-span-2">
                <SelectField icon={User} label="جنسیت" name="gender" onChange={handleChange} value={form.gender}>
                  <option value="">انتخاب نشده</option>
                  <option value="male">آقا</option>
                  <option value="female">خانم</option>
                  <option value="other">سایر</option>
                </SelectField>
              </div>
              <TextField icon={Country} label="استان" name="province" onChange={handleChange} value={form.province} />
              <TextField icon={AddressIcon} label="شهر" name="city" onChange={handleChange} value={form.city} />
              <TextField icon={AddressIcon} label="آدرس دقیق" name="address" onChange={handleChange} value={form.address} />
              <TextField icon={AddressIcon} label="پلاک دقیق" name="plateNumber" onChange={handleChange} type="number" value={form.plateNumber} />
              <TextField icon={Post} label="کد پستی" name="postalCode" onChange={handleChange} value={form.postalCode} />
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-lg font-black text-zinc-950 dark:text-white">سطح سه</h2>
        <p className="mt-1 text-sm leading-7 text-zinc-500">بیوگرافی کوتاه مدیر را ثبت کنید.</p>
        <label className="mt-5 block">
          <span className="mb-2 block text-xs font-bold text-zinc-600 dark:text-zinc-400">بیوگرافی</span>
          <textarea
            className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-8 text-zinc-900 outline-none transition focus:border-zinc-900 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-white"
            name="biography"
            onChange={handleChange}
            placeholder="بیوگرافی، تجربه‌ها و مسئولیت‌ها"
            rows={8}
            value={form.biography}
          />
        </label>
      </section>
    );
  };

  return (
    <ControlPanel>
      <form className="mx-auto max-w-6xl space-y-5" onSubmit={handleSubmit}>
        <div className="rounded-2xl border border-zinc-700 bg-black/80 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs text-zinc-400">حساب مدیر</p>
              <h1 className="mt-1 text-2xl font-bold text-white">پروفایل مرحله‌ای</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-300">
                هر سطح بعد از تکمیل ذخیره می‌شود و برای تایید مدیر کل به صف تاییدها می‌رود.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-200">
              سطح تایید شده: <span className="font-black text-white">{approvedLevel || "هیچ‌کدام"}</span>
              {pendingLevel > approvedLevel ? <span className="mr-3 text-amber-300">در انتظار تایید سطح {pendingLevel}</span> : null}
            </div>
          </div>
        </div>

        <div className="sticky top-16 z-20 rounded-xl border border-gray-200 bg-white/95 p-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
          <StepIndicator
            completedSteps={completedSteps}
            currentStep={currentStep + 1}
            invalidSteps={invalidSteps}
            onStepClick={(step) => {
              if (!canOpenStep(step)) {
                toast.error("ابتدا سطح قبلی باید توسط مدیر کل تایید شود");
                return;
              }
              setCurrentStep(step - 1);
            }}
            totalSteps={steps.length}
          />
          <div className="grid gap-2 md:grid-cols-3">
            {steps.map((step, index) => (
              <div className="rounded-xl bg-zinc-100 px-3 py-2 text-xs dark:bg-black" key={step.key}>
                <div className="flex items-center justify-between font-black text-zinc-800 dark:text-zinc-100">
                  <span>{step.title}</span>
                  <span>{levelCompletion[index].completed}/{levelCompletion[index].total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {hasPendingCurrentLevel ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-800">
            اطلاعات این سطح ذخیره شده و منتظر تایید مدیر کل است. بعد از تایید، سطح بعدی فعال می‌شود.
          </div>
        ) : null}

        {renderStep()}

        <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-950 p-4">
          <NavigationButton direction="prev" disabled={!canMoveToPrevious || isLoading} onClick={() => setCurrentStep((step) => Math.max(step - 1, 0))} />
          {isLastStep || approvedLevel < currentLevel ? (
            <SendButton
              isLoading={isLoading}
              label={approvedLevel < currentLevel ? `ذخیره و ارسال سطح ${currentLevel}` : "ذخیره پروفایل"}
              loadingLabel="در حال ذخیره..."
            />
          ) : (
            <NavigationButton direction="next" disabled={isLoading} onClick={handleNext} />
          )}
        </div>
      </form>
    </ControlPanel>
  );
}
