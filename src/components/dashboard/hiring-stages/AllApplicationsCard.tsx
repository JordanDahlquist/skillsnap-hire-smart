
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
      className={`group relative bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden flex-shrink-0 w-32 ${
        selectedStage === null
          ? 'border-blue-500 ring-2 ring-blue-100 scale-105'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className={`w-2 h-2 rounded-full ${
            selectedStage === null ? 'bg-blue-500' : 'bg-gray-400'
          } transition-colors duration-200`}></div>
          <Users className={`w-3 h-3 ${
            selectedStage === null ? 'text-blue-500' : 'text-gray-400'
          } transition-colors duration-200`} />
        </div>
        
        <h3 className={`font-semibold text-xs mb-2 ${
          selectedStage === null ? 'text-blue-700' : 'text-gray-700'
        } transition-colors duration-200 truncate`}>
          All
        </h3>
        
        <Badge 
          variant={selectedStage === null ? "default" : "secondary"}
          className={`text-sm font-bold px-2 py-1 w-full justify-center ${
            selectedStage === null 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-600'
          } transition-all duration-200`}
        >
          {totalApplications}
        </Badge>
      </div>
      
      {/* Subtle gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
        selectedStage === null ? 'opacity-100' : ''
      }`}></div>
    </div>
  );
};
