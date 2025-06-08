
import { Star } from "lucide-react";

interface ApplicationRatingSectionProps {
  manualRating: number | null;
  aiRating: number | null;
  onManualRating: (rating: number) => void;
  isUpdating: boolean;
}

export const ApplicationRatingSection = ({
  manualRating,
  aiRating,
  onManualRating,
  isUpdating
}: ApplicationRatingSectionProps) => {
  const renderAIRating = (rating: number | null) => {
    if (!rating) {
      return Array.from({ length: 3 }, (_, i) => (
        <Star key={i} className="w-5 h-5 text-gray-300" />
      ));
    }
    
    return Array.from({ length: 3 }, (_, i) => {
      const starValue = i + 1;
      const isActive = starValue <= Math.round(rating);
      
      return (
        <Star
          key={i}
          className={`w-5 h-5 ${
            isActive ? 'text-purple-500 fill-current' : 'text-gray-300'
          }`}
        />
      );
    });
  };

  const renderManualRatingStars = (currentRating: number | null) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 3 }, (_, i) => {
          const starValue = i + 1;
          const isActive = currentRating && starValue <= currentRating;
          
          return (
            <button
              key={i}
              onClick={() => onManualRating(starValue)}
              disabled={isUpdating}
              className={`transition-all duration-200 hover:scale-110 disabled:opacity-50 ${
                isActive ? 'text-blue-500' : 'text-gray-300 hover:text-blue-400'
              }`}
            >
              <Star 
                className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`}
              />
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex justify-between items-start gap-6">
        {/* Manual Rating Section - Left */}
        <div className="flex flex-col items-start gap-2">
          <span className="text-sm font-semibold text-gray-800">Your Rating</span>
          {renderManualRatingStars(manualRating)}
          <span className="text-xs text-gray-500 min-h-[16px]">
            {manualRating 
              ? `${manualRating} star${manualRating > 1 ? 's' : ''}`
              : 'Click to rate'
            }
          </span>
        </div>

        {/* Visual Divider */}
        <div className="w-px h-16 bg-gray-300"></div>

        {/* AI Rating Section - Right */}
        <div className="flex flex-col items-end gap-2">
          <span className="text-sm font-semibold text-gray-800">AI Rating</span>
          <div className="flex gap-1">
            {renderAIRating(aiRating)}
          </div>
          <span className="text-xs text-purple-600 font-medium min-h-[16px]">
            {aiRating 
              ? `${aiRating.toFixed(1)}/3`
              : 'Not rated'
            }
          </span>
        </div>
      </div>
    </div>
  );
};
