
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoResponsePlayer } from "@/components/dashboard/components/VideoResponsePlayer";
import { Application } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { logger } from "@/services/loggerService";
import { safeParseSkillsTestResponses, safeParseVideoTranscripts } from "@/utils/typeGuards";

interface CandidateVideoTabProps {
  application: Application;
}

interface VideoResponse {
  question: string;
  questionIndex: number;
  answerType: string;
  videoUrl: string;
  source: 'skills' | 'interview';
  answer: string;
}

export const CandidateVideoTab = ({ application }: CandidateVideoTabProps) => {
  // Parse skills test responses and filter for video responses
  const skillsResponses = safeParseSkillsTestResponses(application.skills_test_responses || []);

  const skillsVideoResponses: VideoResponse[] = skillsResponses
    .filter((response: any) => response.answerType === 'video' && response.videoUrl)
    .map((response: any, index: number) => ({
      ...response,
      source: 'skills' as const,
      questionIndex: index,
      answer: response.answer || ''
    }));

  // Parse interview video responses with improved handling and backward compatibility
  let interviewResponses = [];
  
  // Try to parse interview_video_responses first (new format)
  if (application.interview_video_responses) {
    try {
      if (Array.isArray(application.interview_video_responses)) {
        interviewResponses = application.interview_video_responses;
        logger.debug('Using interview_video_responses array:', interviewResponses);
      } else if (typeof application.interview_video_responses === 'string') {
        interviewResponses = JSON.parse(application.interview_video_responses);
        logger.debug('Parsed interview_video_responses from string:', interviewResponses);
      }
    } catch (error) {
      logger.error('Error parsing interview_video_responses:', error);
      interviewResponses = [];
    }
  }
  
  // Fallback to old interview_video_url format for backward compatibility
  if (interviewResponses.length === 0 && application.interview_video_url) {
    try {
      // Check if it's a JSON string with multiple responses
      const parsed = JSON.parse(application.interview_video_url);
      if (Array.isArray(parsed)) {
        interviewResponses = parsed;
        logger.debug('Using fallback interview_video_url array:', interviewResponses);
      } else {
        // Handle single video URL as a legacy format
        interviewResponses = [{
          question: 'Video Interview Response',
          questionIndex: 0,
          answerType: 'video',
          videoUrl: application.interview_video_url,
          answer: 'Video response',
          recordedAt: application.created_at
        }];
        logger.debug('Using single video URL as legacy format:', interviewResponses);
      }
    } catch (error) {
      // If not valid JSON, treat as single video URL
      if (application.interview_video_url.startsWith('http') || application.interview_video_url.startsWith('blob:')) {
        interviewResponses = [{
          question: 'Video Interview Response',
          questionIndex: 0,
          answerType: 'video',
          videoUrl: application.interview_video_url,
          answer: 'Video response',
          recordedAt: application.created_at
        }];
        logger.debug('Treating as single video URL:', interviewResponses);
      } else {
        logger.warn('Could not parse interview_video_url:', error);
      }
    }
  }

  logger.debug('Final interview responses processing:', {
    applicationId: application.id,
    interviewResponsesRaw: application.interview_video_responses,
    interviewVideoUrl: application.interview_video_url,
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
        questionIndex: response.questionIndex !== undefined ? response.questionIndex : index,
        answer: response.answer || 'Video response'
      };
    });

  logger.debug('Final processed video responses:', {
    skillsVideoCount: skillsVideoResponses.length,
    interviewVideoCount: interviewVideoResponses.length,
    interviewVideos: interviewVideoResponses
  });

  // Combine all video responses
  const allVideoResponses = [...skillsVideoResponses, ...interviewVideoResponses];

  // Parse video transcripts
  const skillsTranscripts = safeParseVideoTranscripts(application.skills_video_transcripts || []);
  const interviewTranscripts = safeParseVideoTranscripts(application.interview_video_transcripts || []);

  // Debug transcript data
  console.log('Transcript Debug:', {
    applicationId: application.id,
    skillsTranscriptsCount: skillsTranscripts.length,
    interviewTranscriptsCount: interviewTranscripts.length,
    skillsTranscripts,
    interviewTranscripts,
    transcriptProcessingStatus: application.transcript_processing_status
  });

  const handleProcessTranscripts = () => {
    // TODO: Implement transcript processing trigger
    console.log('Process transcripts triggered for application:', application.id);
  };

  if (allVideoResponses.length === 0) {
    return (
      <Card className="bg-card border border-border">
        <CardContent className="p-8 text-center">
          <div className="text-lg font-medium text-muted-foreground mb-2">
            No Video Responses Found
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            This candidate did not submit any video responses during the skills assessment or interview.
          </p>
          {import.meta.env.DEV && (
            <details className="text-xs text-left bg-gray-50 p-4 rounded">
              <summary className="cursor-pointer font-medium">Debug Info</summary>
              <pre className="mt-2 whitespace-pre-wrap">
                Skills responses: {JSON.stringify(skillsResponses, null, 2)}
                {'\n'}
                Interview responses (interview_video_responses): {JSON.stringify(application.interview_video_responses, null, 2)}
                {'\n'}
                Interview responses (interview_video_url): {JSON.stringify(application.interview_video_url, null, 2)}
                {'\n'}
                Parsed interview responses: {JSON.stringify(interviewResponses, null, 2)}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Video Responses</CardTitle>
              <p className="text-sm text-muted-foreground">
                {allVideoResponses.length} video response{allVideoResponses.length !== 1 ? 's' : ''} submitted
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Transcript Status Badge */}
              {application.transcript_processing_status && (
                <Badge 
                  variant="outline" 
                  className={
                    application.transcript_processing_status === 'completed' ? 'text-green-600' :
                    application.transcript_processing_status === 'processing' ? 'text-blue-600' :
                    application.transcript_processing_status === 'failed' ? 'text-red-600' :
                    'text-yellow-600'
                  }
                >
                  Transcripts: {application.transcript_processing_status}
                </Badge>
              )}
              
              {/* Manual Process Button (for development/testing) */}
              {import.meta.env.DEV && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleProcessTranscripts}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  Process Transcripts
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {allVideoResponses.map((response, index) => {
              const transcripts = response.source === 'skills' ? skillsTranscripts : interviewTranscripts;
              const transcript = transcripts.find(t => t.questionIndex === response.questionIndex);
              
              console.log(`Transcript matching for ${response.source} question ${response.questionIndex}:`, {
                availableTranscripts: transcripts.map(t => ({ questionIndex: t.questionIndex, hasText: !!t.transcript })),
                foundTranscript: !!transcript,
                transcript: transcript
              });
              
              return (
                <div key={`${response.source}-${response.questionIndex || index}`} className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={response.source === 'skills' ? 'default' : 'secondary'}>
                      {response.source === 'skills' ? 'Skills Assessment' : 'Video Interview'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Question {(response.questionIndex || 0) + 1}
                    </span>
                    {transcript && (
                      <Badge variant="outline" className="text-green-600 text-xs">
                        Transcript Ready
                      </Badge>
                    )}
                  </div>
                  <VideoResponsePlayer
                    response={response}
                    questionIndex={response.questionIndex || index}
                    transcript={transcript}
                  />
                  {/* Show transcript if available */}
                  {transcript && (
                    <div className="p-3 bg-muted/20 rounded border-l-4 border-purple-500">
                      <h4 className="text-sm font-medium text-foreground mb-1">Video Transcript:</h4>
                      <p className="text-sm text-muted-foreground mb-2">"{transcript.transcript}"</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Confidence: {Math.round(transcript.confidence * 100)}%</span>
                        <span>•</span>
                        <span>Processed: {new Date(transcript.processedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                  {index < allVideoResponses.length - 1 && (
                    <div className="border-b border-border" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
