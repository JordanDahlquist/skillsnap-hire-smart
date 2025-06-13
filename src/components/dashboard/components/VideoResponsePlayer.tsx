
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Volume2, VolumeX, Maximize, Download } from "lucide-react";

interface VideoResponse {
  question: string;
  answer: string;
  answerType?: string;
  videoUrl?: string;
  videoFileName?: string;
  videoFileSize?: number;
}

interface VideoResponsePlayerProps {
  response: VideoResponse;
  questionIndex: number;
}

export const VideoResponsePlayer = ({ response, questionIndex }: VideoResponsePlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleVideoClick = (action: 'play' | 'pause' | 'mute' | 'unmute' | 'fullscreen') => {
    const video = document.querySelector(`video[data-question="${questionIndex}"]`) as HTMLVideoElement;
    if (!video) return;

    switch (action) {
      case 'play':
        video.play();
        setIsPlaying(true);
        break;
      case 'pause':
        video.pause();
        setIsPlaying(false);
        break;
      case 'mute':
        video.muted = true;
        setIsMuted(true);
        break;
      case 'unmute':
        video.muted = false;
        setIsMuted(false);
        break;
      case 'fullscreen':
        if (video.requestFullscreen) {
          video.requestFullscreen();
        }
        break;
    }
  };

  const downloadVideo = () => {
    if (response.videoUrl) {
      const link = document.createElement('a');
      link.href = response.videoUrl;
      link.download = response.videoFileName || `video-response-${questionIndex + 1}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (response.answerType !== 'video' || !response.videoUrl) {
    return (
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Question {questionIndex + 1}
          </CardTitle>
          <p className="text-sm text-gray-600">{response.question}</p>
        </CardHeader>
        <CardContent>
          <p className="text-gray-800 whitespace-pre-wrap">{response.answer}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base mb-2">
              Question {questionIndex + 1}
            </CardTitle>
            <p className="text-sm text-gray-600 mb-3">{response.question}</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Video Response
              </Badge>
              {response.videoFileSize && (
                <Badge variant="outline" className="text-xs">
                  {formatFileSize(response.videoFileSize)}
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadVideo}
            className="flex items-center gap-1"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            data-question={questionIndex}
            src={response.videoUrl}
            className="w-full max-h-80 object-contain"
            controls
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onVolumeChange={(e) => setIsMuted((e.target as HTMLVideoElement).muted)}
          >
            Your browser does not support the video tag.
          </video>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVideoClick(isPlaying ? 'pause' : 'play')}
              className="flex items-center gap-1"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVideoClick(isMuted ? 'unmute' : 'mute')}
              className="flex items-center gap-1"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVideoClick('fullscreen')}
              className="flex items-center gap-1"
            >
              <Maximize className="w-4 h-4" />
              Fullscreen
            </Button>
          </div>
          
          {response.videoFileName && (
            <p className="text-xs text-gray-500">
              {response.videoFileName}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
