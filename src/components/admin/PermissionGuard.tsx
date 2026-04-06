import type { ReactNode } from "react";
import type { AdminPermission } from "@/lib/adminDashboard";
import { canAccessPermission } from "@/lib/adminDashboard";
import { useAuth } from "@/contexts/AuthContext";

interface PermissionGuardProps {
  permission?: AdminPermission;
  fallback?: ReactNode;
  children: ReactNode;
}

const PermissionGuard = ({ permission, fallback = null, children }: PermissionGuardProps) => {
  const { currentUser } = useAuth();

  if (!canAccessPermission(currentUser, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGuard;
