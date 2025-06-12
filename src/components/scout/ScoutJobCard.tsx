
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, Users, Calendar, ExternalLink } from 'lucide-react';
import { getJobStatusColor } from '@/utils/statusUtils';
import { getTimeAgo } from '@/utils/dateUtils';

interface ScoutJobCardProps {
  job: {
    id: string;
    title: string;
    status: string;
    role_type: string;
    experience_level: string;
    created_at: string;
    applications?: Array<{ count?: number }>;
  };
}

export const ScoutJobCard = ({ job }: ScoutJobCardProps) => {
  const navigate = useNavigate();
  
  const applicationCount = job.applications?.[0]?.count || 0;
  
  const handleClick = () => {
    navigate(`/dashboard/${job.id}`);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Open';
      case 'paused':
        return 'Paused';
      case 'closed':
        return 'Closed';
      case 'draft':
        return 'Draft';
      default:
        return status;
    }
  };

  return (
    <Card 
      className="cursor-pointer bg-transparent border-0 shadow-none group"
      onClick={handleClick}
    >
      <CardContent className="p-0">
        <div className="glass-card border-l-4 border-l-blue-500 hover:scale-[1.02] transition-all duration-300 hover:shadow-xl group-hover:border-l-purple-500">
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground truncate text-lg">{job.title}</h3>
                  <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge className={`${getJobStatusColor(job.status)} rounded-full px-3`}>
                    {getStatusLabel(job.status)}
                  </Badge>
                  <Badge variant="outline" className="text-xs rounded-full border-blue-200 bg-blue-50 text-blue-700">
                    {job.role_type}
                  </Badge>
                  <Badge variant="outline" className="text-xs rounded-full border-purple-200 bg-purple-50 text-purple-700">
                    {job.experience_level}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg bg-green-100 flex items-center justify-center">
                      <Users className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="font-medium">{applicationCount} applications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Calendar className="w-3 h-3 text-blue-600" />
                    </div>
                    <span>{getTimeAgo(job.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
