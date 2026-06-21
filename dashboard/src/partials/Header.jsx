import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearAdmin } from "@/features/auth/authSlice";
import { useThemeProvider } from "@/utils/ThemeContext";

function Header({ sidebarOpen, setSidebarOpen, variant = "default" }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const admin = useSelector((state) => state.auth.admin);
  const { currentTheme, changeCurrentTheme } = useThemeProvider();
  const isDark = currentTheme === "dark";

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    dispatch(clearAdmin());
    navigate("/signin", { replace: true });
  };

  const roleLabels = {
    owner: "مدیر کل",
    superAdmin: "مدیر ارشد",
    admin: "مدیر",
    operator: "اپراتور",
    guest: "مهمان",
    buyer: "خریدار",
  };

  const displayRole = roleLabels[admin?.role] || "مهمان";

  return (
    <header
      className={`sticky top-0 z-30 border-b border-gray-200 bg-white/90 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/90 ${
        variant === "v2" || variant === "v3" ? "" : ""
      }`}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              className="text-zinc-400 transition hover:text-white lg:hidden"
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              onClick={(e) => {
                e.stopPropagation();
                setSidebarOpen(!sidebarOpen);
              }}
            >
              <span className="sr-only">باز کردن منوی کناری</span>
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="5" width="16" height="2" />
                <rect x="4" y="11" width="16" height="2" />
                <rect x="4" y="17" width="16" height="2" />
              </svg>
            </button>
            <span className="hidden text-sm text-zinc-400 sm:block">وضعیت سیستم: پایدار</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              aria-label={isDark ? "فعال کردن حالت روشن" : "فعال کردن حالت تاریک"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-secondary border border-gray-300 bg-gray-100 text-gray-700 shadow-sm transition hover:border-green-500 hover:text-green-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-blue-500 dark:hover:text-blue-300"
              onClick={() => changeCurrentTheme(isDark ? "light" : "dark")}
              title={isDark ? "حالت روشن" : "حالت تاریک"}
              type="button"
            >
              {isDark ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path
                    d="M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M3 12h2M19 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="12" r="4" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 14.6A8.5 8.5 0 0 1 9.4 3a.75.75 0 0 0-.9-.9 10 10 0 1 0 13.4 13.4.75.75 0 0 0-.9-.9Z" />
                </svg>
              )}
            </button>
            <div className="hidden text-left sm:block">
              <p className="text-sm text-white">{admin?.name || "مدیر"}</p>
              <p className="text-xs text-zinc-500">{displayRole}</p>
            </div>
            <button
              className="rounded-secondary border border-green-700 bg-green-600 px-4 py-2 text-xs !text-white shadow-sm shadow-green-900/20 transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-green-500 dark:bg-green-600 dark:!text-white dark:hover:bg-green-500"
              onClick={handleLogout}
              type="button"
            >
              خروج
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

