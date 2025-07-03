
import { useEffect, useRef, useState } from 'react';

export const ScoutVideoCharacter = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [videoKey, setVideoKey] = useState(0);
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    // Set up interval to restart the video every 15 seconds
    const interval = setInterval(() => {
      // Show image for 1 second before switching to new video
      setShowImage(true);
      
      setTimeout(() => {
        setVideoKey(prev => prev + 1);
        setShowImage(false);
      }, 1000); // Show image for 1 second
    }, 15000); // 15 seconds total cycle

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="flex justify-center mb-4">
      <div className="relative w-32 h-24 rounded-lg overflow-hidden">
        {/* Scout Robot Image */}
        <div 
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
            showImage ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ zIndex: showImage ? 2 : 1 }}
        >
          <img
            src="/lovable-uploads/94c55311-c1e6-4d52-957f-02345e74c4bc.png"
            alt="Scout AI Character"
            className="w-full h-full object-contain bg-gradient-to-br from-blue-50 to-blue-100"
          />
        </div>

        {/* Video Iframe */}
        <div 
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
            showImage ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ zIndex: showImage ? 1 : 2 }}
        >
          <iframe
            key={videoKey}
            ref={iframeRef}
            src="https://player.vimeo.com/video/1098645553?autoplay=1&loop=0&muted=1&controls=0&title=0&byline=0&portrait=0&background=1"
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
        </div>
      </div>
    </div>
  );
};
