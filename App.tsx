import React, { useState, useEffect, useRef, Suspense } from 'react';
import { LiquidBackground } from './components/LiquidBackground';
import { Navigation } from './components/Navigation';
import { ShockwaveIntro, ShockwaveIntroRef } from './components/ShockwaveIntro';
import { ParticleField } from './components/ParticleField';
import { Spotlight } from './components/Spotlight';
import { District, DistrictTheme } from './types';
import { PixelButton } from './components/PixelButton';
import { ScrollytellingSection } from './components/ScrollytellingSection';
import { HowWeWorkSection } from './components/HowWeWorkSection';
import { ProtagonistasSection } from './components/ProtagonistasSection';
import { NewsSection } from './components/NewsSection';
import { NewToolkitSection } from './components/NewToolkitSection';
import { PurposeSection } from './components/PurposeSection';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { Header } from './components/Header';

// Lazy load DistrictModel (Visual heavy 3D component)
const DistrictModel = React.lazy(() =>
  import('./components/DistrictModel').then(module => ({ default: module.DistrictModel }))
);


const DISTRICT_DATA: Record<District, DistrictTheme> = {
  [District.NATION]: {
    name: 'EMBARCA NATION',
    description: 'No solo ponemos capital — ponemos equipo, método y comunidad. El ecosistema tech que está construyendo el futuro de LATAM.',
    colors: ['#52D8D6'],
    accent: '#52D8D6',
    icon: 'sun'
  },
  [District.BOOSTER]: {
    name: 'BOOSTER',
    description: 'Aceleramos startups early stage con método, equipo y piel en el juego.',
    colors: ['#FF8F22'],
    accent: '#FF8F22',
    icon: 'zap'
  },
  [District.CONNECT]: {
    name: 'CONNECT',
    description: 'Potenciamos al ecosistema emprendedor para desarrollar líderes extraordinarios',
    colors: ['#C24EE4'],
    accent: '#C24EE4',
    icon: 'network'
  },
  [District.VC]: {
    name: 'VENTURE',
    description: 'Invertimos en los founders que están construyendo el futuro de LATAM.',
    colors: ['#1BB45A'],
      accent: '#1BB45A',
    icon: 'coins'
  },
  [District.COWORK]: {
    name: 'COWORK',
    description: 'A physical space designed for serendipity. Digital nomads unite.',
    colors: ['#00ffcc'],
    accent: '#00ffcc',
    icon: 'building'
  }
};

