import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { DistrictTheme, District } from '../types';
import { ConvergingCard } from './ConvergingCard';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProtagonistasProps {
    theme: DistrictTheme;
    district?: District;
}

type Protagonist = {
    name: string;
    role: string;
    company: string;
    focus: string;
    image: string;
    stats: string[];
    story: { title: string; text: string }[];
};


const DISTRICT_PROTAGONISTS: Record<District, Protagonist[]> = {
  [District.NATION]: [
    {
        name: 'Max Campanella',
        role: 'Partner',
        company: 'Embarca',
        focus: 'Venture',
        image: '/fotos-de-protagonistas/MAXI.jpg',
        stats: ['Capitán', 'Asertivo', 'Colaborativo'],
        story: [
            { title: 'Estudios', text: 'Ingeniero Industrial' },
            { title: 'Propósito', text: 'Acompañar equipos a que cumplan sus objetivos' },
            { title: 'Dato curioso', text: 'Mi primera startup fue una banda de rock. El product-market fit nunca apareció.' }
        ]
    },
    {
        name: 'Juls Kerman',
        role: 'Partner',
        company: 'Embarca',
        focus: 'Booster',
        image: '/fotos-de-protagonistas/JULS.jpg',
        stats: ['Idealista', 'Entusiasta', 'Catalizadora'],
        story: [
            { title: 'Estudios', text: 'Magister en negocios y licenciada en comercialización.' },
            { title: 'Propósito', text: 'Conocer gente piola, aprender de ellos y ayudarlos a potenciar sus impactos en el mundo.' },
            { title: 'Dato curioso', text: 'Una de mis entrevistas laborales fue con un principe de Arabia.' }
        ]
    },
    {
        name: 'Lucas Fernandez',
        role: 'Partner',
        company: 'Embarca',
        focus: 'Connect',
        image: '/fotos-de-protagonistas/LUCAS(1).jpg',
        stats: ['Carismático', 'Productivo', 'Metódico'],
        story: [
            { title: 'Estudios', text: 'Ingeniero Industrial + MBA.' },
            { title: 'Propósito', text: 'Ayudar a construir empresas más modernas, humanas y ambiciosas, conectando personas, oportunidades y tecnología para generar impacto real.' },
            { title: 'Dato curioso', text: 'Me sé las finales de todos los mundiales, con sus sedes.' }
        ]
    },
    {
        name: 'Valen Terranova',
        role: 'Partner',
        company: 'Embarca',
        focus: 'Venture',
        image: '/fotos-de-protagonistas/nuevas-fotos/valen.png',
        stats: ['Escala', 'Manija', 'Aventurera'],
        story: [
            { title: 'Estudios', text: 'Lic. en Administración de Empresas' },
            { title: 'Propósito', text: 'Potenciar emprendedores que cambian el mundo.' },
            { title: 'Dato curioso', text: 'Me gustan los deportes extremos: ski, surf, kitesurf e invertir en startups con riesgo existencial. (Me gusta la adrenalina)' }
        ]
    },
    {
        name: 'Gonza Innocenti',
        role: 'Partner',
        company: 'Embarca',
        focus: 'Embarca',
        image: '/fotos-de-protagonistas/nuevas-fotos/gonza.png',
        stats: ['Intergaláctico', 'Reflexivo', 'Disruptivo'],
        story: [
            { title: 'Estudios', text: 'Ingeniero Industrial, MBA y Máster en Mercados Financieros' },
            { title: 'Propósito', text: 'Crear valor para Inversores y para Mendoza' },
            { title: 'Dato curioso', text: 'Cuando tengo que usar traje, alquilo.' }
        ]
    },
    {
        name: 'Fede "el Tucu" Broquen',
        role: 'Líder área Connect',
        company: 'Embarca',
        focus: 'Connect',
        image: '/fotos-de-protagonistas/FEDE.jpg',
        stats: ['Colaborativo', 'Metódico', 'Observador'],
        story: [
            { title: 'Estudios', text: 'Ingeniero Agrónomo.' },
            { title: 'Propósito', text: 'Compartir el conocimiento para potenciar equipos y personas.' },
            { title: 'Dato curioso', text: 'Fui extra en una película Filipina.' }
        ]
    },
    {
        name: 'Gise Paez',
        role: 'Administración',
        company: 'Embarca',
        focus: 'Campus Olegario - Embarca',
        image: '/fotos-de-protagonistas/GISE.jpg',
        stats: ['Observadora', 'Ordenada', 'Considerada'],
        story: [
            { title: 'Estudios', text: 'Licenciada en Administración.' },
            { title: 'Propósito', text: 'Poder aprender de la gente que me rodea.' },
            { title: 'Dato curioso', text: 'Estuve en la portada de un diario de la India.' }
        ]
    },
    {
        name: 'Pau Semiz',
        role: 'Brand Manager',
        company: 'Embarca',
        focus: 'Embarca',
        image: '/fotos-de-protagonistas/PAU.jpg',
        stats: ['Creativa', 'Inspiradora', 'Cinéfila'],
        story: [
            { title: 'Estudios', text: 'Licenciada en Comunicación.' },
            { title: 'Propósito', text: 'Anclar el cine en todo lo que hago para encender curiosidad y abrir mundos.' },
            { title: 'Dato curioso', text: 'Adivino la película con solo escuchar la banda sonora.' }
        ]
    },
    {
        name: 'Bautista Bruno',
        role: 'Venture',
        company: 'Embarca',
        focus: 'Venture',
        image: '/fotos-de-protagonistas/BAUTI.jpg',
        stats: ['Curioso', 'Aventurero', 'Comprometido'],
        story: [
            { title: 'Estudios', text: 'Estudiante y el chico IA' },
            { title: 'Propósito', text: 'Alcanzar mi mejor versión aportando valor a otros' },
            { title: 'Dato curioso', text: 'Me tengo que levantar siempre con el pie derecho' }
        ]
    },
    {
        name: 'Brenda Rojas',
        role: 'Advisor',
        company: 'Embarca',
        focus: 'Booster',
        image: '/fotos-de-protagonistas/BRENDA.jpg',
        stats: ['Integral', 'Empática', 'Proactiva'],
        story: [
            { title: 'Estudios', text: 'Contadora Pública Nacional.' },
            { title: 'Propósito', text: 'Facilitar procesos de transformación.' },
            { title: 'Dato curioso', text: 'Fan de la sonoterapia. Toco cuencos tibetanos y gong.' }
        ]
    },
    {
        name: 'Gerardo Montenegro',
        role: 'Office Manager Campus Olegario',
        company: 'Embarca',
        focus: 'Campus Olegario',
        image: '/fotos-de-protagonistas/GERARDO.jpg',
        stats: ['Resolutivo', 'Creativo', 'Versátil'],
        story: [
            { title: 'Propósito', text: 'Contar cosas a través de palabras, acciones y vivencias.' },
            { title: 'Dato curioso', text: 'Creé un juego de mesa histórico sobre la batalla de Maipú.' }
        ]
    },
    {
        name: 'Milagros Romero',
        role: 'Office Manager Campus Olegario',
        company: 'Embarca',
        focus: 'Campus Olegario',
        image: '/fotos-de-protagonistas/MILI.jpg',
        stats: ['Comprometida', 'Atenta', 'Proactiva'],
        story: [
            { title: 'Propósito', text: 'Aportar compromiso y aprender constantemente.' },
            { title: 'Dato curioso', text: 'Hago bachata cabaret (acrobacia).' }
        ]
    },
    {
        name: 'David Lobato',
        role: 'Colaborador',
        company: 'Embarca',
        focus: 'Connect',
        image: '/fotos-de-protagonistas/DAVID.jpg',
        stats: ['Zen', 'Perspectiva', 'Transparencia'],
        story: [
            { title: 'Estudios', text: 'Ingeniero Industrial.' },
            { title: 'Propósito', text: 'Ser un catalizador en las personas, para que logren estar mejor en sus espacios y más conscientes en el día a día.' },
            { title: 'Dato curioso', text: 'Tengo 9 temas grabados con 2 bandas distintas.' }
        ]
    },
    {
        name: 'Ampi Martinez Cardama',
        role: 'Connect',
        company: 'Embarca',
        focus: 'Connect',
        image: '/fotos-de-protagonistas/nuevas-fotos/ampi.png',
        stats: ['Empática', 'Comprometida', 'Versátil'],
        story: [
            { title: 'Estudios', text: 'Contadora Pública Nacional' },
            { title: 'Propósito', text: 'Cuando en equipo somos capaces de TRANSFORMAR, lo que sea. Poder aportar y apoyar a esa transformación.' },
            { title: 'Dato curioso', text: 'Tengo habilidad para matar mosquitos con la mano y no me gustan los Simpson' }
        ]
    },
    {
        name: 'Lucas Flores Lucero',
        role: 'Mentor',
        company: 'Embarca',
        focus: 'Connect',
        image: '/fotos-de-protagonistas/LUCAS FLORES.jpg',
        stats: ['Metódico', 'Disciplinado', 'Proactivo'],
        story: [
            { title: 'Estudios', text: 'Ingeniero Industrial.' },
            { title: 'Propósito', text: 'Hacer cosas piolas.' },
            { title: 'Dato curioso', text: 'Le gané un partido de tenis a un futbolista campeón mundial a nivel clubes 🫡' }
        ]
    },
    {
        name: 'Jose Codoni',
        role: 'Consultor estratégico',
        company: 'Embarca',
        focus: 'Connect',
        image: '/fotos-de-protagonistas/Jose codoni.jpeg',
        stats: ['Receptivo', 'Claridad', 'Metódico'],
        story: [
            { title: 'Estudios', text: 'Consultor estratégico.' },
            { title: 'Propósito', text: 'Empoderar la creatividad en el mundo de los negocios.' },
            { title: 'Dato curioso', text: 'Conocí a Megan Fox (spoiler: no es tan linda).' }
        ]
    }
  ],
  [District.BOOSTER]: [
    ...[
      'Aigis.png',
      'Biospi.png',
      'Capazeta.png',
      'Dertiomics.png',
      'Empujón.png',
      'Episense.png',
      'Mesenchualt.png',
      'NoCountry.png',
      'Scitrix.png',
      'Tranqui AI.png'
    ].map(filename => ({
        name: filename.split('.')[0].replace(/[-_]/g, ' '),
        role: 'Startup Acelerada',
        company: 'Booster',
        focus: '',
        image: `/nuevos-logos/nuevos-logos-startups-booster/${filename}`,
        stats: ['Tracción', 'Crecimiento', 'Desarrollo'],
        story: [
            { title: 'Progreso', text: 'En etapa de aceleración para alcanzar nuevos mercados y escalar operaciones.' }
        ]
    }))
  ],
  [District.CONNECT]: [
    ...[
      'AchavalFerrer.png',
      'AgroFE.png',
      'Agromaq Vidrio.png',
      'Andreu.png',
      'Autiq.png',
      'Azafrán.png',
      'Beralt.png',
      'Brandia.jpg',
      'Brutto.png',
      'COV.png',
      'Fabric.png',
      'GRB Legal.png',
      'GSA.jfif',
      'MAX Capital.png',
      'Nites.png',
      'Oftar.png',
      'PlazaV.png',
      'Rlrtl.png',
      'Sandra Marzzan.png',
      'Toliver.jfif',
      'Valca.png',
      'Valos.png',
      'Viamatica.png',
      'YPF Los Corralitos.png'
    ].map(filename => ({
        name: filename.split('.')[0].substring(0, 15).replace(/[-_]/g, ' '),
        role: 'Cliente',
        company: '',
        focus: 'Innovación',
        image: `/nuevos-logos/nuevos-logos-connect/${filename}`,
        stats: ['Innovación', 'Pilotos', 'Corporate'],
        story: [
            { title: 'Impacto', text: 'Estrategia de innovación corporativa, logrando pilotos exitosos y sinergias en el ecosistema.' }
        ]
    }))
  ],
  [District.VC]: [
    ...[
      'Aigis.png',
      'Autonoma.png',
      'Biospi.png',
      'Capazeta.png',
      'Carbula.png',
      'Cerebrocurioso.png',
      'Dertiomics.png',
      'Egg.png',
      'Elegirseguro.png',
      'Empujón.png',
      'Episense.png',
      'Frame 100.png',
      'GoSchool.png',
      'Invuelto.png',
      'Mecubro.png',
      'Mesenchualt.png',
      'MujerFinanciera.png',
      'NIdeport.png',
      'NoCountry.png',
      'POL.png',
      'Palta.png',
      'Pareto Frontier.png',
      'Paydece.png',
      'Prospera.png',
      'Retia.png',
      'Scitrix.png',
      'Skyloom.png',
      'Tranqui AI.png',
      'We Sex.png',
      'Wipper.png',
      'debi.png',
      'pura mente.png'
    ].map(filename => ({
        name: filename.split('.')[0].replace(/[-_]/g, ' '),
        role: 'Startup Invertida',
        company: 'Portfolio',
        focus: '',
        image: `/nuevos-logos/nuevos-logos-startups-invertidas/${filename}`,
        stats: ['Venture Capital', 'Latam', 'Escala'],
        story: [
            { title: 'Propósito', text: 'Construyendo el futuro tecnológico de LATAM desde sus bases.' },
            { title: 'Desarrollo', text: 'Crecimiento impulsado por capital inteligente y networking de impacto.' },
            { title: 'Resultados', text: 'Haciendo un impacto real en nuestra región y transformando industrias.' }
        ]
    }))
  ],
  [District.COWORK]: []
};




