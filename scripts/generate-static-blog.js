#!/usr/bin/env node

/**
 * Post-build script that generates static HTML for every blog post and the
 * blog index from the Markdown source files.  Produces sitemap.xml and rss.xml.
 *
 * Runs after `react-scripts build` so it can reuse the built index.html
 * (which already contains the hashed CSS/JS bundles) as a template.
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const BUILD_DIR = path.join(__dirname, '..', 'build');
const POSTS_DIR = path.join(BUILD_DIR, 'posts');
const SITE_URL = 'https://caskeycoding.com';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readingTime(text) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function stripMarkdown(md) {
  return md
    .replace(/^---[\s\S]*?---/m, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/\|/g, ' ')
    .replace(/^[-:| ]+$/gm, '')
    .replace(/\n{2,}/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00Z');
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function toRFC822(dateStr) {
  const d = new Date(dateStr + 'T12:00:00Z');
  return d.toUTCString();
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

// ---------------------------------------------------------------------------
// Configure marked
// ---------------------------------------------------------------------------

const renderer = new marked.Renderer();

const originalHeading = renderer.heading;
renderer.heading = function ({ tokens, depth }) {
  const text = this.parser.parseInline(tokens);
  const id = slugify(text);
  return `<h${depth} id="${id}">${text}</h${depth}>\n`;
};

marked.use({ renderer, gfm: true, breaks: false });

// ---------------------------------------------------------------------------
// Embedded CSS for static pages (sb- prefix avoids collisions with React)
// ---------------------------------------------------------------------------

const STATIC_CSS = `
<style id="sb-styles">
.sb{font-family:'Inter','Segoe UI','Roboto',Arial,sans-serif;color:#222;min-height:100vh;display:flex;flex-direction:column;background:#f7f9fb}
.sb-nav{background:#fff;border-bottom:1px solid #e2e8f0;padding:12px 0;position:sticky;top:0;z-index:100;box-shadow:0 1px 3px rgba(0,0,0,.02)}
.sb-nav-inner{max-width:900px;margin:0 auto;padding:0 24px;display:flex;justify-content:space-between;align-items:center}
.sb-nav a{color:#003366;text-decoration:none;font-weight:500}
.sb-nav a:hover{color:#F5A623}
.sb-nav-links{display:flex;gap:24px}
.sb-main{max-width:900px;margin:0 auto;padding:48px 24px;flex:1;width:100%;box-sizing:border-box}
.sb-back{color:#003366;text-decoration:none;display:inline-block;margin-bottom:24px;font-size:.95rem}
.sb-back:hover{color:#F5A623}
.sb-post{background:#fff;border:1px solid #f1f5f9;border-radius:8px;padding:40px}
.sb-post h1{color:#003366;font-weight:600;font-size:2rem;line-height:1.3;margin:0 0 16px}
.sb-meta{display:flex;align-items:center;gap:12px;color:#64748b;font-size:.875rem;margin-bottom:32px;flex-wrap:wrap}
.sb-dot{width:4px;height:4px;border-radius:50%;background:#cbd5e1;display:inline-block}
.sb-content{line-height:1.8;font-size:1.1rem}
.sb-content h2{color:#003366;font-weight:600;font-size:1.5rem;margin:32px 0 16px}
.sb-content h3{color:#003366;font-weight:600;font-size:1.25rem;margin:24px 0 12px}
.sb-content h4{color:#003366;font-weight:600;font-size:1.1rem;margin:20px 0 8px}
.sb-content p{margin-bottom:16px}
.sb-content a{color:#F5A623;font-weight:500;text-decoration:underline;text-underline-offset:3px}
.sb-content blockquote{border-left:3px solid #F5A623;padding:8px 24px;margin:24px 0;background:#fafbfc;border-radius:0 8px 8px 0}
.sb-content ul,.sb-content ol{padding-left:24px;margin-bottom:16px}
.sb-content li{margin-bottom:4px;line-height:1.8}
.sb-content img{max-width:100%;height:auto;border-radius:8px;border:1px solid #e2e8f0;margin:16px 0;display:block}
.sb-content table{width:100%;border-collapse:collapse;font-size:.95rem;margin-bottom:24px}
.sb-content th{text-align:left;padding:12px;border-bottom:2px solid #e2e8f0;font-weight:600;color:#003366;background:#f8fafc}
.sb-content td{padding:12px;border-bottom:1px solid #f1f5f9}
.sb-content pre{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;overflow-x:auto;margin:16px 0;font-size:.9rem}
.sb-content code{font-family:source-code-pro,Menlo,Monaco,Consolas,monospace;font-size:.9em}
.sb-content p code,.sb-content li code,.sb-content td code{background:#f1f5f9;color:#0f172a;padding:2px 6px;border-radius:4px}
.sb-content hr{border:none;border-top:1px solid #e2e8f0;margin:32px 0}
.sb-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:32px;padding-top:24px;border-top:1px solid #f1f5f9}
.sb-tag{background:rgba(245,166,35,.06);color:#F5A623;font-weight:500;font-size:.8rem;border-radius:4px;padding:4px 8px;border:1px solid rgba(245,166,35,.12)}
.sb-footer{background:#fff;border-top:1px solid #e2e8f0;padding:24px;text-align:center;color:#64748b;font-size:.875rem}
.sb-card{background:#fff;border:1px solid #f1f5f9;border-radius:8px;padding:32px;margin-bottom:24px;transition:all .3s ease}
.sb-card:hover{border-color:#e2e8f0;box-shadow:0 4px 16px rgba(0,0,0,.04)}
.sb-card h2{margin:0 0 16px;line-height:1.3}
.sb-card h2 a{color:#003366;text-decoration:none;font-weight:600;font-size:1.5rem}
.sb-card h2 a:hover{color:#F5A623}
.sb-card-excerpt{color:#222;line-height:1.7;margin-bottom:24px}
.sb-read-more{color:#F5A623;text-decoration:none;font-weight:500;margin-left:8px}
.sb-index-title{color:#003366;font-weight:700;text-align:center;font-size:2.5rem;margin-bottom:48px}
@media(max-width:600px){.sb-post{padding:20px}.sb-main{padding:24px 16px}.sb-nav-links{gap:12px;font-size:.85rem}}
</style>`;

// ---------------------------------------------------------------------------
// HTML fragments
// ---------------------------------------------------------------------------

function navHtml() {
  return `
<nav class="sb-nav" aria-label="Main navigation">
  <div class="sb-nav-inner">
    <a href="/" style="font-size:1.25rem;font-weight:600">Eric Caskey</a>
    <div class="sb-nav-links">
      <a href="/">Home</a>
      <a href="/ericcaskey">Case Studies</a>
      <a href="/profile">Profile</a>
      <a href="/blog">Blog</a>
    </div>
  </div>
</nav>`;
}

function footerHtml() {
  const year = new Date().getFullYear();
  return `<footer class="sb-footer">&copy; ${year} Eric Caskey. All rights reserved.</footer>`;
}

// ---------------------------------------------------------------------------
// Template manipulation
// ---------------------------------------------------------------------------

function setMeta(html, { title, description, url, type }) {
  const fullTitle = title && title !== 'Blog'
    ? `${title} | Blog | Eric Caskey`
    : 'Blog | Eric Caskey';

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(fullTitle)}</title>`);

  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${esc(description)}" />`
  );

  // Canonical
  const canonical = `<link rel="canonical" href="${esc(url)}" />`;
  html = html.replace('</head>', `  ${canonical}\n</head>`);

  // Open Graph
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${esc(title ? `${title} | Eric Caskey` : 'Blog | Eric Caskey')}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${esc(description)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${esc(url)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:type" content="${esc(type || 'article')}" />`
  );

  // Twitter
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${esc(title ? `${title} | Eric Caskey` : 'Blog | Eric Caskey')}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${esc(description)}" />`
  );

  return html;
}

function injectContent(html, bodyHtml) {
  // Replace the empty #root div with one containing pre-rendered content
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${bodyHtml}</div>`
  );

  // Replace the unhelpful noscript with the static content note
  html = html.replace(
    /<noscript>[^<]*<\/noscript>/,
    '<noscript>This page works without JavaScript. Enable JavaScript for interactive features.</noscript>'
  );

  // Insert static CSS before </head>
  html = html.replace('</head>', `${STATIC_CSS}\n</head>`);

  return html;
}

// ---------------------------------------------------------------------------
// Page generators
// ---------------------------------------------------------------------------

function generatePostPage(template, post) {
  const url = `${SITE_URL}/blog/${post.slug}/`;
  let html = setMeta(template, {
    title: post.title,
    description: post.description,
    url,
    type: 'article',
  });

  // Strip the leading # title from markdown since the template renders it separately
  const contentWithoutTitle = post.content.trimStart().replace(/^#\s+.+\n*/, '');
  const contentHtml = marked.parse(contentWithoutTitle);
  const minutes = readingTime(post.content);
  const date = formatDate(post.date);
  const tags = (post.tags || [])
    .map((t) => `<span class="sb-tag">${esc(t)}</span>`)
    .join('');

  const body = `
<div class="sb">
  ${navHtml()}
  <div class="sb-main">
    <a href="/blog" class="sb-back">&larr; Back to Blog</a>
    <article class="sb-post" itemscope itemtype="https://schema.org/BlogPosting">
      <h1 itemprop="headline">${esc(post.title)}</h1>
      <div class="sb-meta">
        <span itemprop="author" itemscope itemtype="https://schema.org/Person">
          <span itemprop="name">By Eric Caskey</span>
        </span>
        <span class="sb-dot"></span>
        <time datetime="${esc(post.date)}" itemprop="datePublished">${date}</time>
        <span class="sb-dot"></span>
        <span>${minutes} min read</span>
      </div>
      <div class="sb-content" itemprop="articleBody">
        ${contentHtml}
      </div>
      ${tags ? `<div class="sb-tags">${tags}</div>` : ''}
    </article>
  </div>
  ${footerHtml()}
</div>`;

  html = injectContent(html, body);

  // Add JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { '@type': 'Person', name: 'Eric Caskey' },
    url,
  };
  html = html.replace(
    '</head>',
    `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n</head>`
  );

  return html;
}

