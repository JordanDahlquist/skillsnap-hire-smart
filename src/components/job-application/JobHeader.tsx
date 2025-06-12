
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
    <Card className="mb-8 bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-0">
        <JobApplicationHeader
          job={job}
          applicationsCount={applicationsCount}
          getLocationDisplay={getLocationDisplay}
          getTimeAgo={getTimeAgo}
        />
      </CardHeader>
      
      <CardContent className="pt-6">
        <JobDescription job={job} />
      </CardContent>
    </Card>
  );
};
