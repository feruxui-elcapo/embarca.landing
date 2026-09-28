// Links compartibles para cada novedad/evento.
// El link público es /novedad/<id>: en producción lo atiende api/novedad.js (meta tags
// para la vista previa en redes) y redirige a /?novedad=<id>, que abre la novedad en la landing.

export const getNewsShareUrl = (id: string) => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/novedad/${encodeURIComponent(id)}`;
};

// Lee el id de la novedad desde ?novedad=<id>, #novedad-<id> o /novedad/<id>
export const getNewsIdFromLocation = (): string | null => {
  if (typeof window === 'undefined') return null;
  const { search, hash, pathname } = window.location;

  const fromQuery = new URLSearchParams(search).get('novedad');
  if (fromQuery) return fromQuery;

  if (hash.startsWith('#novedad-')) {
    return decodeURIComponent(hash.slice('#novedad-'.length)) || null;
  }

  const pathMatch = pathname.match(/^\/novedad\/([^/]+)\/?$/i);
  if (pathMatch) return decodeURIComponent(pathMatch[1]);

  return null;
};

// Quita el id de la URL sin recargar (deja la landing limpia debajo del modal)
export const clearNewsIdFromLocation = () => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.delete('novedad');
  if (url.hash.startsWith('#novedad-')) url.hash = '';
  if (/^\/novedad\//i.test(url.pathname)) url.pathname = '/';
  window.history.replaceState(null, '', url.toString());
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {}

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch (e) {
    return false;
  }
};

export const getSocialShareLinks = (url: string, title: string) => {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  return {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    x: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`
  };
};
