import React, { useEffect, useRef } from 'react';

interface SpotlightProps {
  color: string;
}

export const Spotlight: React.FC<SpotlightProps> = ({ color }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const requestRef = useRef<number>(0);

  useEffect(() => {
    // Initial center position
    targetRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    posRef.current = { ...targetRef.current };

    // El loop solo corre mientras el halo se está acercando al cursor; quieto no consume nada
    let running = false;
    const wake = () => {
      if (running) return;
      running = true;
      requestRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      wake();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        targetRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        wake();
      }
    };

    const animate = () => {
      if (divRef.current) {
        // Smooth interpolation
        const ease = 0.15;
        posRef.current.x += (targetRef.current.x - posRef.current.x) * ease;
        posRef.current.y += (targetRef.current.y - posRef.current.y) * ease;
        
        // Performance: Use translate3d to offload to GPU compositing
        // The div is fixed at 0,0, so we just translate it.
        // We subtract half the size (600px) to center it on cursor.
        const x = posRef.current.x;
        const y = posRef.current.y;
        
        divRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      }
      const settled =
        Math.abs(targetRef.current.x - posRef.current.x) < 0.05 &&
        Math.abs(targetRef.current.y - posRef.current.y) < 0.05;
      if (settled) {
        running = false;
        return;
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    wake();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
        <div 
          ref={divRef}
          className="absolute w-[1200px] h-[1200px] rounded-full mix-blend-screen transition-colors duration-1000 opacity-60"
          style={{
            background: `radial-gradient(closest-side, ${color}22, transparent)`,
            left: 0,
            top: 0,
            willChange: 'transform' // Hints browser to promote to layer
          }}
        />
    </div>
  );
};