
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
    <div className="w-full mb-6 animate-slide-in">
      <Card className="p-6 bg-blue-50 border-blue-200 shadow-sm">
        <div className="flex flex-col gap-6">
          {/* Header with selection info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-blue-300 text-blue-800 bg-blue-100 px-4 py-2 text-base font-semibold">
                {selectedCount} application{selectedCount > 1 ? 's' : ''} selected
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
              >
                <X className="w-4 h-4 mr-2" />
                Clear selection
              </Button>
            </div>
          </div>

          {/* Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Communication Actions */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">Communication</h3>
              <div className="space-y-2">
                <Button 
                  onClick={onSendEmail}
                  disabled={isLoading}
                  className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white h-12"
                >
                  <Mail className="w-5 h-5 mr-3" />
                  Send Email to Selected
                </Button>
              </div>
            </div>

            {/* Assessment Actions */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">Assessment</h3>
              <div className="space-y-2">
                <div className="text-sm text-gray-600 mb-2">Set Rating:</div>
                <div className="flex gap-2">
                  {[1, 2, 3].map((rating) => (
                    <Button
                      key={rating}
                      variant="outline"
                      onClick={() => onSetRating(rating)}
                      disabled={isLoading}
                      className="flex-1 h-12 hover:bg-yellow-50 hover:border-yellow-300 border-gray-300"
                      title={`Set ${rating} star${rating > 1 ? 's' : ''} rating`}
                    >
                      <span className="text-base font-semibold mr-2">{rating}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Management Actions */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">Management</h3>
              <div className="space-y-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      disabled={isLoading} 
                      className="w-full justify-between h-12 border-gray-300 hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <MoveRight className="w-5 h-5 mr-3" />
                        Move to Stage
                      </div>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <BulkStageSelector 
                      jobId={jobId} 
                      onStageChange={onMoveToStage}
                      disabled={isLoading}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button 
                  variant="destructive"
                  onClick={onReject}
                  disabled={isLoading}
                  className="w-full justify-start h-12"
                >
                  <X className="w-5 h-5 mr-3" />
                  Reject Selected
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
