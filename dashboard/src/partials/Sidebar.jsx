import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import Expand from "@/components/icons/Expand";
import Dashboard from "@/components/icons/Dashboard";
import Category from "@/components/icons/Category";
import Star from "@/components/icons/Star";
import Setting from "@/components/icons/Setting";
import Tag from "@/components/icons/Tag";
import logo from "../favicon.svg";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const { pathname } = location;

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
    {
      title: "داشبورد",
      icon: Dashboard,
      path: "/",
    },
    { title: "بازی‌ها", icon: Star, path: "/games" },
    { title: "آیکون‌ها", icon: Tag, path: "/icons" },
    { title: "دسته بندی", icon: Category, path: "/categories" },
    { title: "تعریف فیلترها", icon: Setting, path: "/filter-definitions" },
    { title: "فیلتر دسته‌بندی", icon: Setting, path: "/category-filters" },
    { title: "ژانر", icon: Star, path: "/genres" },
    { title: "کمپانی", icon: Star, path: "/companies" },
    { title: "تگ‌ها", icon: Tag, path: "/tags" },
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
        className={`no-scrollbar absolute right-0 top-0 z-40 flex h-screen w-64 shrink-0 translate-x-64 flex-col overflow-y-auto border-l border-zinc-800 bg-black p-3 transition-all duration-200 ease-in-out lg:static lg:top-auto lg:!flex lg:translate-x-0 lg:right-auto ${
          sidebarExpanded ? "lg:w-64" : "lg:w-20"
        } ${
          sidebarOpen ? "translate-x-0" : ""
        }`}
      >
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
            className="hidden h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 text-zinc-500 transition hover:border-white hover:text-white lg:inline-flex"
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            type="button"
            aria-controls="sidebar"
            aria-expanded={sidebarExpanded}
            title={sidebarExpanded ? "بستن منو" : "باز کردن منو"}
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
              <span className={`block ${sidebarExpanded ? "lg:block" : "lg:hidden"}`}>صفحات</span>
            </h3>
            <ul className="mt-3 max-h-screen overflow-h-auto">
              {sidebarItems.map((item, index) => (
                <SidebarItem key={`${item.title}-${index}`} item={item} sidebarExpanded={sidebarExpanded} pathname={pathname} />
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
  );
}

export default Sidebar;
