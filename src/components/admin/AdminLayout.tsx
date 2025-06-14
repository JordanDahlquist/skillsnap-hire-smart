
import { ReactNode } from "react";
import { AdminNavigation } from "./AdminNavigation";
import { UnifiedHeader } from "../UnifiedHeader";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Main site header for navigation back to other areas */}
      <UnifiedHeader />
      
      {/* Admin panel layout */}
      <div className="flex">
        <AdminNavigation />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
