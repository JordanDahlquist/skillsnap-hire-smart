
import { Button } from "@/components/ui/button";
import { Archive, Download } from "lucide-react";

interface BulkActionsProps {
  selectedCount: number;
  onBulkAction: (action: string) => void;
}

export const BulkActions = ({ selectedCount, onBulkAction }: BulkActionsProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onBulkAction('activate')}
      >
        Activate Selected
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onBulkAction('pause')}
      >
        Pause Selected
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onBulkAction('archive')}
      >
        <Archive className="w-4 h-4 mr-1" />
        Archive Selected
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onBulkAction('export')}
      >
        <Download className="w-4 h-4 mr-1" />
        Export Data
      </Button>
    </div>
  );
};
