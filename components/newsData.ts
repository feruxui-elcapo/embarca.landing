import { District } from '../types';
import { collection, doc, setDoc, deleteDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export type NewsBlock = 
  | { id: string; type: 'text'; content: string }
  | { id: string; type: 'image'; url: string; caption?: string };

export type NewsItem = {
  id: string;
  district?: District; // Make district optional for global sections
  title: string;
  subtitle?: string;
  summary: string;
  excerpt?: string; // para noticias
  description?: string; // para eventos
  content?: string; // HTML format para internas
  blocks?: NewsBlock[]; // Bloques dinámicos para internas
  category?: string;
  date: string;
  time?: string;
  location?: string;
  locationLink?: string; // link al mapa
  imageUrl?: string;
  authors?: string[]; author?: string; // opcional para noticias
  inscriptionUrl?: string; // link de inscripcion
  externalUrl?: string; sourceLink?: string; // link si es de tipo externa
  type: 'event' | 'news' | 'alert';
  isExternal?: boolean; // Noticias: intera o externa
  timestamp?: number; // Sorting support
};

const STORAGE_KEY = 'embarca_news_items_v3';

const FALLBACK_NEWS: Record<District, NewsItem[]> = {
  [District.NATION]: [
    {
      id: 'news-nation-01',
      district: District.NATION,
      title: 'Valentina Terranova: la mendocina que conecta startups latinas con el mercado global',
      author: 'Mariana Zeitune',
      date: '9 de enero de 2026',
      timestamp: 1767924000000,
      summary: 'Entrevista en profundidad a Valentina Terranova, fundadora de la aceleradora Embarca y socia de Draper Cygnus. Explica las tendencias para el ecosistema tecnológico en 2026, los programas de aceleración, y destaca hitos de inversión como la venta de Skyloom Global a la compañía cuántica IonQ, validando el potencial de Mendoza en la industria deep tech global.',
      externalUrl: 'https://ecocuyo.com/nota/149547/valentina-terranova-la-mendocina-que-conecta-startups-latinas-con-el-mercado-global/',
      imageUrl: '/novedades/valentina_terranova.png',
      type: 'news',
      isExternal: true
    },
    {
      id: 'news-nation-02',
      district: District.NATION,
      title: 'Estos fondos de inversión buscan nuevos unicornios y pueden apostar por tu empresa: todos sus datos',
      author: 'Redacción LA NACION',
      date: '28 de diciembre de 2025',
      timestamp: 1766887200000,
      summary: 'Una guía exhaustiva con datos clave sobre fondos de inversión y capital semilla pertenecientes a la asociación argentina Arcap. Detalla los ejecutivos principales, montos de capital disponibles y el perfil de las startups en las que están invirtiendo para el desarrollo estratégico de nuevos negocios.',
      externalUrl: 'https://www.lanacion.com.ar/economia/uno-por-uno-los-fondos-que-pueden-invertir-en-tu-empresa-nid28122025/',
      imageUrl: '/novedades/fondos_inversion.png',
      type: 'news',
      isExternal: true
    }
  ],
  [District.BOOSTER]: [
    {
      id: 'news-booster-01',
      district: District.BOOSTER,
      title: 'Empujón Educativo: la startup mendocina que revoluciona el aprendizaje desde la inclusión',
      author: 'Mariana Zeitune',
      date: '21 de abril de 2026',
      timestamp: 1776736800000,
      summary: 'Reseña de la startup liderada por Marianela López que fusiona ciencias del comportamiento con agentes de inteligencia artificial para personalizar la educación inclusiva. Con operaciones en 48 escuelas del país y 2 de Perú, ha recibido importantes distinciones de impacto por el BID y el Banco Galicia, acelerando su crecimiento junto a Embarca y Endeavor Cuyo.',
      externalUrl: 'https://ecocuyo.com/nota/150039/empujon-educativo-la-startup-mendocina-que-revoluciona-el-aprendizaje-desde-la-inclusion/',
      imageUrl: '/novedades/empujon_educativo.png',
      type: 'news',
      isExternal: true
    },
    {
      id: 'news-booster-02',
      district: District.BOOSTER,
      title: 'Con IA y química cuántica, llevan una tecnología de elite a las industrias',
      author: 'Redacción Punto Biz',
      date: 'Año 2026',
      timestamp: 1767312000000,
      summary: 'Análisis técnico sobre la implementación coordinada de algoritmos de Inteligencia Artificial (IA) avanzados y simulaciones computacionales de química cuántica. Esta convergencia disruptiva permite llevar soluciones de ciencia de frontera a la optimización de procesos y desarrollo de nuevos materiales críticos dentro de la manufactura industrial.',
      externalUrl: 'https://puntobiz.com.ar/negocios/con-ia-y-quimica-cuantica-llevan-una-tecnologia-de-elite-a-las-industrias-2026424600',
      imageUrl: '/novedades/ia_quimica_cuantica.png',
      type: 'news',
      isExternal: true
    }
  ],
  [District.CONNECT]: [],
  [District.VC]: [
    {
      id: 'news-vc-01',
      district: District.VC,
      title: 'La startup que combate incendios sobre el fuego en la Patagonia: "Hoy se quema el doble de superficie que hace 20 años"',
      author: 'Agustín Jamele',
      date: '1 de febrero de 2026',
      timestamp: 1769911200000,
      summary: 'Franco Rodríguez Viau, cofundador de Satellites On Fire, relata cómo su plataforma tecnológica utiliza inteligencia artificial y el procesamiento de datos de más de diez satélites cada cinco minutos para la detección temprana de incendios forestales. Tras la fuerte afectación en Río Negro y Chubut, la startup busca cerrar su ronda semilla y expandir su tecnología de prevención climática.',
      externalUrl: 'https://www.forbesargentina.com/innovacion/la-startup-combate-incendios-sobre-fuego-patagonia-hoy-quemael-doble-superficie-hace-20-anos-n85614',
      imageUrl: '/novedades/incendios_patagonia.png',
      type: 'news',
      isExternal: true
    },
    {
      id: 'news-vc-02',
      district: District.VC,
      title: 'Innovación acelerada: skyloom avanza en un proceso de adquisición global',
      author: 'Tristán Rodríguez Loredo',
      date: '6 de enero de 2026',
      timestamp: 1767664800000,
      summary: 'La startup deep tech de origen argentino Skyloom Global, experta en infraestructura óptica de alta velocidad para transmisiones de datos satelitales, avanza en un plan de adquisición por parte de IonQ, líder en computación cuántica. El caso remarca cómo el desarrollo local impulsado en sus inicios por la aceleradora Embarca logra integrarse a redes espaciales y arquitecturas de seguridad globales.',
      externalUrl: 'https://noticias.perfil.com/noticias/empresas/skyloom-avanza-en-un-proceso-de-adquisicion-global.phtml',
      imageUrl: '/novedades/skyloom_adquisicion.png',
      type: 'news',
      isExternal: true
    },
    {
      id: 'news-vc-03',
      district: District.VC,
      title: 'Las startups que impulsaron el capital de riesgo en Latinoamérica a su mejor primer trimestre desde 2022',
      author: 'Daniel Salazar Castellanos',
      date: 'Primer Trimestre de 2026',
      timestamp: 1773532800000,
      summary: 'Las empresas emergentes de Latinoamérica captaron US$1.300 millones en capital de riesgo durante el 1T de 2026, logrando el mejor periodo inicial en cuatro años según LAVCA. Impulsado por megarrondas como Kavak (US$300 M), Ualá (US$195 M) y Addi (US$89 M), el mercado de venture capital global y regional muestra un enfoque selectivo enfocado en unit economics y rentabilidad estructurada.',
      externalUrl: 'https://www.bloomberglinea.com/negocios/las-startups-que-impulsaron-el-capital-de-riesgo-en-latinoamerica-a-su-mejor-primer-trimestre-desde-2022/?outputType=amp',
      imageUrl: '/novedades/venture_capital_latam.png',
      type: 'news',
      isExternal: true
    }
  ],
  [District.COWORK]: []
};

export const getFallbackNews = (district: District) => FALLBACK_NEWS[district] ?? [];

export const loadNewsItems = () => {
  const fallback = [
    ...(FALLBACK_NEWS[District.NATION] || []),
    ...(FALLBACK_NEWS[District.BOOSTER] || []),
    ...(FALLBACK_NEWS[District.CONNECT] || []),
    ...(FALLBACK_NEWS[District.VC] || [])
  ] as NewsItem[];

  if (typeof window === 'undefined') return fallback;
  
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
      return fallback;
    }
    const parsed = JSON.parse(raw) as NewsItem[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  } catch (error) {
    return fallback;
  }
};

