import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import MutationFeedback from "@/components/MutationFeedback";
import { useSignUpAdminMutation } from "@/services/auth/authApi";

const steps = [
  { id: 1, title: "????" },
  { id: 2, title: "????" },
  { id: 3, title: "?????" },
  { id: 4, title: "??????" },
  { id: 5, title: "?????" },
  { id: 6, title: "????" },
];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  province: "",
  city: "",
  address: "",
  plateNumber: "",
  postalCode: "",
};

function SignUp() {
  const [signUpAdmin, { data, isLoading, isSuccess, error, isError }] =
    useSignUpAdminMutation();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);

  const progress = useMemo(() => (step / steps.length) * 100, [step]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    let nextValue = value;

    if (["phone", "plateNumber", "postalCode"].includes(name)) {
      nextValue = value.replace(/\D/g, "");
    }

    if (name === "phone") {
      nextValue = nextValue.slice(0, 11);
    }

    if (name === "postalCode") {
      nextValue = nextValue.slice(0, 10);
    }

    if (name === "plateNumber") {
      nextValue = nextValue.slice(0, 6);
    }

    setForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const validateStep = () => {
    if (step === 1) {
      if (!form.name) {
        toast.error("??? ?? ???? ????", { id: "signup-step-1" });
        return false;
      }
    }

    if (step === 2) {
      if (!form.email || !form.phone) {
        toast.error("????? ? ????? ?????? ?? ???? ????", {
          id: "signup-step-2",
        });
        return false;
      }

      if (!/^09\d{9}$/.test(form.phone)) {
        toast.error("????? ?????? ???? 11 ??? ???? ? ?? 09 ???? ???", {
          id: "signup-step-2-phone",
        });
        return false;
      }
    }

    if (step === 3) {
      if (!form.password || !form.confirmPassword) {
        toast.error("??? ???? ? ????? ?? ?? ???? ????", {
          id: "signup-step-3",
        });
        return false;
      }

      if (form.password.length < 6) {
        toast.error("??? ???? ???? ????? 6 ??????? ????", {
          id: "signup-step-3-length",
        });
        return false;
      }

      if (form.password !== form.confirmPassword) {
        toast.error("??? ???? ? ????? ?? ????? ??????", {
          id: "signup-step-3-match",
        });
        return false;
      }
    }

    if (step === 4) {
      if (!form.province || !form.city) {
        toast.error("????? ? ??? ?? ???? ????", { id: "signup-step-4" });
        return false;
      }
    }

    if (step === 5) {
      if (!form.address || !form.plateNumber || !form.postalCode) {
        toast.error("??????? ????? ?? ???? ????", { id: "signup-step-5" });
        return false;
      }
    }

    return true;
  };

  const nextStep = () => {
    if (!validateStep()) {
      return;
    }

    setStep((prev) => Math.min(prev + 1, steps.length));
  };

  const previousStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleKeyDown = (event) => {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    if (event.target.tagName === "TEXTAREA") {
      return;
    }

    if (step < steps.length) {
      event.preventDefault();
      nextStep();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateStep()) {
      return;
    }

    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        province: form.province,
        city: form.city,
        address: form.address,
        plateNumber: form.plateNumber,
        postalCode: form.postalCode,
      };

      await signUpAdmin(payload).unwrap();
    } catch (_) {}
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <MutationFeedback
        state={{ data, isLoading, isSuccess, isError, error }}
        toastId="signup"
        loadingMessage="?? ??? ??? ???..."
        successMessage="??? ??? ?? ?????? ????? ??"
        errorMessage="??? ??? ????? ???"
        navigateTo="/signin"
      />

      <div className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="w-full rounded-3xl border border-zinc-900 bg-zinc-950 p-6 sm:p-8">
          <div className="mb-8">
            <p className="text-xs tracking-[0.45em] text-zinc-500">
              ??? ??? ?????
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-white">
              ???? ???? ??????
            </h1>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              ??? ??? ??? ????? ?? ????? ????? ??? ?? ???? ??????? ??????? ?
              ??????? ????.
            </p>
          </div>

          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
              <span>?????? ??? ???</span>
              <span>{Math.round(progress)}%</span>
            </div>

            <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-zinc-900">
              <div
                className="h-full rounded-full bg-white transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              {steps.map((item) => {
                const active = item.id === step;
                const completed = item.id < step;

                return (
                  <div
                    key={item.id}
                    className="flex flex-1 items-center justify-center"
                    title={item.title}
                  >
                    <span
                      className={`h-3 w-3 rounded-full border transition ${
                        active
                          ? "border-white bg-white"
                          : completed
                            ? "border-zinc-500 bg-zinc-500"
                            : "border-zinc-800 bg-black"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <form className="space-y-6" onKeyDown={handleKeyDown} onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm text-zinc-300">??? ? ??? ????????</span>
                  <input
                    autoFocus
                    className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white"
                    name="name"
                    onChange={handleChange}
                    placeholder="??? ????"
                    type="text"
                    value={form.name}
                  />
                </label>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm text-zinc-300">?????</span>
                  <input
                    autoFocus
                    className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white"
                    name="email"
                    onChange={handleChange}
                    placeholder="example@email.com"
                    type="email"
                    value={form.email}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-zinc-300">????? ??????</span>
                  <input
                    className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white"
                    inputMode="numeric"
                    maxLength={11}
                    name="phone"
                    onChange={handleChange}
                    placeholder="09123456789"
                    type="text"
                    value={form.phone}
                  />
                  <p className="mt-2 text-xs text-zinc-500">????? ???? ????? 11 ??? ? ?? 09 ???? ???.</p>
                </label>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm text-zinc-300">??? ????</span>
                  <input
                    autoFocus
                    className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white"
                    name="password"
                    onChange={handleChange}
                    placeholder="????? 6 ???????"
                    type="password"
                    value={form.password}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-zinc-300">????? ??? ????</span>
                  <input
                    className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white"
                    name="confirmPassword"
                    onChange={handleChange}
                    placeholder="??? ???? ?? ?????? ???? ????"
                    type="password"
                    value={form.confirmPassword}
                  />
                </label>
              </div>
            )}

            {step === 4 && (
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm text-zinc-300">?????</span>
                  <input
                    autoFocus
                    className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white"
                    name="province"
                    onChange={handleChange}
                    placeholder="???? ?????"
                    type="text"
                    value={form.province}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-zinc-300">???</span>
                  <input
                    className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white"
                    name="city"
                    onChange={handleChange}
                    placeholder="???? ?????"
                    type="text"
                    value={form.city}
                  />
                </label>
              </div>
            )}

            {step === 5 && (
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm text-zinc-300">???? ????</span>
                  <textarea
                    className="min-h-32 w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white"
                    name="address"
                    onChange={handleChange}
                    placeholder="???? ???? ?? ???? ????"
                    value={form.address}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-zinc-300">????</span>
                  <input
                    className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white"
                    inputMode="numeric"
                    name="plateNumber"
                    onChange={handleChange}
                    placeholder="???? 12"
                    type="text"
                    value={form.plateNumber}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-zinc-300">?? ????</span>
                  <input
                    className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white"
                    inputMode="numeric"
                    maxLength={10}
                    name="postalCode"
                    onChange={handleChange}
                    placeholder="???? 1234567890"
                    type="text"
                    value={form.postalCode}
                  />
                </label>
              </div>
            )}

            {step === 6 && (
              <div className="grid gap-4">
                <div className="rounded-2xl border border-zinc-900 bg-black p-5">
                  <h2 className="mb-4 text-sm font-medium text-white">??????? ????</h2>
                  <div className="grid gap-3 text-sm text-zinc-400 md:grid-cols-2">
                    <p>???: {form.name || "-"}</p>
                    <p>?????: {form.email || "-"}</p>
                    <p>????? ??????: {form.phone || "-"}</p>
                    <p>??? ????: {form.password ? "??? ???" : "-"}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-900 bg-black p-5">
                  <h2 className="mb-4 text-sm font-medium text-white">??????? ????</h2>
                  <div className="grid gap-3 text-sm text-zinc-400 md:grid-cols-2">
                    <p>?????: {form.province || "-"}</p>
                    <p>???: {form.city || "-"}</p>
                    <p>????: {form.plateNumber || "-"}</p>
                    <p>?? ????: {form.postalCode || "-"}</p>
                    <p className="md:col-span-2">????: {form.address || "-"}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                {step > 1 && (
                  <button
                    className="rounded-2xl border border-zinc-800 bg-black px-5 py-3 text-sm text-zinc-300 transition hover:border-white hover:text-white"
                    onClick={previousStep}
                    type="button"
                  >
                    ????? ???
                  </button>
                )}

                {step < steps.length && (
                  <button
                    className="rounded-2xl border border-white bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
                    onClick={nextStep}
                    type="button"
                  >
                    ?????
                  </button>
                )}

                {step === steps.length && (
                  <button
                    className="rounded-2xl border border-white bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-400"
                    disabled={isLoading}
                    type="submit"
                  >
                    {isLoading ? "?? ??? ??? ???..." : "??? ??? ?????"}
                  </button>
                )}
              </div>

              <p className="text-sm text-zinc-400">
                ???? ???? ?????????{" "}
                <Link
                  className="text-white underline underline-offset-4"
                  to="/signin"
                >
                  ????
                </Link>
              </p>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default SignUp;

