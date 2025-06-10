
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users } from 'lucide-react';
import type { Application } from '@/types/emailComposer';

interface RecipientsListProps {
  applications: Application[];
}

export const RecipientsList = ({ applications }: RecipientsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="w-4 h-4" />
          Recipients ({applications.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-32">
          <div className="space-y-2">
            {applications.map((app) => (
              <div key={app.id} className="flex items-center justify-between text-sm">
                <span className="font-medium">{app.name}</span>
                <span className="text-gray-500">{app.email}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
