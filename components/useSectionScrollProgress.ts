import { RefObject, useEffect, useState } from 'react';

// Progreso de entrada de una sección (0 → 1) para las animaciones de ConvergingCard.
// Se calcula como máximo una vez por cuadro y solo mientras la sección está en pantalla.
export const useSectionScrollProgress = (sectionRef: RefObject<HTMLElement | null>) => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let isVisible = false;
    let frame = 0;

    const update = () => {
      frame = 0;
      if (!sectionRef.current || !isVisible) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (windowHeight * 0.8 - rect.top) / (rect.height * 0.6)));
      setScrollProgress(progress);
    };

    const handleScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[entries.length - 1].isIntersecting;
      if (isVisible) handleScroll();
    }, { threshold: 0 });

    if (sectionRef.current) observer.observe(sectionRef.current);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return scrollProgress;
};
