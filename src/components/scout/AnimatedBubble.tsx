
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface AnimatedBubbleProps {
  text: string;
  delay: number;
  onClick: () => void;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const AnimatedBubble = ({ 
  text, 
  delay, 
  onClick, 
  icon,
  size = 'md' 
}: AnimatedBubbleProps) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => {
      onClick();
    }, 200);
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const floatDelays = [
    '',
    'style={{ animationDelay: "1s" }}',
    'style={{ animationDelay: "2s" }}',
    'style={{ animationDelay: "3s" }}',
    'style={{ animationDelay: "4s" }}'
  ];

  return (
    <div
      className={`
        bubble-entrance bubble-delay-${Math.min(delay, 5)}
        opacity-0
      `}
      style={{ animationFillMode: 'forwards' }}
    >
      <Button
        variant="outline"
        className={`
          ${sizeClasses[size]}
          bubble-float bubble-pulse
          bg-white/90 backdrop-blur-sm
          border-blue-200 hover:border-blue-400
          text-gray-700 hover:text-blue-700
          shadow-lg hover:shadow-xl
          transition-all duration-300
          hover:scale-105 hover:bg-blue-50/90
          cursor-pointer relative overflow-hidden
          ${isClicked ? 'bubble-click' : ''}
        `}
        onClick={handleClick}
        style={{ 
          animationDelay: `${delay * 1.5}s`
        }}
      >
        {icon && (
          <span className="mr-2 text-blue-600">
            {icon}
          </span>
        )}
        <span className="font-medium">{text}</span>
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 to-purple-50/20 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300" />
      </Button>
    </div>
  );
};
