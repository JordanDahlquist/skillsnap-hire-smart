
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

  return (
    <>
      <style>{`
        @keyframes oscillate {
          0%, 100% {
            transform: rotate(-25deg);
          }
          50% {
            transform: rotate(25deg);
          }
        }
        
        @keyframes subtle-scale {
          0%, 100% {
            transform: scale(1) rotate(-25deg);
          }
          50% {
            transform: scale(1.05) rotate(25deg);
          }
        }
        
        .custom-spinning-logo {
          animation: oscillate ${animationDuration} ease-in-out infinite, subtle-scale ${animationDuration} ease-in-out infinite;
        }
        
        .custom-spinning-logo img {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
        }
      `}</style>
      
      <div 
        className={`relative ${className}`}
        style={{ width: size, height: size }}
      >
        {/* Subtle glow effect behind logo */}
        <div 
          className="absolute inset-0 bg-blue-400/20 rounded-full blur-lg animate-pulse"
          style={{ 
            width: size * 1.2, 
            height: size * 1.2,
            left: -size * 0.1,
            top: -size * 0.1
          }}
        />
        
        {/* Main logo with oscillating rotation */}
        <img
          src="/lovable-uploads/63006c72-b38b-4a0c-9fdd-38e79513a90e.png"
          alt="Loading..."
          className="relative z-10 w-full h-full object-contain drop-shadow-lg custom-spinning-logo"
          loading="eager"
          decoding="async"
          onError={(e) => {
            console.error('Logo image failed to load:', e);
            // Fallback: hide the image if it fails to load
            e.currentTarget.style.display = 'none';
          }}
          onLoad={() => {
            console.log('Logo image loaded successfully');
          }}
        />
      </div>
    </>
  );
};
