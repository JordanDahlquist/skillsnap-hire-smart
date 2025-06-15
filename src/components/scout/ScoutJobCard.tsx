
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, Users, Calendar } from 'lucide-react';
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
    navigate(`/jobs/${job.id}`);
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
      className="cursor-pointer bg-gray-50 border-l-4 border-l-blue-500 group"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <h3 className="font-medium text-gray-900 truncate">{job.title}</h3>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getJobStatusColor(job.status)}>
                {getStatusLabel(job.status)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {job.role_type}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {job.experience_level}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{applicationCount} applications</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{getTimeAgo(job.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
