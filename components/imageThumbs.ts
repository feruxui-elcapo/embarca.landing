// Miniaturas (800px) de las fotos de protagonistas para las tarjetas de 230px.
// El modal sigue usando la foto completa. Si se agrega una foto nueva sin miniatura,
// la tarjeta usa la original (funciona igual, solo que más pesada).
const THUMBS = new Set([
  '/fotos-de-protagonistas/MAXI.jpg',
  '/fotos-de-protagonistas/JULS.jpg',
  '/fotos-de-protagonistas/LUCAS(1).jpg',
  '/fotos-de-protagonistas/nuevas-fotos/valen_v2.webp',
  '/fotos-de-protagonistas/nuevas-fotos/gonza_v2.webp',
  '/fotos-de-protagonistas/FEDE.jpg',
  '/fotos-de-protagonistas/GISE.jpg',
  '/fotos-de-protagonistas/PAU.jpg',
  '/fotos-de-protagonistas/BAUTI.jpg',
  '/fotos-de-protagonistas/GERARDO.jpg',
  '/fotos-de-protagonistas/MILI.jpg',
  '/fotos-de-protagonistas/DAVID.jpg',
  '/fotos-de-protagonistas/nuevas-fotos/ampi.webp',
  '/fotos-de-protagonistas/LUCAS FLORES.jpg',
]);

export const getThumbSrc = (src: string) => {
  if (!THUMBS.has(src)) return src;
  const slash = src.lastIndexOf('/');
  return `${src.slice(0, slash)}/thumbs${src.slice(slash)}`;
};

// Precarga la foto completa (p. ej. al pasar el mouse por la tarjeta) para que el modal abra sin demora
const preloaded = new Set<string>();
export const preloadImage = (src: string) => {
  if (!src || preloaded.has(src) || typeof Image === 'undefined') return;
  preloaded.add(src);
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
};
