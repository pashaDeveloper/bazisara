import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function MutationFeedback({
  state,
  toastId = "mutation-feedback",
  loadingMessage = "در حال انجام عملیات...",
  successMessage = "عملیات با موفقیت انجام شد",
  errorMessage = "عملیات انجام نشد",
  navigateTo,
  onSuccess,
  onError,
}) {
  const navigate = useNavigate();
  const { data, isLoading, isSuccess, isError, error } = state;

  useEffect(() => {
    if (isLoading) {
      toast.loading(loadingMessage, { id: toastId });
    }

    if (isSuccess && data?.acknowledgement) {
      toast.success(data.description || successMessage, { id: toastId });

      if (typeof onSuccess === "function") {
        onSuccess(data);
      }

      if (navigateTo) {
        navigate(navigateTo);
      }
    }

    if (isError) {
      toast.error(error?.data?.description || errorMessage, { id: toastId });

      if (typeof onError === "function") {
        onError(error);
      }
    }
  }, [
    data,
    error,
    errorMessage,
    isError,
    isLoading,
    isSuccess,
    loadingMessage,
    navigate,
    navigateTo,
    onError,
    onSuccess,
    successMessage,
    toastId,
  ]);

  return null;
}

export default MutationFeedback;
