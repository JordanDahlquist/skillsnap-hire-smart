
import React from 'react';

export const SolarSystemBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Deeper space background with subtle vignette */}
      <div className="absolute inset-0 bg-gray-950" />
      
      {/* Enhanced depth gradient with vignette effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-gray-950/60 to-black opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20" />
      
      {/* Softer nebula clouds */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-gray-700/6 via-gray-800/3 to-transparent rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '12s' }} />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-gradient-radial from-gray-600/5 via-gray-700/2 to-transparent rounded-full blur-3xl animate-pulse" 
             style={{ animationDelay: '4s', animationDuration: '16s' }} />
        <div className="absolute top-2/3 left-1/6 w-64 h-64 bg-gradient-radial from-gray-500/4 via-gray-600/2 to-transparent rounded-full blur-2xl animate-pulse" 
             style={{ animationDelay: '8s', animationDuration: '14s' }} />
      </div>

      {/* Softened star field with reduced brightness */}
      <div className="absolute inset-0">
        {/* Dimmed prominent stars */}
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={`bright-${i}`}
            className="absolute bg-gray-200 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${1.5 + Math.random() * 1.5}px`,
              height: `${1.5 + Math.random() * 1.5}px`,
              animationDelay: `${(i * 0.3) % 8}s`,
              animationDuration: '8s',
              opacity: 0.3 + Math.random() * 0.2,
              boxShadow: `0 0 ${2 + Math.random() * 4}px rgba(229, 231, 235, 0.4)`,
            }}
          />
        ))}
        
        {/* Softer medium stars */}
        {Array.from({ length: 90 }).map((_, i) => (
          <div
            key={`medium-${i}`}
            className="absolute bg-slate-300 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${0.8 + Math.random() * 0.8}px`,
              height: `${0.8 + Math.random() * 0.8}px`,
              animationDelay: `${(i * 0.2) % 6}s`,
              animationDuration: '6s',
              opacity: 0.2 + Math.random() * 0.2,
            }}
          />
        ))}
        
        {/* Subtle distant stars */}
        {Array.from({ length: 150 }).map((_, i) => (
          <div
            key={`small-${i}`}
            className="absolute w-px h-px bg-gray-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.1 + Math.random() * 0.15,
            }}
          />
        ))}
      </div>

      {/* Toned down solar system container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[900px] h-[900px] opacity-25">
          
          {/* Softer central sun */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            {/* Gentle outer glow */}
            <div className="absolute w-14 h-14 bg-blue-400/15 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" 
                 style={{ animationDuration: '4s' }} />
            <div className="absolute w-10 h-10 bg-blue-300/20 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" 
                 style={{ animationDuration: '3s', animationDelay: '1s' }} />
            {/* Muted core sun */}
            <div className="absolute w-6 h-6 bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse shadow-sm" 
                 style={{ 
                   boxShadow: '0 0 15px 5px rgba(147, 197, 253, 0.3), 0 0 30px 8px rgba(147, 197, 253, 0.2)',
                   animationDuration: '2s'
                 }} />
          </div>
          
          {/* Subtle asteroid particles */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 animate-spin-slow">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`asteroid-1-${i}`}
                className="absolute w-0.5 h-0.5 bg-gray-400 rounded-full opacity-40"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `rotate(${i * 60}deg) translateX(80px) translateY(-0.25px)`,
                }}
              />
            ))}
          </div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 animate-spin-slower">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`asteroid-2-${i}`}
                className="absolute w-0.5 h-0.5 bg-gray-300 rounded-full opacity-30"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `rotate(${i * 45}deg) translateX(120px) translateY(-0.25px)`,
                }}
              />
            ))}
          </div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 animate-spin-slowest">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={`asteroid-3-${i}`}
                className="absolute w-0.5 h-0.5 bg-gray-200 rounded-full opacity-25"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `rotate(${i * 36}deg) translateX(160px) translateY(-0.25px)`,
                }}
              />
            ))}
          </div>
          
          {/* Muted orbiting planets with softer colors */}
          {/* Inner orbit */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 animate-spin-slow">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-gradient-to-br from-cyan-200 to-cyan-300 rounded-full shadow-sm" 
                 style={{ boxShadow: '0 0 6px rgba(165, 243, 252, 0.4)' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 bg-gradient-to-br from-emerald-200 to-emerald-300 rounded-full" 
                 style={{ boxShadow: '0 0 4px rgba(167, 243, 208, 0.3)' }} />
            <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-gradient-to-br from-purple-200 to-purple-300 rounded-full" />
          </div>
          
          {/* Middle orbit */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 animate-spin-slower">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full shadow-sm" 
                 style={{ boxShadow: '0 0 8px rgba(191, 219, 254, 0.5)' }} />
            <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gradient-to-br from-indigo-200 to-indigo-300 rounded-full" 
                 style={{ boxShadow: '0 0 6px rgba(196, 181, 253, 0.4)' }} />
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-gradient-to-br from-teal-200 to-teal-300 rounded-full" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1 h-1 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full" />
          </div>
          
          {/* Outer orbit */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 animate-spin-slowest">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-gradient-to-br from-violet-100 to-violet-200 rounded-full shadow-sm" 
                 style={{ boxShadow: '0 0 8px rgba(221, 214, 254, 0.5)' }} />
            <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full" 
                 style={{ boxShadow: '0 0 6px rgba(226, 232, 240, 0.4)' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full" />
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-gradient-to-br from-rose-200 to-rose-300 rounded-full" />
            <div className="absolute" 
                 style={{ 
                   left: '70.7%', 
                   top: '29.3%', 
                   transform: 'translate(-50%, -50%)' 
                 }}>
              <div className="w-0.5 h-0.5 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full" />
            </div>
          </div>
          
        </div>
      </div>

      {/* Gentle floating cosmic dust */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`dust-${i}`}
            className="absolute w-0.5 h-0.5 bg-gray-500/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: '15s',
            }}
          />
        ))}
      </div>
    </div>
  );
};
