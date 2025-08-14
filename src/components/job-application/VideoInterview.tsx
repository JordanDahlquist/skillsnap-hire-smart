import { useState, useEffect } from "react";
import { Camera } from "lucide-react";
import { VideoInterviewHeader } from "./video-interview/VideoInterviewHeader";
import { QuestionNavigation } from "./video-interview/QuestionNavigation";
import { CurrentQuestion } from "./video-interview/CurrentQuestion";
import { VideoRecordingArea } from "./video-interview/VideoRecordingArea";
import { CompletionCard } from "./video-interview/CompletionCard";
import { VideoInterviewNavigation } from "./video-interview/VideoInterviewNavigation";
import { useVideoRecording, ViewMode } from "./video-interview/useVideoRecording";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StorageBucketValidator } from "./video-interview/StorageBucketValidator";
import { VideoUploadErrorHandler } from "./video-interview/VideoUploadErrorHandler";
import { videoUploadService } from "@/services/videoUploadService";
import { logger } from "@/services/loggerService";
import { InterviewQuestionsData, InterviewQuestion } from "@/types/interviewQuestions";

interface VideoInterviewProps {
  questions: string;
  maxLength: number;
  videoUrl: string | null;
  onChange: (videoUrl: string | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export const VideoInterview = ({ 
  questions, 
  maxLength, 
  videoUrl, 
  onChange, 
  onNext, 
  onBack 
}: VideoInterviewProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [recordedVideos, setRecordedVideos] = useState<{ [key: number]: string }>({});
  const [questionViewModes, setQuestionViewModes] = useState<{ [key: number]: ViewMode }>({});
  const [uploadedVideos, setUploadedVideos] = useState<{ [key: number]: string }>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [storageReady, setStorageReady] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);

  // Parse interview questions from JSON string or convert from markdown
  useEffect(() => {
    if (questions) {
      try {
        console.log('Processing interview questions:', questions);
        
        // First try to parse as JSON (new format)
        const parsedData: InterviewQuestionsData = JSON.parse(questions);
        console.log('Parsed interview questions data:', parsedData);
        
        if (parsedData.questions && Array.isArray(parsedData.questions)) {
          // Sort questions by order
          const sortedQuestions = parsedData.questions.sort((a, b) => a.order - b.order);
          setInterviewQuestions(sortedQuestions);
          console.log('Set interview questions from JSON:', sortedQuestions);
        } else {
          console.error('No questions array found in parsed data:', parsedData);
          setInterviewQuestions([]);
        }
      } catch (error) {
        console.log('JSON parsing failed, attempting markdown conversion:', error);
        
        // If JSON parsing fails, try to convert from markdown format (backward compatibility)
        try {
          const convertedQuestions = convertMarkdownToQuestions(questions);
          setInterviewQuestions(convertedQuestions);
          console.log('Set interview questions from markdown:', convertedQuestions);
        } catch (conversionError) {
          console.error('Failed to convert markdown to questions:', conversionError);
          setInterviewQuestions([]);
        }
      }
    } else {
      setInterviewQuestions([]);
    }
  }, [questions]);

  // Convert markdown format to InterviewQuestion array for backward compatibility
  const convertMarkdownToQuestions = (markdown: string): InterviewQuestion[] => {
    console.log('Converting markdown to questions:', markdown);
    
    // Split by --- separators to get individual question blocks
    const questionBlocks = markdown.split('---').map(block => block.trim()).filter(block => block);
    const questions: InterviewQuestion[] = [];
    
    questionBlocks.forEach((block, index) => {
      const lines = block.split('\n').map(line => line.trim()).filter(line => line);
      
      if (lines.length === 0) return;
      
      let questionTitle = '';
      let questionContent = '';
      
      // Look for question title pattern: **Question X: Title**
      const titleLine = lines.find(line => line.match(/^\*\*Question \d+:/));
      if (titleLine) {
        // Extract title from **Question X: Title**
        const titleMatch = titleLine.match(/^\*\*Question \d+:\s*(.+?)\*\*$/);
        if (titleMatch) {
          questionTitle = titleMatch[1].trim();
        }
      }
      
      // Collect question content (skip title line and evaluation criteria)
      const contentLines = lines.filter(line => {
        // Skip the title line
        if (line.match(/^\*\*Question \d+:/)) return false;
        // Skip evaluation criteria lines
        if (line.startsWith('*What we') && line.includes('looking for:*')) return false;
        return true;
      });
      
      questionContent = contentLines.join(' ').trim();
      
      // If we have content, create the question
      if (questionContent) {
        const finalQuestion = questionTitle ? `${questionTitle}: ${questionContent}` : questionContent;
        
        questions.push({
          id: `q${index + 1}`,
          question: finalQuestion,
          type: 'video_response',
          required: true,
          order: index + 1,
          videoMaxLength: maxLength,
          candidateInstructions: 'Please record your video response.'
        });
      }
    });
    
    console.log('Converted questions:', questions);
    return questions;
  };
  
  const {
    stream,
    isRecording,
    recordingTime,
    permissionGranted,
    videoReady,
    videoLoading,
    viewMode,
    requestPermissions,
    startRecording,
    stopRecording,
    switchToLiveMode,
    switchToPlaybackMode
  } = useVideoRecording();

  const uploadVideoToStorage = async (blob: Blob, questionIndex: number): Promise<string | null> => {
    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(0);
      
      const result = await videoUploadService.uploadVideo(
        blob, 
        questionIndex,
        (progress) => {
          setUploadProgress(progress.percentage);
        }
      );

      if (!result.success) {
        setUploadError(result.error || 'Upload failed');
        toast.error(`Failed to upload video ${questionIndex + 1}: ${result.error}`);
        return null;
      }

      toast.success(`Video ${questionIndex + 1} uploaded successfully`);
      return result.url || null;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown upload error';
      logger.error('Error uploading video:', error);
      setUploadError(errorMessage);
      toast.error(`Failed to upload video: ${errorMessage}`);
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const retryUpload = async () => {
    if (recordedVideos[currentQuestion]) {
      try {
        const response = await fetch(recordedVideos[currentQuestion]);
        const blob = await response.blob();
        const uploadedUrl = await uploadVideoToStorage(blob, currentQuestion);
        
        if (uploadedUrl) {
          setUploadedVideos(prev => ({
            ...prev,
            [currentQuestion]: uploadedUrl
          }));
          setUploadError(null);
        }
      } catch (error) {
        logger.error('Error retrying upload:', error);
        toast.error('Failed to retry upload');
      }
    }
  };

  const handleStartRecording = async () => {
    startRecording((url: string) => {
      setRecordedVideos(prev => ({
        ...prev,
        [currentQuestion]: url
      }));
      
      // Upload to storage after recording completes
      const handleUpload = async () => {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const uploadedUrl = await uploadVideoToStorage(blob, currentQuestion);
          if (uploadedUrl) {
            setUploadedVideos(prev => ({
              ...prev,
              [currentQuestion]: uploadedUrl
            }));
          }
        } catch (error) {
          logger.error('Error uploading recorded video:', error);
        }
      };
      
      handleUpload();
    });
  };

  const handleStorageValidation = (isValid: boolean) => {
    setStorageReady(isValid);
  };

  const retakeVideo = () => {
    if (recordedVideos[currentQuestion]) {
      URL.revokeObjectURL(recordedVideos[currentQuestion]);
    }
    
    setRecordedVideos(prev => {
      const newVideos = { ...prev };
      delete newVideos[currentQuestion];
      return newVideos;
    });
    
    setUploadedVideos(prev => {
      const newVideos = { ...prev };
      delete newVideos[currentQuestion];
      return newVideos;
    });
    
    setUploadError(null);
  };

  const handleQuestionChange = (index: number) => {
    setCurrentQuestion(index);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < interviewQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSwitchToLive = () => {
    setQuestionViewModes(prev => ({
      ...prev,
      [currentQuestion]: 'live'
    }));
    switchToLiveMode();
  };

  const handleSwitchToPlayback = () => {
    if (recordedVideos[currentQuestion]) {
      setQuestionViewModes(prev => ({
        ...prev,
        [currentQuestion]: 'playback'
      }));
      switchToPlaybackMode();
    }
  };

  // Update the onChange callback when all videos are uploaded
  useEffect(() => {
    const allVideosUploaded = interviewQuestions.every((_, index) => uploadedVideos[index]);
    if (allVideosUploaded && interviewQuestions.length > 0) {
      const videoResponses = Object.entries(uploadedVideos)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([index, url]) => ({
          questionIndex: parseInt(index),
          questionText: interviewQuestions[parseInt(index)]?.question || '',
          videoUrl: url
        }));
      
      onChange(JSON.stringify(videoResponses));
    } else {
      onChange(null);
    }
  }, [uploadedVideos, interviewQuestions, onChange]);

  // Show loading state while questions are being parsed
  if (questions && interviewQuestions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interview questions...</p>
        </div>
      </div>
    );
  }

