import React, { useRef, useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { District, DistrictTheme } from '../types';
import { ArrowUpRight, CalendarDays, Sparkles, MapPin, Share2, X, ArrowLeft } from 'lucide-react';
import { PixelButton } from './PixelButton';
import { ConvergingCard } from './ConvergingCard';
import { NewsItem, getFallbackNews, subscribeToNews } from './newsData';
import { motion, AnimatePresence } from 'framer-motion';

interface NewsSectionProps {
  theme: DistrictTheme;
  currentDistrict: District;
  onNavigate: (d: District, origin?: { x: number; y: number }) => void;
}

const DISTRICT_SUMMARIES: Record<District, { title: string; summary: string; cta: string }> = {
  [District.NATION]: {
    title: 'Embarca Nation',
    summary: 'La comunidad donde founders y capital se encuentran para escalar LatAm.',
    cta: 'Ir a Embarca Nation'
  },
  [District.BOOSTER]: {
    title: 'Booster',
    summary: 'Aceleracion intensiva para startups early stage que buscan traccion real.',
    cta: 'Ir al distrito'
  },
  [District.CONNECT]: {
    title: 'Connect',
    summary: 'Eventos, networking y colisiones que abren oportunidades estrategicas.',
    cta: 'Ir al distrito'
  },
  [District.VC]: {
    title: 'Venture',
    summary: 'Capital para startups en crecimiento y conexion directa con angels.',
    cta: 'Ir al distrito'
  },
  [District.COWORK]: {
    title: 'Cowork',
    summary: 'Espacios pensados para la colaboracion y el foco del equipo.',
    cta: 'Ir al distrito'
  }
};

const DecorativePattern = ({color}: {color: string}) => (
  <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden mix-blend-multiply">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.5" fill={color}/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  </div>
);

const extractEmbedSrc = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed.startsWith('<iframe') || trimmed.startsWith('<IFRAME')) {
    const match = trimmed.match(/src=["']([^"']+)["']/);
    return match ? match[1] : value;
  }
  return value;
};

