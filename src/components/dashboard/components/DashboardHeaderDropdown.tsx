
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal,
  Download,
  Pencil,
  Archive,
  ArchiveRestore,
  Loader2
} from "lucide-react";

interface DashboardHeaderDropdownProps {
  isUpdating: boolean;
  isArchived: boolean;
  onEditJob: () => void;
  onExportApplications: () => void;
  onArchiveJob: () => void;
  onUnarchiveJob: () => void;
}

export const DashboardHeaderDropdown = ({
  isUpdating,
  isArchived,
  onEditJob,
  onExportApplications,
  onArchiveJob,
  onUnarchiveJob
}: DashboardHeaderDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isUpdating}>
          {isUpdating ? (
            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
          ) : (
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEditJob}>
          <Pencil className="w-4 h-4 mr-2" />
          Edit Job
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportApplications}>
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {isArchived ? (
          <DropdownMenuItem onClick={onUnarchiveJob}>
            <ArchiveRestore className="w-4 h-4 mr-2" />
            Unarchive Job
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={onArchiveJob} className="text-destructive">
            <Archive className="w-4 h-4 mr-2" />
            Archive Job
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
