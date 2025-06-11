
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users } from 'lucide-react';
import type { Application } from '@/types/emailComposer';

interface CompactRecipientsSectionProps {
  applications: Application[];
}

export const CompactRecipientsSection = ({ applications }: CompactRecipientsSectionProps) => {
  const displayCount = 3;
  const remainingCount = Math.max(0, applications.length - displayCount);

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-gray-700">To:</span>
      </div>
      
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="flex -space-x-2">
          {applications.slice(0, displayCount).map((app) => (
            <Avatar key={app.id} className="w-8 h-8 border-2 border-white">
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                {app.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm text-gray-600 truncate">
            {applications.slice(0, 2).map(app => app.name).join(', ')}
            {applications.length > 2 && '...'}
          </span>
          <Badge variant="secondary" className="text-xs">
            {applications.length} recipient{applications.length > 1 ? 's' : ''}
          </Badge>
        </div>
      </div>
    </div>
  );
};
