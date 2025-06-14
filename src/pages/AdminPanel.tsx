
import { AdminLayout } from "@/components/admin/AdminLayout";
import { UserManagement } from "@/components/admin/UserManagement";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { useState } from "react";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <AdminLayout>
      <div className="flex-1">
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "users"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Users
            </button>
          </nav>
        </div>
        
        <div className="flex-1">
          {activeTab === "overview" && <AdminOverview />}
          {activeTab === "users" && <UserManagement />}
        </div>
      </div>
    </AdminLayout>
  );
}
