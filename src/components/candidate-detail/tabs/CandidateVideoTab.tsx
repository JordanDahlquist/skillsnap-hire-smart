import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoResponsePlayer } from "@/components/dashboard/components/VideoResponsePlayer";
import { Application } from "@/types";
import { Badge } from "@/components/ui/badge";
import { logger } from "@/services/loggerService";

interface CandidateVideoTabProps {
  application: Application;
}

interface VideoResponse {
  question: string;
  questionIndex: number;
  answerType: string;
  videoUrl: string;
  source: 'skills' | 'interview';
  answer: string; // Add this required property for VideoResponsePlayer
}

export const CandidateVideoTab = ({ application }: CandidateVideoTabProps) => {
  // Parse skills test responses and filter for video responses
  const skillsResponses = Array.isArray(application.skills_test_responses) 
    ? application.skills_test_responses 
    : [];

  const skillsVideoResponses: VideoResponse[] = skillsResponses
    .filter((response: any) => response.answerType === 'video' && response.videoUrl)
    .map((response: any, index: number) => ({
      ...response,
      source: 'skills' as const,
      questionIndex: index,
      answer: response.answer || '' // Ensure answer property exists
    }));

  // Parse interview video responses with better error handling
  const interviewResponses = Array.isArray(application.interview_video_responses) 
    ? application.interview_video_responses 
    : [];

  logger.debug('Interview video responses data:', {
    applicationId: application.id,
    interviewResponsesRaw: application.interview_video_responses,
    parsedResponses: interviewResponses,
    responseCount: interviewResponses.length
  });

  const interviewVideoResponses: VideoResponse[] = interviewResponses
    .filter((response: any) => {
      const hasVideo = response.answerType === 'video' && response.videoUrl;
      if (!hasVideo) {
        logger.debug('Filtering out non-video response:', response);
      }
      return hasVideo;
    })
    .map((response: any, index: number) => {
      logger.debug(`Processing interview video response ${index}:`, response);
      return {
        ...response,
        source: 'interview' as const,
        questionIndex: response.questionIndex || index,
        answer: response.answer || 'Video response' // Provide a default answer for video responses
      };
    });

  logger.debug('Final processed video responses:', {
    skillsVideoCount: skillsVideoResponses.length,
    interviewVideoCount: interviewVideoResponses.length,
    interviewVideos: interviewVideoResponses
  });

  // Combine all video responses
  const allVideoResponses = [...skillsVideoResponses, ...interviewVideoResponses];

  if (allVideoResponses.length === 0) {
    // Enhanced no-video state with debugging info
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <div className="text-lg font-medium text-muted-foreground mb-2">
            No Video Responses Found
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            This candidate did not submit any video responses during the skills assessment or interview.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="text-xs text-left bg-gray-50 p-4 rounded">
              <summary className="cursor-pointer font-medium">Debug Info</summary>
              <pre className="mt-2 whitespace-pre-wrap">
                Skills responses: {JSON.stringify(skillsResponses, null, 2)}
                {'\n'}
                Interview responses: {JSON.stringify(interviewResponses, null, 2)}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Video Responses</CardTitle>
          <p className="text-sm text-muted-foreground">
            {allVideoResponses.length} video response{allVideoResponses.length !== 1 ? 's' : ''} submitted
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {allVideoResponses.map((response, index) => (
              <div key={`${response.source}-${response.questionIndex || index}`} className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={response.source === 'skills' ? 'default' : 'secondary'}>
                    {response.source === 'skills' ? 'Skills Assessment' : 'Video Interview'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Question {(response.questionIndex || 0) + 1}
                  </span>
                </div>
                <VideoResponsePlayer
                  response={response}
                  questionIndex={response.questionIndex || index}
                />
                {index < allVideoResponses.length - 1 && (
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
