
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

  const startRecording = (onRecordingComplete: (blob: Blob, url: string) => void) => {
    if (!stream || !videoReady) {
      toast.error('Video not ready. Please wait for camera to load.');
      return;
    }

    // Configure MediaRecorder with compression settings
    const options = {
      mimeType: 'video/webm;codecs=vp8,opus',
      videoBitsPerSecond: 2500000, // 2.5 Mbps for good quality but reasonable file size
      audioBitsPerSecond: 128000   // 128 kbps for audio
    };

    // Check if the desired codec is supported, fallback if needed
    let recorder: MediaRecorder;
    try {
      if (MediaRecorder.isTypeSupported(options.mimeType)) {
        recorder = new MediaRecorder(stream, options);
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        recorder = new MediaRecorder(stream, { 
          mimeType: 'video/webm',
          videoBitsPerSecond: 2500000,
          audioBitsPerSecond: 128000
        });
      } else {
        // Fallback to default with bitrate limits
        recorder = new MediaRecorder(stream, {
          videoBitsPerSecond: 2500000,
          audioBitsPerSecond: 128000
        });
      }
    } catch (error) {
      console.warn('Error creating MediaRecorder with compression settings, using defaults:', error);
      recorder = new MediaRecorder(stream);
    }

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
      const blob = new Blob(chunks, { type: recorder.mimeType || 'video/webm' });
      const url = URL.createObjectURL(blob);
      
      // Log file size for debugging
      const sizeInMB = (blob.size / (1024 * 1024)).toFixed(2);
      console.log(`Video recorded: ${sizeInMB}MB, duration: ${recordingTime}s`);
      
      onRecordingComplete(blob, url);
      
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
