
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Star, ChevronDown } from 'lucide-react';

interface BulkRatingSelectorProps {
  onRatingChange: (rating: number) => void;
  disabled?: boolean;
}

export const BulkRatingSelector = ({ onRatingChange, disabled }: BulkRatingSelectorProps) => {
  const ratings = [
    { value: 1, label: '1 Star', color: 'text-red-500' },
    { value: 2, label: '2 Stars', color: 'text-yellow-500' },
    { value: 3, label: '3 Stars', color: 'text-green-500' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Star className="w-4 h-4 mr-1" />
          Set Rating
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {ratings.map((rating) => (
          <DropdownMenuItem
            key={rating.value}
            onClick={() => onRatingChange(rating.value)}
          >
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: rating.value }).map((_, i) => (
                  <Star key={i} className={`w-3 h-3 fill-current ${rating.color}`} />
                ))}
              </div>
              <span>{rating.label}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
