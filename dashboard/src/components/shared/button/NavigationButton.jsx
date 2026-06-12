import Next from "@/components/icons/Next";
import Prev from "@/components/icons/Prev";

const NavigationButton = ({
  direction = "next",
  onClick,
  disabled = false,
  label,
  className = "",
}) => {
  const isNext = direction === "next";
  const buttonLabel = label || (isNext ? "ادامه" : "بازگشت");

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group inline-flex items-center rounded-md border border-green-300 px-4 py-2 text-green-500 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-600 dark:text-blue-500 dark:hover:bg-gray-900 ${className}`.trim()}
    >
      {isNext ? (
        <>
          <Next className="h-6 w-6 transform transition-transform duration-300 group-hover:translate-x-1 group-focus:translate-x-1" />
          <span className="mr-2">{buttonLabel}</span>
        </>
      ) : (
        <>
          <span className="ml-2">{buttonLabel}</span>
          <Prev className="h-6 w-6 transform transition-transform duration-300 group-hover:-translate-x-1 group-focus:-translate-x-1" />
        </>
      )}
    </button>
  );
};

export default NavigationButton;

