
import Next from "@/components/icons/Next"
import Prev from "@/components/icons/Prev"

const NavigationButton = ({ direction = "next", onClick }) => {
    const isNext = direction === "next";
    return (
      <button
        type="button"
        onClick={onClick}
        className="group inline-flex items-center border border-green-300 dark:border-blue-600 px-4 py-2 rounded-md text-green-500 dark:text-blue-500 hover:bg-green-50 dark:hover:bg-gray-900"
      >
        {isNext ? (
          <>
           <Next 
              className="h-6 w-6 transition-transform duration-300 transform group-hover:translate-x-1 group-focus:translate-x-1"
 />
            <span className="mr-2 ">بعدی</span>
          </>
        ) : (
          <>
            <span className="ml-2 ">قبلی</span>
            <Prev className="h-6 w-6 transition-transform duration-300 transform group-hover:-translate-x-1 group-focus:-translate-x-1" />

          </>
        )}
      </button>
    );
  };
  
  export default NavigationButton;
  