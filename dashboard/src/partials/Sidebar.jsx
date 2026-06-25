import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import SidebarItem from "./SidebarItem";
import Expand from "@/components/icons/Expand";
import Category from "@/components/icons/Category";
import Company from "@/components/icons/Company";
import DashboardIcon from "@/components/icons/Dashboard";
import Gallery from "@/components/icons/Gallery";
import Keyword from "@/components/icons/Keyword";
import Blog from "@/components/icons/Blog";
import Products from "@/components/icons/Products";
import Rank from "@/components/icons/Rank";
import Setting from "@/components/icons/Setting";
import { FullScreen as Screen } from "@/components/icons/Screen";
import Tag from "@/components/icons/Tag";
import User from "@/components/icons/User";
import Messages from "@/components/icons/Messages";
import logo from "../favicon.svg";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const { pathname } = location;
  const admin = useSelector((state) => state.auth.admin);
  const isOwner = admin?.role === "owner";
  const canManageUsers = ["owner", "superAdmin", "admin"].includes(admin?.role);

  const trigger = useRef(null);
  const sidebar = useRef(null);

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true"
  );

  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded);
    if (sidebarExpanded) {
      document.querySelector("body").classList.add("sidebar-expanded");
    } else {
      document.querySelector("body").classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  const sidebarItems = [
    { title: "صفحه اصلی", icon: DashboardIcon, path: "/" },
    { title: "پروفایل", icon: User, path: "/profile" },
    { title: "پیام‌ها", icon: Messages, path: "/messages" },
    { title: "نشست‌ها", icon: Screen, path: "/sessions" },
    ...(canManageUsers ? [{ title: "کاربران", icon: User, path: "/users" }] : []),
    ...(isOwner ? [{ title: "تأییدیه‌ها", icon: User, path: "/approvals" }] : []),
    { title: "آیکون‌ها", icon: Gallery, path: "/icons" },
    { title: "تگ‌ها", icon: Tag, path: "/tags" },
    { title: "دسته‌بندی‌ها", icon: Category, path: "/categories" },
    { title: "تعریف فیلترها", icon: Setting, path: "/filter-definitions" },
    { title: "فیلترهای دسته‌بندی", icon: Keyword, path: "/category-filters" },
    { title: "ژانرها", icon: Rank, path: "/genres" },
    { title: "پلتفرم‌ها", icon: Rank, path: "/platforms" },
    { title: "سازنده و ناشر", icon: Company, path: "/companies" },
    { title: "برندها", icon: Company, path: "/brands" },
    { title: "کالکشن‌های بازی", icon: Products, path: "/game-collections" },
    { title: "بازی‌ها", icon: Products, path: "/games" },
    { title: "محصولات", icon: Products, path: "/products" },
    { title: "شرکت‌های گارانتی", icon: Company, path: "/warranty-companies" },
    { title: "گارانتی‌ها", icon: Company, path: "/warranties" },
    { title: "شرکت‌های بیمه", icon: Company, path: "/insurance-companies" },
    { title: "بیمه‌ها", icon: Company, path: "/insurances" },
    { title: "قیمت‌ها", icon: Products, path: "/prices" },
    { title: "نحوه ارسال", icon: Products, path: "/shipping-methods" },
    { title: "مجله", icon: Blog, path: "/articles" },
    { title: "اسلایدرها", icon: Gallery, path: "/sliders" },
  ];

  return (
    <div className="min-w-fit">
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-200 lg:hidden lg:z-auto ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
      />

      <div
        id="sidebar"
        ref={sidebar}
        dir="ltr"
        className={`absolute right-0 top-0 z-50 flex h-screen w-64 shrink-0 flex-col overflow-x-hidden overflow-y-auto border-l border-gray-200 bg-white p-3 shadow-lg transition-transform duration-200 ease-in-out [scrollbar-color:#16a34a_transparent] [scrollbar-width:thin] dark:border-gray-800 dark:bg-gray-900 dark:[scrollbar-color:#22c55e_transparent] lg:static lg:right-auto lg:top-auto lg:!flex lg:translate-x-0 lg:transition-none ${
          sidebarExpanded ? "lg:w-64" : "lg:w-20"
        } ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex min-h-full flex-col" dir="rtl">
        <div className={`mb-8 flex items-center gap-2 ${sidebarExpanded ? "justify-between" : "justify-center"}`}>
          <NavLink
            end
            to="/"
            className={`min-w-0 justify-center transition ${sidebarExpanded ? "lg:flex" : "lg:hidden"} ${
              sidebarExpanded ? "flex" : "flex lg:hidden"
            }`}
          >
            <img src={logo} alt="logo" width={141} height={40} className="max-w-full cursor-pointer grayscale" />
          </NavLink>
          <button
            ref={trigger}
            className="text-zinc-500 transition hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
            </svg>
          </button>
          <button
            className="hidden h-10 w-10 items-center justify-center rounded-secondary border border-gray-300 bg-gray-100 text-gray-700 shadow-sm transition hover:border-green-500 hover:text-green-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-blue-500 dark:hover:text-blue-300 lg:inline-flex"
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            type="button"
            aria-controls="sidebar"
            aria-expanded={sidebarExpanded}
            title={sidebarExpanded ? "بستن نوار کناری" : "باز کردن نوار کناری"}
          >
            <Expand className={`h-4 w-4 transition-transform ${sidebarExpanded ? "rotate-180" : ""}`} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="pl-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              <span className={`hidden w-6 text-center ${sidebarExpanded ? "lg:hidden" : "lg:block"}`} aria-hidden="true">
                ...
              </span>
              <span className={`block ${sidebarExpanded ? "lg:block" : "lg:hidden"}`}>مدیریت</span>
            </h3>
            <ul className="mt-3">
              {sidebarItems.map((item, index) => (
                <SidebarItem
                  key={`${item.title}-${index}`}
                  item={item}
                  sidebarExpanded={sidebarExpanded}
                  pathname={pathname}
                  onNavigate={() => setSidebarOpen(false)}
                />
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-auto hidden justify-center pt-3 lg:inline-flex">
          <div className="w-12 px-3 py-2">
            <button className="text-zinc-500 transition hover:text-white" onClick={() => setSidebarExpanded(!sidebarExpanded)}>
              <span className="sr-only">Expand / collapse sidebar</span>
              <Expand className={`transition-transform ${sidebarExpanded ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
