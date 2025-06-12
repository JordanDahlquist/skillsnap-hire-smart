
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
                  isActive ? `text-${color}-500` : 'text-muted-foreground/40 hover:text-blue-400'
                }`}
              >
                <Star className={`w-4 h-4 ${isActive ? 'fill-current' : ''}`} />
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
      {/* Compact horizontal layout */}
      <div className="flex items-center justify-between gap-4">
        {/* Manual Rating */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-xs font-medium text-foreground shrink-0">Your:</span>
          {renderCompactRating(manualRating, true, "blue")}
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {manualRating ? `${manualRating}/3` : 'Rate'}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-border shrink-0"></div>

        {/* AI Rating */}
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
          <span className="text-xs font-medium text-foreground shrink-0">AI:</span>
          {renderCompactRating(normalizedAIRating, false, "purple")}
          <span className="text-xs text-purple-600 font-medium hidden sm:inline">
            {normalizedAIRating ? `${normalizedAIRating}/3` : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};
