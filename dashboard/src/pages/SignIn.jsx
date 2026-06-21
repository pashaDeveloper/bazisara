import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addAdmin } from "@/features/auth/authSlice";
import MutationFeedback from "@/components/MutationFeedback";
import ThemeToggle from "@/components/ThemeToggle";
import AuthInput from "@/components/shared/AuthInput";
import Email from "@/components/icons/Email";
import OutlineEye from "@/components/icons/OutlineEye";
import OutlineEyeInvisible from "@/components/icons/OutlineEyeInvisible";
import Password from "@/components/icons/Password";
import Send from "@/components/icons/Send";
import { useSignInAdminMutation } from "@/services/auth/authApi";

function SignIn() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [signInAdmin, { data, isLoading, isSuccess, error, isError }] =
    useSignInAdminMutation();
  const [showPassword, setShowPassword] = useState(false);
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

    try {
      await signInAdmin(form).unwrap();
    } catch (_) {}
  };

  return (
    <section className="relative flex h-screen w-screen items-center justify-center overflow-hidden p-4">
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

      <div className="wave"></div>
      <div className="wave wave2"></div>
      <div className="wave wave3"></div>

      <div className="z-50 flex w-full max-w-md flex-col gap-y-4 rounded-primary bg-white p-8 shadow-lg dark:bg-gray-900">
        <div className="flex flex-row items-center gap-x-2">
          <hr className="w-full dark:border-gray-600" />
          <img
            alt="logo"
            className="max-w-full cursor-pointer"
            height={40}
            src="/logo.png"
            width={141}
          />
          <hr className="w-full dark:border-gray-600" />
        </div>

        <form className="mt-2 flex flex-col gap-y-5" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-y-1" htmlFor="email">
            <span className="text-sm">ایمیل خود را وارد کنید</span>
            <AuthInput
              autoComplete="email"
              icon={Email}
              id="email"
              name="email"
              onChange={handleChange}
              placeholder="john@example.com"
              required
              type="email"
              value={form.email}
            />
          </label>

          <label className="relative flex flex-col gap-y-1" htmlFor="password">
            <span className="text-sm">رمز عبور خود را وارد کنید</span>
            <AuthInput
              autoComplete="current-password"
              className="pl-10"
              icon={Password}
              id="password"
              name="password"
              onChange={handleChange}
              placeholder="رمز عبور"
              required
              type={showPassword ? "text" : "password"}
              value={form.password}
            >
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword((prev) => !prev)}
                type="button"
              >
                {showPassword ? <OutlineEye /> : <OutlineEyeInvisible />}
              </button>
            </AuthInput>
          </label>

          <button
            className="group inline-flex transform items-center justify-center rounded-secondary border border-green-700 bg-green-600 px-4 py-2 text-white shadow-sm shadow-green-900/20 transition duration-300 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-green-500 dark:bg-green-600 dark:text-white dark:hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? (
              <span>در حال ورود...</span>
            ) : (
              <>
                <Send className="h-6 w-6 transform transition-transform duration-300 group-hover:translate-x-1 group-focus:translate-x-1" />
                <span className="mr-2">ورود</span>
              </>
            )}
          </button>
        </form>

        <div className="flex flex-row items-center justify-center gap-x-2 text-xs">
          <NavLink to="/signup">ثبت‌نام</NavLink>
          <span className="h-4 border-l" />
          <NavLink to="/forgot-password">فراموشی رمز عبور</NavLink>
        </div>

        <div className="flex flex-row items-center justify-center gap-x-2 text-xs">
          <ThemeToggle />
        </div>
      </div>
    </section>
  );
}

export default SignIn;
