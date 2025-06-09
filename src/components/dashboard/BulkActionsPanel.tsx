
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Mail, X, ChevronDown, Star, MoveRight } from 'lucide-react';
import { BulkStageSelector } from './bulk-actions/BulkStageSelector';

interface BulkActionsPanelProps {
  selectedCount: number;
  onSendEmail: () => void;
  onSetRating: (rating: number) => void;
  onMoveToStage: (stage: string) => void;
  onReject: () => void;
  onClearSelection: () => void;
  jobId: string;
  isLoading?: boolean;
}

export const BulkActionsPanel = ({
  selectedCount,
  onSendEmail,
  onSetRating,
  onMoveToStage,
  onReject,
  onClearSelection,
  jobId,
  isLoading = false
}: BulkActionsPanelProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Selection info */}
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm font-medium">
            {selectedCount} selected
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-gray-600 hover:text-gray-800"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-2">
          <Button 
            size="sm"
            onClick={onSendEmail}
            disabled={isLoading}
            className="gap-2"
          >
            <Mail className="w-4 h-4" />
            Email
          </Button>

          <div className="flex items-center gap-1">
            {[1, 2, 3].map((rating) => (
              <Button
                key={rating}
                size="sm"
                variant="outline"
                onClick={() => onSetRating(rating)}
                disabled={isLoading}
                className="gap-1 hover:bg-yellow-50 hover:border-yellow-300"
                title={`Set ${rating} star rating`}
              >
                <span className="text-sm">{rating}</span>
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              </Button>
            ))}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                disabled={isLoading} 
                className="gap-2"
              >
                <MoveRight className="w-4 h-4" />
                Stage
                <ChevronDown className="w-3 h-3" />
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

          <Button 
            size="sm"
            variant="destructive"
            onClick={onReject}
            disabled={isLoading}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
};