function generateIndexPage(template, posts) {
  const url = `${SITE_URL}/blog/`;
  const description =
    'Blog by Eric Caskey — Architecting microservice platforms, observability, change-safe rollouts, and infrastructure reliability at scale.';

  let html = setMeta(template, {
    title: 'Blog',
    description,
    url,
    type: 'website',
  });

  const cards = posts
    .map((post) => {
      const excerpt = post.description || stripMarkdown(post.content).slice(0, 200);
      const date = formatDate(post.date);
      const minutes = readingTime(post.content);
      const tags = (post.tags || [])
        .map((t) => `<span class="sb-tag">${esc(t)}</span>`)
        .join('');

      return `
    <div class="sb-card">
      <h2><a href="/blog/${esc(post.slug)}/">${esc(post.title)}</a></h2>
      <div class="sb-meta">
        <span>By Eric Caskey</span>
        <span class="sb-dot"></span>
        <time datetime="${esc(post.date)}">${date}</time>
        <span class="sb-dot"></span>
        <span>${minutes} min read</span>
      </div>
      <p class="sb-card-excerpt">
        ${esc(excerpt.length > 200 ? excerpt.slice(0, 200) + '…' : excerpt)}
        <a href="/blog/${esc(post.slug)}/" class="sb-read-more">Read more &rarr;</a>
      </p>
      ${tags ? `<div class="sb-tags">${tags}</div>` : ''}
    </div>`;
    })
    .join('\n');

  const body = `
<div class="sb">
  ${navHtml()}
  <div class="sb-main">
    <h1 class="sb-index-title">Blog</h1>
    ${cards}
  </div>
  ${footerHtml()}
</div>`;

  html = injectContent(html, body);
  return html;
}

