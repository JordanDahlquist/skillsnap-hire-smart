
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
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    // Rotate messages every 2.5 seconds
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2500);

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
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-8">
      {/* Animated background sparkles */}
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <div className="absolute top-1/4 left-1/4 animate-pulse">
          <Sparkles className="w-4 h-4 text-purple-300" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-pulse delay-700">
          <Sparkles className="w-3 h-3 text-blue-300" />
        </div>
        <div className="absolute bottom-1/3 left-1/3 animate-pulse delay-1000">
          <Sparkles className="w-5 h-5 text-purple-200" />
        </div>
        <div className="absolute bottom-1/4 right-1/3 animate-pulse delay-500">
          <Sparkles className="w-4 h-4 text-blue-200" />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center space-y-6">
        {/* Animated main icon */}
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
            <Wand2 className="w-10 h-10 text-white animate-bounce" />
          </div>
          {/* Orbiting sparkles */}
          <div className="absolute inset-0 animate-spin">
            <Sparkles className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-4 h-4 text-purple-500" />
          </div>
          <div className="absolute inset-0 animate-spin animation-delay-500">
            <Sparkles className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 w-4 h-4 text-blue-500" />
          </div>
        </div>

        {/* Dynamic message */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3 animate-fade-in">
            <IconComponent className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              {currentMessage.text}
            </h3>
          </div>
          
          <p className="text-gray-600">
            AI is crafting your perfect job post and skills test
          </p>
        </div>

        {/* Progress indicator */}
        <div className="w-full max-w-md mx-auto space-y-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${((15 - countdown) / 15) * 100}%` }}
            ></div>
          </div>
          
          <div className="text-sm text-gray-500">
            Almost done! ~{countdown} seconds remaining
          </div>
        </div>

        {/* Encouraging text */}
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-purple-100">
          <p className="text-sm text-gray-700">
            ✨ Our AI is analyzing your requirements and creating a comprehensive job posting 
            that will attract the perfect candidates for your role!
          </p>
        </div>
      </div>
    </div>
  );
};
