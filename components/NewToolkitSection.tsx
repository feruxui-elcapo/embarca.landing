import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { District, DistrictTheme } from '../types';
import { PixelButton } from './PixelButton';
import { Compass, Target, Users } from 'lucide-react';

interface NewToolkitSectionProps {
  theme: DistrictTheme;
  district?: District;
}

const TOOLKIT_DATA = {
    [District.BOOSTER]: [
        { title: 'Guía', description: 'Guía para armar tu pitch deck', icon: Compass },
        { title: 'Checklist', description: 'Checklist para postular a una aceleradora', icon: Target },
        { title: 'Template', description: 'Template de roadmap de validación', icon: Users }
    ],
    DEFAULT: [
        { title: 'Ruta propia', description: 'Definimos el camino que se adapta a tu startup y al ritmo de tu equipo.', icon: Compass },
      { title: 'Estrategia viva', description: 'Plan accionable, con foco en tracción y decisiones claras.', icon: Target },
      { title: 'Red con propósito', description: 'Mentores, aliados y capital conectados a tu etapa real.', icon: Users }
    ]
};

export const NewToolkitSection: React.FC<NewToolkitSectionProps> = ({ theme, district = District.BOOSTER }) => {
  const [isOpen, setIsOpen] = useState(false);
  const data = TOOLKIT_DATA[district as keyof typeof TOOLKIT_DATA] || TOOLKIT_DATA.DEFAULT;

  return (
    <section className="w-full px-[40px] py-32 relative z-20 overflow-hidden bg-white/75 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex flex-col min-h-[85vh]">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
          <div>
            <h2 className="font-sans text-4xl md:text-5xl font-bold text-zinc-900 uppercase italic tracking-tighter">
              Tu Toolkit
            </h2>
            <p className="font-sans text-base md:text-lg text-zinc-600 max-w-2xl mt-4 relative z-50">
              Un set de recursos y acompañamiento para que avances con claridad, foco y propiedad total.
            </p>
          </div>
          <div className="font-mono text-[11px] uppercase tracking-[0.4em] text-zinc-400">
            Embarca support
          </div>
        </div>

        {/* The Interactive Toolbox Area */}
        <div 
          className="relative w-full flex-1 flex flex-col items-center justify-center py-20 cursor-pointer min-h-[500px] mb-8 perspective-1000"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          onClick={() => setIsOpen(!isOpen)}
        >
          {/* Glowing background effect for the box */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 blur-[100px] rounded-full pointer-events-none transition-all duration-1000"
            style={{ 
              backgroundColor: theme.colors[0],
              opacity: isOpen ? 0.05 : 0.2,
              transform: isOpen ? 'scale(1.5)' : 'scale(1)'
            }}
          />

          {/* Tools Grid (They will spring out of the box) */}
          <div className="w-full relative z-20 grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
            {data.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={false}
                  animate={{
                    y: isOpen ? 0 : 250,       // Starts lower inside the box
                    opacity: isOpen ? 1 : 0,
                    scale: isOpen ? 1 : 0.6,
                    rotateX: isOpen ? 0 : 30, // Tilted when inside
                    rotate: isOpen ? 0 : (idx === 0 ? -10 : idx === 2 ? 10 : 0)
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 150, 
                    damping: 15, 
                    delay: isOpen ? idx * 0.1 + 0.2 : 0,
                    opacity: { duration: 0.3 }
                  }}
                  className="bg-white border border-black/10 rounded-2xl p-8 flex flex-col items-start shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden group hover:border-black/30 transition-colors pointer-events-auto min-h-[220px] will-change-transform transform-gpu"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundColor: theme.colors[0] }} />
                    <Icon size={22} style={{ color: theme.colors[0] }} strokeWidth={2.5} />
                  </div>

                  <h3 className="font-sans text-lg font-bold uppercase tracking-tight text-zinc-900 mb-3 drop-shadow-sm">
                    {item.title}
                  </h3>
                  <p className="font-mono text-[13px] text-zinc-600 leading-relaxed">
                    {item.description}
                  </p>

                  <div
                    className="absolute inset-x-0 bottom-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: theme.colors[0] }}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Closed State: Sleek Digital Toolbox */}
          <div className="absolute top-[65%] md:top-[70%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none perspective-1000 z-[15]">
            <motion.div
              initial={false}
              animate={{
                y: isOpen ? 50 : 0,           // Drops slightly when open
                opacity: isOpen ? 0.3 : 1,    // Fades into background
                scale: isOpen ? 1 : 1.3,      // Shrinks when open out of focus
              }}
              transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Toolbox Graphic */}
              <div className="relative w-80 h-60 md:w-96 md:h-72 flex flex-col items-center">
                 
                 {/* Briefcase Handle */}
                 <div className="w-24 h-6 border-t-4 border-x-4 border-zinc-300 rounded-t-xl mb-[-4px] z-10" />
  
                 {/* Lid part */}
                 <motion.div 
                   className="w-full h-[45%] rounded-t-2xl border-t-2 border-x-2 border-zinc-200 bg-gradient-to-b from-white to-zinc-100 border-b border-black/10 flex flex-col items-center justify-end pb-[2px] origin-bottom relative z-20 shadow-xl"
                   animate={{ 
                     rotateX: isOpen ? -130 : 0, // Opens backward extremely
                     translateZ: isOpen ? -50 : 0 
                   }}
                   transition={{ duration: 0.7, type: 'spring', bounce: 0.35 }}
                   style={{ transformStyle: 'preserve-3d' }}
                 >
                   {/* Lid Latch Top */}
                   <div className="w-12 h-3 bg-zinc-200 border border-zinc-300 rounded-sm" />
                 </motion.div>
  
                 {/* Base part */}
                 <div className="w-full h-[55%] rounded-b-2xl border-b-2 border-x-2 border-zinc-200 bg-white flex items-start justify-center pt-0 relative shadow-2xl overflow-hidden">
                   {/* Latch Bottom - glowing lock indicator */}
                   <div 
                     className="w-12 h-5 border border-zinc-200 rounded-b-sm flex items-center justify-center shadow-lg bg-zinc-50 z-10"
                     style={{ 
                       boxShadow: `0 4px 15px ${theme.colors[0]}40`,
                       borderBottomColor: theme.colors[0],
                       borderBottomWidth: '2px'
                     }}
                   >
                     {/* Glowing pin hole/light */}
                     <div 
                       className="w-[6px] h-[6px] rounded-full" 
                       style={{ 
                         backgroundColor: theme.colors[0],
                         boxShadow: `0 0 8px ${theme.colors[0]}`
                       }} 
                     />
                   </div>
                   
                   {/* Base detail lines */}
                   <div className="absolute top-6 left-0 w-full flex flex-col gap-2 px-6 opacity-30">
                      <div className="h-[1px] w-full bg-zinc-300" />
                      <div className="h-[1px] w-full bg-zinc-300" />
                      <div className="h-[1px] w-full bg-zinc-300" />
                   </div>
  
                   <div className="text-zinc-400 font-mono text-[10px] tracking-[0.2em] absolute bottom-4 uppercase font-semibold">
                     Hover to Unbox
                   </div>
                 </div>
              </div>
            </motion.div>
          </div>

        </div>


      </div>
    </section>
  );
};
