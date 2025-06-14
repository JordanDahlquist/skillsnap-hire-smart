
import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Square, RotateCcw, CheckCircle, Video } from "lucide-react";
import { ViewMode } from "./useVideoRecording";

interface VideoRecordingAreaProps {
  currentQuestion: number;
  totalQuestions: number;
  maxLength: number;
  stream: MediaStream | null;
  isRecording: boolean;
  recordingTime: number;
  videoReady: boolean;
  permissionGranted: boolean;
  videoLoading: boolean;
  viewMode: ViewMode;
  recordedVideoUrl: string | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onRetakeVideo: () => void;
  onPermissionRequest: () => Promise<void>;
  onSwitchToLive: () => void;
  onSwitchToPlayback: () => void;
}

export const VideoRecordingArea = ({
  currentQuestion,
  totalQuestions,
  maxLength,
  stream,
  isRecording,
  recordingTime,
  videoReady,
  permissionGranted,
  videoLoading,
  viewMode,
  recordedVideoUrl,
  onStartRecording,
  onStopRecording,
  onRetakeVideo,
  onPermissionRequest,
  onSwitchToLive,
  onSwitchToPlayback
}: VideoRecordingAreaProps) => {
  const liveVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (stream && liveVideoRef.current && viewMode === 'live') {
      console.log('Assigning stream to live video element...');
      liveVideoRef.current.srcObject = stream;
      
      liveVideoRef.current.onloadedmetadata = () => {
        console.log('Live video metadata loaded, playing...');
        liveVideoRef.current?.play().catch(error => {
          console.error('Error playing live video:', error);
        });
      };
      
      liveVideoRef.current.onerror = (error) => {
        console.error('Live video element error:', error);
      };
    }
  }, [stream, viewMode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRetakeVideo = () => {
    onRetakeVideo();
    onSwitchToLive();
  };

  const handlePlayRecording = () => {
    if (recordedVideoUrl) {
      onSwitchToPlayback();
    }
  };

  if (videoLoading) {
    return (
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-6 space-y-6">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p>Loading camera...</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button
              disabled
              className="bg-gray-400 text-white px-6 py-3 rounded-lg"
            >
              Loading...
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!permissionGranted) {
    return (
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-6 space-y-6">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-center">
                <p className="mb-4">Camera access required to record video responses</p>
                <Button
                  onClick={onPermissionRequest}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Enable Camera
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardContent className="p-6 space-y-6">
        <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
          {viewMode === 'playback' && recordedVideoUrl ? (
            <video
              src={recordedVideoUrl}
              className="w-full h-full object-cover"
              controls
              playsInline
              key={recordedVideoUrl} // Force re-render when URL changes
            />
          ) : (
            <video
              ref={liveVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
              style={{ transform: 'scaleX(-1)' }}
            />
          )}
          
          {isRecording && (
            <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              REC {formatTime(recordingTime)} / {maxLength}:00
            </div>
          )}
          
          {recordedVideoUrl && viewMode === 'playback' && (
            <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Recorded
            </div>
          )}

          {recordedVideoUrl && viewMode === 'live' && !isRecording && (
            <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
              <Video className="w-4 h-4" />
              Live Preview
            </div>
          )}
        </div>
        
        <div className="flex justify-center gap-4">
          {!isRecording ? (
            <>
              {viewMode === 'live' && (
                <Button
                  onClick={onStartRecording}
                  disabled={!videoReady}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Start Recording
                </Button>
              )}
              
              {recordedVideoUrl && viewMode === 'live' && (
                <Button
                  onClick={handlePlayRecording}
                  variant="outline"
                  className="px-6 py-3 rounded-lg flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Play Recording
                </Button>
              )}

              {recordedVideoUrl && (
                <Button
                  onClick={handleRetakeVideo}
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
              onClick={onStopRecording}
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
          {viewMode === 'playback' && recordedVideoUrl && (
            <p className="text-green-600 font-medium">Viewing recorded response</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
