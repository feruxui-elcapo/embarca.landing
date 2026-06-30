import React from 'react';

interface MarqueeProps {
  text: string;
  direction?: 'left' | 'right';
  className?: string;
  speed?: 'slow' | 'fast';
  style?: React.CSSProperties;
}

export const Marquee: React.FC<MarqueeProps> = ({ 
  text, 
  direction = 'left', 
  className = '',
  speed = 'slow',
  style
}) => {
  return (
    <div className={`overflow-hidden whitespace-nowrap flex w-full select-none ${className}`} style={style}>
      <div 
        className={`flex animate-scroll ${direction === 'right' ? 'flex-row-reverse' : ''}`}
        style={{ animationDuration: speed === 'fast' ? '40s' : '80s', animationDirection: direction === 'right' ? 'reverse' : 'normal' }}
      >
        {[...Array(10)].map((_, i) => (
          <span key={i} className="mx-4 flex items-center">
            {text}
            <span className="mx-4 w-4 h-4 bg-current inline-block"></span>
          </span>
        ))}
      </div>
    </div>
  );
};