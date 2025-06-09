
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Mail, Star, Check, MoreHorizontal, Archive, Trash2, ChevronDown } from 'lucide-react';
import { BulkRatingSelector } from './BulkRatingSelector';
import { BulkStageSelector } from './BulkStageSelector';
import { BulkStatusSelector } from './BulkStatusSelector';

interface ApplicationBulkActionsProps {
  selectedCount: number;
  onSendEmail: () => void;
  onUpdateStatus: (status: string) => void;
  onSetRating: (rating: number) => void;
  onMoveToStage: (stage: string) => void;
  onExport: () => void;
  onReject: () => void;
  onClearSelection: () => void;
  jobId: string;
  isLoading?: boolean;
}

export const ApplicationBulkActions = ({
  selectedCount,
  onSendEmail,
  onUpdateStatus,
  onSetRating,
  onMoveToStage,
  onExport,
  onReject,
  onClearSelection,
  jobId,
  isLoading = false
}: ApplicationBulkActionsProps) => {
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  if (selectedCount === 0) return null;

  const handleReject = () => {
    onReject();
    setShowRejectDialog(false);
  };

  return (
    <>
      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4 animate-slide-in">
        <div className="flex items-center gap-2 flex-1">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {selectedCount} candidate{selectedCount > 1 ? 's' : ''} selected
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-blue-600 hover:text-blue-800 h-auto p-1"
          >
            Clear
          </Button>
        </div>

        {/* Primary Actions - Always Visible */}
        <div className="flex items-center gap-2">
          {/* Send Email */}
          <Button 
            size="sm" 
            onClick={onSendEmail}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Mail className="w-4 h-4 mr-1" />
            Send Email
          </Button>

          {/* Status Update */}
          <BulkStatusSelector onStatusChange={onUpdateStatus} disabled={isLoading} />

          {/* Rating */}
          <BulkRatingSelector onRatingChange={onSetRating} disabled={isLoading} />

          {/* More Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isLoading}>
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <BulkStageSelector 
                jobId={jobId} 
                onStageChange={onMoveToStage}
                disabled={isLoading}
              />
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onExport} disabled={isLoading}>
                <Archive className="w-4 h-4 mr-2" />
                Export Selected
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowRejectDialog(true)}
                disabled={isLoading}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Reject All
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject {selectedCount} candidate{selectedCount > 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will mark all selected candidates as rejected. This action can be undone later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
