
import { Badge } from "@/components/ui/badge";
import { XCircle } from "lucide-react";

interface RejectedStageCardProps {
  count: number;
  isSelected: boolean;
  onStageSelect: (stage: string) => void;
}

export const RejectedStageCard = ({
  count,
  isSelected,
  onStageSelect
}: RejectedStageCardProps) => {
  return (
    <div
      onClick={() => onStageSelect('rejected')}
      className={`group relative bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden flex-shrink-0 w-32 ${
        isSelected
          ? 'border-red-500 ring-2 ring-red-500 ring-opacity-20 scale-105'
          : 'border-gray-200 hover:border-red-300'
      }`}
    >
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="w-2 h-2 rounded-full bg-red-500 transition-all duration-200"></div>
          <XCircle className="w-3 h-3 text-red-500" />
        </div>
        
        <h3 className={`font-semibold text-xs mb-2 transition-colors duration-200 truncate ${
          isSelected ? 'text-gray-800' : 'text-gray-700'
        }`}>
          Rejected
        </h3>
        
        <Badge 
          variant={isSelected ? "default" : "secondary"}
          className={`text-sm font-bold px-2 py-1 transition-all duration-200 w-full justify-center ${
            isSelected ? 'bg-red-500 text-white' : 'bg-red-100 text-red-800'
          }`}
        >
          {count}
        </Badge>
      </div>
      
      {/* Colored accent bar */}
      <div 
        className={`absolute bottom-0 left-0 right-0 h-1 bg-red-500 transition-all duration-300 ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
        }`}
      ></div>
      
      {/* Subtle gradient overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-r from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
          isSelected ? 'opacity-100' : ''
        }`}
      ></div>
    </div>
  );
};
