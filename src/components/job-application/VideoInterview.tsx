import { useState, useEffect } from "react";
import { Camera } from "lucide-react";
import { VideoInterviewHeader } from "./video-interview/VideoInterviewHeader";
import { QuestionNavigation } from "./video-interview/QuestionNavigation";
import { CurrentQuestion } from "./video-interview/CurrentQuestion";
import { VideoRecordingArea } from "./video-interview/VideoRecordingArea";
import { CompletionCard } from "./video-interview/CompletionCard";
import { VideoInterviewNavigation } from "./video-interview/VideoInterviewNavigation";
import { useVideoRecording, ViewMode } from "./video-interview/useVideoRecording";
import { useInterviewQuestions } from "./video-interview/useInterviewQuestions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StorageBucketValidator } from "./video-interview/StorageBucketValidator";
import { VideoUploadErrorHandler } from "./video-interview/VideoUploadErrorHandler";
import { videoUploadService } from "@/services/videoUploadService";
import { logger } from "@/services/loggerService";

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
  
  const { interviewQuestions } = useInterviewQuestions(questions);
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

  const handleStartRecording = () => {
    if (!storageReady) {
      toast.error('Storage system not ready. Please wait and try again.');
      return;
    }

    startRecording(async (url) => {
      setRecordedVideos(prev => ({
        ...prev,
        [currentQuestion]: url
      }));
      setQuestionViewModes(prev => ({
        ...prev,
        [currentQuestion]: 'playback'
      }));

      // Convert blob URL to actual blob and upload
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
        logger.error('Error processing recorded video:', error);
        setUploadError('Failed to process recorded video');
      }
    });
  };

  const retakeVideo = () => {
    if (recordedVideos[currentQuestion]) {
      URL.revokeObjectURL(recordedVideos[currentQuestion]);
      const newRecordedVideos = { ...recordedVideos };
      delete newRecordedVideos[currentQuestion];
      setRecordedVideos(newRecordedVideos);
      
      const newViewModes = { ...questionViewModes };
      delete newViewModes[currentQuestion];
      setQuestionViewModes(newViewModes);

      const newUploadedVideos = { ...uploadedVideos };
      delete newUploadedVideos[currentQuestion];
      setUploadedVideos(newUploadedVideos);
    }
  };

  const handleQuestionChange = (index: number) => {
    setCurrentQuestion(index);
    
    // Set appropriate view mode for the new question
    if (recordedVideos[index]) {
      setQuestionViewModes(prev => ({
        ...prev,
        [index]: 'playback'
      }));
      switchToPlaybackMode();
    } else {
      setQuestionViewModes(prev => ({
        ...prev,
        [index]: 'live'
      }));
      switchToLiveMode();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      handleQuestionChange(currentQuestion - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < interviewQuestions.length - 1) {
      handleQuestionChange(currentQuestion + 1);
    }
  };

  const handleSwitchToLive = () => {
    switchToLiveMode();
    setQuestionViewModes(prev => ({
      ...prev,
      [currentQuestion]: 'live'
    }));
  };

  const handleSwitchToPlayback = () => {
    if (recordedVideos[currentQuestion]) {
      switchToPlaybackMode();
      setQuestionViewModes(prev => ({
        ...prev,
        [currentQuestion]: 'playback'
      }));
    }
  };

  const completedVideos = Object.keys(uploadedVideos).length; // Changed from recordedVideos to uploadedVideos
  const allCompleted = completedVideos === interviewQuestions.length;
  const isCurrentQuestionRecorded = !!uploadedVideos[currentQuestion]; // Changed from recordedVideos to uploadedVideos
  const canGoPrevious = currentQuestion > 0;
  const canGoNext = currentQuestion < interviewQuestions.length - 1;

  // Prevent proceeding if uploads are in progress or failed
  const canProceedToReview = allCompleted && !isUploading && !uploadError;

  useEffect(() => {
    if (allCompleted && Object.keys(uploadedVideos).length === interviewQuestions.length) {
      // Create interview responses array with uploaded video URLs
      const interviewResponses = interviewQuestions.map((question, index) => ({
        question,
        questionIndex: index,
        answerType: 'video',
        videoUrl: uploadedVideos[index],
        recordedAt: new Date().toISOString(),
        answer: 'Video response' // Add required answer field
      }));
      
      onChange(JSON.stringify(interviewResponses));
    }
  }, [allCompleted, uploadedVideos, interviewQuestions, onChange]);

  // Initialize view mode for current question when questions load
  useEffect(() => {
    if (interviewQuestions.length > 0) {
      const hasRecording = recordedVideos[currentQuestion];
      const initialMode = hasRecording ? 'playback' : 'live';
      
      setQuestionViewModes(prev => ({
        ...prev,
        [currentQuestion]: initialMode
      }));
      
      if (hasRecording) {
        switchToPlaybackMode();
      } else {
        switchToLiveMode();
      }
    }
  }, [interviewQuestions.length, currentQuestion]);

  if (interviewQuestions.length === 0) {
    return (
      <div className="text-center py-8">
        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Loading Interview Questions...</h3>
        <p className="text-gray-700">Please wait while we prepare your video interview.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StorageBucketValidator onValidationComplete={setStorageReady} />
      
      <VideoInterviewHeader 
        maxLength={maxLength}
        completedVideos={completedVideos}
        totalQuestions={interviewQuestions.length}
      />

      <QuestionNavigation 
        questions={interviewQuestions}
        currentQuestion={currentQuestion}
        recordedVideos={uploadedVideos} // Changed to show uploaded videos status
        onQuestionChange={handleQuestionChange}
      />

      <CurrentQuestion 
        questionNumber={currentQuestion + 1}
        totalQuestions={interviewQuestions.length}
        questionText={interviewQuestions[currentQuestion]}
        isRecorded={!!uploadedVideos[currentQuestion]} // Changed to check uploaded videos
      />

      <VideoRecordingArea 
        currentQuestion={currentQuestion}
        totalQuestions={interviewQuestions.length}
        maxLength={maxLength}
        stream={stream}
        isRecording={isRecording || isUploading}
        recordingTime={recordingTime}
        videoReady={videoReady && storageReady}
        permissionGranted={permissionGranted}
        videoLoading={videoLoading || isUploading}
        viewMode={viewMode}
        recordedVideoUrl={recordedVideos[currentQuestion] || null}
        onStartRecording={handleStartRecording}
        onStopRecording={stopRecording}
        onRetakeVideo={retakeVideo}
        onPermissionRequest={requestPermissions}
        onSwitchToLive={handleSwitchToLive}
        onSwitchToPlayback={handleSwitchToPlayback}
      />

      <VideoUploadErrorHandler 
        error={uploadError}
        onRetry={retryUpload}
        isRetrying={isUploading}
      />

      <VideoInterviewNavigation
        currentQuestion={currentQuestion}
        totalQuestions={interviewQuestions.length}
        isCurrentQuestionRecorded={isCurrentQuestionRecorded}
        allCompleted={canProceedToReview} // Updated to include upload validation
        onPrevious={handlePreviousQuestion}
        onNext={handleNextQuestion}
        onContinueToReview={onNext}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
      />

      <CompletionCard isAllCompleted={canProceedToReview} />
      
      {isUploading && (
        <div className="text-center space-y-2">
          <div className="text-sm text-muted-foreground">
            Uploading video... {uploadProgress}% complete
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
