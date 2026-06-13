import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addAdmin } from "@/features/auth/authSlice";
import MutationFeedback from "@/components/MutationFeedback";
import { useSignInAdminMutation } from "@/services/auth/authApi";

function SignIn() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [signInAdmin, { data, isLoading, isSuccess, error, isError }] =
    useSignInAdminMutation();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");

    if (token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

      await signInAdmin(form).unwrap();
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <MutationFeedback
        state={{ data, isLoading, isSuccess, isError, error }}
        toastId="signin"
        loadingMessage="در حال ورود..."
        successMessage="ورود با موفقیت انجام شد"
        errorMessage="ورود ناموفق بود"
        navigateTo={location.state?.from || "/"}
        onSuccess={(response) => {
          localStorage.setItem("accessToken", response.accessToken);
          dispatch(addAdmin(response.data || {}));
        }}
      />

      <div className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="w-full rounded-3xl border border-zinc-900 bg-zinc-950 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-8">
          <div className="mb-8">
            <p className="text-xs tracking-[0.45em] text-zinc-500">پنل ادمین</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">
              ورود به داشبورد
            </h2>
            <p className="mt-3 text-sm text-zinc-400">
              برای دسترسی به پنل مدیریت، ایمیل و رمز عبور خود را وارد کنید.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm text-zinc-300">ایمیل</span>
              <input
                className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white"
                name="email"
                onChange={handleChange}
                placeholder="example@email.com"
                required
                type="email"
                value={form.email}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-zinc-300">رمز عبور</span>
              <input
                className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white"
                name="password"
                onChange={handleChange}
                placeholder="رمز عبور خود را وارد کنید"
                required
                type="password"
                value={form.password}
              />
            </label>

            <button
              className="w-full rounded-2xl border border-white bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-400"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? "در حال ورود..." : "ورود"}
            </button>
          </form>

          <p className="mt-6 text-sm text-zinc-400">
            هنوز حساب کاربری ندارید؟{" "}
            <Link
              className="text-white underline underline-offset-4"
              to="/signup"
            >
              ثبت‌نام کنید
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}

export default SignIn;

