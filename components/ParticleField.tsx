import React, { useEffect, useRef } from 'react';

interface ParticleFieldProps {
  color: string;
  className?: string;
}

interface Particle {
  originX: number;
  originY: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  vx: number;
  vy: number;
}

export const ParticleField: React.FC<ParticleFieldProps> = ({ color, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<Particle[]>([]);
  const scrollRef = useRef(0);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    scrollRef.current = window.scrollY;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    const initParticles = () => {
      particlesRef.current = [];
      // Performance: Much lower density (higher divisor)
      const isMobile = width < 768;
      const density = isMobile ? 40000 : 30000;
      const particleCount = Math.floor((width * height) / density);

      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        particlesRef.current.push({
          originX: x,
          originY: y,
          x: x,
          y: y,
          size: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5 - 0.2,
          vx: 0,
          vy: 0
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        mouseRef.current = { x: touch.clientX, y: touch.clientY };
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', resize);

    resize();

    const animate = () => {
      if (!ctx || !canvas) return;

      const currentScroll = window.scrollY;
      const scrollDelta = currentScroll - scrollRef.current;
      scrollRef.current = currentScroll;

      ctx.clearRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = color;

      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;

      const radius = 100;
      const forceMultiplier = 0.5;
      const returnStrength = 0.05;
      const friction = 0.90;

      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];

        p.originX += p.speedX;
        p.originY += p.speedY;

        p.originY -= scrollDelta * 0.2;

        let justWrapped = false;
        if (p.originX < 0) { p.originX = width; justWrapped = true; }
        if (p.originX > width) { p.originX = 0; justWrapped = true; }
        if (p.originY < 0) { p.originY = height; justWrapped = true; }
        if (p.originY > height) { p.originY = 0; justWrapped = true; }

        if (justWrapped) {
          p.x = p.originX;
          p.y = p.originY;
          p.vx = 0;
          p.vy = 0;
        }

        const dx = mouseX - p.x;
        const dy = mouseY - p.y;

        if (Math.abs(dx) < radius && Math.abs(dy) < radius) {
          const distSq = dx * dx + dy * dy;
          if (distSq < radius * radius) {
            const distance = Math.sqrt(distSq);
            const angle = Math.atan2(dy, dx);
            const force = (radius - distance) / radius;
            const push = force * forceMultiplier;

            p.vx -= Math.cos(angle) * push;
            p.vy -= Math.sin(angle) * push;
          }
        }

        const ox = p.originX - p.x;
        const oy = p.originY - p.y;

        p.vx += ox * returnStrength;
        p.vy += oy * returnStrength;

        p.vx *= friction;
        p.vy *= friction;

        p.x += p.vx;
        p.y += p.vy;

        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [color]);

  return <canvas ref={canvasRef} className={`fixed inset-0 pointer-events-none z-10 ${className}`} />;
};