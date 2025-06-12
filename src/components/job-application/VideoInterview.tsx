
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Square, Play, RotateCcw, CheckCircle } from "lucide-react";
import { toast } from "sonner";

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
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideos, setRecordedVideos] = useState<{ [key: number]: string }>({});
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Parse interview questions
    const parsedQuestions = questions
      .split(/\d+\.|\n-|\n\*/)
      .map(q => q.trim())
      .filter(q => q.length > 10 && !q.toLowerCase().includes('interview questions'))
      .slice(0, 5); // Limit to 5 questions
    
    setInterviewQuestions(parsedQuestions);
  }, [questions]);

  const requestPermissions = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      setStream(mediaStream);
      setPermissionGranted(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
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
    setIsRecording(true);
    setRecordingTime(0);

    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      
      setRecordedVideos(prev => ({
        ...prev,
        [currentQuestion]: url
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
    if (recordedVideos[currentQuestion]) {
      URL.revokeObjectURL(recordedVideos[currentQuestion]);
      const newRecordedVideos = { ...recordedVideos };
      delete newRecordedVideos[currentQuestion];
      setRecordedVideos(newRecordedVideos);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Video Interview
          </CardTitle>
          <p className="text-gray-700">
            Record your responses to the interview questions (max {maxLength} minutes each)
          </p>
          <div className="flex items-center gap-2 mt-4">
            <Camera className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">
              Progress: {completedVideos} of {interviewQuestions.length} questions recorded
            </span>
          </div>
        </CardHeader>
      </Card>

      {/* Question Navigation */}
      <div className="flex flex-wrap gap-2 justify-center">
        {interviewQuestions.map((_, index) => (
          <Button
            key={index}
            variant={index === currentQuestion ? "default" : recordedVideos[index] ? "outline" : "ghost"}
            size="sm"
            onClick={() => setCurrentQuestion(index)}
            className={`w-10 h-10 p-0 ${recordedVideos[index] ? 'bg-green-50 border-green-200 hover:bg-green-100' : 'bg-white hover:bg-gray-50'}`}
          >
            {recordedVideos[index] ? <CheckCircle className="w-4 h-4 text-green-600" /> : index + 1}
          </Button>
        ))}
      </div>

      {/* Current Question */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg text-gray-900">
            <span>Question {currentQuestion + 1} of {interviewQuestions.length}</span>
            {recordedVideos[currentQuestion] && (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-gray-900 leading-relaxed font-medium">
              {interviewQuestions[currentQuestion]}
            </p>
          </div>
          
          {/* Video Recording Area */}
          <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video relative">
            {!permissionGranted ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="text-center text-white space-y-4">
                  <Camera className="w-12 h-12 mx-auto opacity-50" />
                  <p className="text-lg">Camera access required</p>
                  <Button 
                    onClick={requestPermissions} 
                    variant="outline" 
                    className="text-white border-white hover:bg-white hover:text-gray-900"
                  >
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
                
                {isRecording && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    <span className="text-sm font-medium">REC {formatTime(recordingTime)}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Recorded Video Preview */}
          {recordedVideos[currentQuestion] && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2 text-gray-900">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Recorded Response
              </h4>
              <video
                src={recordedVideos[currentQuestion]}
                controls
                className="w-full max-w-md mx-auto rounded-lg"
              />
            </div>
          )}

          {/* Recording Controls */}
          {permissionGranted && (
            <div className="flex justify-center gap-3">
              {!recordedVideos[currentQuestion] ? (
                <>
                  {!isRecording ? (
                    <Button onClick={startRecording} className="bg-red-600 hover:bg-red-700 text-white">
                      <Camera className="w-4 h-4 mr-2" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button 
                      onClick={stopRecording} 
                      variant="outline"
                      className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Stop Recording
                    </Button>
                  )}
                </>
              ) : (
                <Button 
                  onClick={retakeVideo} 
                  variant="outline"
                  className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake Video
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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

      {allCompleted && (
        <Card className="bg-green-50 border border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">
                All video responses recorded! You can now proceed to review your application.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
