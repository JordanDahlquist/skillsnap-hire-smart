
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { JobApplicationHeader } from './JobApplicationHeader';
import { JobDescription } from './JobDescription';
import { Job } from '@/types';

interface JobHeaderProps {
  job: Job;
  applicationsCount: number;
  getLocationDisplay: () => string;
  getTimeAgo: (dateString: string) => string;
}

export const JobHeader = ({ 
  job, 
  applicationsCount, 
  getLocationDisplay, 
  getTimeAgo 
}: JobHeaderProps) => {
  return (
    <Card className="mb-8 border-0 bg-white/95 backdrop-blur-sm shadow-lg glass-card-no-hover">
      <CardHeader>
        <JobApplicationHeader
          job={job}
          applicationsCount={applicationsCount}
          getLocationDisplay={getLocationDisplay}
          getTimeAgo={getTimeAgo}
        />
      </CardHeader>
      
      <CardContent>
        <JobDescription job={job} />
      </CardContent>
    </Card>
  );
};
