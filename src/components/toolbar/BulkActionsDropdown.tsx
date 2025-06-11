
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
      <SelectTrigger className="w-36 backdrop-blur-2xl bg-gradient-to-br from-white/20 via-white/15 to-white/8 text-slate-700 shadow-[0_8px_24px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.2)_inset,0_1px_0_rgba(255,255,255,0.3)_inset,0_-1px_0_rgba(0,0,0,0.03)_inset] border border-white/12 hover:bg-gradient-to-br hover:from-white/30 hover:via-white/25 hover:to-white/15 hover:text-slate-900 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.3)_inset,0_2px_0_rgba(255,255,255,0.4)_inset,0_-1px_0_rgba(0,0,0,0.05)_inset] hover:border-white/20 rounded-2xl transition-all duration-300 focus:ring-0">
        <Settings className="w-4 h-4 mr-1 text-slate-700" />
        <SelectValue placeholder="Actions" />
      </SelectTrigger>
      <SelectContent className="bg-white/95 backdrop-blur-sm border-white/40 shadow-lg">
        <SelectItem value="activate" className="text-gray-900 hover:bg-gray-100">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-green-600" />
            Activate
          </div>
        </SelectItem>
        <SelectItem value="pause" className="text-gray-900 hover:bg-gray-100">
          <div className="flex items-center gap-2">
            <Pause className="w-4 h-4 text-orange-600" />
            Pause
          </div>
        </SelectItem>
        <SelectItem value="archive" className="text-gray-900 hover:bg-gray-100">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-gray-600" />
            Archive
          </div>
        </SelectItem>
        <SelectItem value="export" className="text-gray-900 hover:bg-gray-100">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-600" />
            Export
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
