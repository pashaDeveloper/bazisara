import React from "react";
import { NavLink } from "react-router-dom";

const AddButton = ({ link, onClick }) => {
  const ButtonComponent = link ? NavLink : "a"; // انتخاب کامپوننت مناسب

  return (
    <ButtonComponent
      to={link}
      onClick={!link ? onClick : undefined} // اگر `link` نبود، `onClick` فعال شود
      className="dashboard-add-button inline-flex w-auto cursor-pointer items-center gap-2 rounded-primary border border-green-600 bg-green-600 px-5 py-2 text-white shadow-sm shadow-green-900/20 transition-all hover:bg-green-700 dark:border-blue-600 dark:bg-blue-600 dark:text-white dark:shadow-blue-900/20 dark:hover:bg-blue-700"
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