export const saveNewsItems = (items: NewsItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    return;
  }
};

// FIREBASE INTEGRATION 
const NEWS_COLLECTION = 'news';

const removeUndefinedDeep = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map((item) => removeUndefinedDeep(item)) as T;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, removeUndefinedDeep(v)]);
    return Object.fromEntries(entries) as T;
  }

  return value;
};

export const subscribeToNews = (callback: (news: NewsItem[]) => void) => {
  const fallback = [
    ...(FALLBACK_NEWS[District.NATION] || []),
    ...(FALLBACK_NEWS[District.BOOSTER] || []),
    ...(FALLBACK_NEWS[District.CONNECT] || []),
    ...(FALLBACK_NEWS[District.VC] || [])
  ] as NewsItem[];
  
  if (!db) {
    console.warn("Firestore is not initialized. Falling back to local storage news items.");
    callback(loadNewsItems());
    return () => {};
  }
  
  try {
    return onSnapshot(collection(db, NEWS_COLLECTION), (snapshot) => {
      if (snapshot.empty) {
        // Migrate local storage or fallback to Firebase automatically
        let itemsToUpload = fallback;
        try {
          const rawLocal = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
          if (rawLocal) {
            const parsed = JSON.parse(rawLocal);
            if (Array.isArray(parsed) && parsed.length > 0) {
              itemsToUpload = parsed;
            }
          }
        } catch (e) {}

        // Muestra lo cargado inmediatamente
        callback(itemsToUpload);

        // Sube en segundo plano a Firebase
        itemsToUpload.forEach(async (item) => {
          try {
            const cleanItem = removeUndefinedDeep(item);
            await setDoc(doc(db, NEWS_COLLECTION, item.id), cleanItem);
          } catch(e) {}
        });
      } else {
        const items = snapshot.docs.map(doc => doc.data() as NewsItem);
        callback(items);
      }
    }, (error) => {
      console.error("Firestore snapshot error, falling back to localStorage:", error);
      callback(loadNewsItems());
    });
  } catch (e) {
    console.error("Failed to subscribe to Firestore news, falling back to localStorage:", e);
    callback(loadNewsItems());
    return () => {};
  }
};

export const saveNewsItemToFirebase = async (item: NewsItem) => {
  if (!db) {
    console.warn("Firestore is not initialized. Saving news item locally.");
    const items = loadNewsItems();
    const idx = items.findIndex(i => i.id === item.id);
    if (idx > -1) {
      items[idx] = item;
    } else {
      items.push(item);
    }
    saveNewsItems(items);
    return;
  }
  // Guarda un solo ítem completo.
  const cleanItem = removeUndefinedDeep(item);
  await setDoc(doc(db, NEWS_COLLECTION, item.id), cleanItem);
};

export const deleteNewsItemFromFirebase = async (id: string) => {
  if (!db) {
    console.warn("Firestore is not initialized. Deleting news item locally.");
    const items = loadNewsItems();
    const filtered = items.filter(i => i.id !== id);
    saveNewsItems(filtered);
    return;
  }
  await deleteDoc(doc(db, NEWS_COLLECTION, id));
};

