
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Mail, X, ChevronDown } from 'lucide-react';
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
    <div className="p-3 bg-white border border-blue-200 rounded-lg mb-4 shadow-sm animate-slide-in">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Selection info */}
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 font-medium">
            {selectedCount} selected
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-8 px-3 text-sm"
          >
            Clear selection
          </Button>
        </div>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-3">
          {/* Communication Actions */}
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              onClick={onSendEmail}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 gap-2"
            >
              <Mail className="w-4 h-4" />
              Send Email
            </Button>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200" />

          {/* Assessment Actions */}
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-600 mr-2">Rate:</span>
            {[1, 2, 3].map((rating) => (
              <Button
                key={rating}
                size="sm"
                variant="outline"
                onClick={() => onSetRating(rating)}
                disabled={isLoading}
                className="h-8 px-3 hover:bg-yellow-50 hover:border-yellow-300 border-gray-200 gap-1"
                title={`Set ${rating} star${rating > 1 ? 's' : ''}`}
              >
                <span className="text-sm font-medium">{rating}</span>
                <span className="text-yellow-400">⭐</span>
              </Button>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200" />

          {/* Management Actions */}
          <div className="flex items-center gap-2">
            {/* Move to Stage */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={isLoading} 
                  className="h-8 px-3 gap-2 border-gray-200 hover:bg-gray-50"
                >
                  Move to Stage
                  <ChevronDown className="w-4 h-4" />
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

            {/* Reject */}
            <Button 
              size="sm" 
              variant="destructive"
              onClick={onReject}
              disabled={isLoading}
              className="h-8 px-3 gap-2"
            >
              <X className="w-4 h-4" />
              Reject
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
