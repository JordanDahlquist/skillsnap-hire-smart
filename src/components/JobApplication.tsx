
import { useViewTracking } from '@/hooks/useViewTracking';
import { useJobData } from '@/hooks/useJobData';
import { JobApplicationLayout } from './job-application/JobApplicationLayout';
import { JobHeader } from './job-application/JobHeader';
import { ApplicationForm } from './job-application/ApplicationForm';
import { 
  JobApplicationLoading, 
  JobNotFound, 
  JobApplicationError 
} from './job-application/JobApplicationStates';

export const JobApplication = () => {
  const { 
    job, 
    jobId, 
    loading, 
    error, 
    getLocationDisplay, 
    getTimeAgo, 
    refetch 
  } = useJobData();
  
  // Track job view when component mounts
  useViewTracking(jobId || '', !!jobId && !!job);

  if (loading) {
    return <JobApplicationLoading />;
  }

  if (error) {
    return <JobApplicationError error={error} onRetry={refetch} />;
  }

  if (!job) {
    return <JobNotFound />;
  }

  const applicationsCount = job?.applications?.[0]?.count || 0;
  const isApplicationOpen = job.status === 'active';

  return (
    <JobApplicationLayout>
      <JobHeader
        job={job}
        applicationsCount={applicationsCount}
        getLocationDisplay={getLocationDisplay}
        getTimeAgo={getTimeAgo}
      />

      <ApplicationForm 
        job={job}
        jobId={jobId!} 
        isApplicationOpen={isApplicationOpen}
        jobStatus={job.status}
      />
    </JobApplicationLayout>
  );
};
