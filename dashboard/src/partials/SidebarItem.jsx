import { useState } from "react";
import { NavLink } from "react-router-dom";
import Arrow from "@/components/icons/Arrow";

const SidebarItem = ({ item, sidebarExpanded, pathname }) => {
  const isActive = pathname === item.path || item.subItems?.some((sub) => pathname === sub.path);
  const [isOpen, setIsOpen] = useState(isActive);

  const handleToggle = () => {
    if (item.subItems) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <li
      className={`mb-1 rounded-lg border border-transparent px-3 py-2 transition ${
        isActive || isOpen ? "border-zinc-700 bg-zinc-900" : "hover:border-zinc-800 hover:bg-zinc-950"
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
            className={`flex min-w-0 items-center text-zinc-300 transition ${sidebarExpanded ? "" : "lg:justify-center"} ${
              isActive ? "text-white" : "hover:text-white"
            }`}
          >
            <item.icon className={`shrink-0 fill-current ${isActive ? "text-white" : "text-zinc-500"}`} />
            <span className={`mr-4 text-sm font-medium duration-200 ${sidebarExpanded ? "lg:inline" : "lg:hidden"}`}>
              {item.title}
            </span>
          </NavLink>
        ) : (
          <div className={`flex items-center text-zinc-300 transition ${isActive ? "text-white" : "hover:text-white"}`}>
            <item.icon className={`shrink-0 fill-current ${isActive ? "text-white" : "text-zinc-500"}`} />
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
                className={({ isActive: activeSub }) =>
                  `flex items-center gap-x-2 truncate rounded-md px-2 py-1 text-sm transition ${
                    !sidebarExpanded ? "" : "mr-3"
                  } ${activeSub ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"}`
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

