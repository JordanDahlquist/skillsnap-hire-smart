
import { useEffect, useRef, useState } from 'react';

export const ScoutVideoCharacter = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Set up interval to restart the video every 15 seconds
    const interval = setInterval(() => {
      if (iframeRef.current) {
        // Reload the iframe to restart the video
        const currentSrc = iframeRef.current.src;
        iframeRef.current.src = '';
        setTimeout(() => {
          if (iframeRef.current) {
            iframeRef.current.src = currentSrc;
          }
        }, 100);
      }
    }, 15000); // 15 seconds

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="flex justify-center mb-4">
      <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-lg border-2 border-white/20">
        <iframe
          ref={iframeRef}
          src="https://www.youtube.com/embed/LKpzePb6vHs?autoplay=1&loop=1&mute=1&controls=0&showinfo=0&rel=0&disablekb=1&fs=0&modestbranding=1&playsinline=1&start=0&end=10"
          title="Scout AI Character"
          className="w-full h-full scale-150 -translate-y-2"
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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div className="w-6 h-6 bg-white rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};
