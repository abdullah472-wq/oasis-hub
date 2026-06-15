import type { ReactNode } from "react";
import type { AdminPermission } from "@/lib/adminDashboard";
import type { AdminUser } from "@/lib/adminDashboard";
import { canAccessPermission } from "@/lib/adminDashboard";
import { useAuth } from "@/contexts/AuthContext";

interface PermissionGuardProps {
  user?: AdminUser | null;
  permission?: AdminPermission;
  fallback?: ReactNode;
  children: ReactNode;
}

const PermissionGuard = ({ user, permission, fallback = null, children }: PermissionGuardProps) => {
  const { currentUser } = useAuth();
  const activeUser = user ?? currentUser;

  if (!canAccessPermission(activeUser, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGuard;
