
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Application } from '@/types/emailComposer';

interface CompactRecipientsSectionProps {
  applications: Application[];
}

export const CompactRecipientsSection = ({ applications }: CompactRecipientsSectionProps) => {
  const displayLimit = 3;
  const hasMore = applications.length > displayLimit;
  const displayedApps = applications.slice(0, displayLimit);

  return (
    <div className="space-y-3">
      {/* Preview Recipients */}
      <div className="flex items-center gap-2 flex-wrap">
        {displayedApps.map((app) => (
          <div key={app.id} className="flex items-center gap-2 bg-background/50 rounded-lg px-3 py-2 text-sm">
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                {app.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-foreground">{app.name}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground truncate max-w-32">{app.email}</span>
          </div>
        ))}
        
        {hasMore && (
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 text-sm">
            <span className="text-muted-foreground">+{applications.length - displayLimit} more</span>
          </div>
        )}
      </div>

      {/* Full list when there are many recipients */}
      {applications.length > 5 && (
        <ScrollArea className="h-24 w-full">
          <div className="space-y-1">
            {applications.map((app) => (
              <div key={app.id} className="flex items-center justify-between text-xs px-2 py-1 rounded hover:bg-background/50">
                <span className="font-medium text-foreground">{app.name}</span>
                <span className="text-muted-foreground truncate ml-2">{app.email}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
