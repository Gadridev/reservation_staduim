import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "./store";
import type { UserRole } from "./api";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { PageLoadingSkeleton } from "../../components/ui/PageLoadingSkeleton";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isInitializing } = useAuthStore();
  const location = useLocation();

  useEffect(() => {

    if (!isInitializing && !user) {
      toast.error("Please log in to access this page.", {
        id: "auth-unauthorized",
      });
    }


    if (
      !isInitializing &&
      user &&
      allowedRoles &&
      (!user.role || !allowedRoles.includes(user.role))
    ) {
      toast.error("You don't have permission to access this page.", {
        id: "auth-forbidden",
      });
    }
  }, [isInitializing, user, allowedRoles]);
  if (isInitializing) {
    return <PageLoadingSkeleton />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && (!user.role || !allowedRoles.includes(user.role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
