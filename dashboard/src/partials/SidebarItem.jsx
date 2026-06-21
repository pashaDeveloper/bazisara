import { useState } from "react";
import { NavLink } from "react-router-dom";
import Arrow from "@/components/icons/Arrow";

const SidebarItem = ({ item, sidebarExpanded, pathname, onNavigate }) => {
  const isActive = pathname === item.path || item.subItems?.some((sub) => pathname === sub.path);
  const [isOpen, setIsOpen] = useState(isActive);

  const handleToggle = () => {
    if (item.subItems) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <li
      className={`mb-1 rounded-primary px-3 py-2 transition ${
        isActive || isOpen
          ? "bg-green-50 text-green-700 ring-1 ring-green-500 dark:bg-blue-950/40 dark:text-blue-100 dark:ring-blue-500"
          : "hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
      title={!sidebarExpanded ? item.title : undefined}
    >
      <div
        onClick={handleToggle}
        className={`flex cursor-pointer items-center ${sidebarExpanded ? "justify-between" : "justify-between lg:justify-center"}`}
      >
        {item.path ? (
          <NavLink
            end
            to={item.path}
            onClick={onNavigate}
            className={`flex min-w-0 items-center text-gray-700 transition dark:text-gray-100 ${sidebarExpanded ? "" : "lg:justify-center"} ${
              isActive ? "text-green-700 dark:text-blue-100" : "hover:text-green-600 dark:hover:text-blue-200"
            }`}
          >
            <item.icon className={`shrink-0 fill-current ${isActive ? "text-green-600 dark:text-blue-300" : "text-gray-500 dark:text-gray-400"}`} />
            <span className={`mr-4 text-sm font-medium duration-200 ${sidebarExpanded ? "lg:inline" : "lg:hidden"}`}>
              {item.title}
            </span>
          </NavLink>
        ) : (
          <div className={`flex items-center text-gray-700 transition dark:text-gray-100 ${isActive ? "text-green-700 dark:text-blue-100" : "hover:text-green-600 dark:hover:text-blue-200"}`}>
            <item.icon className={`shrink-0 fill-current ${isActive ? "text-green-600 dark:text-blue-300" : "text-gray-500 dark:text-gray-400"}`} />
            <span className={`mr-4 text-sm font-medium duration-200 ${sidebarExpanded ? "lg:inline" : "lg:hidden"}`}>
              {item.title}
            </span>
          </div>
        )}

        {item.subItems && sidebarExpanded && (
          <Arrow className={`h-4 w-4 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        )}
      </div>

      {item.subItems && sidebarExpanded && (
        <ul className={`mt-3 space-y-2 ${isOpen ? "block" : "hidden"}`}>
          {item.subItems.map((subItem) => (
            <li key={subItem.path}>
              <NavLink
                end
                to={subItem.path}
                onClick={onNavigate}
                className={({ isActive: activeSub }) =>
                  `flex items-center gap-x-2 truncate rounded-md px-2 py-1 text-sm transition ${
                    !sidebarExpanded ? "" : "mr-3"
                  } ${activeSub ? "bg-green-100 text-green-700 dark:bg-blue-950/40 dark:text-blue-100" : "text-gray-500 hover:bg-gray-100 hover:text-green-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-200"}`
                }
              >
                {subItem.icon && <subItem.icon className="shrink-0 fill-current text-zinc-500" />}
                <span className="font-medium">{subItem.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default SidebarItem;

