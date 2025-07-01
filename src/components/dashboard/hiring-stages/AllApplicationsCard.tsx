
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface AllApplicationsCardProps {
  totalApplications: number;
  selectedStage: string | null;
  onStageSelect: (stage: string | null) => void;
}

export const AllApplicationsCard = ({
  totalApplications,
  selectedStage,
  onStageSelect
}: AllApplicationsCardProps) => {
  return (
    <div
      onClick={() => onStageSelect(null)}
      className={`group relative glass-card-no-hover cursor-pointer overflow-hidden transition-all duration-300 ${
        selectedStage === null
          ? 'border-primary ring-2 ring-primary/20 scale-105 shadow-lg'
          : 'hover:scale-102 hover:shadow-md'
      }`}
    >
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              selectedStage === null ? 'bg-primary' : 'bg-muted-foreground/60'
            } transition-colors duration-200`}></div>
            <h3 className={`font-semibold text-xs ${
              selectedStage === null ? 'text-primary' : 'text-foreground/80'
            } transition-colors duration-200`}>
              All Applications
            </h3>
          </div>
          <Users className={`w-3 h-3 ${
            selectedStage === null ? 'text-primary' : 'text-muted-foreground'
          } transition-colors duration-200`} />
        </div>
        
        <div className="flex items-center justify-between">
          <Badge 
            variant={selectedStage === null ? "default" : "secondary"}
            className={`text-base font-bold px-2 py-0.5 transition-all duration-200 ${
              selectedStage === null 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {totalApplications}
          </Badge>
          
          <div className="text-xs text-muted-foreground font-medium">
            Total
          </div>
        </div>
      </div>
      
      {/* Subtle gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent transition-opacity duration-300 ${
        selectedStage === null ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}></div>
    </div>
  );
};
