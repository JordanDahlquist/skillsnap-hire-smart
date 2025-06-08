
import { Star } from 'lucide-react';

export const renderManualRating = (rating: number | null) => {
  if (!rating) {
    return Array.from({ length: 3 }, (_, i) => (
      <Star key={i} className="w-4 h-4 text-gray-300" />
    ));
  }

  return Array.from({ length: 3 }, (_, i) => {
    const starValue = i + 1;
    const isActive = starValue <= rating;
    
    return (
      <Star
        key={i}
        className={`w-4 h-4 ${
          isActive ? 'text-blue-500 fill-current' : 'text-gray-300'
        }`}
      />
    );
  });
};

export const renderAIRating = (rating: number | null) => {
  if (!rating) {
    return Array.from({ length: 3 }, (_, i) => (
      <Star key={i} className="w-4 h-4 text-gray-300" />
    ));
  }

  // Convert 5-star AI rating to 3-star scale
  const convertedRating = (rating / 5) * 3;
  
  return Array.from({ length: 3 }, (_, i) => {
    const starValue = i + 1;
    const isActive = starValue <= Math.round(convertedRating);
    
    return (
      <Star
        key={i}
        className={`w-4 h-4 ${
          isActive ? 'text-green-500 fill-current' : 'text-gray-300'
        }`}
      />
    );
  });
};