const App: React.FC = () => {
  const [district, setDistrict] = useState<District>(District.NATION);
  const [loading, setLoading] = useState(true);
  const [loadingDistrict, setLoadingDistrict] = useState<string>('NATION');
  const [isAdminMode, setIsAdminMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const hasAdminPath = window.location.pathname.toLowerCase().includes('/admin');
    const hasAdminQuery = params.get('admin') === '1' || params.get('admin') === 'true';
    return hasAdminPath || hasAdminQuery;
  });
  const [isNavHidden, setIsNavHidden] = useState(false);

  const shockwaveRef = useRef<ShockwaveIntroRef>(null);
  const modelPlaceholderRef = useRef<HTMLDivElement>(null);
  const headerModelPlaceholderRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const lastScrollYRef = useRef(0);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = 200;
      setScrolled(scrollY > threshold);
      setScrollProgress(Math.min(1, Math.max(0, scrollY / threshold)));
    };


    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAdminMode) return;
    const handleScroll = () => {
      const currentY = window.scrollY;
      const direction = currentY > lastScrollYRef.current ? 'down' : 'up';
      lastScrollYRef.current = currentY;

      if (!footerRef.current) {
        if (direction === 'up') setIsNavHidden(false);
        return;
      }

      const rect = footerRef.current.getBoundingClientRect();
      const footerVisible = rect.top <= window.innerHeight - 80;

      if (footerVisible && direction === 'down') {
        setIsNavHidden(true);
      } else if (direction === 'up') {
        setIsNavHidden(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isAdminMode]);


  useEffect(() => {
    const districts = [District.NATION, District.BOOSTER, District.CONNECT, District.VC];
    let index = 0;

    const interval = setInterval(() => {
      setLoadingDistrict(districts[index]);
      index = (index + 1) % districts.length;
    }, 100);

    const timer = setTimeout(() => {
      // Trigger shockwave explosion before removing loader
      const startColor = DISTRICT_DATA[District.NATION].colors[0];

      // Use ShockwaveIntro for initial load (defaults to 0,0 origin)
      if (shockwaveRef.current) {
        shockwaveRef.current.play(startColor, () => {
          setLoading(false);
          clearInterval(interval);
        });
      } else {
        // Fallback if ref is missing
        setLoading(false);
        clearInterval(interval);
      }
    }, 2000);

    // Safety fallback: Force end loading if something hangs
    const safetyTimer = setTimeout(() => {
      setLoading(false);
      clearInterval(interval);
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(safetyTimer);
      clearInterval(interval);
    };
  }, []);

  const handleNavigate = (d: District, origin?: { x: number, y: number }) => {
    if (d === district) return;
    const targetTheme = DISTRICT_DATA[d];

    // Use ShockwaveIntro for navigation with custom origin (button location)
    shockwaveRef.current?.play(targetTheme.colors[0], () => {
      setDistrict(d);

      // Handle Scroll Reset - Standard Native
      window.scrollTo({ top: 0, behavior: 'instant' });

    }, origin);
  };

  const currentTheme = DISTRICT_DATA[district];
  const cursorRef = useRef<HTMLDivElement>(null);

  const handleExitAdmin = () => {
    setIsAdminMode(false);
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.delete('admin');
    
    // Si la ruta contiene /admin, redirigir a la raíz en vez de hacer replaceState
    // que dejaría la URL igual y la volvería a cargar mal si recargan
    if (url.pathname.toLowerCase().includes('/admin')) {
      window.location.href = '/';
    } else {
      window.history.replaceState({}, '', url.toString());
    }
  };

  useEffect(() => {
    if (isAdminMode) return;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;

        // Hide if navigating over elements with custom cursors or pointers
        const target = e.target as HTMLElement;
        const computedCursor = window.getComputedStyle(target).cursor;
        if (computedCursor.includes('url(') || computedCursor === 'pointer') {
          cursorRef.current.style.opacity = '0';
        } else {
          cursorRef.current.style.opacity = '1';
        }
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isAdminMode]);

  if (isAdminMode) {
    return <AdminPanel onExit={handleExitAdmin} />;
  }

  return (
    <div className="relative min-h-screen w-full bg-transparent text-zinc-800">
      {/* 0. Noise Overlay (Always present) */}
      <div className="fixed inset-0 pointer-events-none z-[60] bg-noise mix-blend-overlay opacity-30"></div>

      {/* CUSTOM CURSOR - CROSSHAIR STYLE */}
      {!isTouchDevice && (
        <div
          ref={cursorRef}
          className="hidden md:flex fixed top-0 left-0 w-6 h-6 pointer-events-none z-[99999] mix-blend-difference items-center justify-center transition-opacity duration-150"
          style={{
            marginLeft: '-12px',
            marginTop: '-12px',
            willChange: 'transform'
          }}
        >
          {/* Horizontal line */}
          <div className="absolute w-full h-[1px] bg-white opacity-90" />
          {/* Vertical line */}
          <div className="absolute h-full w-[1px] bg-white opacity-90" />
        </div>
      )}

      {/* Global Transition Layers */}
      <ShockwaveIntro ref={shockwaveRef} />

      {/* LOADING SCREEN */}
      {loading && (
        <div className="fixed inset-0 bg-gray-50 flex flex-col items-center justify-center z-[80] bg-noise">
          <div className="text-center relative px-4">
            <h1 className="font-pixel text-4xl md:text-6xl text-zinc-700 mb-6 uppercase tracking-wider relative z-10 mix-blend-exclusion">
              LOADING <br /> SYSTEM
            </h1>
            <p className="font-mono text-xs text-[#00eaff] mt-4">Initializing {loadingDistrict} protocol...</p>
          </div>
        </div>
      )}

      {/* MAIN APP CONTENT */}
      {!loading && (
        <>
          {/* 1. Background Layer */}
          <LiquidBackground district={district} />

          {/* New Sticky Header */}
          <Header
            district={district}
            themeName={currentTheme.name}
            isVisible={scrolled}
            modelPlaceholderRef={headerModelPlaceholderRef}
          />

          {/* 1.3 Spotlight Gradient */}

          <Spotlight color={currentTheme.colors[0]} />

{/* 1.5 Interactive Particles (Removed) */}

          {/* 1.7 District Model Overlay (Global Fixed) */}
          <div className={`transition-opacity duration-500 z-[80] fixed inset-0 pointer-events-none opacity-100`}>
            <Suspense fallback={null}>
              <DistrictModel
                district={district}
                color="#ffffff"
                containerRef={modelPlaceholderRef}
                targetRef={headerModelPlaceholderRef}
              />
            </Suspense>
          </div>

          {/* 2. Main Content Wrapper */}
          <div className="relative z-20 flex flex-col min-h-screen pointer-events-none">

            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center justify-start w-full relative pointer-events-auto">

              {/* Hero Section Container */}
              <div className="w-full min-h-[20vh] md:min-h-screen flex flex-col justify-center pb-6 md:pb-24 pt-10">
                {/* MAIN TITLE (Glitch Texture) */}
                <div
                  className="relative z-10 w-full flex justify-center mb-8 md:mb-12 pointer-events-none transition-opacity duration-300 mt-auto"
                  style={{ opacity: 1 - scrollProgress }}
                >
                  <LiquidBackground
                    district={district}
                    text={currentTheme.name}
                    className="h-[80px] md:h-[12rem] w-full"
                  />
                </div>

                {/* Hero Two-Column Layout */}
                <div className="w-full px-[40px] grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center relative z-20 mb-auto">

                {/* Left Column: Description & Action */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left gap-8 md:gap-12">
                  <h3 className="font-sans text-2xl md:text-3xl lg:text-5xl font-bold text-white leading-tight tracking-tighter drop-shadow-sm">
                    {currentTheme.description.split('.').map((sentence, idx) => (
                      <React.Fragment key={idx}>
                        {sentence.trim()}
                        {idx < currentTheme.description.split('.').length - 1 && '.'}
                        <br />
                      </React.Fragment>
                    ))}
                  </h3>

                  <div className="pointer-events-auto">
                    <PixelButton 
                      variant="gradient-outline" 
                      color={currentTheme.colors[0]}
                      onClick={() => window.location.href = 'mailto:pau@embarca.tech'}
                    >
                      Let's talk
                    </PixelButton>
                  </div>
                </div>

                {/* Right Column: 3D Model */}
                <div className="hidden md:flex w-full max-w-md mx-auto aspect-square relative items-center justify-center pointer-events-auto">
                  <div
                    ref={modelPlaceholderRef}
                    className="w-full h-full opacity-0 absolute inset-0"
                    aria-hidden="true"
                  ></div>
                </div>
              </div>
              </div>

              {/* --- CONDITIONAL SCROLLYTELLING / PURPOSE --- */}
              {district === District.NATION ? (
                <ScrollytellingSection />
              ) : (
                <PurposeSection theme={currentTheme} currentDistrict={district} />
              )}

              {/* --- NEW SECTION: HOW WE WORK & METRICS --- */}
              <HowWeWorkSection theme={currentTheme} district={district} />

              {/* --- NEW SECTION: PROTAGONISTAS --- */}
              <ProtagonistasSection theme={currentTheme} district={district} />
{/* --- NEW SECTION: NOVEDADES --- */}
              <NewsSection theme={currentTheme} currentDistrict={district} onNavigate={handleNavigate} />

              {/* --- NEW SECTION: TOOLKIT --- */}
              {/* {district !== District.NATION && (
                <NewToolkitSection theme={currentTheme} district={district} />
              )} */}

              <div ref={footerRef} className="w-full relative z-30">
                <Footer />
              </div>

            </main>
          </div>

          <Navigation currentDistrict={district} onNavigate={handleNavigate} isHidden={isNavHidden} />
        </>
      )}
    </div>
  );
};

export default App;



