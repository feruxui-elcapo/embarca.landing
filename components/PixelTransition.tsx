import React, { useRef, useImperativeHandle, forwardRef, useState, useEffect } from 'react';

export interface PixelTransitionRef {
  play: (color: string, onMidpoint: () => void) => void;
}

export const PixelTransition = forwardRef<PixelTransitionRef, {}>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const frameRef = useRef<number>(0);
  const paramsRef = useRef<{ color: string; onMidpoint: () => void } | null>(null);

  useImperativeHandle(ref, () => ({
    play: (color: string, onMidpoint: () => void) => {
      paramsRef.current = { color, onMidpoint };
      setIsActive(true);
    }
  }));

  useEffect(() => {
    if (isActive && canvasRef.current && paramsRef.current) {
      const { color, onMidpoint } = paramsRef.current;
      startAnimation(color, onMidpoint);
    }
  }, [isActive]);

  const startAnimation = (color: string, onMidpoint: () => void) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuration
    const pixelSize = 50; // Chunky pixels
    const width = window.innerWidth;
    const height = window.innerHeight;
    const cols = Math.ceil(width / pixelSize);
    const rows = Math.ceil(height / pixelSize);
    
    canvas.width = width;
    canvas.height = height;
    
    // Disable smoothing for crisp pixel edges
    ctx.imageSmoothingEnabled = false;

    // Create grid with random delays for the "blast" feel
    // We shuffle the grid to avoid linear scanning patterns
    const grid: {x: number, y: number, delay: number}[] = [];
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        grid.push({
          x: i * pixelSize,
          y: j * pixelSize,
          // Random delay for organic "noise" feel
          delay: Math.random() * 400 
        });
      }
    }

    const startTime = performance.now();
    const enterDuration = 800; // Time to cover screen
    const stayDuration = 50;   // Brief hold
    const exitDuration = 600;  // Time to reveal screen
    
    let midpointTriggered = false;

    const draw = (now: number) => {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, width, height);
      
      // Phase 1: Enter (Scaling UP)
      if (elapsed < enterDuration) {
        grid.forEach(cell => {
           const cellTime = elapsed - cell.delay;
           if (cellTime > 0) {
             const progress = Math.min(1, cellTime / 300); // Individual block anim time
             // Ease out quart for snappy expansion
             const ease = 1 - Math.pow(1 - progress, 4);
             
             const size = pixelSize * ease;
             const offset = (pixelSize - size) / 2;
             
             ctx.fillStyle = color;
             // +1 to size avoids subpixel gaps
             ctx.fillRect(Math.floor(cell.x + offset), Math.floor(cell.y + offset), Math.ceil(size + 1), Math.ceil(size + 1));
           }
        });
        frameRef.current = requestAnimationFrame(draw);
      } 
      // Phase 2: Midpoint (Full Cover)
      else if (elapsed < enterDuration + stayDuration) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
        
        if (!midpointTriggered) {
          onMidpoint();
          midpointTriggered = true;
        }
        frameRef.current = requestAnimationFrame(draw);
      }
      // Phase 3: Exit (Scaling DOWN)
      else if (elapsed < enterDuration + stayDuration + exitDuration) {
         if (!midpointTriggered) {
            onMidpoint(); // Backup trigger
            midpointTriggered = true;
         }
         
         const exitElapsed = elapsed - (enterDuration + stayDuration);
         
         grid.forEach(cell => {
           // We can use the same delay for a "first-in-first-out" feel, or reverse it.
           // Let's reuse delay for consistent noise pattern.
           const cellTime = exitElapsed - cell.delay; 
           
           if (cellTime > 0) {
              const progress = Math.min(1, cellTime / 300);
              // Ease in quad for smooth disappearance
              const ease = Math.pow(progress, 2);
              
              // Size goes from pixelSize -> 0
              const size = pixelSize * (1 - ease);
              const offset = (pixelSize - size) / 2;
              
              if (size > 0.5) {
                ctx.fillStyle = color;
                ctx.fillRect(Math.floor(cell.x + offset), Math.floor(cell.y + offset), Math.ceil(size + 1), Math.ceil(size + 1));
              }
           } else {
             // Not yet started shrinking, keep full
             ctx.fillStyle = color;
             ctx.fillRect(cell.x, cell.y, pixelSize + 1, pixelSize + 1);
           }
         });
         
         frameRef.current = requestAnimationFrame(draw);
      } else {
        // Animation Complete
        setIsActive(false);
        paramsRef.current = null;
      }
    };

    frameRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  if (!isActive) return null;

  return (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 z-[9999] pointer-events-auto cursor-wait"
      style={{ touchAction: 'none' }}
    />
  );
});

PixelTransition.displayName = 'PixelTransition';