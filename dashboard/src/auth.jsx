import { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { addAdmin, clearAdmin } from "@/features/auth/authSlice";
import { usePersistLoginQuery } from "@/services/auth/authApi";

const Auth = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("token");

  const {
    data: adminData,
    error: adminError,
    isLoading,
  } = usePersistLoginQuery(undefined, {
    skip: !token,
  });

  const admin = useMemo(() => adminData?.data || {}, [adminData]);

  useEffect(() => {
    if (adminData && !adminError) {
      dispatch(addAdmin(admin));
    }

    if (adminError?.data) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      dispatch(clearAdmin());
      toast.error(adminError.data.description || "Session is invalid", {
        id: "auth",
      });

      if (location.pathname !== "/signin") {
        navigate("/signin", {
          replace: true,
          state: { from: location.pathname },
        });
      }
    }
  }, [admin, adminData, adminError, dispatch, location.pathname, navigate]);

  if (!token) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-6">
        <div
          aria-label="Checking admin session"
          className="h-12 w-12 animate-spin rounded-full border-2 border-zinc-800 border-t-white"
          role="status"
        />
      </div>
    );
  }

  return <>{children}</>;
};

export default Auth;

