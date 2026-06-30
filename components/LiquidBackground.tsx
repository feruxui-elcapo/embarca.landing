import React, { useEffect, useRef } from 'react';
import { District } from '../types';
import Silk from './Silk';

interface LiquidBackgroundProps {
  district: District;
  className?: string;
  text?: string;
  align?: 'left' | 'center' | 'right';
}

const SILK_COLORS: Record<District, string> = {
  [District.NATION]: '#52D8D6',
  [District.BOOSTER]: '#FF8F22',
  [District.CONNECT]: '#C24EE4',
  [District.VC]: '#1BB45A',
  [District.COWORK]: '#1300b9',
};

const SILK_BG_COLORS: Record<District, string> = {
  [District.NATION]: '#060B8F',
  [District.BOOSTER]: '#DC234C',
  [District.CONNECT]: '#502092',
  [District.VC]: '#064919',
  [District.COWORK]: '#ffffff',
};

const PALETTES: Record<District, string[]> = {
  // Base Background, Line Color 1 (Top Gradient), Line Color 2 (Bottom Gradient), Highlight
  [District.NATION]: ['#ffffff', '#52D8D6', '#FFFFFF', '#52D8D6'],
  [District.BOOSTER]: ['#ffffff', '#FF8F22', '#FFFFFF', '#FF8F22'],
  [District.CONNECT]: ['#ffffff', '#C24EE4', '#FFFFFF', '#C24EE4'],
  [District.VC]: ['#ffffff', '#1BB45A', '#FFFFFF', '#1BB45A'],
  [District.COWORK]: ['#ffffff', '#00ccff', '#FFFFFF', '#0088ff'],
};

