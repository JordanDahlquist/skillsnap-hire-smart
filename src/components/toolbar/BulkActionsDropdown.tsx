
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Play, Pause, Archive, Download } from "lucide-react";

interface BulkActionsDropdownProps {
  selectedCount: number;
  onBulkAction: (action: string) => void;
}

export const BulkActionsDropdown = ({
  selectedCount,
  onBulkAction
}: BulkActionsDropdownProps) => {
  if (selectedCount === 0) return null;

  const handleActionSelect = (action: string) => {
    if (action && action !== 'placeholder') {
      onBulkAction(action);
    }
  };

  return (
    <Select onValueChange={handleActionSelect}>
      <SelectTrigger className="w-36 bg-card text-foreground shadow-[0_8px_24px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.2)_inset,0_1px_0_rgba(255,255,255,0.3)_inset,0_-1px_0_rgba(0,0,0,0.03)_inset] border border-border hover:bg-card hover:text-foreground hover:shadow-[0_12px_32px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.3)_inset,0_2px_0_rgba(255,255,255,0.4)_inset,0_-1px_0_rgba(0,0,0,0.05)_inset] hover:border-border rounded-2xl transition-all duration-300 focus:ring-0">
        <Settings className="w-4 h-4 mr-1 text-foreground" />
        <SelectValue placeholder="Actions" />
      </SelectTrigger>
      <SelectContent className="bg-background border-border shadow-lg">
        <SelectItem value="activate" className="text-foreground hover:bg-muted">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-green-600" />
            Activate
          </div>
        </SelectItem>
        <SelectItem value="pause" className="text-foreground hover:bg-muted">
          <div className="flex items-center gap-2">
            <Pause className="w-4 h-4 text-orange-600" />
            Pause
          </div>
        </SelectItem>
        <SelectItem value="archive" className="text-foreground hover:bg-muted">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-gray-600" />
            Archive
          </div>
        </SelectItem>
        <SelectItem value="export" className="text-foreground hover:bg-muted">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-600" />
            Export
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