function generateSitemap(posts) {
  const urls = [
    { loc: `${SITE_URL}/`, priority: '1.0' },
    { loc: `${SITE_URL}/blog/`, priority: '0.9' },
    { loc: `${SITE_URL}/ericcaskey/`, priority: '0.8' },
    { loc: `${SITE_URL}/profile/`, priority: '0.7' },
    ...posts.map((p) => ({
      loc: `${SITE_URL}/blog/${p.slug}/`,
      lastmod: p.date,
      priority: '0.8',
    })),
  ];

  const entries = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${escXml(u.loc)}</loc>${
          u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''
        }\n    <priority>${u.priority}</priority>\n  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

function generateRSS(posts) {
  const items = posts
    .slice(0, 20)
    .map(
      (p) => `    <item>
      <title>${escXml(p.title)}</title>
      <link>${SITE_URL}/blog/${escXml(p.slug)}/</link>
      <guid>${SITE_URL}/blog/${escXml(p.slug)}/</guid>
      <description>${escXml(p.description)}</description>
      <pubDate>${toRFC822(p.date)}</pubDate>
    </item>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Eric Caskey – Blog</title>
    <link>${SITE_URL}/blog/</link>
    <description>Architecting microservice platforms, observability, change-safe rollouts, and infrastructure reliability at scale.</description>
    <language>en-us</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  if (!fs.existsSync(BUILD_DIR)) {
    console.error('build/ not found — run "npm run build" first.');
    process.exit(1);
  }

  if (!fs.existsSync(POSTS_DIR)) {
    console.warn('No posts/ directory in build — skipping static blog generation.');
    return;
  }

  const template = fs.readFileSync(path.join(BUILD_DIR, 'index.html'), 'utf8');

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));
  if (files.length === 0) {
    console.warn('No .md files found in build/posts/ — skipping.');
    return;
  }

  const posts = files
    .map((filename) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, filename), 'utf8');
      const { data, content } = matter(raw);
      if (!data.title || !data.slug) {
        console.warn(`Skipping ${filename}: missing title or slug in frontmatter.`);
        return null;
      }
      return { ...data, content, filename };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  console.log(`Generating static blog for ${posts.length} posts…`);

  // Individual post pages
  for (const post of posts) {
    const dir = path.join(BUILD_DIR, 'blog', post.slug);
    mkdirp(dir);
    const html = generatePostPage(template, post);
    fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
    console.log(`  ✓ /blog/${post.slug}/`);
  }

  // Blog index
  mkdirp(path.join(BUILD_DIR, 'blog'));
  const indexHtml = generateIndexPage(template, posts);
  fs.writeFileSync(path.join(BUILD_DIR, 'blog', 'index.html'), indexHtml, 'utf8');
  console.log('  ✓ /blog/');

  // Sitemap
  fs.writeFileSync(
    path.join(BUILD_DIR, 'sitemap.xml'),
    generateSitemap(posts),
    'utf8'
  );
  console.log('  ✓ /sitemap.xml');

  // RSS
  fs.writeFileSync(path.join(BUILD_DIR, 'rss.xml'), generateRSS(posts), 'utf8');
  console.log('  ✓ /rss.xml');

  console.log('Static blog generation complete.');
}

main();
