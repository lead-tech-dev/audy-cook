const SOCIAL_BOTS = [
  'facebookexternalhit', 'facebot', 'twitterbot', 'whatsapp',
  'linkedinbot', 'slackbot', 'telegrambot', 'discordbot',
  'pinterest', 'w3c_validator', 'iframely', 'embedly',
];

const SITE_URL = 'https://audy-cook.pages.dev';
const DEFAULT_IMAGE = 'https://audy-cook.pages.dev/brand/audycook-logo.png';
const DEFAULT_DESC = 'Repas camerounais authentiques au Luxembourg, en Belgique et au-delà.';

function isBot(userAgent = '') {
  const ua = userAgent.toLowerCase();
  return SOCIAL_BOTS.some((bot) => ua.includes(bot));
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);
}

function buildHtml({ title, description, image, articleUrl }) {
  const t = esc(title);
  const d = esc(description);
  const img = esc(image);
  const url = esc(articleUrl);

  return `<!DOCTYPE html>
<html lang="fr" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="utf-8"/>
  <title>${t} – AUDY COOK</title>
  <meta name="description" content="${d}"/>
  <meta property="og:type" content="article"/>
  <meta property="og:site_name" content="AUDY COOK"/>
  <meta property="og:locale" content="fr_FR"/>
  <meta property="og:title" content="${t}"/>
  <meta property="og:description" content="${d}"/>
  <meta property="og:image" content="${img}"/>
  <meta property="og:image:secure_url" content="${img}"/>
  <meta property="og:image:type" content="image/jpeg"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:image:alt" content="${t}"/>
  <meta property="og:url" content="${url}"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${t}"/>
  <meta name="twitter:description" content="${d}"/>
  <meta name="twitter:image" content="${img}"/>
  <meta http-equiv="refresh" content="0;url=${url}"/>
  <script>window.location.replace("${url}");</script>
</head>
<body><p><a href="${url}">${t}</a></p></body>
</html>`;
}

export async function onRequest(context) {
  const { request, params, env } = context;
  const userAgent = request.headers.get('user-agent') || '';

  if (!isBot(userAgent)) {
    return context.next();
  }

  const slug = params.slug;
  const backendUrl = (env.REACT_APP_BACKEND_URL || 'https://audy-cook-backend.onrender.com').replace(/\/$/, '');
  const articleUrl = `${SITE_URL}/blog/${slug}`;

  // Fetch article with a 6-second timeout so Render cold-starts don't hang the crawler
  let post = null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`${backendUrl}/api/blog/${slug}`, {
      signal: controller.signal,
      cf: { cacheTtl: 600, cacheEverything: true },
    });
    clearTimeout(timer);
    if (res.ok) post = await res.json();
  } catch {
    // Backend unreachable (cold start timeout) — serve branded fallback below
  }

  const title = post?.title?.fr || post?.title?.en || 'AUDY COOK';
  const rawExcerpt = post?.excerpt?.fr || post?.excerpt?.en || post?.body?.fr || post?.body?.en || DEFAULT_DESC;
  const description = stripHtml(rawExcerpt) || DEFAULT_DESC;
  const image = post?.cover_image || DEFAULT_IMAGE;

  const html = buildHtml({ title, description, image, articleUrl });

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=600',
    },
  });
}