export const NewsSection: React.FC<NewsSectionProps> = ({ theme, currentDistrict, onNavigate }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  
  const [spotifySrc, setSpotifySrc] = useState('https://open.spotify.com/embed/track/0mBKv9DkYfQHjdMcw2jdyI?utm_source=generator');
  const [youtubeSrc, setYoutubeSrc] = useState('https://www.youtube.com/embed/1yb-tnuaEoI');

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

  useEffect(() => {
    let unsubSpotify: any = null;
    let unsubYoutube: any = null;
    const districtKey = currentDistrict === District.VC ? 'VC' : currentDistrict;

    // Load initial fallbacks from localStorage if available
    try {
      const cachedSpotify = localStorage.getItem('embarca_setting_spotify');
      if (cachedSpotify) setSpotifySrc(extractEmbedSrc(cachedSpotify));
      
      const cachedYoutube = localStorage.getItem(`embarca_setting_youtube_${districtKey}`)
        || localStorage.getItem('embarca_setting_youtube');
      if (cachedYoutube) {
        setYoutubeSrc(extractEmbedSrc(cachedYoutube));
      }
    } catch (e) {
      console.warn("Failed to load settings from localStorage:", e);
    }

    import('firebase/firestore').then(({ doc, onSnapshot }) => {
      import('../firebase').then(({ db }) => {
        if (!db) {
          console.warn("Firestore not available. Using local settings fallbacks.");
          return;
        }

        try {
          unsubSpotify = onSnapshot(doc(db, 'settings', 'spotify'), (d: any) => {
            if (d.exists() && d.data().url) {
              const src = extractEmbedSrc(d.data().url);
              setSpotifySrc(src);
              try {
                localStorage.setItem('embarca_setting_spotify', src);
              } catch (e) {}
            }
          }, (err) => {
            console.error("Spotify setting subscription error:", err);
          });
        } catch (err) {
          console.error("Failed to subscribe to Spotify settings:", err);
        }

        try {
          unsubYoutube = onSnapshot(doc(db, 'settings', 'youtube_' + districtKey), (d: any) => {
            if (d.exists() && d.data().url) {
              const src = extractEmbedSrc(d.data().url);
              setYoutubeSrc(src);
              try {
                localStorage.setItem(`embarca_setting_youtube_${districtKey}`, src);
              } catch (e) {}
            } else {
              // Fall back to the legacy single 'youtube' document
              onSnapshot(doc(db, 'settings', 'youtube'), (fallback: any) => {
                if (fallback.exists() && fallback.data().url) {
                  setYoutubeSrc(extractEmbedSrc(fallback.data().url));
                } else {
                  setYoutubeSrc('https://www.youtube.com/embed/1yb-tnuaEoI');
                }
              });
            }
          }, (err) => {
            console.error("Youtube setting subscription error:", err);
          });
        } catch (err) {
          console.error("Failed to subscribe to Youtube settings:", err);
        }
      });
    });

    return () => {
      if (unsubSpotify) unsubSpotify();
      if (unsubYoutube) unsubYoutube();
    };
  }, [currentDistrict]);

  useEffect(() => {
    const unsubNews = subscribeToNews((items) => setNewsItems(items));
    return () => {
      unsubNews();
    };
  }, []);

  // Back button handler for the modal
  useEffect(() => {
    const handlePopState = () => {
      if (!window.location.hash.startsWith('#novedad-')) {
        setSelectedNewsId(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const openNews = (newsId: string) => {
    setSelectedNewsId(newsId);
    window.history.pushState({ modalOpen: true }, '', `#novedad-${newsId}`);
  };

  const closeNews = () => {
    setSelectedNewsId(null);
    if (window.location.hash.startsWith('#novedad-')) {
      window.history.back();
    }
  };

  const visibleNews = useMemo(() => {
    // 1. Get filtered news from Firestore/state
    const filtered = newsItems.filter(
      (item) => currentDistrict === District.NATION || item.district === currentDistrict
    );

    // 2. Fetch fallbacks not already in filtered news
    let fallback: NewsItem[] = [];
    if (currentDistrict === District.NATION) {
      const allFallbacks = [
        ...(getFallbackNews(District.NATION) || []),
        ...(getFallbackNews(District.BOOSTER) || []),
        ...(getFallbackNews(District.CONNECT) || []),
        ...(getFallbackNews(District.VC) || [])
      ];
      fallback = allFallbacks.filter(
        (item) => !filtered.some((stored) => stored.id === item.id)
      );
    } else {
      fallback = getFallbackNews(currentDistrict).filter(
        (item) => !filtered.some((stored) => stored.id === item.id)
      );
    }

    // 3. Combine and sort by timestamp descending
    const combined = [...filtered, ...fallback].sort((a, b) => {
      const timeA = a.timestamp || 0;
      const timeB = b.timestamp || 0;
      return timeB - timeA;
    });

    const limit = currentDistrict === District.NATION ? 6 : 4;
    const items = combined.slice(0, limit);

    // 4. Fill remaining spots with placeholders if district news count is < 4
    if (currentDistrict !== District.NATION && items.length < 4) {
      const result: (NewsItem | { isPlaceholder: true; placeholderId: string })[] = [...items];
      const needed = 4 - items.length;
      for (let i = 0; i < needed; i++) {
        result.push({ isPlaceholder: true, placeholderId: `placeholder-${currentDistrict}-${i}` });
      }
      return result;
    }

    return items;
  }, [newsItems, currentDistrict]);

  const selectedNews = useMemo(() => {
    const found = newsItems.find(n => n.id === selectedNewsId);
    if (found) return found;

    const allFallbacks = [
      ...(getFallbackNews(District.NATION) || []),
      ...(getFallbackNews(District.BOOSTER) || []),
      ...(getFallbackNews(District.CONNECT) || []),
      ...(getFallbackNews(District.VC) || [])
    ];
    return allFallbacks.find(n => n.id === selectedNewsId);
  }, [newsItems, selectedNewsId]);

  return (
    <section ref={sectionRef} className="w-full px-[40px] py-32 relative overflow-hidden bg-white/75 backdrop-blur-md" id="news">
      <DecorativePattern color={theme.colors[0]} />

      <div className="flex items-end justify-between gap-8 mb-16 relative z-10">
        <div>
          <h2 className="font-sans text-5xl md:text-6xl font-bold text-center md:text-left text-zinc-900 uppercase italic tracking-tighter drop-shadow-md">
            Novedades
          </h2>
          <p className="font-sans text-lg md:text-xl text-zinc-600 max-w-2xl mt-4 drop-shadow-sm">
            Eventos y noticias creadas por el equipo. Todo lo que necesitas para mantenerte al frente.
          </p>
        </div>
        <div className="hidden md:flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 text-[12px] font-mono uppercase tracking-[0.4em] drop-shadow-sm text-zinc-800">
            <Sparkles size={16} />
            Live Updates
          </div>
          <div className="flex gap-1 mt-2">
            <div className="h-1 w-8 rounded-full bg-zinc-800" />
            <div className="h-1 w-2 bg-zinc-300 rounded-full" />
            <div className="h-1 w-2 bg-zinc-300 rounded-full" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 items-stretch">
        {/* Left Column: News cards */}
        <div className={`lg:col-span-8 grid ${currentDistrict === District.NATION ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'} gap-6 auto-rows-fr h-full`}>
          {visibleNews.map((news, idx) => {
            if ('isPlaceholder' in news) {
              return (
                <ConvergingCard
                  key={news.placeholderId}
                  index={idx}
                  scrollProgress={scrollProgress}
                  initialX={idx % 2 === 0 ? -40 : 40}
                  initialY={Math.floor(idx / 2) * 60 + 80}
                  initialRotation={idx % 2 === 0 ? 8 : -8}
                  delayStep={0.08}
                  className="h-full"
                >
                  <div className="bg-zinc-50/40 border-2 border-dashed border-zinc-200/80 rounded-2xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden h-full min-h-[380px] w-full group transition-all duration-500 hover:border-zinc-300">
                    {/* Decorative background grid */}
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
                      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <pattern id={`placeholder-grid-${idx}`} width="20" height="20" patternUnits="userSpaceOnUse">
                          <line x1="0" y1="0" x2="0" y2="20" stroke="currentColor" strokeWidth="1" className="text-zinc-900" />
                          <line x1="0" y1="0" x2="20" y2="0" stroke="currentColor" strokeWidth="1" className="text-zinc-900" />
                        </pattern>
                        <rect width="100%" height="100%" fill={`url(#placeholder-grid-${idx})`} />
                      </svg>
                    </div>

                    {/* Pulsing indicator */}
                    <div className="relative w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-zinc-100 group-hover:scale-110 transition-transform duration-500">
                      <div className="absolute inset-0 rounded-full bg-zinc-200/50 animate-ping opacity-75" />
                      <div className="relative w-6 h-6 rounded-full border-2 border-dashed border-zinc-400 animate-spin [animation-duration:10s]" />
                    </div>

                    <h4 className="font-sans font-bold text-zinc-400 text-xl md:text-2xl uppercase tracking-wider mb-2">
                      Próximamente
                    </h4>
                    <p className="font-mono text-xs md:text-sm text-zinc-400 max-w-[200px] leading-relaxed">
                      Nuevas historias, eventos y novedades de este distrito se están cocinando.
                    </p>

                    {/* Bottom accent glow */}
                    <div
                      className="absolute inset-x-0 bottom-0 h-1.5 opacity-30 transition-transform origin-left duration-500 transform scale-x-0 group-hover:scale-x-100"
                      style={{ backgroundColor: theme.colors[0] }}
                    />
                  </div>
                </ConvergingCard>
              );
            }

            return (
              <ConvergingCard
                key={news.id}
                index={idx}
                scrollProgress={scrollProgress}
                initialX={idx % 2 === 0 ? -40 : 40}
                initialY={Math.floor(idx / 2) * 60 + 80}
                initialRotation={idx % 2 === 0 ? 8 : -8}
                delayStep={0.08}
                className="h-full"
              >
                <div
                  className="bg-white border border-black/5 rounded-2xl p-0 flex flex-col group transition-all duration-500 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden h-full min-h-[380px] w-full cursor-pointer"
                  onMouseEnter={() => setHoveredCard(news.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => {
                    if (news.type === 'news' && !news.isExternal) {
                      openNews(news.id);
                    } else if (news.externalUrl) {
                      window.open(news.externalUrl, '_blank');
                    }
                  }}
                >
                  {/* Visual impact wrapper */}
                  <div className="absolute top-0 left-0 w-full h-1/2 overflow-hidden bg-zinc-100 flex items-center justify-center">
                    {news.imageUrl ? (
                      <img
                        src={news.imageUrl}
                        alt={news.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 opacity-20 transition-transform duration-700 group-hover:scale-110" style={{ background: `linear-gradient(45deg, ${theme.colors[0]}40, transparent)` }} />
                        <div className="w-full h-full flex items-center justify-center opacity-10">
                          <svg viewBox="0 0 100 100" className="w-150% h-150% stroke-current" style={{ color: theme.colors[0] }}>
                            <circle cx="50" cy="50" r="40" fill="none" strokeWidth="2" strokeDasharray="4 4" />
                            <path d="M 0 50 L 100 50 M 50 0 L 50 100" strokeWidth="1" />
                          </svg>
                        </div>
                      </>
                    )}
                    <div className="absolute inset-0 bg-black/10 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-0" />

                    {/* Floating Date Badge */}
                    <div className="absolute top-4 left-4 bg-white/75 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/40 shadow-sm flex items-center gap-2">
                      <CalendarDays size={14} className="text-zinc-500" />
                      <span className="font-mono text-[11px] text-zinc-800 font-bold uppercase tracking-widest">{news.date}</span>
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-4 right-4 bg-zinc-900 text-white px-3 py-1.5 rounded-md font-mono text-[10px] uppercase tracking-widest shadow-sm">
                      {news.type}
                    </div>
                  </div>

                  {/* Content wrapper */}
                  <div className="absolute bottom-0 w-full h-[60%] bg-white p-6 md:p-8 flex flex-col justify-between border-t border-black/5 transform transition-transform duration-500 rounded-2xl group-hover:-translate-y-2">
                    <div>
                      <h4 className="font-sans font-bold text-zinc-900 mb-3 text-lg md:text-2xl uppercase tracking-tight leading-[1.1] line-clamp-2">
                        {news.title}
                      </h4>
                      <p className="font-mono text-[13px] md:text-[14px] text-zinc-500 leading-relaxed line-clamp-2 transition-opacity duration-300">
                        {news.summary || news.excerpt || news.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-zinc-100 mt-2">
                      <div className="flex items-center gap-2 text-zinc-500 font-mono text-xs uppercase tracking-widest">
                         <MapPin size={12} />
                         {news.district || 'NATION'}
                      </div>

                      <button className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-50 group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-300 text-zinc-400">
                        <ArrowUpRight size={18} className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Color Bar */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-1.5 transition-transform origin-left duration-500 transform scale-x-0 group-hover:scale-x-100"
                    style={{ backgroundColor: theme.colors[0] }}
                  />
                </div>
              </ConvergingCard>
            );
          })}
        </div>

        {/* Right Column: District cards + CTA */}
        <div className="lg:col-span-4 flex flex-col items-stretch gap-6 h-full">
            <div className="rounded-2xl shadow-xl overflow-hidden shrink-0 min-h-[232px] bg-transparent">
              <iframe data-testid="embed-iframe" style={{ borderRadius: '12px' }} src={spotifySrc} width="100%" height="100%" frameBorder="0" allowFullScreen={false} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
            </div>
  
            <div className="bg-zinc-900 rounded-2xl shadow-xl flex-1 overflow-hidden" style={{ minHeight: '272px' }}>
              <iframe width="100%" height="100%" style={{ minHeight: '100%', objectFit: 'cover' }} src={youtubeSrc} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
            </div>
          <ConvergingCard
            index={0}
            delayStep={0}
            scrollProgress={scrollProgress}
            initialX={0}
            initialY={50}
            initialRotation={0}
            className="flex-shrink-0 w-full"
          >
            <div className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg border border-black/10 w-full h-full">
              <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105" style={{ backgroundColor: theme.colors[0], opacity: 0.1 }} />
              <div className="bg-white h-full w-full p-8 flex flex-col items-center justify-center text-center relative z-10">
                <div className="w-12 h-12 rounded-full mb-4 flex items-center justify-center shadow-inner" style={{ backgroundColor: `${theme.colors[0]}20`, color: theme.colors[0] }}>
                  <Share2 size={20} />
                </div>
                <h3 className="font-sans font-bold text-2xl uppercase tracking-tighter text-zinc-900 mb-2">Join the impact</h3>
                <p className="font-mono text-[13px] text-zinc-500 mb-6">Se parte activa de nuestras proximas novedades y eventos.</p>
                <PixelButton variant="primary" className="w-full text-sm tracking-widest uppercase mt-2">
                  LET'S TALK
                </PixelButton>
              </div>
            </div>
          </ConvergingCard>
        </div>
      </div>

      {/* Floating News Slide-Over Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedNewsId && selectedNews && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex justify-end"
              onWheel={(e) => e.stopPropagation()}
              onClick={closeNews}
            >
              <motion.div
                initial={{ x: '100%', filter: 'blur(10px)' }}
                animate={{ x: 0, filter: 'blur(0px)' }}
                exit={{ x: '100%', filter: 'blur(10px)' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full md:w-[80vw] lg:w-[65vw] xl:w-[50vw] bg-white h-full shadow-2xl rounded-l-[40px] flex flex-col relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="shrink-0 sticky top-0 w-full bg-white/80 backdrop-blur-xl border-b border-black/5 p-5 px-8 flex justify-between items-center z-50 rounded-tl-[40px]">
                   <button
                     onClick={closeNews}
                     className="flex items-center gap-2 p-2 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-full transition-colors text-sm font-sans font-bold tracking-tight"
                   >
                     <ArrowLeft size={16} />
                     Volver
                   </button>
                   <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                     Novedad
                   </span>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto pb-32">
                   {selectedNews.imageUrl && (
                     <div className="w-full h-[40vh] md:h-[50vh] relative overflow-hidden bg-zinc-100">
                       <img
                         src={selectedNews.imageUrl}
                         alt={selectedNews.title}
                         className="w-full h-full object-cover"
                       />
                     </div>
                   )}

                   <div className="px-8 mt-12 md:mt-16 max-w-3xl mx-auto">
                     <div className="flex flex-wrap items-center gap-4 mb-6">
                       <span className="px-3 py-1 bg-black text-white text-[10px] font-mono font-bold uppercase tracking-widest rounded-md shadow-sm">
                         {selectedNews.district || 'NATION'}
                       </span>
                       <span className="text-zinc-400 font-mono text-xs uppercase tracking-widest">{selectedNews.date}</span>
                       {(selectedNews.authors?.length || selectedNews.author) && (
                         <span className="text-zinc-400 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
                           <span className="opacity-50">Por</span> <span className="text-zinc-800 font-bold">{selectedNews.authors?.length ? selectedNews.authors.join(', ') : selectedNews.author}</span>
                         </span>
                       )}
                     </div>
                     {selectedNews.isExternal && selectedNews.sourceLink && (
                       <div className="flex items-center gap-2 text-sm text-zinc-500 font-mono mb-4">
                         <span className="opacity-50">Fuente:</span> <a href={selectedNews.sourceLink} target="_blank" rel="noopener noreferrer" className="text-cyan-600 font-bold hover:underline" style={{ color: theme.accent }}>Ver fuente original</a>
                       </div>
                     )}

                     <h1 className="text-3xl md:text-5xl font-sans font-bold uppercase tracking-tighter text-zinc-900 mb-12 leading-[1.1]">
                       {selectedNews.title}
                     </h1>

                     {/* Dynamic Blocks */}
                     <div className="prose prose-zinc prose-lg max-w-none prose-headings:font-sans prose-headings:font-bold prose-headings:uppercase prose-a:text-blue-600 hover:prose-a:text-blue-500 prose-img:rounded-2xl prose-p:font-sans prose-p:text-zinc-600 prose-p:leading-relaxed">
                       {selectedNews.blocks?.map((block, index) => (
                         <div key={block.id || index} className="my-8 md:my-10">
                           {block.type === 'text' && (
                             <div
                               className="space-y-6"
                               dangerouslySetInnerHTML={{ __html: block.content || '' }}
                             />
                           )}
                           {block.type === 'image' && block.url && (
                             <figure className="my-10">
                               <img
                                 src={block.url}
                                 alt={block.caption || 'Imagen del artículo'}
                                 className="w-full rounded-2xl bg-zinc-100 border border-black/5 shadow-sm"
                               />
                               {block.caption && (
                                 <figcaption className="text-center mt-3 text-sm font-mono text-zinc-400 uppercase tracking-widest">
                                   {block.caption}
                                 </figcaption>
                               )}
                             </figure>
                           )}
                         </div>
                       ))}

                       {(!selectedNews.blocks || selectedNews.blocks.length === 0) && (
                         <div className="text-zinc-600 font-sans leading-relaxed text-xl" dangerouslySetInnerHTML={{ __html: selectedNews.summary || 'Sin contenido adicional.' }} />
                       )}
                     </div>
                   </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
};
