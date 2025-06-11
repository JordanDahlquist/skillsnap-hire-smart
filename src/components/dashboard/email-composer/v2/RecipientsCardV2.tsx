
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, User } from 'lucide-react';
import type { Application } from '@/types/emailComposer';

interface RecipientsCardV2Props {
  applications: Application[];
}

export const RecipientsCardV2 = ({ applications }: RecipientsCardV2Props) => {
  return (
    <Card className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 border-0 shadow-lg backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="p-2 bg-blue-500 rounded-xl text-white">
            <Users className="w-5 h-5" />
          </div>
          Email Recipients
          <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-700">
            {applications.length} selected
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-40">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {applications.map((app) => (
              <div 
                key={app.id} 
                className="flex items-center gap-3 p-3 bg-white/70 rounded-xl border border-white/50 hover:bg-white/90 transition-all duration-200 hover:shadow-md group"
              >
                <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white text-sm font-medium">
                    {app.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {app.name}
                  </p>
                  <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {app.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
