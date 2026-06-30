import React, { useEffect, useRef } from 'react';
import { District } from '../types';

interface DistrictModelProps {
  district: District;
  color: string;
  className?: string;
  containerRef?: React.RefObject<HTMLDivElement>; // Source position for the animation
  targetRef?: React.RefObject<HTMLDivElement>; // Target position in header
}



interface Voxel {
  x: number;
  y: number;
  z: number;
  vx: number; // Velocity vector for explosion (3D transition)
  vy: number;
  vz: number;
}

// Physics state for 2D screen-space interaction
interface PhysicsState {
  dx: number;
  dy: number;
  vx: number;
  vy: number;
}

export const DistrictModel: React.FC<DistrictModelProps> = ({ district, color, className, containerRef, targetRef }) => {
  const [isMobile, setIsMobile] = React.useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const scrollRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  // Store physics state for each voxel (resets when district changes)
  const physicsRef = useRef<PhysicsState[]>([]);

  // Generate voxel shapes
  const getShape = (d: District): Voxel[] => {
    const coords: { x: number, y: number, z: number }[] = [];

    // Performance: Increase step size to reduce total points
    const step = 1.5;

    switch (d) {
      case District.NATION: // Sphere
        const radius = 5;
        for (let x = -radius; x <= radius; x += step) {
          for (let y = -radius; y <= radius; y += step) {
            for (let z = -radius; z <= radius; z += step) {
              if (Math.sqrt(x * x + y * y + z * z) <= radius && Math.sqrt(x * x + y * y + z * z) > radius - 1.5) {
                if (Math.random() > 0.4) coords.push({ x, y, z }); // Reduced density
              }
            }
          }
        }
        break;

      case District.BOOSTER: // Rocket Engine Nozzle
        for (let y = -3; y <= 4; y += step * 0.8) {
          const progress = (4 - y) / 7;
          const r = 1.0 + progress * 2.8;

          for (let x = -Math.ceil(r); x <= Math.ceil(r); x += step) {
            for (let z = -Math.ceil(r); z <= Math.ceil(r); z += step) {
              const d = Math.sqrt(x * x + z * z);
              if (d <= r && d >= r - 1.0) {
                coords.push({ x, y, z });
              }
            }
          }
        }

        // Exhaust
        for (let i = 0; i < 15; i++) {
          const fy = -4 - Math.random() * 5;
          const widthAtY = Math.max(0.5, 2.5 - (-4 - fy) * 0.4);
          const angle = Math.random() * Math.PI * 2;
          const rad = Math.random() * widthAtY;
          coords.push({
            x: Math.cos(angle) * rad,
            y: fy,
            z: Math.sin(angle) * rad
          });
        }
        break;

      case District.CONNECT: // Network
        const nodes = [
          { x: -3, y: -3, z: -3 }, { x: 3, y: -3, z: 3 },
          { x: -3, y: 3, z: 3 }, { x: 3, y: 3, z: -3 },
          { x: 0, y: 0, z: 0 }
        ];

        nodes.forEach(n => {
          for (let dx = -1; dx <= 1; dx += step)
            for (let dy = -1; dy <= 1; dy += step)
              for (let dz = -1; dz <= 1; dz += step)
                coords.push({ x: n.x + dx, y: n.y + dy, z: n.z + dz });

          if (n.x !== 0) {
            const steps = 4;
            for (let i = 0; i < steps; i++) {
              coords.push({
                x: n.x * (i / steps),
                y: n.y * (i / steps),
                z: n.z * (i / steps)
              });
            }
          }
        });
        break;

      case District.VC: // Stack
        const layers = 3;
        const coinR = 4;
        for (let l = 0; l < layers; l++) {
          const yOff = (l - 1) * 3;
          for (let x = -coinR; x <= coinR; x += step) {
            for (let z = -coinR; z <= coinR; z += step) {
              if (Math.sqrt(x * x + z * z) <= coinR) {
                coords.push({ x, y: yOff, z });
                coords.push({ x, y: yOff + 0.5, z });
              }
            }
          }
        }
        break;

      case District.COWORK: // Building
        const size = 3;
        for (let x = -size; x <= size; x += step)
          for (let y = -size; y <= size; y += step)
            for (let z = -size; z <= size; z += step)
              if (Math.abs(x) >= size - 0.5 || Math.abs(y) >= size - 0.5 || Math.abs(z) >= size - 0.5)
                coords.push({ x, y, z });
        break;
    }

    return coords.map(c => ({
      ...c,
      vx: (c.x || (Math.random() - 0.5)) + (Math.random() - 0.5) * 5,
      vy: (c.y || (Math.random() - 0.5)) + (Math.random() - 0.5) * 5,
      vz: (c.z || (Math.random() - 0.5)) + (Math.random() - 0.5) * 5
    }));
  };

  useEffect(() => {
    if (isMobile) return;
    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) mouseRef.current = { x: t.clientX, y: t.clientY };
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rotationX = 0;
    let rotationY = 0;

    const voxels = getShape(district);

    physicsRef.current = voxels.map(() => ({ dx: 0, dy: 0, vx: 0, vy: 0 }));

    const resize = () => {
      // Performance: Force 1.0 DPR
      const dpr = 1;

      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';

      ctx.imageSmoothingEnabled = false;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      rotationY += 0.015;
      rotationX += 0.005;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      const transitionThreshold = 200;
      const progress = Math.min(1, Math.max(0, scrollRef.current / transitionThreshold));


      let cx = width / 2;
      let cy = height / 2;
      let scale = 10;

      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;

        let endX = width / 2;
        let endY = 50;

        if (targetRef?.current) {
          const targetRect = targetRef.current.getBoundingClientRect();
          // Header is fixed, but let's just get screen coords
          endX = targetRect.left + targetRect.width / 2;
          endY = targetRect.top + targetRect.height / 2;
        }

        const t = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

        cx = startX + (endX - startX) * t;
        cy = startY + (endY - startY) * t;


        const isMobileSize = window.innerWidth < 768;
        const initialScale = Math.min(rect.width, rect.height) / (isMobileSize ? 22 : 14);
        const finalScale = initialScale * 0.10;
        scale = initialScale + (finalScale - initialScale) * t;




      }

      // Strict scatter: fully closed (0) at both ends, and dampened as it approaches the header
      // This prevents the particles from expanding outside the navbar height during the transition
      const scatterBase = Math.sin(progress * Math.PI) * 0.8;
      const dampening = 1 - Math.pow(progress, 2); // Faster dampening as it nears the target
      const scatterIntensity = scatterBase * dampening;


      const len = voxels.length;

      // Removed complex sorting for performance in "light" mode
      // Without sorting, Z-order is incorrect but acceptable for a dot cloud aesthetic
      // If we need some depth cue, we rely on opacity

      const pixelSize = Math.max(2, scale * 1.2);
      ctx.fillStyle = color;

      for (let i = 0; i < len; i++) {
        const v = voxels[i];

        let tx = v.x;
        let ty = v.y;
        let tz = v.z;

        if (scatterIntensity > 0.01) {
          tx += v.vx * scatterIntensity;
          ty += v.vy * scatterIntensity;
          tz += v.vz * scatterIntensity;
        }

        const cosY = Math.cos(rotationY);
        const sinY = Math.sin(rotationY);
        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);

        let x1 = tx * cosY - tz * sinY;
        let z1 = tx * sinY + tz * cosY;
        let y1 = ty * cosX - z1 * sinX;
        let z2 = ty * sinX + z1 * cosX;

        const fov = 300;
        const dist = fov / (fov + z2 * 4);

        const px = cx + x1 * scale * 1.5;
        const py = cy + y1 * scale * 1.5;

        const phys = physicsRef.current[i];
        const currentX = px + phys.dx;
        const currentY = py + phys.dy;

        // Interaction logic
        const dx = mx - currentX;
        const dy = my - currentY;

        if (Math.abs(dx) < 100 && Math.abs(dy) < 100) {
          // Simplified distance check
          phys.vx -= dx * 0.005;
          phys.vy -= dy * 0.005;
        }

        phys.vx += -phys.dx * 0.08;
        phys.vy += -phys.dy * 0.08;

        phys.vx *= 0.85;
        phys.vy *= 0.85;

        phys.dx += phys.vx;
        phys.dy += phys.vy;

        // Simple depth check for opacity without sorting
        let depthAlpha = Math.max(0.2, Math.min(1, (z2 + 10) / 20));
        
        // Fade out completely as it reaches the header (progress -> 1)
        depthAlpha *= Math.max(0, 1 - progress);

        if (depthAlpha > 0.01) {
          ctx.globalAlpha = depthAlpha;
          ctx.fillRect(Math.floor(currentX - pixelSize / 2), Math.floor(currentY - pixelSize / 2), pixelSize, pixelSize);
        }
      }

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [district, color, containerRef, isMobile]);

  if (isMobile) return null;

  return <canvas ref={canvasRef} className={`fixed inset-0 pointer-events-none ${className}`} />;
};