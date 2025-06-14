
import { ReactNode } from "react";
import { useAdminRole } from "@/hooks/useAdminRole";
import { AdminNavigation } from "./AdminNavigation";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { isSuperAdmin, isLoading } = useAdminRole();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNavigation />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};