export const ProtagonistasSection: React.FC<ProtagonistasProps> = ({ theme, district = District.NATION }) => {
    const sectionRef = useRef<HTMLElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const activeProtagonist = activeIndex !== null ? (DISTRICT_PROTAGONISTS[district] || DISTRICT_PROTAGONISTS[District.NATION])[activeIndex] : null;

    const [isTouch, setIsTouch] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    useEffect(() => {
        setIsTouch(window.matchMedia('(pointer: coarse)').matches);
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const isNation = district === District.NATION;
    const currentItems = (DISTRICT_PROTAGONISTS[district] || DISTRICT_PROTAGONISTS[District.NATION]);

    const checkScrollButtons = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 5);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScrollButtons);
            // check initially
            setTimeout(checkScrollButtons, 100);
        }
        return () => {
            if (container) {
                container.removeEventListener('scroll', checkScrollButtons);
            }
        };
    }, [district, currentItems]);

    // Handle smooth scrolling left/right
    const handleScroll = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const scrollAmount = container.clientWidth * 0.75;
        container.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        let isVisible = false;
        const observer = new IntersectionObserver((entries) => {
            isVisible = entries[0].isIntersecting;
        }, { threshold: 0 });

        if (sectionRef.current) observer.observe(sectionRef.current);

        const handleScrollEvent = () => {
            if (!sectionRef.current || !isVisible) return;
            const rect = sectionRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            // Faster convergence
            const progress = Math.min(1, Math.max(0, (windowHeight * 0.8 - rect.top) / (rect.height * 0.6)));
            setScrollProgress(progress);
        };

        window.addEventListener('scroll', handleScrollEvent, { passive: true });
        handleScrollEvent();
        return () => {
            window.removeEventListener('scroll', handleScrollEvent);
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        if (activeIndex === null) return;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [activeIndex]);

    useEffect(() => {
        if (activeIndex === null) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setActiveIndex(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeIndex]);

    // Generates a custom SVG cursor with the district's accent color
    const getCursorSvg = (color: string) => {
        if (isTouch) return undefined;
        const encColor = encodeURIComponent(color);
        return `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><rect width='36' height='36' x='2' y='2' rx='6' fill='${encColor}' stroke='black' stroke-width='3' stroke-opacity='0.8' fill-opacity='0.6'/><polyline points='14 14 26 14 26 26' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/><line x1='14' y1='26' x2='26' y2='14' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/></svg>") 20 20, pointer`;
    };

    const getGroupColor = (focusName: string) => {
        if (focusName === 'Venture') return '#127c3d';
        if (focusName === 'Booster') return '#c2410c';
        if (focusName === 'Connect') return '#701a75';
        if (focusName === 'Embarca') return '#0f766e';
        if (focusName.startsWith('Campus Olegario')) return '#27272a';
        return theme.colors[0];
    };

    // Handler for navigation between protagonists
    const handleNavigation = (direction: 'next' | 'prev', event: React.MouseEvent) => {
        event.stopPropagation();
        if (activeIndex === null) return;
        
        let newIndex;
        if (direction === 'next') {
            newIndex = activeIndex === (DISTRICT_PROTAGONISTS[district] || DISTRICT_PROTAGONISTS[District.NATION]).length - 1 ? 0 : activeIndex + 1;
        } else {
            newIndex = activeIndex === 0 ? (DISTRICT_PROTAGONISTS[district] || DISTRICT_PROTAGONISTS[District.NATION]).length - 1 : activeIndex - 1;
        }
        setActiveIndex(newIndex);
    };

    return (
        <section ref={sectionRef} className="w-full px-[60px] md:px-[100px] py-32 relative z-20 overflow-hidden bg-white/75 backdrop-blur-md">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-16 w-full">
                <h2 className="font-sans text-4xl md:text-5xl font-bold text-zinc-800 uppercase italic tracking-tighter" style={{ transform: 'none', perspective: 'none' }}>
                    {district === District.VC ? 'Protagonistas: Startups invertidas' : 'Protagonistas'}
                </h2>
                
                {/* Arrow Controls at the top right */}
                {currentItems.length > 0 && (
                    <div className="flex items-center gap-4 shrink-0">
                        <button 
                            onClick={() => handleScroll('left')}
                            disabled={!canScrollLeft}
                            className="w-12 h-12 flex items-center justify-center rounded-full border border-black/10 text-zinc-600 hover:bg-zinc-50 hover:text-black disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                            <ChevronLeft size={24} strokeWidth={1.5} />
                        </button>
                        <button 
                            onClick={() => handleScroll('right')}
                            disabled={!canScrollRight}
                            className="w-12 h-12 flex items-center justify-center rounded-full border border-black/10 text-zinc-600 hover:bg-zinc-50 hover:text-black disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                            <ChevronRight size={24} strokeWidth={1.5} />
                        </button>
                    </div>
                )}
            </div>

            <div className="relative w-full">
                <div 
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto gap-8 md:gap-12 pb-8 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {currentItems.map((item, idx) => {
                        const cols = isNation ? 4 : 5;
                        const colIdx = idx % cols;
                        const initialX = (colIdx - (cols - 1) / 2) * 30;

                        return (
                            <div 
                                key={idx} 
                                className="min-w-[240px] sm:min-w-[280px] md:min-w-[300px] lg:min-w-[320px] snap-start shrink-0"
                            >
                                <ConvergingCard
                                    index={idx}
                                    scrollProgress={scrollProgress}
                                    initialX={initialX}
                                    initialY={50} // simpler Y so they don't break
                                    initialRotation={(idx % 2 === 0 ? 1 : -1) * 10}
                                    delayStep={0.08}
                                >
                                    <button
                                        type="button"
                                        className="flex flex-col gap-4 group text-left w-full h-full"
                                        onClick={() => setActiveIndex(idx)}
                                    >
                                        {/* Image Placeholder with Custom Cursor */}
                                        <div
                                            className="w-full aspect-[4/3] bg-white/60 border border-black/10 rounded-lg overflow-hidden relative shadow-[inset_0_0_20px_rgba(0,0,0,0.02)] group-hover:border-black/30 transition-colors backdrop-blur-xl shrink-0"
                                            style={{ cursor: getCursorSvg(theme.colors[0]) }}
                                        >
                                            {/* Subtle inner gradient hover effect */}
                                            <div className="absolute inset-x-0 bottom-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: theme.colors[0] }} />
                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-tr from-transparent to-black/5 pointer-events-none" />

                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />

                                            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-black/20" />
                                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-black/20" />
                                        </div>

                                        {/* Text Label */}
                                        <div className="flex flex-col items-center gap-1 text-center mt-2 flex-grow">
                                            <span className="font-sans text-base font-bold text-zinc-800 uppercase tracking-tight">
                                                {item.name}
                                            </span>
                                            <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-[0.3em]">
                                                {item.company ? `${item.role} // ${item.company}` : item.role}
                                            </span>
                                            {item.focus && (
                                                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-[0.35em]">
                                                    {item.focus}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                </ConvergingCard>
                            </div>
                        );
                    })}
                </div>
            </div>

            {activeProtagonist && createPortal(
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6"
                    onClick={() => setActiveIndex(null)}
                >
                    {/* Dark/Blurry overlay con efecto dramatismo */}
                    <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-md transition-opacity" />

                    {/* Navigation Buttons (Left/Right) outside the main content card for better clickability */}
                    <button
                        onClick={(e) => handleNavigation('prev', e)}
                        className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all z-[210] shadow-xl"
                        aria-label="Anterior protagonista"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    
                    <button
                        onClick={(e) => handleNavigation('next', e)}
                        className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all z-[210] shadow-xl"
                        aria-label="Siguiente protagonista"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>

                    <div
                        className="w-[90vw] max-w-4xl bg-white rounded-3xl relative shadow-[0_0_80px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col md:flex-row max-h-[85vh] md:max-h-[75vh] animate-in fade-in zoom-in-95 duration-300"
                        onClick={(event) => event.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                    >
                        {/* Glow accent */}
                        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-[80px] pointer-events-none" style={{ backgroundColor: getGroupColor(activeProtagonist.focus) }} />
                        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 blur-[80px] pointer-events-none" style={{ backgroundColor: getGroupColor(activeProtagonist.focus) }} />

                        <button
                            type="button"
                            onClick={() => setActiveIndex(null)}
                            className="absolute top-4 right-4 md:top-6 md:right-6 w-12 h-12 rounded-full bg-white/80 backdrop-blur border border-black/5 flex items-center justify-center hover:bg-black/5 hover:scale-105 transition-all z-50 text-zinc-800 shadow-sm"
                            aria-label="Cerrar"
                        >
                            <X size={20} />
                        </button>

                        {/* Columna Izquierda: Imagen full height (en desktop) / banner (en mobile) */}
                        <div className="w-full md:w-[35%] h-52 md:h-auto relative shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 md:hidden" />
                            <img
                                src={activeProtagonist.image}
                                alt={activeProtagonist.name}
                                className="w-full h-full object-cover"
                            />
                            {/* Stats overlayed on image for mobile, and integrated nicely for desktop */}
                            <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap gap-2 md:hidden">
                                {activeProtagonist.stats.map((stat) => (
                                    <span
                                        key={stat}
                                        className="px-3 py-1.5 text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] bg-black/60 backdrop-blur-md rounded-lg text-white border border-white/20"
                                    >
                                        {stat}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Columna Derecha: Información */}
                        <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 overflow-y-auto relative z-10 scrollbar-hide bg-white/95 backdrop-blur-sm">
                            <div className="flex flex-col gap-4 h-full">
                                
                                {/* Info Principal */}
                                <div>
                                    <h3 className="font-sans text-2xl md:text-3xl font-extrabold text-zinc-900 uppercase tracking-tighter leading-none mb-1.5">
                                        {activeProtagonist.name}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-mono uppercase tracking-widest text-zinc-500">
                                        <span className="text-zinc-800 font-bold">{activeProtagonist.role}</span>
                                        {activeProtagonist.company && (
                                            <>
                                                <span className="text-zinc-300">//</span>
                                                <span className="text-zinc-800">{activeProtagonist.company}</span>
                                            </>
                                        )}
                                        {activeProtagonist.focus && (
                                            <>
                                                <span className="text-zinc-300">//</span>
                                                <span style={{ color: getGroupColor(activeProtagonist.focus) }}>{activeProtagonist.focus}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Stats Only for Desktop (oculto en mobile porque va en la imagen) */}
                                <div className="hidden md:flex flex-nowrap items-center gap-2 py-3 border-y border-black/5 w-full">
                                    {activeProtagonist.stats.map((stat) => (
                                        <div
                                            key={stat}
                                            className="px-2.5 py-1 text-[9px] font-mono uppercase tracking-[0.1em] bg-black/5 rounded-lg text-zinc-800 font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 max-w-full truncate"
                                        >
                                            <span style={{ color: getGroupColor(activeProtagonist.focus), fontSize: '10px' }} className="shrink-0">✦</span>
                                            <span className="truncate">{stat}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Story Steps */}
                                <div className="flex-1 mt-1 md:mt-0">
                                    {district !== District.NATION && (
                                        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.4em] text-zinc-400 mb-3">
                                            Caso de éxito detail
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-3 relative before:absolute before:inset-y-0 before:left-[9px] before:w-px before:bg-black/5">
                                        {activeProtagonist.story.map((step, stepIndex) => (
                                            <div
                                                key={step.title}
                                                className="relative pl-6 md:pl-8"
                                            >
                                                {/* Line node indicator */}
                                                <div 
                                                    className="absolute left-[6px] top-1.5 w-1.5 h-1.5 rounded-full ring-[3px] ring-white" 
                                                    style={{ backgroundColor: stepIndex === 2 ? getGroupColor(activeProtagonist.focus) : '#d4d4d8' }} 
                                                />
                                                
                                                <div className="bg-zinc-50 border border-black/5 hover:border-black/20 transition-colors rounded-xl p-3 shadow-sm">
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        {district !== District.NATION && (
                                                            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-black/5 uppercase tracking-[0.3em] text-zinc-500">
                                                                Paso {stepIndex + 1}
                                                            </span>
                                                        )}
                                                        <h4 className="font-sans text-[12px] md:text-[13px] font-bold uppercase tracking-tight text-zinc-900">
                                                            {step.title}
                                                        </h4>
                                                    </div>
                                                    <p className="font-mono text-[10px] md:text-[11px] text-zinc-600 leading-relaxed md:leading-snug">
                                                        {step.text}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </section>
    );
};
