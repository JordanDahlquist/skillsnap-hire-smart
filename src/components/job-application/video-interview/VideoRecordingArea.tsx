import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Square, RotateCcw, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface VideoRecordingAreaProps {
  currentQuestion: number;
  totalQuestions: number;
  maxLength: number;
  recordedVideos: { [key: number]: string };
  onVideoRecorded: (questionIndex: number, videoBlob: Blob) => void;
}

export const VideoRecordingArea = ({
  currentQuestion,
  totalQuestions,
  maxLength,
  recordedVideos,
  onVideoRecorded
}: VideoRecordingAreaProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const hasRecordedVideo = recordedVideos[currentQuestion];

  useEffect(() => {
    initializeCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      console.log('Initializing camera...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });
      
      console.log('Camera stream obtained:', mediaStream);
      setStream(mediaStream);
      
      if (videoRef.current) {
        console.log('Assigning stream to video element...');
        videoRef.current.srcObject = mediaStream;
        
        // Wait for the video element to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded, playing...');
          videoRef.current?.play().catch(error => {
            console.error('Error playing video:', error);
          });
        };
        
        videoRef.current.onerror = (error) => {
          console.error('Video element error:', error);
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Failed to access camera. Please check your permissions.');
    }
  };

  const startRecording = async () => {
    if (!stream) {
      toast.error('Camera not available');
      return;
    }

    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      setRecordedChunks([]);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };
      
      mediaRecorder.onstop = () => {
        setIsProcessing(true);
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        onVideoRecorded(currentQuestion, blob);
        setIsProcessing(false);
        toast.success('Video recorded successfully!');
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxLength * 60) {
            stopRecording();
            return maxLength * 60;
          }
          return newTime;
        });
      }, 1000);
      
      toast.success('Recording started!');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const resetRecording = () => {
    setRecordingTime(0);
    setRecordedChunks([]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardContent className="p-6 space-y-6">
        <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
            style={{ transform: 'scaleX(-1)' }}
          />
          
          {isRecording && (
            <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              REC {formatTime(recordingTime)} / {maxLength}:00
            </div>
          )}
          
          {hasRecordedVideo && !isRecording && (
            <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Recorded
            </div>
          )}
          
          {isProcessing && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p>Processing video...</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-center gap-4">
          {!isRecording ? (
            <>
              <Button
                onClick={startRecording}
                disabled={!stream || isProcessing}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Start Recording
              </Button>
              
              {hasRecordedVideo && (
                <Button
                  onClick={resetRecording}
                  variant="outline"
                  className="px-6 py-3 rounded-lg flex items-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Re-record
                </Button>
              )}
            </>
          ) : (
            <Button
              onClick={stopRecording}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
            >
              <Square className="w-5 h-5" />
              Stop Recording
            </Button>
          )}
        </div>
        
        <div className="text-center text-sm text-gray-600">
          <p>Maximum recording time: {maxLength} minutes</p>
          <p>Question {currentQuestion + 1} of {totalQuestions}</p>
        </div>
      </CardContent>
    </Card>
  );
};
