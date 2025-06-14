
import { ReactNode } from "react";
import { AdminNavigation } from "./AdminNavigation";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminNavigation />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};
