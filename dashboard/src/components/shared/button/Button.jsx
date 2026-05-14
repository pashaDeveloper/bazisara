import React from "react";
import  MoonLoader   from "@/components/shared/loading/MoonLoaderLoading";

const Button = ({ children, className, isLoading, ...rest }) => {
  return (
    <button
      {...rest}
      className={
        "text-sm bg-primary/80 dark:bg-blue-500/80 text-white rounded-secondary border-primary dark:border-blue-500  border-b-[5px] border-solid hover:bg-primary/90 dark:hover:bg-blue-500/90 hover:text-black transition-all delay-100" +
        ` ${className}`
      }
      disabled={isLoading} 
    >
      {isLoading ? (
        <>
       <MoonLoader  />
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
