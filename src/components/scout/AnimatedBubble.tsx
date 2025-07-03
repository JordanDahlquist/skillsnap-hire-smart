
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
    sm: 'h-auto min-h-[2.5rem] px-4 py-3 text-sm',
    md: 'h-auto min-h-[3rem] px-5 py-4 text-sm',
    lg: 'h-auto min-h-[3.5rem] px-6 py-5 text-base'
  };

  return (
    <div
      className="animate-fade-in opacity-0 w-full"
      style={{ 
        animationDelay: `${delay * 0.1}s`,
        animationFillMode: 'forwards'
      }}
    >
      <Button
        variant="outline"
        className={`
          ${sizeClasses[size]}
          w-full
          transition-all duration-200
          hover:scale-[1.02] hover:shadow-md
          ${isClicked ? 'scale-[0.98]' : ''}
          bg-white/80 backdrop-blur-sm
          border-gray-200 hover:border-blue-300
          text-gray-700 hover:text-blue-700
          shadow-sm hover:shadow-lg
          font-medium
          text-left
          justify-start
          whitespace-normal
          leading-relaxed
        `}
        onClick={handleClick}
      >
        {icon && (
          <span className="mr-3 text-blue-600 flex-shrink-0">
            {icon}
          </span>
        )}
        <span className="flex-1">
          {text}
        </span>
      </Button>
    </div>
  );
};
