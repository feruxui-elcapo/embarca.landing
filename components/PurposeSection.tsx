import React, { useRef, useEffect, useState } from 'react';
import { DistrictTheme, District } from '../types';

interface PurposeSectionProps {
  theme: DistrictTheme;
  currentDistrict: District;
}

const getPurposeText = (district: District) => {
  switch (district) {
    case District.BOOSTER:
      return "Acompañamos a startups early stage con equipo y propósito para que logren levantar capital de impacto o construir un modelo de crecimiento sostenible.";
    case District.CONNECT:
      return "Acompañamos a pymes y startups a profesionalizar su gestión, ordenar su estrategia y ejecutar con foco mediante la implementación de sistemas de trabajo.";
    case District.VC:
      return "Invertir es elegir de qué historias queremos ser parte. Acompañamos startups que nos emocionan y nos enorgullece contar, poniendo capital y equipo para que su impacto en Latam sea real.";
    default:
      return "Building the future of Latam.";
  }
};

export const PurposeSection: React.FC<PurposeSectionProps> = ({ theme, currentDistrict }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how far the block is through the screen
      // Start coloring when the top of the element hits 75% of the screen
      // Finish coloring when the top of the element hits 25% of the screen
      const start = windowHeight * 0.75;
      const end = windowHeight * 0.25;
      
      const currentScroll = rect.top;
      
      let progress = 0;
      if (currentScroll <= end) {
        progress = 1;
      } else if (currentScroll >= start) {
        progress = 0;
      } else {
        progress = 1 - (currentScroll - end) / (start - end);
      }
      
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Init
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const text = getPurposeText(currentDistrict);
  const words = text.split(' ');

  return (
    <section 
      ref={containerRef} 
      className="w-full min-h-screen flex flex-col items-center justify-center px-6 md:px-12 py-24 relative overflow-hidden bg-black backdrop-blur-md"
    >
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
      
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center gap-8 relative z-10">
        <h2 className="text-sm md:text-base font-mono uppercase tracking-widest text-white mb-4">
          Nuestro Propósito
        </h2>
        
        <h3 
          ref={textRef}
          className="text-4xl md:text-5xl lg:text-7xl font-sans font-bold leading-snug tracking-tight relative"
        >
          {words.map((word, i) => {
            const step = 1 / words.length;
            const wordStart = i * step;
            const wordEnd = (i + 1) * step;
            
            // Map the global scrollProgress (0 to 1) to this word's progress
            let opacity = 0.2; // base opacity for uncolored text
            let color = 'rgb(161, 161, 170)'; // text-zinc-400
            
            if (scrollProgress >= wordEnd) {
              opacity = 1;
              color = theme.colors[0];
            } else if (scrollProgress > wordStart) {
              const localProgress = (scrollProgress - wordStart) / (wordEnd - wordStart);
              opacity = 0.2 + (0.8 * localProgress);
              color = theme.colors[0];
            }

            return (
              <span key={i} className="inline-block mr-[0.25em] transition-colors duration-100" style={{ 
                opacity,
                color: scrollProgress > wordStart ? color : 'rgb(161, 161, 170)' 
              }}>
                {word}
              </span>
            );
          })}
        </h3>
      </div>
    </section>
  );
};
