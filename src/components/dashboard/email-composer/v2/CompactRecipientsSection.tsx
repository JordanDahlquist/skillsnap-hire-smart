
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
    <div className="flex items-center gap-2 p-2 bg-white rounded border text-sm">
      <span className="text-xs font-medium text-gray-600 min-w-fit">To:</span>
      
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="flex -space-x-1">
          {applications.slice(0, displayCount).map((app) => (
            <Avatar key={app.id} className="w-6 h-6 border border-white">
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                {app.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs text-gray-600 truncate">
            {applications.slice(0, 2).map(app => app.name).join(', ')}
            {applications.length > 2 && '...'}
          </span>
          <Badge variant="secondary" className="text-xs py-0 px-1.5 h-4">
            {applications.length}
          </Badge>
        </div>
      </div>
    </div>
  );
};
