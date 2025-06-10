
import React from 'react';

export const SolarSystemBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-purple-50" />
      
      {/* Galaxy Container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[1200px] h-[1200px] opacity-60">
          
          {/* Galactic Core - Bright center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="absolute w-20 h-20 bg-gradient-radial from-white via-yellow-200 to-orange-300 rounded-full blur-sm animate-pulse" 
                 style={{ animationDuration: '4s' }} />
            <div className="absolute w-16 h-16 bg-gradient-radial from-yellow-100 via-orange-200 to-red-300 rounded-full blur-md animate-pulse" 
                 style={{ animationDuration: '3s', animationDelay: '1s' }} />
            <div className="absolute w-12 h-12 bg-gradient-radial from-white to-yellow-300 rounded-full animate-pulse" 
                 style={{ animationDuration: '2s' }} />
          </div>
          
          {/* Spiral Arm 1 - Main spiral */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full animate-spin-galaxy-1">
            <div className="absolute w-full h-full">
              {/* Spiral path with stars and nebula */}
              <div className="absolute top-1/2 left-1/2 w-1 h-96 bg-gradient-to-t from-transparent via-blue-300/30 to-transparent origin-bottom rotate-0 blur-sm" />
              <div className="absolute top-1/2 left-1/2 w-1 h-80 bg-gradient-to-t from-transparent via-purple-300/25 to-transparent origin-bottom rotate-45 blur-sm" />
              <div className="absolute top-1/2 left-1/2 w-1 h-64 bg-gradient-to-t from-transparent via-blue-400/20 to-transparent origin-bottom rotate-90 blur-sm" />
              <div className="absolute top-1/2 left-1/2 w-1 h-48 bg-gradient-to-t from-transparent via-purple-400/15 to-transparent origin-bottom rotate-135 blur-sm" />
              
              {/* Star clusters along spiral */}
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={`spiral1-${i}`}
                  className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full"
                  style={{
                    transform: `rotate(${i * 30}deg) translateY(-${80 + i * 15}px) translate(-50%, -50%)`,
                    opacity: 0.4 + Math.random() * 0.4,
                    animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                    animationDelay: `${i * 0.5}s`
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Spiral Arm 2 - Counter-rotating */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full animate-spin-galaxy-2">
            <div className="absolute w-full h-full">
              {/* Counter spiral path */}
              <div className="absolute top-1/2 left-1/2 w-1 h-80 bg-gradient-to-t from-transparent via-purple-300/25 to-transparent origin-bottom rotate-120 blur-sm" />
              <div className="absolute top-1/2 left-1/2 w-1 h-64 bg-gradient-to-t from-transparent via-blue-300/20 to-transparent origin-bottom rotate-165 blur-sm" />
              <div className="absolute top-1/2 left-1/2 w-1 h-48 bg-gradient-to-t from-transparent via-purple-400/15 to-transparent origin-bottom rotate-210 blur-sm" />
              <div className="absolute top-1/2 left-1/2 w-1 h-32 bg-gradient-to-t from-transparent via-blue-400/10 to-transparent origin-bottom rotate-255 blur-sm" />
              
              {/* More star clusters */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={`spiral2-${i}`}
                  className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-blue-200 rounded-full"
                  style={{
                    transform: `rotate(${120 + i * 40}deg) translateY(-${60 + i * 20}px) translate(-50%, -50%)`,
                    opacity: 0.3 + Math.random() * 0.5,
                    animation: `twinkle ${1.5 + Math.random() * 2}s ease-in-out infinite`,
                    animationDelay: `${i * 0.7}s`
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Nebular Clouds - Swirling gas clouds */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full animate-spin-nebula">
            <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-gradient-radial from-purple-300/20 via-blue-300/10 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-gradient-radial from-blue-400/15 via-purple-300/8 to-transparent rounded-full blur-2xl" />
            <div className="absolute top-3/4 left-1/6 w-32 h-32 bg-gradient-radial from-purple-400/12 via-blue-400/6 to-transparent rounded-full blur-xl" />
          </div>
          
          {/* Outer dust and distant stars */}
          <div className="absolute inset-0 animate-spin-outer">
            {Array.from({ length: 60 }).map((_, i) => (
              <div
                key={`outer-${i}`}
                className="absolute bg-gray-300 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${0.5 + Math.random() * 1}px`,
                  height: `${0.5 + Math.random() * 1}px`,
                  opacity: 0.15 + Math.random() * 0.25,
                  animation: `float ${8 + Math.random() * 4}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
          
        </div>
      </div>

      {/* Additional atmospheric elements */}
      <div className="absolute inset-0">
        {/* Shooting stars for drama */}
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={`shooting-${i}`}
            className="absolute w-1 h-1 bg-blue-400 rounded-full animate-shooting-star opacity-0"
            style={{
              left: `${Math.random() * 30}%`,
              top: `${30 + Math.random() * 40}%`,
              animationDelay: `${i * 12 + Math.random() * 8}s`,
              animationDuration: '4s',
              boxShadow: '0 0 8px rgba(59, 130, 246, 0.9), -30px 0 15px rgba(59, 130, 246, 0.5)',
            }}
          />
        ))}
        
        {/* Twinkling foreground stars */}
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={`twinkle-${i}`}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              opacity: 0.4 + Math.random() * 0.6,
              animationDuration: `${1 + Math.random() * 3}s`,
              animationDelay: `${i * 0.3}s`,
              boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)'
            }}
          />
        ))}
      </div>
    </div>
  );
};
