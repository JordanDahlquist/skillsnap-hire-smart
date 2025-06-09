
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Mail, X, Star, ChevronDown } from 'lucide-react';
import { BulkStageSelector } from './BulkStageSelector';

interface CompactBulkActionsProps {
  selectedCount: number;
  onSendEmail: () => void;
  onSetRating: (rating: number) => void;
  onMoveToStage: (stage: string) => void;
  onReject: () => void;
  onClearSelection: () => void;
  jobId: string;
  isLoading?: boolean;
}

export const CompactBulkActions = ({
  selectedCount,
  onSendEmail,
  onSetRating,
  onMoveToStage,
  onReject,
  onClearSelection,
  jobId,
  isLoading = false
}: CompactBulkActionsProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-lg mb-3 animate-slide-in">
      {/* Left: Selection info */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
          {selectedCount} selected
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="text-blue-600 hover:text-blue-800 h-6 px-2 text-xs"
        >
          Clear
        </Button>
      </div>

      {/* Right: Action buttons */}
      <div className="flex items-center gap-1">
        {/* Send Email */}
        <Button 
          size="sm" 
          onClick={onSendEmail}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 h-7 px-2"
        >
          <Mail className="w-3 h-3 mr-1" />
          Email
        </Button>

        {/* Reject */}
        <Button 
          size="sm" 
          variant="destructive"
          onClick={onReject}
          disabled={isLoading}
          className="h-7 px-2"
        >
          <X className="w-3 h-3 mr-1" />
          Reject
        </Button>

        {/* Star Rating Buttons */}
        <div className="flex items-center gap-0.5 ml-1">
          {[1, 2, 3].map((rating) => (
            <Button
              key={rating}
              size="sm"
              variant="outline"
              onClick={() => onSetRating(rating)}
              disabled={isLoading}
              className="h-7 w-7 p-0 hover:bg-yellow-50 border-yellow-200"
              title={`Set ${rating} star${rating > 1 ? 's' : ''}`}
            >
              <Star className={`w-3 h-3 ${rating <= 3 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
            </Button>
          ))}
        </div>

        {/* Move to Stage */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isLoading} className="h-7 px-2">
              Stage
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <BulkStageSelector 
              jobId={jobId} 
              onStageChange={onMoveToStage}
              disabled={isLoading}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
