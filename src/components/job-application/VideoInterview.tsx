
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { VideoInterviewHeader } from "./video-interview/VideoInterviewHeader";
import { QuestionNavigation } from "./video-interview/QuestionNavigation";
import { CurrentQuestion } from "./video-interview/CurrentQuestion";
import { VideoRecordingArea } from "./video-interview/VideoRecordingArea";
import { CompletionCard } from "./video-interview/CompletionCard";
import { useVideoRecording } from "./video-interview/useVideoRecording";
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
  
  const { interviewQuestions } = useInterviewQuestions(questions);
  const {
    stream,
    isRecording,
    recordingTime,
    permissionGranted,
    videoReady,
    videoLoading,
    requestPermissions,
    startRecording,
    stopRecording
  } = useVideoRecording();

  const handleStartRecording = () => {
    startRecording((url) => {
      setRecordedVideos(prev => ({
        ...prev,
        [currentQuestion]: url
      }));
    });
  };

  const retakeVideo = () => {
    if (recordedVideos[currentQuestion]) {
      URL.revokeObjectURL(recordedVideos[currentQuestion]);
      const newRecordedVideos = { ...recordedVideos };
      delete newRecordedVideos[currentQuestion];
      setRecordedVideos(newRecordedVideos);
    }
  };

  const completedVideos = Object.keys(recordedVideos).length;
  const allCompleted = completedVideos === interviewQuestions.length;

  useEffect(() => {
    if (allCompleted) {
      onChange('recorded'); // Placeholder - in production, upload to storage
    }
  }, [allCompleted, onChange]);

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
        onQuestionChange={setCurrentQuestion}
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
        recordedVideoUrl={recordedVideos[currentQuestion] || null}
        onStartRecording={handleStartRecording}
        onStopRecording={stopRecording}
        onRetakeVideo={retakeVideo}
        onPermissionRequest={requestPermissions}
      />

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!allCompleted}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Continue
        </Button>
      </div>

      <CompletionCard isAllCompleted={allCompleted} />
    </div>
  );
};
