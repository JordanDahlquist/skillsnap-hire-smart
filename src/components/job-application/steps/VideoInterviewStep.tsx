
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  Square, 
  Play, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle,
  Camera,
  Mic,
  Upload
} from "lucide-react";
import { Job } from "@/types";
import { toast } from "sonner";

interface ApplicationFormData {
  name: string;
  email: string;
  portfolio: string;
  resumeUrl: string | null;
  answer1: string;
  answer2: string;
  answer3: string;
  skillsTestResponses: Array<{
    question: string;
    answer: string;
  }>;
  videoUrl: string | null;
}

interface VideoInterviewStepProps {
  job: Job;
  formData: ApplicationFormData;
  onFormDataChange: (updates: Partial<ApplicationFormData>) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const VideoInterviewStep = ({ 
  job, 
  formData, 
  onFormDataChange, 
  onValidationChange 
}: VideoInterviewStepProps) => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideos, setRecordedVideos] = useState<{ [key: number]: string }>({});
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Parse interview questions
  useEffect(() => {
    if (job.generated_interview_questions) {
      const interviewQuestions = job.generated_interview_questions
        .split(/\d+\.|\n-|\n\*/)
        .map(q => q.trim())
        .filter(q => q.length > 10 && !q.toLowerCase().includes('interview questions'));
      
      setQuestions(interviewQuestions.slice(0, 5)); // Limit to 5 questions max
    }
  }, [job.generated_interview_questions]);

  // Validate when recorded videos change
  useEffect(() => {
    if (!job.generated_interview_questions) {
      onValidationChange(true); // No interview means this step is valid
      return;
    }

    const allRecorded = questions.every((_, index) => recordedVideos[index]);
    onValidationChange(allRecorded);
    
    // Update form data with video status
    if (allRecorded) {
      onFormDataChange({ videoUrl: 'recorded' }); // Placeholder - in production, upload to storage
    }
  }, [recordedVideos, questions, job.generated_interview_questions, onValidationChange, onFormDataChange]);

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      setStream(stream);
      setPermissionGranted(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera/microphone:', error);
      toast.error('Unable to access camera and microphone. Please grant permissions.');
    }
  };

  const startRecording = () => {
    if (!stream) return;

    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);
    setRecordedChunks([]);
    setIsRecording(true);
    setRecordingTime(0);

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks(prev => [...prev, event.data]);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(blob);
      
      setRecordedVideos(prev => ({
        ...prev,
        [currentQuestionIndex]: videoUrl
      }));
      
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };

    recorder.start();
    
    // Start timer
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
    }
  };

  const retakeVideo = () => {
    if (recordedVideos[currentQuestionIndex]) {
      URL.revokeObjectURL(recordedVideos[currentQuestionIndex]);
      const newRecordedVideos = { ...recordedVideos };
      delete newRecordedVideos[currentQuestionIndex];
      setRecordedVideos(newRecordedVideos);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const maxDuration = job.interview_video_max_length || 5; // Default 5 minutes

  // If no interview questions, show message
  if (!job.generated_interview_questions) {
    useEffect(() => {
      onValidationChange(true);
    }, [onValidationChange]);

    return (
      <div className="text-center space-y-6">
        <div className="bg-blue-50 rounded-lg p-8">
          <CheckCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Video Interview Required</h2>
          <p className="text-gray-600">
            This position doesn't require a video interview. You can proceed to the final step.
          </p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center space-y-6">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-900">Loading Interview Questions...</h2>
        <p className="text-gray-600">Please wait while we prepare your video interview.</p>
      </div>
    );
  }

  const completedVideos = Object.keys(recordedVideos).length;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Video Interview</h2>
        <p className="text-gray-600 mt-2">
          Record your responses to the interview questions (max {maxDuration} minutes each)
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Video className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-500">
            Progress: {completedVideos} of {questions.length} questions recorded
          </span>
        </div>
      </div>

      {/* Question Navigation */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {questions.map((_, index) => (
          <Button
            key={index}
            variant={index === currentQuestionIndex ? "default" : recordedVideos[index] ? "outline" : "ghost"}
            size="sm"
            onClick={() => setCurrentQuestionIndex(index)}
            className={`w-10 h-10 p-0 ${recordedVideos[index] ? 'bg-green-100 hover:bg-green-200' : ''}`}
          >
            {recordedVideos[index] ? <CheckCircle className="w-4 h-4 text-green-600" /> : index + 1}
          </Button>
        ))}
      </div>

      {/* Current Question */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <Badge variant={recordedVideos[currentQuestionIndex] ? "default" : "secondary"}>
              {recordedVideos[currentQuestionIndex] ? "Recorded" : "Not Recorded"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-800 leading-relaxed font-medium">
              {questions[currentQuestionIndex]}
            </p>
          </div>
          
          {/* Video Recording Area */}
          <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video relative">
            {!permissionGranted ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="text-center text-white space-y-4">
                  <Camera className="w-12 h-12 mx-auto opacity-50" />
                  <p className="text-lg">Camera access required</p>
                  <Button onClick={requestPermissions} variant="outline" className="text-white border-white hover:bg-white hover:text-gray-900">
                    <Camera className="w-4 h-4 mr-2" />
                    Enable Camera & Microphone
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Recording Indicator */}
                {isRecording && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    <span className="text-sm font-medium">REC {formatTime(recordingTime)}</span>
                  </div>
                )}
                
                {/* Max Duration Warning */}
                {isRecording && recordingTime >= (maxDuration * 60 - 30) && (
                  <div className="absolute top-4 right-4 bg-amber-600 text-white px-3 py-1 rounded-full">
                    <span className="text-sm font-medium">
                      {Math.max(0, maxDuration * 60 - recordingTime)}s left
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Recorded Video Preview */}
          {recordedVideos[currentQuestionIndex] && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Recorded Response
              </h4>
              <video
                src={recordedVideos[currentQuestionIndex]}
                controls
                className="w-full max-w-md mx-auto rounded-lg"
              />
            </div>
          )}

          {/* Recording Controls */}
          {permissionGranted && (
            <div className="flex justify-center gap-3">
              {!recordedVideos[currentQuestionIndex] ? (
                <>
                  {!isRecording ? (
                    <Button onClick={startRecording} className="bg-red-600 hover:bg-red-700">
                      <Video className="w-4 h-4 mr-2" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button onClick={stopRecording} variant="outline">
                      <Square className="w-4 h-4 mr-2" />
                      Stop Recording
                    </Button>
                  )}
                </>
              ) : (
                <Button onClick={retakeVideo} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake Video
                </Button>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Recording Tips:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Ensure good lighting on your face</li>
              <li>• Speak clearly and look at the camera</li>
              <li>• Keep your response under {maxDuration} minutes</li>
              <li>• You can retake your video if needed</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {completedVideos === questions.length && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-900">
              All video responses recorded! You can now proceed to review your application.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
