
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Application } from '@/types/emailComposer';

interface CompactRecipientsSectionProps {
  applications: Application[];
}

export const CompactRecipientsSection = ({ applications }: CompactRecipientsSectionProps) => {
  const displayCount = 3;
  const remainingCount = Math.max(0, applications.length - displayCount);

  return (
    <div className="flex items-center gap-3 p-3 glass-card rounded-xl text-sm">
      <span className="text-sm font-medium text-slate-700 min-w-fit">To:</span>
      
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex -space-x-1">
          {applications.slice(0, displayCount).map((app) => (
            <Avatar key={app.id} className="w-7 h-7 border-2 border-white shadow-lg">
              <AvatarFallback className="glass-button-premium text-blue-600 text-xs font-medium">
                {app.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm text-slate-600 truncate">
            {applications.slice(0, 2).map(app => app.name).join(', ')}
            {applications.length > 2 && '...'}
          </span>
          <Badge variant="secondary" className="text-xs py-0.5 px-2 h-5 glass-button-premium text-blue-700 font-medium">
            {applications.length}
          </Badge>
        </div>
      </div>
    </div>
  );
};
