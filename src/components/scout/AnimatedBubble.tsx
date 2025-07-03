
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
    }, 150);
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base'
  };

  return (
    <div
      className="animate-fade-in opacity-0"
      style={{ 
        animationDelay: `${delay * 0.1}s`,
        animationFillMode: 'forwards'
      }}
    >
      <Button
        variant="outline"
        className={`
          ${sizeClasses[size]}
          transition-all duration-200
          hover:scale-105 hover:shadow-md
          ${isClicked ? 'scale-95' : ''}
          bg-white/80 backdrop-blur-sm
          border-gray-200 hover:border-blue-300
          text-gray-700 hover:text-blue-700
          shadow-sm hover:shadow-lg
          font-medium
        `}
        onClick={handleClick}
      >
        {icon && (
          <span className="mr-2 text-blue-600">
            {icon}
          </span>
        )}
        {text}
      </Button>
    </div>
  );
};
