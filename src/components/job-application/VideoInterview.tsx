
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
  const [videoReady, setVideoReady] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  
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

  const waitForVideoElement = async (video: HTMLVideoElement): Promise<void> => {
    return new Promise((resolve) => {
      if (video.readyState >= 1) {
        resolve();
        return;
      }
      
      const onLoadedMetadata = () => {
        video.removeEventListener('loadedmetadata', onLoadedMetadata);
        resolve();
      };
      
      video.addEventListener('loadedmetadata', onLoadedMetadata);
    });
  };

  const assignStreamToVideo = async (mediaStream: MediaStream) => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    setVideoLoading(true);
    
    try {
      // Clear any existing source
      video.srcObject = null;
      
      // Assign the new stream
      video.srcObject = mediaStream;
      
      // Wait for the video element to be ready
      await waitForVideoElement(video);
      
      // Force play with proper error handling
      try {
        await video.play();
        setVideoReady(true);
        console.log('Video stream successfully assigned and playing');
      } catch (playError) {
        console.warn('Initial play failed, retrying...', playError);
        // Retry after a short delay
        setTimeout(async () => {
          try {
            await video.play();
            setVideoReady(true);
            console.log('Video stream playing after retry');
          } catch (retryError) {
            console.error('Video play failed after retry:', retryError);
            toast.error('Failed to start video preview. Please try refreshing.');
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error assigning stream to video:', error);
      toast.error('Failed to display camera feed. Please try again.');
    } finally {
      setVideoLoading(false);
    }
  };

  const requestPermissions = async () => {
    try {
      setVideoLoading(true);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }, 
        audio: true 
      });
      
      setStream(mediaStream);
      setPermissionGranted(true);
      
      // Assign stream to video element
      await assignStreamToVideo(mediaStream);
      
    } catch (error) {
      console.error('Error accessing camera/microphone:', error);
      setVideoLoading(false);
      
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          toast.error('Camera access denied. Please grant permissions and try again.');
        } else if (error.name === 'NotFoundError') {
          toast.error('No camera found. Please connect a camera and try again.');
        } else {
          toast.error('Unable to access camera. Please check your device settings.');
        }
      } else {
        toast.error('Unable to access camera and microphone. Please grant permissions.');
      }
    }
  };

  const startRecording = () => {
    if (!stream || !videoReady) {
      toast.error('Video not ready. Please wait for camera to load.');
      return;
    }

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

  // Cleanup streams on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [stream]);

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
                {videoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-10">
                    <div className="text-center text-white space-y-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                      <p className="text-sm">Connecting camera...</p>
                    </div>
                  </div>
                )}
                
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  onLoadStart={() => {
                    console.log('Video load started');
                  }}
                  onLoadedMetadata={() => {
                    console.log('Video metadata loaded');
                  }}
                  onLoadedData={() => {
                    console.log('Video data loaded');
                  }}
                  onCanPlay={() => {
                    console.log('Video can play');
                  }}
                  onPlaying={() => {
                    console.log('Video is playing');
                    setVideoReady(true);
                  }}
                  onError={(e) => {
                    console.error('Video element error:', e);
                    toast.error('Video display error. Please try refreshing.');
                  }}
                />
                
                {isRecording && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    <span className="text-sm font-medium">REC {formatTime(recordingTime)}</span>
                  </div>
                )}
                
                {!videoReady && permissionGranted && !videoLoading && (
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    Initializing camera...
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
                    <Button 
                      onClick={startRecording} 
                      disabled={!videoReady}
                      className="bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-400"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {videoReady ? 'Start Recording' : 'Camera Loading...'}
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
