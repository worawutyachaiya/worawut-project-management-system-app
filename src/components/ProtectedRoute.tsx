import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Box, CircularProgress } from "@mui/material";

interface ProtectedRouteProps {
  roles?: string[];
}

export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, isLoading, hasAnyRole } = useAuthStore();

  console.log("ProtectedRoute:", {
    isAuthenticated,
    isLoading,
    path: location.pathname,
  });

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    console.log("ProtectedRoute: not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !hasAnyRole(...roles)) {
    console.log("ProtectedRoute: missing required roles");
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
