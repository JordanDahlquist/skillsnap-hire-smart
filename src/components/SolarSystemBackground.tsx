
import React from 'react';

export const SolarSystemBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Light gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-purple-50" />
      
      {/* Subtle depth gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-blue-50/30 to-purple-100/40 opacity-60" />
      
      {/* Soft nebula clouds - very subtle */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-blue-200/15 via-purple-200/8 to-transparent rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-gradient-radial from-purple-200/12 via-blue-200/6 to-transparent rounded-full blur-3xl animate-pulse" 
             style={{ animationDelay: '3s', animationDuration: '12s' }} />
        <div className="absolute top-2/3 left-1/6 w-64 h-64 bg-gradient-radial from-blue-300/10 via-purple-300/5 to-transparent rounded-full blur-2xl animate-pulse" 
             style={{ animationDelay: '6s', animationDuration: '10s' }} />
      </div>

      {/* Subtle star field */}
      <div className="absolute inset-0">
        {/* Bright accent stars - very minimal */}
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={`bright-${i}`}
            className="absolute bg-blue-400 rounded-full animate-pulse opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${1 + Math.random()}px`,
              height: `${1 + Math.random()}px`,
              animationDelay: `${(i * 0.3) % 6}s`,
              animationDuration: '6s',
            }}
          />
        ))}
        
        {/* Medium twinkling stars - subtle */}
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={`medium-${i}`}
            className="absolute bg-purple-300 rounded-full animate-pulse opacity-15"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${0.5 + Math.random() * 0.5}px`,
              height: `${0.5 + Math.random() * 0.5}px`,
              animationDelay: `${(i * 0.2) % 4}s`,
              animationDuration: '4s',
            }}
          />
        ))}
        
        {/* Tiny distant stars - very subtle */}
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={`small-${i}`}
            className="absolute w-px h-px bg-gray-400 rounded-full opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Minimal solar system - decorative accent */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <div className="relative w-[600px] h-[600px]">
          
          {/* Central sun - subtle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="absolute w-8 h-8 bg-blue-300/40 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" 
                 style={{ animationDuration: '3s' }} />
            <div className="absolute w-6 h-6 bg-blue-400/50 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" 
                 style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
            <div className="absolute w-4 h-4 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse opacity-60" 
                 style={{ animationDuration: '1.5s' }} />
          </div>
          
          {/* Orbiting elements - very subtle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 animate-spin-slow">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-40" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1 h-1 bg-purple-400 rounded-full opacity-30" />
          </div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 animate-spin-slower">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-purple-400 rounded-full opacity-30" />
            <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-25" />
          </div>
          
        </div>
      </div>

      {/* Floating light particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={`dust-${i}`}
            className="absolute w-0.5 h-0.5 bg-blue-300/20 rounded-full animate-float"
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
