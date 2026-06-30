import React, { useState, useEffect, useRef } from 'react';
import { District, DistrictTheme } from '../types';
import { ConvergingCard } from './ConvergingCard';

interface HowWeWorkProps {
    theme: DistrictTheme;
    district?: District;
}

type StepItem = {
    title: string;
    text: string;
    rotation: number;
    x: number;
    y: number;
    image: string;
};

type Testimonial = {
    quote: string;
    image: string;
    author: string;
};

type SectionContent = {
    steps: StepItem[];
    metrics: string[];
    testimonials?: Testimonial[];
};

const DEFAULT_TESTIMONIALS: Testimonial[] = [
    {
        quote: 'Transformamos el capital en propósito, y el propósito en realidad.',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200',
        author: 'Startup Founder'
    },
    {
        quote: 'Nuestra misión es potenciar startups que generen un impacto real en nuestra sociedad.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
        author: 'Investment Analyst'
    },
    {
        quote: 'Buscamos talento con hambre y visión para construir el futuro de LatAm.',
        image: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&q=80&w=200&h=200',
        author: 'Managing Partner'
    }
];

const BOOSTER_TESTIMONIALS: Testimonial[] = [
    {
        quote: 'No se quedaron en la superficie: se metieron adentro del modelo, nos ayudaron a entender los desafíos que teníamos, qué parte del proyecto tenía más potencial y dónde había que inyectar la energía.',
        image: '/fotos de testimonios/REXIA.jpeg',
        author: 'REXIA'
    },
    {
        quote: 'Nos ayudó a ordenar estratégicamente el proyecto, validar aspectos clave del negocio y fortalecer nuestra visión como startup de base científica y tecnológica.',
        image: '/fotos de testimonios/SCITRIX.jpeg',
        author: 'Scitrix'
    },
    {
        quote: 'Embarca nos ayudó a ordenar la startup con OKRs más claros , construir una narrativa más sólida y estratégica.',
        image: '/fotos de testimonios/Mestembio.jpg',
        author: 'Mestembio'
    }
];

const CONNECT_TESTIMONIALS: Testimonial[] = [
    {
        quote: 'El proceso de OKRs nos ayudó a ordenar prioridades, alinear al equipo y enfocarnos en aquello que realmente queríamos construir como estudio.',
        image: '/fotos de testimonios/GRB.jpeg',
        author: 'GRB Legal'
    },
    {
        quote: 'Nos has permitido hacer foco donde realmente la empresa nos necesita, siendo más profesionales, planteándose desafíos reales y crecimiento en todo momento.',
        image: '/fotos de testimonios/AGRO FW.jpeg',
        author: 'Agro FW SA'
    },
    {
        quote: 'A través de la implementación de OKR estamos pudiendo clarificar prioridades, alinear mejor al equipo y enfocar los esfuerzos.',
        image: '/fotos de testimonios/VALOS.jpeg',
        author: 'VALOS'
    }
];

const NATION_CONTENT: SectionContent = {
    steps: [
        {
            title: 'Venture: Capital con propósito',
            text: 'Invertimos en las historias de las que queremos ser parte. Actuamos como el "casamentero" perfecto: unimos el capital inteligente con las ideas que están construyendo un futuro luminoso.',
            rotation: -5,
            x: -20,
            y: 10,
            image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&q=80'
        },
        {
            title: 'Booster: Filtramos y aceleramos',
            text: 'Buscamos equipos extraordinarios con hambre y propósito. Durante 18 semanas intensas, destrabamos y preparamos startups para la escala.',
            rotation: 4,
            x: 30,
            y: -10,
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80'
        },
        {
            title: 'Connect: Transformamos desde dentro',
            text: 'Entramos a las industrias tradicionales para actualizar su mindset, implementando metodologías ágiles y procesos claros para construir equipos autónomos.',
            rotation: -3,
            x: -15,
            y: 20,
            image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80'
        }
    ],
    metrics: [
        '+20 compañías invertidas',
        '+35 proyectos acelerados',
        '+50 empresas acompañadas',
        '+1,250,000 USD movilizados'
    ],
    testimonials: BOOSTER_TESTIMONIALS
};

