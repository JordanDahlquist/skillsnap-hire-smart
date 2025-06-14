
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
  // Normalize AI rating to 1-3 scale
  const normalizeAIRating = (rating: number | null): number | null => {
    if (!rating) return null;
    return Math.max(1, Math.min(3, Math.round(rating)));
  };

  const normalizedAIRating = normalizeAIRating(aiRating);
  const hasManualRating = manualRating && manualRating > 0;

  const renderCompactRating = (rating: number | null, isClickable: boolean = false, color: string = "blue") => {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 3 }, (_, i) => {
          const starValue = i + 1;
          const isActive = rating && starValue <= rating;
          
          if (isClickable) {
            return (
              <button
                key={i}
                onClick={() => onManualRating(starValue)}
                disabled={isUpdating}
                className={`transition-all duration-200 hover:scale-110 disabled:opacity-50 ${
                  isActive ? `text-${color}-500` : !hasManualRating 
                    ? 'text-blue-300 hover:text-blue-500' 
                    : 'text-muted-foreground/40 hover:text-blue-400'
                }`}
              >
                <Star className={`w-5 h-5 ${isActive ? 'fill-current' : ''}`} />
              </button>
            );
          }
          
          return (
            <Star
              key={i}
              className={`w-4 h-4 ${
                isActive ? `text-${color}-500 fill-current` : 'text-muted-foreground/40'
              }`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="glass-card-no-hover p-3 border border-border">
      {/* Enhanced layout with prominent manual rating */}
      <div className="flex items-center justify-between gap-4">
        {/* Manual Rating - More Prominent */}
        <div className={`flex items-center gap-2 min-w-0 flex-1 p-2 rounded-lg transition-all ${
          !hasManualRating ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
        }`}>
          <span className={`text-sm font-medium shrink-0 ${
            !hasManualRating ? 'text-blue-700' : 'text-muted-foreground'
          }`}>
            {!hasManualRating ? 'Rate this candidate:' : 'You:'}
          </span>
          {renderCompactRating(manualRating, true, "blue")}
          <span className={`text-sm font-medium ${
            !hasManualRating ? 'text-blue-700' : 'text-blue-600'
          }`}>
            {manualRating ? `${manualRating}/3` : '--'}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-border shrink-0"></div>

        {/* AI Rating */}
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
          <span className="text-sm font-medium text-muted-foreground shrink-0">AI:</span>
          {renderCompactRating(normalizedAIRating, false, "purple")}
          <span className="text-sm text-purple-600 font-medium">
            {normalizedAIRating ? `${normalizedAIRating}/3` : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};
