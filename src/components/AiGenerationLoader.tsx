
import { useState, useEffect } from "react";
import { Sparkles, Brain, Wand2, Zap, Target, PenTool } from "lucide-react";

interface AiGenerationLoaderProps {
  onComplete?: () => void;
}

const loadingMessages = [
  { icon: Target, text: "🎯 Analyzing your requirements..." },
  { icon: Brain, text: "🧠 AI is working its magic..." },
  { icon: PenTool, text: "✍️ Crafting compelling job descriptions..." },
  { icon: Sparkles, text: "✨ Adding the perfect finishing touches..." },
  { icon: Zap, text: "⚡ Almost ready to wow you!" },
];

export const AiGenerationLoader = ({ onComplete }: AiGenerationLoaderProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [countdown, setCountdown] = useState(20);

  useEffect(() => {
    // Rotate messages every 4 seconds
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 4000);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(countdownInterval);
    };
  }, [onComplete]);

  const currentMessage = loadingMessages[currentMessageIndex];
  const IconComponent = currentMessage.icon;

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 rounded-lg p-8 relative overflow-hidden">
      {/* Animated background with floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-purple-300/40 rounded-full animate-pulse" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className="absolute top-32 right-24 w-1.5 h-1.5 bg-blue-300/40 rounded-full animate-pulse" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className="absolute bottom-32 left-32 w-3 h-3 bg-indigo-300/40 rounded-full animate-pulse" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-purple-300/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}></div>
        <div className="absolute top-40 left-1/2 w-1 h-1 bg-blue-400/40 rounded-full animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '4s' }}></div>
        <div className="absolute bottom-40 right-1/3 w-2.5 h-2.5 bg-indigo-300/40 rounded-full animate-pulse" style={{ animationDelay: '2.5s', animationDuration: '3s' }}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center space-y-8">
        {/* Elegant central animation */}
        <div className="relative">
          {/* Rotating gradient ring */}
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 animate-spin" style={{ animationDuration: '3s' }}>
              <div className="absolute inset-1 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 rounded-full"></div>
            </div>
            
            {/* Central morphing gradient circle */}
            <div className="absolute inset-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center animate-pulse" style={{ animationDuration: '2s' }}>
              <Wand2 className="w-8 h-8 text-white" />
            </div>
          </div>
          
          {/* Orbiting elements */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full shadow-lg"></div>
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }}>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full shadow-lg"></div>
          </div>
        </div>

        {/* Dynamic message with smooth transitions */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3 transition-all duration-500 ease-in-out">
            <div className="p-2 bg-white/60 backdrop-blur-sm rounded-full shadow-sm">
              <IconComponent className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 tracking-wide">
              {currentMessage.text}
            </h3>
          </div>
          
          <p className="text-gray-600 font-medium">
            AI is crafting your perfect job post and skills test
          </p>
        </div>

        {/* Enhanced progress indicator */}
        <div className="w-full max-w-md mx-auto space-y-4">
          <div className="relative">
            <div className="w-full bg-gray-200/60 backdrop-blur-sm rounded-full h-3 shadow-inner">
              <div 
                className="bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-lg relative overflow-hidden"
                style={{ width: `${((20 - countdown) / 20) * 100}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-500 font-medium">
            Almost done! ~{countdown} seconds remaining
          </div>
        </div>

        {/* Glass morphism info card */}
        <div className="bg-white/40 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-800 mb-2">AI Magic in Progress</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                Our advanced AI is analyzing your requirements and creating a comprehensive, 
                tailored job posting that will attract the perfect candidates for your role.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
