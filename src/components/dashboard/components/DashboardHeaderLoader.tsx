
import { Loader2 } from "lucide-react";
import { DASHBOARD_HEADER_CONSTANTS } from "../constants/dashboardHeaderConstants";

interface DashboardHeaderLoaderProps {
  isVisible: boolean;
  message?: string;
}

export const DashboardHeaderLoader = ({ isVisible, message = "Loading..." }: DashboardHeaderLoaderProps) => {
  if (!isVisible) return null;

  return (
    <div className={DASHBOARD_HEADER_CONSTANTS.LOADING_OVERLAY.BACKDROP + " flex items-center justify-center"}>
      <div className={DASHBOARD_HEADER_CONSTANTS.LOADING_OVERLAY.CONTENT + " flex items-center gap-3"}>
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>{message}</span>
      </div>
    </div>
  );
};
