
import { useEffect, useRef, useState } from 'react';

export const ScoutVideoCharacter = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [videoKey, setVideoKey] = useState(0);

  useEffect(() => {
    // Set up interval to restart the video every 15 seconds
    const interval = setInterval(() => {
      // Instead of clearing the src, we force a re-render with a new key
      // This avoids the black screen issue
      setVideoKey(prev => prev + 1);
    }, 15000); // 15 seconds

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="flex justify-center mb-4">
      <div className="relative w-32 h-24 rounded-lg overflow-hidden">
        <iframe
          key={videoKey}
          ref={iframeRef}
          src="https://player.vimeo.com/video/1098642733?autoplay=1&loop=0&muted=1&controls=0&title=0&byline=0&portrait=0&background=1"
          title="Scout AI Character"
          className="w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen={false}
          style={{
            pointerEvents: 'none',
            border: 'none',
            outline: 'none'
          }}
          onError={() => setIsVisible(false)}
        />
        {/* Fallback overlay in case video doesn't load */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center opacity-0">
          <div className="w-6 h-6 bg-white rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};
