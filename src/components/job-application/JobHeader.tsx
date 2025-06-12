
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
    <Card className="mb-8 border bg-card shadow-lg">
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