export const LiquidBackground: React.FC<LiquidBackgroundProps> = ({ district, className, text, align = 'center' }) => {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const lastMoveRef = useRef<number>(0);
  const activityRef = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      lastMoveRef.current = performance.now();
      if (text && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      } else {
        mouseRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      lastMoveRef.current = performance.now();
      const touch = e.touches[0];
      if (touch) {
        if (text && containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          mouseRef.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
        } else {
          mouseRef.current = { x: touch.clientX, y: touch.clientY };
        }
      }
    };

    const handleMouseLeave = () => {
      lastMoveRef.current = 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('touchend', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('touchend', handleMouseLeave);
    };
  }, [text]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Enable alpha for text mode to allow transparency
    const ctx = canvas.getContext('2d', { alpha: !!text });
    if (!ctx) return;

    let time = 0;

    const resize = () => {
      // PERFORMANCE OPTIMIZATION: Force DPR to 1.
      // High-DPI rendering is the #1 cause of lag on low-end devices with large canvases.
      const dpr = 1;

      if (text && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
      } else {
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
      }
    };

    window.addEventListener('resize', resize);
    setTimeout(resize, 0);

    const draw = () => {
      const logicalWidth = text && containerRef.current ? containerRef.current.clientWidth : window.innerWidth;
      const logicalHeight = text && containerRef.current ? containerRef.current.clientHeight : window.innerHeight;

      const palette = PALETTES[district];
      const isMobile = logicalWidth < 768;

      const now = performance.now();
      const timeSinceMove = now - lastMoveRef.current;
      const isIdle = timeSinceMove > 2000;
      const targetActivity = isIdle ? 0 : 1;

      activityRef.current += (targetActivity - activityRef.current) * 0.05;
      const activityStrength = activityRef.current;

      // 1. Clear / Background Fill
      if (!text) {
        // Optimization: Fill with solid color occasionally or simple gradient
        const bgGradient = ctx.createLinearGradient(0, 0, 0, logicalHeight);
        bgGradient.addColorStop(0, palette[0]);
        bgGradient.addColorStop(1, '#fafafa');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, logicalWidth, logicalHeight);
      } else {
        ctx.clearRect(0, 0, logicalWidth, logicalHeight);
      }

      time += 0.01;

      ctx.save();

      if (text) {
        // --- TEXT MODE ---
        const txt = text.toUpperCase();

        let fontSize = 300;
        ctx.font = `${fontSize}px "VT323", monospace`;
        const metrics = ctx.measureText(txt);
        const textWidth = metrics.width;
        const maxTextWidth = logicalWidth * 0.9;
        if (textWidth > maxTextWidth) {
          fontSize = fontSize * (maxTextWidth / textWidth);
        }
        const maxTextHeight = logicalHeight * 0.85;
        if (fontSize > maxTextHeight) {
          fontSize = maxTextHeight;
        }
        ctx.font = `${fontSize}px "VT323", monospace`;
        ctx.textBaseline = 'middle';

        const cx = align === 'left' ? fontSize * 0.1 : align === 'right' ? logicalWidth - fontSize * 0.1 : logicalWidth / 2;
        const cy = logicalHeight / 2;

        ctx.textAlign = align;



        const dx = mouseRef.current.x - cx;
        const dy = mouseRef.current.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const proximity = Math.max(0, 1 - dist / 400) * activityStrength;

        const shakeX = (Math.random() - 0.5) * 10 * proximity;
        const shakeY = (Math.random() - 0.5) * 10 * proximity;

        // Glowing colored shadow (the effect)
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.filter = 'blur(4px)';
        ctx.fillStyle = palette[1];
        ctx.fillText(txt, cx + shakeX, cy + shakeY);
        ctx.restore();

        // Extra sharp colored offset
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = palette[2] || palette[1];
        ctx.fillText(txt, cx + shakeX + 6 * proximity, cy + shakeY + 6 * proximity);
        ctx.restore();

        // Main Text (Solid White)
        ctx.fillStyle = '#ffffff';
        ctx.fillText(txt, cx + shakeX, cy + shakeY);

        // RGB Split - Only when moving
        if (proximity > 0.2) {
          ctx.save();
          // Use screen for light splitting on dark background
          ctx.globalCompositeOperation = 'screen';
          ctx.globalAlpha = 0.3 * proximity;
          ctx.fillStyle = palette[1];
          ctx.fillText(txt, cx + shakeX - (4 * proximity), cy + shakeY);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(txt, cx + shakeX + (4 * proximity), cy + shakeY);
          ctx.restore();
        }

        // Reduced Glitch Frequency
        if (Math.random() < (0.01 + proximity * 0.05)) {
          const slices = 1 + Math.floor(proximity * 3);
          for (let i = 0; i < slices; i++) {
            const sliceHeight = fontSize * (0.1 + Math.random() * 0.1);
            const sliceY = (cy - fontSize / 2) + Math.random() * fontSize;
            const shift = (Math.random() - 0.5) * 20;

            ctx.save();
            ctx.beginPath();
            ctx.rect(0, sliceY, logicalWidth, sliceHeight);
            ctx.clip();
            ctx.fillStyle = (i % 2 === 0) ? palette[1] : '#ffffff';
            ctx.fillText(txt, cx + shakeX + shift, cy + shakeY);
            ctx.restore();
          }
        }

        // Simplified Scanlines (Less frequent draw) - Removidas a pedido del usuario

      } else {
        // --- BACKGROUND MODE ---
        // Optimization: Reduced translation complexity
        ctx.translate(logicalWidth / 2, logicalHeight / 2);
        ctx.rotate(-Math.PI / 6);

        const diagonal = Math.sqrt(logicalWidth * logicalWidth + logicalHeight * logicalHeight);
        const drawSize = diagonal * 2;
        ctx.translate(-drawSize / 2, -drawSize / 2);

        // PERFORMANCE: Reduce line count significantly
        const lines = isMobile ? 15 : 25;
        // Use multiply for liquid lines on light background
        ctx.globalCompositeOperation = 'multiply';

        // PERFORMANCE: Increase step size to reduce path segments
        const step = isMobile ? 60 : 40;

        for (let i = 0; i < lines; i++) {
          ctx.beginPath();
          const iNorm = i / lines;

          let strokeColor = palette[1];
          if (i % 2 === 0) strokeColor = palette[2];
          if (i % 5 === 0 && palette[3]) strokeColor = palette[3];

          ctx.strokeStyle = strokeColor;
          ctx.globalAlpha = 0.15;
          ctx.lineWidth = 2;

          const yBase = i * (drawSize / lines);

          for (let x = 0; x <= drawSize; x += step) {
            const xNorm = x / drawSize;
            const largeSwell = Math.sin(xNorm * 3 + time * 0.3 + iNorm * 2) * 150;
            // Removed extra complexity layers for speed
            const ripples = Math.cos(xNorm * 8 - time * 0.5) * 30;
            const y = yBase + largeSwell + ripples;

            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }

      ctx.restore();
      animationRef.current = requestAnimationFrame(draw);
    };

    if (text) {
      document.fonts.ready.then(() => {
        resize();
        draw();
      });
    } else {
      draw();
    }

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [district, text]);

  if (text) {
    return (
      <div ref={containerRef} className={`w-full flex items-center justify-center ${className}`}>
        {/* Explicitly set transparent background to prevent any black box issues */}
        <canvas ref={canvasRef} style={{ background: 'transparent' }} />
      </div>
    );
  }


  return (
    <div className={`fixed top-0 left-0 w-full h-full pointer-events-none z-0 ${className || ''}`}>
      <Silk
        key={district}
        speed={5}
        scale={0.7}
        color={SILK_COLORS[district] || '#7B7481'}
        bgColor={SILK_BG_COLORS[district] || '#ffffff'}
        noiseIntensity={0}
        rotation={0}
      />
    </div>
  );
};