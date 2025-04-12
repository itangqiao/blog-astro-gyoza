const robotsTxt = `
User-agent: *
Allow: /

Disallow: /_astro/
Disallow: /fonts/

Sitemap: ${new URL('sitemap-index.xml', import.meta.env.SITE).href}
`.trim()
export const GET = () => {
  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
//# sourceMappingURL=robots.txt.js.map
