import Send from "@/components/icons/Send";

const SendButton = ({
  isLoading,
  label = "ارسال",
  loadingLabel = "در حال ارسال...",
}) => {
  return (
    <button
      type="submit"
      className="group inline-flex transform items-center rounded-md border border-green-300 px-4 py-2 text-green-500 transition-transform duration-300 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-600 dark:text-blue-500 dark:hover:bg-gray-900 dark:focus:ring-blue-500"
      disabled={isLoading}
    >
      {isLoading ? (
        <span>{loadingLabel}</span>
      ) : (
        <>
          <Send className="h-6 w-6 transform transition-transform duration-300 group-hover:translate-x-1 group-focus:translate-x-1" />
          <span className="mr-2">{label}</span>
        </>
      )}
    </button>
  );
};

export default SendButton;

