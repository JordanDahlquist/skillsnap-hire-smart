
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Pencil, Copy, Archive, ExternalLink, BarChart3 } from "lucide-react";

interface JobCardActionsProps {
  jobId: string;
  onEdit: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
}

export const JobCardActions = ({ 
  jobId, 
  onEdit, 
  onDuplicate, 
  onArchive 
}: JobCardActionsProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="w-4 h-4 mr-1" />
          Edit
        </Button>
        <Button variant="outline" size="sm" onClick={onDuplicate}>
          <Copy className="w-4 h-4 mr-1" />
          Duplicate
        </Button>
        <Button variant="outline" size="sm" onClick={onArchive}>
          <Archive className="w-4 h-4 mr-1" />
          Archive
        </Button>
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <a href={`/apply/${jobId}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Public
          </a>
        </Button>
        <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700">
          <Link to={`/dashboard/${jobId}`}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Manage
          </Link>
        </Button>
      </div>
    </div>
  );
};
