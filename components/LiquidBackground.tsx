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

// Margen de los buffers offscreen para que el blur y el temblor nunca se recorten distinto
const GLOW_PAD = 32;
// Por debajo de este valor el temblor es sub-pixel: se dibuja el cuadro estático cacheado
const STATIC_PROXIMITY = 0.001;

export const LiquidBackground: React.FC<LiquidBackgroundProps> = ({ district, className, text, align = 'center' }) => {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const lastMoveRef = useRef<number>(0);
  const activityRef = useRef<number>(0);

  useEffect(() => {
    if (!text) return;

    // Guardamos la posición cruda; se convierte a coordenadas del canvas una vez por cuadro
    const handleMouseMove = (e: MouseEvent) => {
      lastMoveRef.current = performance.now();
      pointerRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      lastMoveRef.current = performance.now();
      const touch = e.touches[0];
      if (touch) pointerRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleMouseLeave = () => {
      lastMoveRef.current = 0;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
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
    const container = containerRef.current;
    if (!text || !canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const palette = PALETTES[district];
    const txt = text.toUpperCase();

    // Layout y buffers cacheados: se recalculan solo cuando cambia el tamaño del canvas
    let layout: { w: number; h: number; fontSize: number; cx: number; cy: number } | null = null;
    const glowCanvas = document.createElement('canvas');
    const staticCanvas = document.createElement('canvas');

    const setTextStyle = (c: CanvasRenderingContext2D, fontSize: number) => {
      c.font = `${fontSize}px "VT323", monospace`;
      c.textBaseline = 'middle';
      c.textAlign = align;
    };

    const buildLayout = (w: number, h: number) => {
      let fontSize = 300;
      ctx.font = `${fontSize}px "VT323", monospace`;
      const textWidth = ctx.measureText(txt).width;
      const maxTextWidth = w * 0.9;
      if (textWidth > maxTextWidth) {
        fontSize = fontSize * (maxTextWidth / textWidth);
      }
      const maxTextHeight = h * 0.85;
      if (fontSize > maxTextHeight) {
        fontSize = maxTextHeight;
      }
      const cx = align === 'left' ? fontSize * 0.1 : align === 'right' ? w - fontSize * 0.1 : w / 2;
      const cy = h / 2;

      // Resplandor de color desenfocado (antes se calculaba con ctx.filter en cada cuadro)
      glowCanvas.width = w + GLOW_PAD * 2;
      glowCanvas.height = h + GLOW_PAD * 2;
      const g = glowCanvas.getContext('2d');
      if (g) {
        setTextStyle(g, fontSize);
        g.filter = 'blur(4px)';
        g.fillStyle = palette[1];
        g.fillText(txt, cx + GLOW_PAD, cy + GLOW_PAD);
      }

      // Cuadro completo sin temblor (glow + offset + texto principal), igual al dibujo en reposo
      staticCanvas.width = w + GLOW_PAD * 2;
      staticCanvas.height = h + GLOW_PAD * 2;
      const s = staticCanvas.getContext('2d');
      if (s) {
        s.globalAlpha = 0.5;
        s.drawImage(glowCanvas, 0, 0);
        setTextStyle(s, fontSize);
        s.globalAlpha = 0.4;
        s.fillStyle = palette[2] || palette[1];
        s.fillText(txt, cx + GLOW_PAD, cy + GLOW_PAD);
        s.globalAlpha = 1;
        s.fillStyle = '#ffffff';
        s.fillText(txt, cx + GLOW_PAD, cy + GLOW_PAD);
      }

      layout = { w, h, fontSize, cx, cy };
    };

    // Tamaño cacheado (ResizeObserver): leer clientWidth en cada cuadro forzaba recálculo de layout
    let logicalWidth = 0;
    let logicalHeight = 0;
    // En reposo el cuadro estático no cambia: solo se repinta si hubo temblor o glitch antes
    let staticOnCanvas = false;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      logicalWidth = container.clientWidth;
      logicalHeight = container.clientHeight;
      layout = null;
      staticOnCanvas = false;
    };

    const draw = () => {
      if (!layout || layout.w !== logicalWidth || layout.h !== logicalHeight) {
        buildLayout(logicalWidth, logicalHeight);
      }
      const { fontSize, cx, cy } = layout!;

      const now = performance.now();
      const timeSinceMove = now - lastMoveRef.current;
      const isIdle = timeSinceMove > 2000;
      const targetActivity = isIdle ? 0 : 1;

      activityRef.current += (targetActivity - activityRef.current) * 0.05;
      const activityStrength = activityRef.current;

      let proximity = 0;
      if (activityStrength > 1e-4) {
        const rect = container.getBoundingClientRect();
        const dx = pointerRef.current.x - rect.left - cx;
        const dy = pointerRef.current.y - rect.top - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        proximity = Math.max(0, 1 - dist / 400) * activityStrength;
      }

      // Reduced Glitch Frequency
      const glitch = Math.random() < (0.01 + proximity * 0.05);
      const isStatic = proximity < STATIC_PROXIMITY;

      if (isStatic && !glitch && staticOnCanvas) {
        // El canvas ya muestra exactamente este cuadro
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, logicalWidth, logicalHeight);

      let shakeX = 0;
      let shakeY = 0;

      if (isStatic) {
        ctx.drawImage(staticCanvas, -GLOW_PAD, -GLOW_PAD);
      } else {
        shakeX = (Math.random() - 0.5) * 10 * proximity;
        shakeY = (Math.random() - 0.5) * 10 * proximity;

        // Glowing colored shadow (the effect)
        ctx.globalAlpha = 0.5;
        ctx.drawImage(glowCanvas, shakeX - GLOW_PAD, shakeY - GLOW_PAD);

        setTextStyle(ctx, fontSize);

        // Extra sharp colored offset
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = palette[2] || palette[1];
        ctx.fillText(txt, cx + shakeX + 6 * proximity, cy + shakeY + 6 * proximity);

        // Main Text (Solid White)
        ctx.globalAlpha = 1;
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
      }

      staticOnCanvas = isStatic && !glitch;

      if (glitch) {
        setTextStyle(ctx, fontSize);
        ctx.globalAlpha = 1;
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

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(draw);
    };

    // Solo anima mientras el título está en pantalla (header oculto o hero scrolleado = pausa)
    let fontsReady = false;
    let isVisible = false;
    let running = false;
    const start = () => {
      if (running || !fontsReady || !isVisible) return;
      running = true;
      animationRef.current = requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(animationRef.current);
    };

    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[entries.length - 1].isIntersecting;
      if (isVisible) start(); else stop();
    });
    observer.observe(container);

    const resizeObserver = new ResizeObserver(() => {
      if (fontsReady) resize();
    });
    resizeObserver.observe(container);

    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      fontsReady = true;
      resize();
      start();
    });

    return () => {
      cancelled = true;
      observer.disconnect();
      resizeObserver.disconnect();
      stop();
    };
  }, [district, text, align]);

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
