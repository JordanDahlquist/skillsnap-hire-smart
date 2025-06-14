
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Application } from "@/types";

interface CandidateVideoTabProps {
  application: Application;
}

export const CandidateVideoTab = ({ application }: CandidateVideoTabProps) => {
  if (!application.interview_video_url) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <div className="text-lg font-medium text-muted-foreground mb-2">
            No Video Interview
          </div>
          <p className="text-sm text-muted-foreground">
            This candidate did not submit a video interview.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Video Interview</CardTitle>
          <p className="text-sm text-muted-foreground">
            Candidate's video interview submission
          </p>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <video
              src={application.interview_video_url}
              controls
              className="w-full h-full object-contain"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
