
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Square, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface VideoRecordingAreaProps {
  stream: MediaStream | null;
  isRecording: boolean;
  recordingTime: number;
  videoReady: boolean;
  permissionGranted: boolean;
  videoLoading: boolean;
  recordedVideoUrl: string | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onRetakeVideo: () => void;
  onPermissionRequest: () => void;
}

export const VideoRecordingArea = ({
  stream,
  isRecording,
  recordingTime,
  videoReady,
  permissionGranted,
  videoLoading,
  recordedVideoUrl,
  onStartRecording,
  onStopRecording,
  onRetakeVideo,
  onPermissionRequest
}: VideoRecordingAreaProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const assignStreamToVideo = async (mediaStream: MediaStream) => {
    if (!videoRef.current || !mediaStream) return;
    
    const video = videoRef.current;
    
    try {
      video.srcObject = null;
      video.srcObject = mediaStream;
      
      await new Promise<void>((resolve) => {
        const onCanPlay = () => {
          video.removeEventListener('canplay', onCanPlay);
          resolve();
        };
        
        if (video.readyState >= 3) {
          resolve();
        } else {
          video.addEventListener('canplay', onCanPlay);
        }
      });
      
      await video.play();
    } catch (error) {
      console.error('Error assigning stream to video:', error);
      toast.error('Failed to display camera feed. Please try again.');
    }
  };

  useEffect(() => {
    if (stream && videoRef.current && permissionGranted) {
      assignStreamToVideo(stream);
    }
  }, [stream, permissionGranted]);

  return (
    <div className="space-y-6">
      {/* Video Recording Area */}
      <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video relative">
        {!permissionGranted ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center text-white space-y-4">
              <Camera className="w-12 h-12 mx-auto opacity-50" />
              <p className="text-lg">Camera access required</p>
              <Button 
                onClick={onPermissionRequest} 
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
              onPlaying={() => console.log('Video is playing')}
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
      {recordedVideoUrl && (
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2 text-gray-900">
            <CheckCircle className="w-4 h-4 text-green-600" />
            Recorded Response
          </h4>
          <video
            src={recordedVideoUrl}
            controls
            className="w-full max-w-md mx-auto rounded-lg"
          />
        </div>
      )}

      {/* Recording Controls */}
      {permissionGranted && (
        <div className="flex justify-center gap-3">
          {!recordedVideoUrl ? (
            <>
              {!isRecording ? (
                <Button 
                  onClick={onStartRecording} 
                  disabled={!videoReady}
                  className="bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-400"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {videoReady ? 'Start Recording' : 'Camera Loading...'}
                </Button>
              ) : (
                <Button 
                  onClick={onStopRecording} 
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
              onClick={onRetakeVideo} 
              variant="outline"
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Video
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