const BOOSTER_CONTENT: SectionContent = {
    steps: [
        {
            title: 'Menos teoría, más barro',
            text: 'Seleccionamos equipos con propósito y tecnologías disruptivas que no temen iterar para transformar su ciencia en un negocio real.',
            rotation: -5,
            x: -20,
            y: 10,
            image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&q=80'
        },
        {
            title: 'Product Market Fit',
            text: 'Te ayudamos a validar tu propuesta de valor trabajando de cerca con tus clientes para asegurar que estás construyendo algo que realmente necesitan.',
            rotation: 2,
            x: 10,
            y: -15,
            image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'
        },
        {
            title: '18 semanas de tracción',
            text: 'Ejecutamos un proceso intenso de acompañamiento donde expertos que ya recorrieron el camino te ayudan a mover la aguja. - teoría +acción',
            rotation: 4,
            x: 30,
            y: -10,
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80'
        },
        {
            title: 'Demo Day',
            text: 'Preparamos y presentamos tu pitch ante una red cerrada de inversores clave, conectando tu tracción con el capital necesario para crecer.',
            rotation: -4,
            x: -25,
            y: 5,
            image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=800&q=80'
        },
        {
            title: 'Escala con propósito',
            text: 'Conectamos tu proyecto con el ecosistema global para asegurar un camino claro hacia el levantamiento de capital o un modelo de crecimiento sostenible.',
            rotation: -3,
            x: -15,
            y: 20,
            image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80'
        }
    ],
    metrics: [
        '+5 verticales de impacto',
        '+35 proyectos acelerados',
        '+4 ediciones realizadas'
    ],
    testimonials: BOOSTER_TESTIMONIALS
};

const CONNECT_CONTENT: SectionContent = {
    steps: [
        {
            title: 'Ordenamos la estrategia',
            text: 'Trabajamos con founders y equipos directivos para definir visión, prioridades y foco utilizando sistemas de gestión como OKR y Traction (EOS).',
            rotation: -5,
            x: -20,
            y: 10,
            image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&q=80'
        },
        {
            title: 'Profesionalizamos la gestión',
            text: 'Acompañamos la evolución de las empresas incorporando prácticas de gobernanza, directorios estratégicos y procesos de toma de decisiones.',
            rotation: 4,
            x: 30,
            y: -10,
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80'
        },
        {
            title: 'Conectamos con el ecosistema',
            text: 'Activamos vínculos con mentores, aliados estratégicos y talento dentro de la red Embarca.',
            rotation: -3,
            x: -15,
            y: 20,
            image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80'
        }
    ],
    metrics: [
        '+25 empresas acompañadas',
        '80% de autonomía operativa en menos de 12 meses',
        '+5 verticales: Tecnología, industria, servicios, etc.'
    ],
    testimonials: CONNECT_TESTIMONIALS
};

const VC_CONTENT: SectionContent = {
    steps: [
        {
            title: 'Tesis y Match',
            text: 'Invertimos en emprendedores extraordinarios cuyas tecnologías disruptivas resuelvan problemas esenciales. Somos agnósticos pero preferimos compañías con modelos de negocio que generen impacto en tres ejes: crecimiento económico, protección y regeneración ambiental; desarrollo de comunidades en Latam.',
            rotation: -5,
            x: -20,
            y: 10,
            image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&q=80'
        },
        {
            title: 'Capital Inteligente (y cuerpo)',
            text: 'Ponemos capital y equipo a startups en un estadío pre-seed. Trabajamos codo a codo en la estrategia de crecimiento, el orden del cap table y la preparación para las siguientes rondas de inversión. Somos el socio que te ayuda a pensar el negocio a largo plazo.',
            rotation: 4,
            x: 30,
            y: -10,
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80'
        },
        {
            title: 'Networking de Impacto',
            text: 'Nadie escala solo. Te integramos a un ecosistema de founders y expertos que hablan tu mismo idioma y comparten tus mismos dolores. Te conectamos con los que ya recorrieron el camino para que tus decisiones tengan menos teoría y más experiencia real.',
            rotation: -3,
            x: -15,
            y: 20,
            image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80'
        }
    ],
    metrics: [
        '2 fondos operativos',
        '33 startups invertidas',
        '+40 inversores'
    ]
};

