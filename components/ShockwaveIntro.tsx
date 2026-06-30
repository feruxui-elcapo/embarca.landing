import React, { useRef, useImperativeHandle, forwardRef, useState, useEffect } from 'react';

export interface ShockwaveIntroRef {
  play: (color: string, onMidpoint: () => void, origin?: { x: number, y: number }) => void;
}

export const ShockwaveIntro = forwardRef<ShockwaveIntroRef, {}>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const frameRef = useRef<number>(0);
  const paramsRef = useRef<{ color: string; onMidpoint: () => void; origin: {x: number, y: number} } | null>(null);

  useImperativeHandle(ref, () => ({
    play: (color: string, onMidpoint: () => void, origin?: { x: number, y: number }) => {
      // Default to top-left (0,0) if no origin specified (initial load)
      const startOrigin = origin || { x: 0, y: 0 };
      paramsRef.current = { color, onMidpoint, origin: startOrigin };
      setIsActive(true);
      if (canvasRef.current) {
         // Performance: Fixed 1:1 pixel mapping, ignores DPI for speed
         canvasRef.current.width = window.innerWidth;
         canvasRef.current.height = window.innerHeight;
         canvasRef.current.style.width = '100vw';
         canvasRef.current.style.height = '100vh';
      }
    }
  }));

  useEffect(() => {
    if (isActive && canvasRef.current && paramsRef.current) {
      const { color, onMidpoint, origin } = paramsRef.current;
      startAnimation(color, onMidpoint, origin);
    }
    return () => {
       if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isActive]);

  const startAnimation = (accentColor: string, onMidpoint: () => void, origin: { x: number, y: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true }); 
    if (!ctx) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Explicitly set 1:1 match for pixel look
    canvas.width = width;
    canvas.height = height;
    
    ctx.imageSmoothingEnabled = false;

    // Config: Larger voxels = Less draw calls = Higher Performance
    const voxelSize = 24; // Increased from 14
    const cols = Math.ceil(width / voxelSize) + 5; 
    const rows = Math.ceil(height / voxelSize) + 15;
    
    const corners = [
        {x: 0, y: 0},
        {x: width, y: 0},
        {x: 0, y: height},
        {x: width, y: height}
    ];
    let maxDist = 0;
    
    for(let i=0; i<corners.length; i++) {
        const dx = corners[i].x - origin.x;
        const dy = corners[i].y - origin.y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d > maxDist) maxDist = d;
    }
    
    const MAX_Z = voxelSize * 6; 

    // Pre-generate grid colors
    const totalVoxels = cols * rows;
    const gridColors: string[] = new Array(totalVoxels);
    const gridShadows: string[] = new Array(totalVoxels);

    const darken = (hex: string, percent: number) => {
        const cleanHex = hex.replace('#', '');
        const num = parseInt(cleanHex, 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return '#' + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
    };

    const palette = [
        accentColor,                        
        darken(accentColor, 5),             
        darken(accentColor, 10),            
        darken(accentColor, 15),            
    ];

    for(let i=0; i<totalVoxels; i++) {
        const c = palette[Math.floor(Math.random() * palette.length)];
        gridColors[i] = c;
        gridShadows[i] = darken(c, 25);
    }

    const startTime = performance.now();
    
    const rampWidth = 300; 
    const tailWidth = 300;
    const plateauWidth = maxDist * 0.45; 
    const totalDist = maxDist + rampWidth + plateauWidth + tailWidth;
    const duration = 1400; 
    
    let midpointTriggered = false;

    const draw = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      
      ctx.clearRect(0, 0, width, height);

      if (progress > 0.45 && !midpointTriggered) {
          try { onMidpoint(); } catch(e) {}
          midpointTriggered = true;
      }

      const wavePos = progress * totalDist;
      
      for (let j = 0; j < rows; j++) {
        const y = j * voxelSize;
        const dy = y - origin.y;

        for (let i = 0; i < cols; i++) {
            const x = i * voxelSize;
            const dx = x - origin.x;
            
            // Optimization: Cheaper noise calculation
            const noise = ((i * 3 + j * 7) & 15) * 3; 
            
            // Still using sqrt as it's necessary for circular waves, but reduced iteration count helps
            const dist = Math.sqrt(dx*dx + dy*dy) + noise;
            
            const distFromWave = wavePos - dist;
            
            if (distFromWave <= 0 || distFromWave > (rampWidth + plateauWidth + tailWidth + 50)) {
                continue;
            }

            let z = 0;
            let alpha = 0;

            if (distFromWave < rampWidth) {
                const p = distFromWave / rampWidth;
                const smooth = p * p * (3 - 2 * p);
                z = MAX_Z * smooth;
                alpha = smooth; 
            } else if (distFromWave < rampWidth + plateauWidth) {
                z = MAX_Z;
                alpha = 1;
            } else if (distFromWave < rampWidth + plateauWidth + tailWidth) {
                const relativePos = distFromWave - (rampWidth + plateauWidth);
                const p = 1 - (relativePos / tailWidth);
                const smooth = p * p * (3 - 2 * p);
                z = MAX_Z * smooth;
                alpha = smooth; 
            }
            
            if (alpha > 0.1) {
                const idx = i + j * cols;
                ctx.globalAlpha = alpha;
                const topY = y - z;
                
                // Draw Shadow
                ctx.fillStyle = gridShadows[idx];
                ctx.fillRect(x, topY + voxelSize, voxelSize + 0.5, z + 1.0);
                
                // Draw Face
                ctx.fillStyle = gridColors[idx];
                ctx.fillRect(x, topY, voxelSize + 0.5, voxelSize + 0.5);
            }
        }
      }

      ctx.globalAlpha = 1;

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(draw);
      } else {
        setIsActive(false);
        if (!midpointTriggered) { try { onMidpoint(); } catch(e) {} }
      }
    };

    frameRef.current = requestAnimationFrame(draw);
  };

  return (
    <canvas 
      ref={canvasRef}
      className={`fixed inset-0 z-[9999] pointer-events-auto cursor-wait ${isActive ? 'block' : 'hidden'}`}
      style={{ touchAction: 'none' }}
    />
  );
});

ShockwaveIntro.displayName = 'ShockwaveIntro';