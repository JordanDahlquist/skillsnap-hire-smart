
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoResponsePlayer } from "@/components/dashboard/components/VideoResponsePlayer";
import { Application } from "@/types";

interface CandidateVideoTabProps {
  application: Application;
  videoResponses: any[];
}

export const CandidateVideoTab = ({ application, videoResponses }: CandidateVideoTabProps) => {
  if (videoResponses.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <div className="text-lg font-medium text-muted-foreground mb-2">
            No Video Interview
          </div>
          <p className="text-sm text-muted-foreground">
            This candidate did not submit any video interview responses.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Video Interview Responses</CardTitle>
          <p className="text-sm text-muted-foreground">
            {videoResponses.length} video response{videoResponses.length !== 1 ? 's' : ''} submitted
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {videoResponses.map((response: any, index: number) => (
              <div key={index} className="space-y-4">
                <VideoResponsePlayer
                  response={response}
                  questionIndex={index}
                />
                {index < videoResponses.length - 1 && (
                  <div className="border-b border-border" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
