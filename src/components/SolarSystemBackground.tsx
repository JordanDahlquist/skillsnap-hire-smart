
import React from 'react';

export const SolarSystemBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Charcoal space background */}
      <div className="absolute inset-0 bg-gray-800" />
      
      {/* Subtle depth gradient for charcoal */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-gray-800 to-gray-900 opacity-30" />
      
      {/* Minimal nebula clouds - adjusted for charcoal background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-gray-600/15 via-gray-700/8 to-transparent rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-gradient-radial from-gray-500/12 via-gray-600/6 to-transparent rounded-full blur-3xl animate-pulse" 
             style={{ animationDelay: '3s', animationDuration: '12s' }} />
        <div className="absolute top-2/3 left-1/6 w-64 h-64 bg-gradient-radial from-gray-400/10 via-gray-500/5 to-transparent rounded-full blur-2xl animate-pulse" 
             style={{ animationDelay: '6s', animationDuration: '10s' }} />
      </div>

      {/* Enhanced star field with multiple layers */}
      <div className="absolute inset-0">
        {/* Bright prominent stars */}
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={`bright-${i}`}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 2}px`,
              height: `${2 + Math.random() * 2}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              opacity: 0.7 + Math.random() * 0.3,
              boxShadow: `0 0 ${4 + Math.random() * 8}px rgba(255, 255, 255, 0.8)`,
            }}
          />
        ))}
        
        {/* Medium twinkling stars */}
        {Array.from({ length: 120 }).map((_, i) => (
          <div
            key={`medium-${i}`}
            className="absolute bg-blue-100 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${1 + Math.random()}px`,
              height: `${1 + Math.random()}px`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              opacity: 0.4 + Math.random() * 0.4,
            }}
          />
        ))}
        
        {/* Distant small stars */}
        {Array.from({ length: 200 }).map((_, i) => (
          <div
            key={`small-${i}`}
            className="absolute w-px h-px bg-gray-300 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.2 + Math.random() * 0.3,
            }}
          />
        ))}
      </div>

      {/* Enhanced meteors with gravitational pull effects */}
      <div className="absolute inset-0">
        {/* Meteors that spiral into the solar system */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`spiral-meteor-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full opacity-0 animate-spiral-in"
            style={{
              left: `${Math.random() * 20}%`,
              top: `${Math.random() * 20}%`,
              animationDelay: `${3 + Math.random() * 8}s`,
              animationDuration: '4s',
              boxShadow: '0 0 8px 3px rgba(255, 255, 255, 0.8)',
            }}
          />
        ))}
        
        {/* Meteors that get captured into orbit */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`orbit-meteor-${i}`}
            className="absolute w-1.5 h-1.5 bg-blue-200 rounded-full opacity-0 animate-gravitational-capture"
            style={{
              right: `${Math.random() * 30}%`,
              top: `${Math.random() * 30}%`,
              animationDelay: `${5 + Math.random() * 10}s`,
              animationDuration: '6s',
              boxShadow: '0 0 6px 2px rgba(191, 219, 254, 0.8)',
            }}
          />
        ))}
        
        {/* Fast meteors that pass by with slight deflection */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`deflect-meteor-${i}`}
            className="absolute w-0.5 h-0.5 bg-yellow-200 rounded-full opacity-0 animate-gravitational-deflect"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${8 + Math.random() * 12}s`,
              animationDuration: '3s',
              boxShadow: '0 0 4px 1px rgba(254, 240, 138, 0.8)',
            }}
          />
        ))}
      </div>

      {/* Enhanced solar system container - NO ORBIT LINES */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[900px] h-[900px] opacity-50">
          
          {/* Central sun with intense glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            {/* Outer glow rings */}
            <div className="absolute w-16 h-16 bg-blue-400/25 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" 
                 style={{ animationDuration: '3s' }} />
            <div className="absolute w-12 h-12 bg-blue-300/35 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" 
                 style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
            {/* Core sun */}
            <div className="absolute w-8 h-8 bg-gradient-to-br from-blue-300 via-blue-400 to-blue-600 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse shadow-lg" 
                 style={{ 
                   boxShadow: '0 0 25px 10px rgba(59, 130, 246, 0.7), 0 0 50px 15px rgba(59, 130, 246, 0.4)',
                   animationDuration: '1.5s'
                 }} />
          </div>
          
          {/* Invisible orbit paths with asteroid particles - NO VISIBLE BORDERS */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 animate-spin-slow">
            {/* Asteroid particles */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`asteroid-1-${i}`}
                className="absolute w-0.5 h-0.5 bg-gray-300 rounded-full opacity-70"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `rotate(${i * 45}deg) translateX(80px) translateY(-0.25px)`,
                }}
              />
            ))}
          </div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 animate-spin-slower">
            {/* Asteroid particles */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={`asteroid-2-${i}`}
                className="absolute w-0.5 h-0.5 bg-gray-200 rounded-full opacity-50"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `rotate(${i * 30}deg) translateX(120px) translateY(-0.25px)`,
                }}
              />
            ))}
          </div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 animate-spin-slowest">
            {/* Asteroid particles */}
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={`asteroid-3-${i}`}
                className="absolute w-0.5 h-0.5 bg-gray-100 rounded-full opacity-40"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `rotate(${i * 22.5}deg) translateX(160px) translateY(-0.25px)`,
                }}
              />
            ))}
          </div>
          
          {/* Enhanced orbiting planets with varied colors and trails */}
          {/* Inner orbit - Fast planets */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 animate-spin-slow">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gradient-to-br from-cyan-300 to-cyan-500 rounded-full shadow-lg" 
                 style={{ boxShadow: '0 0 10px rgba(34, 211, 238, 0.7)' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gradient-to-br from-emerald-300 to-emerald-500 rounded-full shadow-md" 
                 style={{ boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)' }} />
            <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-gradient-to-br from-purple-300 to-purple-500 rounded-full" />
          </div>
          
          {/* Middle orbit - Medium speed planets */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 animate-spin-slower">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full shadow-lg" 
                 style={{ boxShadow: '0 0 12px rgba(96, 165, 250, 0.8)' }} />
            <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-gradient-to-br from-indigo-300 to-indigo-500 rounded-full shadow-md" 
                 style={{ boxShadow: '0 0 10px rgba(129, 140, 248, 0.7)' }} />
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gradient-to-br from-teal-300 to-teal-500 rounded-full" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 bg-gradient-to-br from-pink-300 to-pink-500 rounded-full" />
          </div>
          
          {/* Outer orbit - Slow planets */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 animate-spin-slowest">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-gradient-to-br from-violet-200 to-violet-400 rounded-full shadow-lg" 
                 style={{ boxShadow: '0 0 15px rgba(196, 181, 253, 0.9)' }} />
            <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-gradient-to-br from-slate-200 to-slate-400 rounded-full shadow-md" 
                 style={{ boxShadow: '0 0 10px rgba(203, 213, 225, 0.7)' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gradient-to-br from-amber-200 to-amber-400 rounded-full" />
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-gradient-to-br from-rose-300 to-rose-500 rounded-full" />
            <div className="absolute" 
                 style={{ 
                   left: '70.7%', 
                   top: '29.3%', 
                   transform: 'translate(-50%, -50%)' 
                 }}>
              <div className="w-1 h-1 bg-gradient-to-br from-orange-300 to-orange-500 rounded-full" />
            </div>
          </div>
          
        </div>
      </div>

      {/* Floating cosmic dust particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={`dust-${i}`}
            className="absolute w-0.5 h-0.5 bg-gray-400/40 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${8 + Math.random() * 6}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
