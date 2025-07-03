
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  threadCount: number;
  messageCount?: number;
}

export const DeleteConfirmationModal = ({
  isOpen,
  onOpenChange,
  onConfirm,
  threadCount,
  messageCount
}: DeleteConfirmationModalProps) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="space-y-2">
          <AlertDialogTitle className="text-lg font-semibold">
            Delete {threadCount === 1 ? 'Thread' : 'Threads'}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            Are you sure you want to permanently delete {threadCount === 1 ? 'this thread' : `these ${threadCount} threads`}?
            {messageCount && (
              <span className="block mt-1 text-xs font-medium text-destructive">
                This will delete {messageCount} message{messageCount !== 1 ? 's' : ''} and cannot be undone.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel className="h-9 px-4 text-sm">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className="h-9 px-4 text-sm bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
