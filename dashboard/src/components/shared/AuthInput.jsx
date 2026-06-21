import React from "react";

const AuthInput = React.forwardRef(
  ({ icon: Icon, className = "", children, ...props }, ref) => {
    return (
      <div className="relative">
        {Icon && (
          <span className="pointer-events-none absolute right-0 top-0 flex h-full w-12 items-center justify-center rounded-r-primary rounded-l-none border border-l border-gray-300 bg-gray-200 text-gray-700 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
            <Icon className="h-5 w-5" />
          </span>
        )}
        <input
          ref={ref}
          {...props}
          className={`w-full border bg-white py-2 pl-3 pr-14 text-sm outline-none transition focus:border-green-400 focus:ring-0 dark:bg-[#0a2d4d] dark:focus:border-blue-500 ${className}`}
        />
        {children}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";

export default AuthInput;
