// Vercel Function: vista previa (Open Graph) de cada novedad para redes sociales.
// Atiende /novedad/<id> (ver rewrite en vercel.json). Los crawlers de WhatsApp, LinkedIn,
// X y Facebook leen los meta tags; las personas son redirigidas a /?novedad=<id>.
// Si algo falla, igual responde una vista previa genérica y redirige: nunca rompe el link.

const SITE_NAME = 'Embarca Nation';
const DEFAULT_DESCRIPTION = 'Impulsamos a emprendedores extraordinarios. Sumamos capital, metodología y red.';

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const stripTags = (value = '') => String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const truncate = (value, max) => (value.length > max ? `${value.slice(0, max - 1).trim()}…` : value);

const fetchNewsItem = async (id) => {
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  const apiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
  if (!projectId || !id) return null;

  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/news/${encodeURIComponent(id)}${apiKey ? `?key=${encodeURIComponent(apiKey)}` : ''}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return null;
    const data = await response.json();
    const fields = data.fields || {};
    const str = (key) => fields[key]?.stringValue || '';
    return {
      title: str('title'),
      summary: str('summary') || str('excerpt') || str('description'),
      imageUrl: str('imageUrl'),
      type: str('type')
    };
  } catch (e) {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

export default async function handler(req, res) {
  const rawId = Array.isArray(req.query?.id) ? req.query.id[0] : req.query?.id;
  const id = typeof rawId === 'string' ? rawId : '';

  const proto = (req.headers['x-forwarded-proto'] || 'https').toString().split(',')[0];
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').toString().split(',')[0];
  const origin = `${proto}://${host}`;

  const shareUrl = `${origin}/novedad/${encodeURIComponent(id)}`;
  const targetUrl = id ? `${origin}/?novedad=${encodeURIComponent(id)}` : `${origin}/`;

  let item = null;
  try {
    item = await fetchNewsItem(id);
  } catch (e) {}

  const title = item?.title ? `${item.title} | ${SITE_NAME}` : SITE_NAME;
  const description = truncate(stripTags(item?.summary || DEFAULT_DESCRIPTION), 200);
  let image = item?.imageUrl || '';
  if (image && image.startsWith('/')) image = `${origin}${image}`;
  if (image && !/^https?:\/\//i.test(image)) image = '';

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${escapeHtml(shareUrl)}" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:type" content="article" />
  <meta property="og:locale" content="es_AR" />
  <meta property="og:url" content="${escapeHtml(shareUrl)}" />
  <meta property="og:title" content="${escapeHtml(item?.title || SITE_NAME)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  ${image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : ''}
  <meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />
  <meta name="twitter:title" content="${escapeHtml(item?.title || SITE_NAME)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  ${image ? `<meta name="twitter:image" content="${escapeHtml(image)}" />` : ''}
  <script>window.location.replace(${JSON.stringify(targetUrl).replace(/</g, '\\u003c')});</script>
</head>
<body style="font-family: sans-serif; padding: 40px; text-align: center;">
  <p><a href="${escapeHtml(targetUrl)}">Ver novedad en ${SITE_NAME}</a></p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
  res.status(200).send(html);
}
