import React, { useRef, useEffect, useState } from 'react';
import { DistrictTheme } from '../types';
import { PixelButton } from './PixelButton';
import { Download, Zap } from 'lucide-react';
import { ConvergingCard } from './ConvergingCard';

interface ToolkitProps {
    theme: DistrictTheme;
}

export const ToolkitSection: React.FC<ToolkitProps> = ({ theme }) => {
    const sectionRef = useRef<HTMLElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        let isVisible = false;
        const observer = new IntersectionObserver((entries) => {
            isVisible = entries[0].isIntersecting;
        }, { threshold: 0 });

        if (sectionRef.current) observer.observe(sectionRef.current);

        const handleScroll = () => {
            if (!sectionRef.current || !isVisible) return;
            const rect = sectionRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            // Faster convergence
            const progress = Math.min(1, Math.max(0, (windowHeight * 0.8 - rect.top) / (rect.height * 0.6)));
            setScrollProgress(progress);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => {
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
        };
    }, []);

    const toolkits = [
        { title: "Plantilla OKR", desc: "Ordená los objetivos de tu empresa o startup." },
        { title: "Plantilla OKR", desc: "Ordená los objetivos de tu empresa o startup." },
        { title: "Plantilla OKR", desc: "Ordená los objetivos de tu empresa o startup." },
        { title: "Plantilla OKR", desc: "Ordená los objetivos de tu empresa o startup." },
        { title: "Plantilla OKR", desc: "Ordená los objetivos de tu empresa o startup." },
        { title: "Plantilla OKR", desc: "Ordená los objetivos de tu empresa o startup." },
    ];

    const getSaveCursorSvg = (color: string) => {
        const encColor = encodeURIComponent(color);
        return `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><rect width='28' height='28' x='6' y='6' rx='3' fill='${encColor}' stroke='black' stroke-width='3' stroke-opacity='0.8' fill-opacity='0.6'/><path d='M6 14L14 6' stroke='black' stroke-width='3'/><rect width='12' height='10' x='14' y='6' fill='transparent' stroke='black' stroke-width='3'/><rect width='16' height='10' x='12' y='24' fill='black' opacity='0.8'/></svg>") 20 20, pointer`;
    };

    return (
        <section ref={sectionRef} className="w-full px-[40px] py-32 relative z-20 border-t border-black/5 overflow-hidden">

            <h2 className="font-sans text-4xl md:text-5xl font-bold mb-16 text-center md:text-left text-zinc-800 uppercase italic tracking-tighter">
                Toolkit<span className="opacity-20">:</span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Left Column: Grid of tools (Span 8 columns) */}
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {toolkits.map((tool, idx) => (
                        <ConvergingCard
                            key={idx}
                            index={idx}
                            scrollProgress={scrollProgress}
                            initialX={(idx % 3 - 1) * 40}
                            initialY={Math.floor(idx / 3) * 80 + 120}
                            initialRotation={(idx % 2 === 0 ? 15 : -15)}
                            delayStep={0.05}
                        >
                            <div
                                className="bg-white/60 border border-black/10 rounded-xl p-8 flex flex-col items-center text-center group hover:border-black/30 transition-all shadow-lg relative overflow-hidden backdrop-blur-xl aspect-square flex justify-center"
                                style={{ cursor: getSaveCursorSvg(theme.colors[0]) }}
                            >
                                <div
                                    className="absolute inset-x-0 bottom-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ backgroundColor: theme.colors[0] }}
                                />

                                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">🚀</div>
                                <h4 className="font-sans font-bold text-zinc-800 mb-2 uppercase tracking-tight">{tool.title}</h4>
                                <p className="font-mono text-[10px] text-zinc-500 leading-relaxed uppercase tracking-widest">{tool.desc}</p>

                                <Download size={16} className="absolute top-6 right-6 text-black/20 group-hover:text-black/80 transition-colors" />

                                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-black/20" />
                                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-black/20" />
                            </div>
                        </ConvergingCard>
                    ))}
                </div>

                {/* Right Column: Promotional Cards (Span 4 columns) */}
                <div className="lg:col-span-4 flex flex-col justify-between items-stretch gap-3">
                    {[1, 2, 3, 4].map((num, idx) => (
                        <ConvergingCard
                            key={num}
                            index={idx + 4}
                            scrollProgress={scrollProgress}
                            initialX={idx % 2 === 0 ? -40 : 40}
                            initialY={(idx + 1) * 80}
                            initialRotation={idx % 2 === 0 ? 20 : -20}
                            delayStep={0.06}
                            className="flex-1"
                        >
                            <div className="bg-white/60 border border-black/10 p-4 rounded-xl flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-black/30 transition-colors backdrop-blur-xl h-full min-h-[80px]">
                                <div className="mb-2 relative">
                                    <Zap size={18} className="text-yellow-500 group-hover:animate-pulse z-10 relative" />
                                    <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>

                                <h3 className="font-sans font-bold text-[8px] tracking-[0.3em] text-zinc-800 uppercase leading-tight">
                                    Distrito<br /><span style={{ color: theme.colors[0] }}>Booster</span>
                                </h3>

                                <div
                                    className="absolute left-0 top-0 w-0.5 h-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ backgroundColor: theme.colors[0] }}
                                />

                                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-black/20" />
                                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-black/20" />
                            </div>
                        </ConvergingCard>
                    ))}

                    <ConvergingCard
                        index={8}
                        scrollProgress={scrollProgress}
                        initialX={0}
                        initialY={50}
                        initialRotation={0}
                    >
                        <PixelButton variant="primary" className="w-full py-4 text-[10px] tracking-widest uppercase">
                            LET'S TALK
                        </PixelButton>
                    </ConvergingCard>
                </div>

            </div>

        </section>
    );
};

