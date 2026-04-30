const SOCIAL_BOTS = [
  'facebookexternalhit', 'facebot', 'twitterbot', 'whatsapp',
  'linkedinbot', 'slackbot', 'telegrambot', 'discordbot',
  'pinterest', 'w3c_validator', 'iframely', 'embedly',
];

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

export async function onRequest(context) {
  const { request, params, env } = context;
  const userAgent = request.headers.get('user-agent') || '';

  // Non-bots get the React SPA directly
  if (!isBot(userAgent)) {
    return context.next();
  }

  const slug = params.slug;
  const backendUrl = env.REACT_APP_BACKEND_URL || 'https://audy-cook-backend.onrender.com';
  const siteUrl = 'https://audy-cook.pages.dev';

  let post;
  try {
    const res = await fetch(`${backendUrl}/api/blog/${slug}`, {
      cf: { cacheTtl: 300 }, // cache 5 min at edge
    });
    if (!res.ok) return context.next();
    post = await res.json();
  } catch {
    return context.next();
  }

  const title = esc(post.title?.fr || post.title?.en || 'AUDY COOK');
  const rawExcerpt = post.excerpt?.fr || post.excerpt?.en || post.body?.fr || post.body?.en || '';
  const description = esc(stripHtml(rawExcerpt));
  const image = esc(post.cover_image || '');
  const articleUrl = esc(`${siteUrl}/blog/${slug}`);

  const html = `<!DOCTYPE html>
<html lang="fr" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="utf-8"/>
  <title>${title} – AUDY COOK</title>
  <meta name="description" content="${description}"/>
  <meta property="og:type" content="article"/>
  <meta property="og:site_name" content="AUDY COOK"/>
  <meta property="og:locale" content="fr_FR"/>
  <meta property="og:title" content="${title}"/>
  <meta property="og:description" content="${description}"/>
  <meta property="og:image" content="${image}"/>
  <meta property="og:image:secure_url" content="${image}"/>
  <meta property="og:image:type" content="image/jpeg"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:image:alt" content="${title}"/>
  <meta property="og:url" content="${articleUrl}"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${title}"/>
  <meta name="twitter:description" content="${description}"/>
  <meta name="twitter:image" content="${image}"/>
  <meta http-equiv="refresh" content="0;url=${articleUrl}"/>
  <script>window.location.replace("${articleUrl}");</script>
</head>
<body><p><a href="${articleUrl}">${title}</a></p></body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
