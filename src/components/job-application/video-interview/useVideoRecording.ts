
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

export type ViewMode = 'live' | 'playback';

export const useVideoRecording = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('live');
  
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      setVideoReady(true);
      setViewMode('live');
      
    } catch (error) {
      console.error('Error accessing camera/microphone:', error);
      
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
    } finally {
      setVideoLoading(false);
    }
  };

  const startRecording = (onRecordingComplete: (url: string) => void) => {
    if (!stream || !videoReady) {
      toast.error('Video not ready. Please wait for camera to load.');
      return;
    }

    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);
    setIsRecording(true);
    setRecordingTime(0);
    setViewMode('live'); // Ensure we're in live mode during recording

    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      onRecordingComplete(url);
      
      setIsRecording(false);
      setViewMode('playback'); // Switch to playback mode after recording
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

  const switchToLiveMode = () => {
    setViewMode('live');
  };

  const switchToPlaybackMode = () => {
    setViewMode('playback');
  };

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

  return {
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
  };
};
