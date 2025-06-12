
import { JobApplicationLayout } from './JobApplicationLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const JobApplicationLoading = () => {
  return (
    <JobApplicationLayout>
      <Card className="mb-8 bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4 bg-gray-200" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 bg-gray-200" />
              <Skeleton className="h-6 w-24 bg-gray-200" />
              <Skeleton className="h-6 w-16 bg-gray-200" />
            </div>
            <Skeleton className="h-4 w-full bg-gray-200" />
            <Skeleton className="h-4 w-2/3 bg-gray-200" />
            <div className="pt-4">
              <Skeleton className="h-32 w-full bg-gray-200" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <Skeleton className="h-6 w-48 mb-6 bg-gray-200" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full bg-gray-200" />
            <Skeleton className="h-10 w-full bg-gray-200" />
            <Skeleton className="h-24 w-full bg-gray-200" />
          </div>
        </CardContent>
      </Card>
    </JobApplicationLayout>
  );
};

export const JobNotFound = () => {
  return (
    <JobApplicationLayout>
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Job Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The job you're looking for doesn't exist or is no longer available.
          </p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
            <Link to="/jobs">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse Other Positions
            </Link>
          </Button>
        </CardContent>
      </Card>
    </JobApplicationLayout>
  );
};

export const JobApplicationError = ({ error, onRetry }: { error: string; onRetry: () => void }) => {
  return (
    <JobApplicationLayout>
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Error Loading Job</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={onRetry} className="bg-blue-600 hover:bg-blue-700 text-white">Try Again</Button>
            <Button variant="outline" asChild className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <Link to="/jobs">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Browse Other Positions
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </JobApplicationLayout>
  );
};