const DEFAULT_CONTENT: SectionContent = {
    steps: [
        {
            title: 'Filtramos y aceleramos',
            text: 'Buscamos talento con hambre y propósito. Durante 18 semanas intensas, los destrabamos y los preparamos para escalar.',
            rotation: -5,
            x: -20,
            y: 10,
            image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&q=80'
        },
        {
            title: 'Transformamos desde dentro',
            text: 'Entramos a las industrias tradicionales para actualizar su mindset, implementando disciplina y procesos claros.',
            rotation: 4,
            x: 30,
            y: -10,
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80'
        },
        {
            title: 'Conectamos capital y propósito',
            text: 'Actuamos como el "casamentero" perfecto: unimos el capital inteligente con las ideas que están construyendo un futuro luminoso.',
            rotation: -3,
            x: -15,
            y: 20,
            image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80'
        }
    ],
    metrics: [
        '+20 compañías invertidas',
        '+35 proyectos acelerados',
        '+50 empresas acompañadas',
        '+1,250,000 USD movilizados'
    ]
};

export const HowWeWorkSection: React.FC<HowWeWorkProps> = ({ theme, district = District.NATION }) => {
    const sectionRef = useRef<HTMLElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [metricActiveSlide, setMetricActiveSlide] = useState(0);
    const [metricSlideProgress, setMetricSlideProgress] = useState(0);
    const [testimonialActiveSlide, setTestimonialActiveSlide] = useState(0);
    const [testimonialSlideProgress, setTestimonialSlideProgress] = useState(0);

    const contentByDistrict: Partial<Record<District, SectionContent>> = {
        [District.NATION]: NATION_CONTENT,
        [District.BOOSTER]: BOOSTER_CONTENT,
        [District.CONNECT]: CONNECT_CONTENT,
        [District.VC]: VC_CONTENT
    };
    const sectionContent = contentByDistrict[district] || DEFAULT_CONTENT;
    const currentTestimonials = sectionContent.testimonials || DEFAULT_TESTIMONIALS;

    const activeMetric = sectionContent.metrics[metricActiveSlide] || '';
    const metricMatch = activeMetric.match(/[+]?\d[\d.,]*/);
    const metricValue = metricMatch ? metricMatch[0].replace(/\.$/, '') : activeMetric;
    const metricLabel = metricMatch
        ? activeMetric
            .replace(metricMatch[0], '')
            .replace(/^\s*\.\s*/, '')
            .trim()
        : 'Impacto';

    useEffect(() => {
        setMetricActiveSlide(0);
        setMetricSlideProgress(0);
        setTestimonialActiveSlide(0);
        setTestimonialSlideProgress(0);
    }, [district]);

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

    // Metrics carousel logic (same progressive behavior as phrase cards)
    const SLIDE_DURATION = 5000;
    const UPDATE_INTERVAL = 50;

    useEffect(() => {
        const interval = setInterval(() => {
            setMetricSlideProgress((prev) => {
                if (prev >= 100) {
                    setMetricActiveSlide((current) => (current + 1) % sectionContent.metrics.length);
                    return 0;
                }
                return prev + (100 / (SLIDE_DURATION / UPDATE_INTERVAL));
            });
        }, UPDATE_INTERVAL);

        return () => clearInterval(interval);
    }, [sectionContent.metrics.length]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTestimonialSlideProgress((prev) => {
                if (prev >= 100) {
                    setTestimonialActiveSlide((current) => (current + 1) % currentTestimonials.length);
                    return 0;
                }
                return prev + (100 / (SLIDE_DURATION / UPDATE_INTERVAL));
            });
        }, UPDATE_INTERVAL);

        return () => clearInterval(interval);
    }, []);

    return (
        <section 
            ref={sectionRef} 
            className={`w-full px-[40px] py-32 relative z-20 border-t border-white/10 overflow-hidden transition-colors duration-500 ${
                district === District.NATION ? 'bg-black' : ''
            }`}
        >

            <h2 className="font-sans text-4xl md:text-5xl font-bold mb-16 text-center md:text-left text-white uppercase italic tracking-tighter drop-shadow-md">
                How <span style={{ color: '#ffffff', textShadow: 'none' }}>we work</span>
            </h2>

            {/* Asymmetric CSS Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                {/* Left Column: Flow of steps (Span 8 columns on desktop) */}
                <div className="md:col-span-8 flex flex-col gap-8">
                    {sectionContent.steps.map((step, idx) => (
                        <ConvergingCard
                            key={idx}
                            index={idx}
                            scrollProgress={scrollProgress}
                            initialX={step.x}
                            initialY={step.y}
                            initialRotation={step.rotation}
                        >
                            <div
                                className="bg-black/15 border border-white/20 rounded-xl p-0 flex flex-col md:flex-row items-stretch text-left group hover:border-white/40 transition-colors shadow-lg relative overflow-hidden backdrop-blur-xl"
                            >
                                <div className="w-full md:w-2/5 h-48 md:h-auto min-h-[200px] relative overflow-hidden shrink-0">
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />
                                    <img 
                                        src={step.image} 
                                        alt={step.title} 
                                        className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                    />
                                </div>
                                <div className="p-8 md:p-10 flex flex-col items-start w-full md:w-3/5">
                                    <div
                                        className="absolute inset-x-0 bottom-0 h-1 opacity-0 group-hover:opacity-20 transition-opacity"
                                        style={{ backgroundColor: theme.colors[0] }}
                                    />

                                    <h3 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight uppercase">
                                        {step.title}
                                    </h3>
                                    <p className="font-mono text-xs sm:text-sm md:text-base lg:text-lg text-zinc-100 leading-relaxed uppercase tracking-widest">
                                        {step.text}
                                    </p>

                                    <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/20" />
                                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/20" />
                                </div>
                            </div>
                        </ConvergingCard>
                    ))}
                </div>

                {/* Right Column: Cards (Span 4 columns on desktop) */}
                <div className="md:col-span-4 flex flex-col gap-8 h-full">

                    {/* Top Right: Metrics Block */}
                    <ConvergingCard
                        index={3}
                        scrollProgress={scrollProgress}
                        initialX={20}
                        initialY={30}
                        initialRotation={5}
                        className="w-full flex-1 flex flex-col"
                    >
                        <div className="bg-black/15 border border-white/20 p-10 rounded-2xl flex flex-col items-center text-center relative overflow-hidden backdrop-blur-md shadow-xl transition-all justify-center flex-1 min-h-[320px]">
                            <div className="absolute top-4 inset-x-4 flex gap-2">
                                {sectionContent.metrics.map((_, idx) => (
                                    <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-white transition-all duration-75"
                                            style={{
                                                width: idx === metricActiveSlide ? `${metricSlideProgress}%` : idx < metricActiveSlide ? '100%' : '0%'
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/50 mb-4">
                                impacto
                            </div>

                            <div className="w-14 h-[1px] mb-6 opacity-50" style={{ backgroundColor: theme.colors[0] }} />

                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="font-sans text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-none">
                                    {metricValue}
                                </span>
                            </div>

                            <p className="font-sans text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-zinc-100 leading-tight flex items-center justify-center italic max-w-[18ch]">
                                {metricLabel}
                            </p>

                            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/20" />
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/20" />
                        </div>
                    </ConvergingCard>

                    {/* Bottom Right: Testimonial & Person Block (Carousel) */}
                    <div className="bg-black/15 border border-white/20 p-10 rounded-2xl flex flex-col items-center text-center relative overflow-hidden backdrop-blur-md shadow-xl transition-all justify-center flex-1 min-h-[320px]">
                        {/* IG Style Top Progress Bars */}
                        <div className="absolute top-4 inset-x-4 flex gap-2">
                            {currentTestimonials.map((_, idx) => (
                                <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-white transition-all duration-75"
                                        style={{
                                            width: idx === testimonialActiveSlide ? `${testimonialSlideProgress}%` : idx < testimonialActiveSlide ? '100%' : '0%'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="w-24 h-24 rounded-full border border-white/20 mb-8 flex items-center justify-center relative group overflow-hidden mt-4">
                            <img
                                src={currentTestimonials[testimonialActiveSlide]?.image}
                                alt={currentTestimonials[testimonialActiveSlide]?.author}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: theme.colors[0] }} />
                        </div>

                        <div className="w-12 h-[1px] mb-8 opacity-50" style={{ backgroundColor: theme.colors[0] }} />

                        <p className="font-sans text-sm font-medium text-white mb-4 leading-relaxed flex items-center justify-center italic">
                            "{currentTestimonials[testimonialActiveSlide]?.quote}"
                        </p>

                        {currentTestimonials[testimonialActiveSlide]?.author && (
                            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/60 mt-2">
                                {currentTestimonials[testimonialActiveSlide].author}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

