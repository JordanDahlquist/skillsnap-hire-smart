
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoResponsePlayer } from "@/components/dashboard/components/VideoResponsePlayer";
import { Application } from "@/types";

interface CandidateSkillsTabProps {
  application: Application;
  skillsResponses: any[];
}

export const CandidateSkillsTab = ({ 
  application, 
  skillsResponses 
}: CandidateSkillsTabProps) => {
  if (skillsResponses.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <div className="text-lg font-medium text-muted-foreground mb-2">
            No Skills Assessment
          </div>
          <p className="text-sm text-muted-foreground">
            This candidate did not complete a skills assessment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-left">Skills Assessment Responses</CardTitle>
          <p className="text-sm text-muted-foreground text-left">
            {skillsResponses.length} response{skillsResponses.length !== 1 ? 's' : ''} submitted
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {skillsResponses.map((response: any, index: number) => (
              <div key={index} className="space-y-4">
                <VideoResponsePlayer
                  response={response}
                  questionIndex={index}
                />
                {index < skillsResponses.length - 1 && (
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
