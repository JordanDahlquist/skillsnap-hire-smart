
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
      <SelectTrigger className="w-36 bg-transparent border-0 focus:ring-0 rounded-2xl backdrop-blur-sm bg-white/20 border border-white/30 hover:bg-white/30 transition-all duration-300">
        <Settings className="w-4 h-4 mr-1 text-slate-600" />
        <SelectValue placeholder="Actions" />
      </SelectTrigger>
      <SelectContent className="glass-card border-white/40">
        <SelectItem value="activate">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-green-600" />
            Activate
          </div>
        </SelectItem>
        <SelectItem value="pause">
          <div className="flex items-center gap-2">
            <Pause className="w-4 h-4 text-orange-600" />
            Pause
          </div>
        </SelectItem>
        <SelectItem value="archive">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-gray-600" />
            Archive
          </div>
        </SelectItem>
        <SelectItem value="export">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-600" />
            Export
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
