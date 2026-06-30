import React, { useRef, useState, useCallback } from 'react';

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'glass' | 'nav' | 'nav-active' | 'gradient-outline';
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export const PixelButton: React.FC<PixelButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  color,
  ...props
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const [isHoveredState, setIsHoveredState] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const maxTilt = 15;

    const rotateY = ((x - centerX) / centerX) * maxTilt;
    const rotateX = ((centerY - y) / centerY) * maxTilt;

    // Apply transform directly
    btnRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;

    // Apply spotlight directly
    if (shineRef.current) {
      shineRef.current.style.background = `radial-gradient(150px circle at ${x}px ${y}px, rgba(0,0,0,0.05), transparent 100%)`;
      shineRef.current.style.opacity = '1';
    }
  }, []);

  const handleMouseEnter = () => {
    setIsHoveredState(true);
  };

  const handleMouseLeave = () => {
    setIsHoveredState(false);
    if (btnRef.current) {
      btnRef.current.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
    if (shineRef.current) {
      shineRef.current.style.opacity = '0';
    }
  };

  const roundedClass = variant === 'nav' || variant === 'nav-active' ? 'rounded-full' : 'rounded-lg';
  const baseClasses = `relative font-pixel uppercase tracking-wider transition-all duration-200 ease-out outline-none overflow-hidden group ${roundedClass}`;

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return "bg-black text-white border border-black/50 px-6 py-4 text-xl w-full shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.2)] hover:border-black";
      case 'gradient-outline':
        return "bg-white border-2 px-8 py-4 text-xl w-full shadow-lg hover:shadow-2xl transition-all duration-300 shadow-${color}/30";
      case 'glass':
        return "bg-white/60 backdrop-blur-md text-zinc-900 border border-black/10 px-6 py-4 text-xl w-full hover:bg-black/5 hover:border-black/30 shadow-lg";
      case 'nav':
        return "bg-transparent text-white/90 font-medium tracking-wide border border-transparent hover:bg-white/10 hover:border-white/20 px-2.5 py-2.5 md:px-4 md:py-2 text-[15px] md:text-base w-full flex justify-center items-center drop-shadow-sm";
      case 'nav-active':
        return "bg-white text-zinc-900 border border-transparent px-2.5 py-2.5 md:px-4 md:py-2 text-[15px] md:text-base shadow-lg w-full flex justify-center items-center font-bold";
      default:
        return "";
    }
  };

  return (
    <div
      className={`perspective-1000 block w-full ${className}`}
      style={{ perspective: '800px' }}
    >
      <button
        ref={btnRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          ${baseClasses}
          ${getVariantClasses()}
        `}
        style={{
          transformStyle: 'preserve-3d',
          willChange: 'transform',
          // Dynamic shadow (using state for simple toggle is fine here, mousemove handles the heavy lifting)
          boxShadow: isHoveredState
            ? '0 20px 40px -5px rgba(0,0,0,0.4)'
            : variant === 'gradient-outline' ? `0 0 15px ${color}30` : variant === 'nav-active' ? '0 4px 10px rgba(0,0,0,0.2)' : '0 5px 15px -5px rgba(0,0,0,0.1)',
          ...(color && variant === 'nav-active' ? { borderColor: color, boxShadow: `0 4px 20px ${color}30` } : {}),
          ...(variant === 'gradient-outline' && color ? {
            borderColor: color,
            color: color,
            textShadow: `0 0 1px ${color}30`
          } : {})
        }}
        {...props}
      >
        {/* Spotlight Effect */}
        <div
          ref={shineRef}
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0"
          style={{ transform: 'translateZ(0px)' }}
        />

        {/* 3D Depth Layer */}
        {isHoveredState && (
          <div className={`absolute inset-0 border border-black/10 translate-z-[-5px] ${roundedClass}`} />
        )}

        {/* Texture Overlay */}
        <div className={`absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-overlay ${roundedClass}`}></div>

        {/* Content Layer */}
        <div
          className="relative z-10 flex items-center justify-center gap-1 md:gap-3 w-full"
          style={{ transform: 'translateZ(15px)' }}
        >
          {children}
        </div>
      </button>
    </div>
  );
};