  // Show error if no questions found
  if (!questions || interviewQuestions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Interview Questions</h3>
          <p className="text-gray-600 mb-6">No interview questions have been set up for this position.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Go Back
            </button>
            <button
              onClick={onNext}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  const allQuestionsRecorded = interviewQuestions.every((_, index) => uploadedVideos[index]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <StorageBucketValidator onValidationComplete={handleStorageValidation} />
      
      <VideoInterviewHeader 
        maxLength={maxLength}
        completedVideos={Object.keys(uploadedVideos).length}
        totalQuestions={interviewQuestions.length}
      />

      <QuestionNavigation
        questions={interviewQuestions.map(q => q.question)}
        currentQuestion={currentQuestion}
        recordedVideos={uploadedVideos}
        onQuestionChange={handleQuestionChange}
      />

      <CurrentQuestion
        questionNumber={currentQuestion + 1}
        totalQuestions={interviewQuestions.length}
        questionText={interviewQuestions[currentQuestion]?.question || ''}
        isRecorded={!!uploadedVideos[currentQuestion]}
      />

      {isUploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Uploading video...</span>
            <span className="text-sm text-blue-700">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {uploadError && (
        <VideoUploadErrorHandler 
          error={uploadError}
          onRetry={retryUpload}
          isRetrying={isUploading}
        />
      )}

      <VideoRecordingArea
        currentQuestion={currentQuestion + 1}
        totalQuestions={interviewQuestions.length}
        maxLength={interviewQuestions[currentQuestion]?.videoMaxLength || maxLength}
        stream={stream}
        isRecording={isRecording}
        recordingTime={recordingTime}
        videoReady={videoReady}
        permissionGranted={permissionGranted}
        videoLoading={videoLoading}
        viewMode={questionViewModes[currentQuestion] || viewMode}
        recordedVideoUrl={recordedVideos[currentQuestion] || null}
        onStartRecording={handleStartRecording}
        onStopRecording={stopRecording}
        onRetakeVideo={retakeVideo}
        onPermissionRequest={requestPermissions}
        onSwitchToLive={handleSwitchToLive}
        onSwitchToPlayback={handleSwitchToPlayback}
      />

      {allQuestionsRecorded ? (
        <CompletionCard 
          isAllCompleted={true}
        />
      ) : (
        <VideoInterviewNavigation
          currentQuestion={currentQuestion}
          totalQuestions={interviewQuestions.length}
          isCurrentQuestionRecorded={!!uploadedVideos[currentQuestion]}
          allCompleted={allQuestionsRecorded}
          onPrevious={handlePreviousQuestion}
          onNext={handleNextQuestion}
          onContinueToReview={onNext}
          canGoPrevious={currentQuestion > 0}
          canGoNext={currentQuestion < interviewQuestions.length - 1}
        />
      )}
    </div>
  );
};