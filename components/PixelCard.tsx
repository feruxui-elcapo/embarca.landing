import React, { useRef, useState, useEffect, useCallback } from 'react';

interface PixelCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: 'default' | 'highlight';
  className?: string;
  actionLabel?: string;
}

export const PixelCard: React.FC<PixelCardProps> = ({
  title,
  subtitle,
  children,
  variant = 'default',
  className = '',
  actionLabel
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);

  // Refs for animation state to avoid re-renders
  const rotationRef = useRef({ x: 0, y: 0 });
  const isHoveredRef = useRef(false);
  const rafRef = useRef<number>(0);

  // State only for layout changes that require re-render (like conditional border)
  const [isHoveredState, setIsHoveredState] = useState(false);

  const updateStyles = useCallback(() => {
    if (!cardRef.current) return;

    const { x, y } = rotationRef.current;
    const isHovered = isHoveredRef.current;
    const scale = isHovered ? 1.02 : 1;

    // Apply 3D transform directly
    cardRef.current.style.transform = `rotateX(${x}deg) rotateY(${y}deg) scale3d(${scale}, ${scale}, ${scale})`;
    cardRef.current.style.boxShadow = isHovered
      ? '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
      : '0 10px 30px -10px rgba(0, 0, 0, 0.05)';
  }, []);

  // Loop for smooth animation
  useEffect(() => {
    const loop = () => {
      updateStyles();
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(rafRef.current);
  }, [updateStyles]);

  // Mobile Scroll Tilt Effect
  useEffect(() => {
    const handleScroll = () => {
      // If hovered (desktop) or card not ready, skip scroll logic
      if (!cardRef.current || isHoveredRef.current) return;

      // Mobile check: Only apply scroll tilt on screens < 768px
      if (window.matchMedia('(min-width: 768px)').matches) {
        if (rotationRef.current.x !== 0) rotationRef.current = { x: 0, y: 0 };
        return;
      }

      const rect = cardRef.current.getBoundingClientRect();
      const viewHeight = window.innerHeight;
      const cardCenterY = rect.top + rect.height / 2;
      const screenCenterY = viewHeight / 2;

      const dist = (cardCenterY - screenCenterY) / (viewHeight * 0.5);

      if (Math.abs(dist) < 1.5) {
        const tiltX = Math.max(-10, Math.min(10, dist * 10));
        rotationRef.current = { x: -tiltX, y: 0 };
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Direct update spotlight
    if (shineRef.current) {
      shineRef.current.style.opacity = '1';
      shineRef.current.style.background = `radial-gradient(400px circle at ${x}px ${y}px, rgba(255,255,255,0.08), transparent 100%)`;
    }

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const maxTilt = 8;

    rotationRef.current = {
      x: ((centerY - y) / centerY) * maxTilt,
      y: ((x - centerX) / centerX) * maxTilt
    };
  };

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    setIsHoveredState(true);
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    setIsHoveredState(false);

    // Reset rotation on desktop, let scroll handle on mobile
    if (window.matchMedia('(min-width: 768px)').matches) {
      rotationRef.current = { x: 0, y: 0 };
    }

    if (shineRef.current) {
      shineRef.current.style.opacity = '0';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`perspective-1000 ${className}`}
      style={{ perspective: '1000px' }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          relative w-full h-auto
          bg-white/60 backdrop-blur-md border 
          ${variant === 'highlight' ? 'border-black/30' : 'border-black/10'}
          rounded-2xl overflow-hidden
          group
        `}
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s linear', // faster response for JS animation
          willChange: 'transform'
        }}
      >
        {/* Spotlight Effect - Managed via Ref */}
        <div
          ref={shineRef}
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-30 opacity-0"
          style={{ transform: 'translateZ(0px)' }}
        />

        {/* Card Header */}
        {(title || subtitle) && (
          <div className="p-6 md:p-8 border-b border-black/5 relative z-20" style={{ transform: 'translateZ(20px)' }}>
            {subtitle && (
              <div className="font-mono text-xs text-zinc-500 mb-2 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse"></span>
                {subtitle}
              </div>
            )}
            {title && (
              <h3 className="font-pixel text-2xl md:text-3xl uppercase tracking-wider text-zinc-800">
                {title}
              </h3>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 md:p-8 relative z-10" style={{ transform: 'translateZ(10px)' }}>
          {children}
        </div>

        {/* Action Footer */}
        {actionLabel && (
          <div className="p-4 bg-black/5 border-t border-black/10 flex justify-between items-center group-hover:bg-black/10 transition-colors">
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-600">{actionLabel}</span>
            <div className="w-2 h-2 bg-black rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};