
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

  const handleStartRecording = () => {
    startRecording((url) => {
      setRecordedVideos(prev => ({
        ...prev,
        [currentQuestion]: url
      }));
      setQuestionViewModes(prev => ({
        ...prev,
        [currentQuestion]: 'playback'
      }));
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

  const completedVideos = Object.keys(recordedVideos).length;
  const allCompleted = completedVideos === interviewQuestions.length;
  const isCurrentQuestionRecorded = !!recordedVideos[currentQuestion];
  const canGoPrevious = currentQuestion > 0;
  const canGoNext = currentQuestion < interviewQuestions.length - 1;

  useEffect(() => {
    if (allCompleted) {
      onChange('recorded'); // Placeholder - in production, upload to storage
    }
  }, [allCompleted, onChange]);

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
      <VideoInterviewHeader 
        maxLength={maxLength}
        completedVideos={completedVideos}
        totalQuestions={interviewQuestions.length}
      />

      <QuestionNavigation 
        questions={interviewQuestions}
        currentQuestion={currentQuestion}
        recordedVideos={recordedVideos}
        onQuestionChange={handleQuestionChange}
      />

      <CurrentQuestion 
        questionNumber={currentQuestion + 1}
        totalQuestions={interviewQuestions.length}
        questionText={interviewQuestions[currentQuestion]}
        isRecorded={!!recordedVideos[currentQuestion]}
      />

      <VideoRecordingArea 
        currentQuestion={currentQuestion}
        totalQuestions={interviewQuestions.length}
        maxLength={maxLength}
        stream={stream}
        isRecording={isRecording}
        recordingTime={recordingTime}
        videoReady={videoReady}
        permissionGranted={permissionGranted}
        videoLoading={videoLoading}
        viewMode={viewMode}
        recordedVideoUrl={recordedVideos[currentQuestion] || null}
        onStartRecording={handleStartRecording}
        onStopRecording={stopRecording}
        onRetakeVideo={retakeVideo}
        onPermissionRequest={requestPermissions}
        onSwitchToLive={handleSwitchToLive}
        onSwitchToPlayback={handleSwitchToPlayback}
      />

      <VideoInterviewNavigation
        currentQuestion={currentQuestion}
        totalQuestions={interviewQuestions.length}
        isCurrentQuestionRecorded={isCurrentQuestionRecorded}
        allCompleted={allCompleted}
        onPrevious={handlePreviousQuestion}
        onNext={handleNextQuestion}
        onContinueToReview={onNext}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
      />

      <CompletionCard isAllCompleted={allCompleted} />
    </div>
  );
};
