
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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {threadCount === 1 ? 'Thread' : 'Threads'} Permanently</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to permanently delete {threadCount === 1 ? 'this thread' : `these ${threadCount} threads`}?
            {messageCount && (
              <span className="block mt-2 font-medium">
                This will delete {messageCount} message{messageCount !== 1 ? 's' : ''} and cannot be undone.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete Permanently
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
