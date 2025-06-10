
import React from 'react';

export const SolarSystemBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Light gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-purple-50" />
      
      {/* Subtle depth gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-blue-50/30 to-purple-100/40 opacity-60" />
      
      {/* Enhanced nebula clouds with better animations */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-blue-200/20 via-purple-200/10 to-transparent rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-gradient-radial from-purple-200/15 via-blue-200/8 to-transparent rounded-full blur-3xl animate-pulse" 
             style={{ animationDelay: '3s', animationDuration: '12s' }} />
        <div className="absolute top-2/3 left-1/6 w-64 h-64 bg-gradient-radial from-blue-300/12 via-purple-300/6 to-transparent rounded-full blur-2xl animate-pulse" 
             style={{ animationDelay: '6s', animationDuration: '10s' }} />
      </div>

      {/* Enhanced star field with better visibility */}
      <div className="absolute inset-0">
        {/* Bright accent stars */}
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={`bright-${i}`}
            className="absolute bg-blue-400 rounded-full animate-pulse opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${1.5 + Math.random()}px`,
              height: `${1.5 + Math.random()}px`,
              animationDelay: `${(i * 0.3) % 6}s`,
              animationDuration: '6s',
            }}
          />
        ))}
        
        {/* Medium twinkling stars */}
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={`medium-${i}`}
            className="absolute bg-purple-300 rounded-full animate-pulse opacity-25"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${0.8 + Math.random() * 0.5}px`,
              height: `${0.8 + Math.random() * 0.5}px`,
              animationDelay: `${(i * 0.2) % 4}s`,
              animationDuration: '4s',
            }}
          />
        ))}
        
        {/* Tiny distant stars */}
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={`small-${i}`}
            className="absolute w-px h-px bg-gray-400 rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Shooting stars for added coolness */}
      <div className="absolute inset-0">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`shooting-${i}`}
            className="absolute w-1 h-1 bg-blue-400 rounded-full animate-shooting-star opacity-0"
            style={{
              left: `${Math.random() * 20}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${i * 8 + Math.random() * 5}s`,
              animationDuration: '3s',
              boxShadow: '0 0 6px rgba(59, 130, 246, 0.8), -20px 0 10px rgba(59, 130, 246, 0.4)',
            }}
          />
        ))}
      </div>

      {/* Enhanced solar system - more prominent */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <div className="relative w-[600px] h-[600px]">
          
          {/* Central sun - enhanced */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="absolute w-10 h-10 bg-blue-300/50 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" 
                 style={{ animationDuration: '3s' }} />
            <div className="absolute w-8 h-8 bg-blue-400/60 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" 
                 style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
            <div className="absolute w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse opacity-80" 
                 style={{ animationDuration: '1.5s' }} />
          </div>
          
          {/* Enhanced orbiting elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 animate-spin-slow">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-400 rounded-full opacity-50" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-40" />
          </div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 animate-spin-slower">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-purple-400 rounded-full opacity-40" />
            <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-400 rounded-full opacity-35" />
          </div>
          
        </div>
      </div>

      {/* Enhanced floating light particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`dust-${i}`}
            className="absolute w-1 h-1 bg-blue-300/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: '12s',
            }}
          />
        ))}
      </div>
    </div>
  );
};
