
import { useRef, useState } from 'react';

export const ScoutVideoCharacter = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="flex justify-center mb-4">
      <div className="relative w-32 h-24 rounded-lg overflow-hidden">
        <iframe
          ref={iframeRef}
          src="https://player.vimeo.com/video/1098645553?autoplay=1&loop=1&muted=1&controls=0&title=0&byline=0&portrait=0&background=1"
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
  );
};
