import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

export default function RequireAdminAuth() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[var(--color-bg)] text-sm text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">
        Yükleniyor...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
