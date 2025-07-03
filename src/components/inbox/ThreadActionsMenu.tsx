
import { 
  ContextMenu, 
  ContextMenuContent, 
  ContextMenuItem, 
  ContextMenuTrigger,
  ContextMenuSeparator
} from "@/components/ui/context-menu";
import { Archive, ArchiveRestore, Trash2 } from "lucide-react";
import type { EmailThread } from "@/types/inbox";

interface ThreadActionsMenuProps {
  children: React.ReactNode;
  thread: EmailThread;
  onArchive: (threadId: string) => void;
  onUnarchive: (threadId: string) => void;
  onDelete: (threadId: string) => void;
}

export const ThreadActionsMenu = ({
  children,
  thread,
  onArchive,
  onUnarchive,
  onDelete
}: ThreadActionsMenuProps) => {
  const isArchived = thread.status === 'archived';

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {isArchived ? (
          <ContextMenuItem onClick={() => onUnarchive(thread.id)}>
            <ArchiveRestore className="w-4 h-4 mr-2" />
            Unarchive
          </ContextMenuItem>
        ) : (
          <ContextMenuItem onClick={() => onArchive(thread.id)}>
            <Archive className="w-4 h-4 mr-2" />
            Archive
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem 
          onClick={() => onDelete(thread.id)}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete permanently
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
