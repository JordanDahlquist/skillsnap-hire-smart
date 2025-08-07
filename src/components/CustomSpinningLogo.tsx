
import React from 'react';

interface CustomSpinningLogoProps {
  size?: number;
  className?: string;
  animationSpeed?: 'slow' | 'normal' | 'fast';
}

export const CustomSpinningLogo = ({ 
  size = 64, 
  className = '', 
  animationSpeed = 'normal' 
}: CustomSpinningLogoProps) => {
  const speedMap = {
    slow: '3s',
    normal: '2s',
    fast: '1.5s'
  };

  const animationDuration = speedMap[animationSpeed];

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Logo image failed to load, showing fallback animation');
    // Hide the image and let the background glow be the animation
    e.currentTarget.style.display = 'none';
  };

  const handleImageLoad = () => {
    console.log('Logo image loaded successfully');
  };

  return (
    <>
      <style>{`
        @keyframes spin360 { to { transform: rotate(360deg); } }
        @keyframes breathe {
          0%, 100% { transform: scale(0.96); opacity: 0.9; }
          50% { transform: scale(1.04); opacity: 1; }
        }
        @keyframes orbit { to { transform: rotate(360deg); } }

        .logo-rotate { animation: spin360 var(--duration) linear infinite; }
        .logo-breathe { animation: breathe calc(var(--duration) * 2) ease-in-out infinite; }
        .ring-layer {
          background: conic-gradient(from 0deg, rgba(59,130,246,.9), rgba(59,130,246,0) 55%, rgba(59,130,246,.9) 100%);
          -webkit-mask: radial-gradient(circle, transparent 58%, black 60%);
                  mask: radial-gradient(circle, transparent 58%, black 60%);
          filter: drop-shadow(0 4px 12px rgba(59,130,246,.45));
          animation: spin360 calc(var(--duration) * 2) linear infinite;
        }
        .ring-dashed {
          border: 2px dashed rgba(59,130,246,.45);
          animation: spin360 calc(var(--duration) * 3) linear infinite reverse;
        }
        .orbit { animation: orbit calc(var(--duration) * 4) linear infinite; }
      `}</style>
      
      <div 
        className={`relative ${className}`}
        style={{ width: size, height: size, ['--duration' as any]: animationDuration }}
      >
        {/* Soft glow */}
        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl logo-breathe" />

        {/* Animated conic gradient ring */}
        <div className="absolute inset-0 rounded-full ring-layer" />

        {/* Dashed counter-rotating ring */}
        <div className="absolute inset-2 rounded-full ring-dashed" />

        {/* Orbiting accents */}
        <div className="absolute inset-0 orbit">
          <span className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.8)]" />
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
        </div>

        {/* Center logo with smooth spin */}
        <img
          src="/lovable-uploads/fcccb8be-0469-47e0-abd3-15729af8467e.png"
          alt="Loading..."
          className="relative z-10 w-full h-full object-contain drop-shadow-lg logo-rotate"
          loading="eager"
          decoding="async"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      </div>
    </>
  );
};
