import React from "react";
import { NavLink } from "react-router-dom";

const AddButton = ({ link, onClick }) => {
  const ButtonComponent = link ? NavLink : "a"; // انتخاب کامپوننت مناسب

  return (
    <ButtonComponent
      to={link}
      onClick={!link ? onClick : undefined} // اگر `link` نبود، `onClick` فعال شود
      className="inline-flex w-auto items-center rounded-lg bg-green-500 dark:bg-blue-500 px-5 py-2 text-white shadow-sm cursor-pointer transition-all hover:bg-green-400 dark:hover:bg-blue-400 gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16">
        <path
          fill="currentColor"
          d="M8.5 2.75a.75.75 0 0 0-1.5 0V7H2.75a.75.75 0 0 0 0 1.5H7v4.25a.75.75 0 0 0 1.5 0V8.5h4.25a.75.75 0 0 0 0-1.5H8.5z"
        />
      </svg>
      <span className="text-white">افزودن آیتم جدید</span>
    </ButtonComponent>
  );
};

export default AddButton;
