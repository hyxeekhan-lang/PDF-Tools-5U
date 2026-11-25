import { readFile, writeFile } from 'node:fs/promises'

for (const file of ['.env', '.env.local', '.env.production', '.env.production.local']) {
  try {
    const contents = await readFile(file, 'utf8')
    for (const line of contents.split(/\r?\n/)) {
      const match = line.match(/^\s*(PUBLIC_SITE_URL|VITE_PUBLIC_SITE_URL)\s*=\s*(.*?)\s*$/)
      if (!match) continue
      const value = match[2].replace(/^(['"])(.*)\1$/, '$2')
      if (value) process.env.PUBLIC_SITE_URL ||= value
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}

const configuredUrl = process.env.PUBLIC_SITE_URL ?? process.env.VITE_PUBLIC_SITE_URL
if (!configuredUrl) {
  console.warn('PUBLIC_SITE_URL is unset; sitemap generation skipped. Set it before a production build.')
  process.exit(0)
}

const parsed = new URL(configuredUrl)
if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('PUBLIC_SITE_URL must use HTTP or HTTPS.')
const baseUrl = parsed.origin
const source = await readFile('src/lib/tools.ts', 'utf8')
const toolEntries = [...source.matchAll(/slug:\s*'([^']+)'(?:(?!slug:\s*')[\s\S])*?status:\s*'(working|soon)'/g)]
  .map((match) => ({ slug: match[1], status: match[2] }))
const redirectsBlock = source.match(/export const TOOL_REDIRECTS:[^{]+\{([\s\S]*?)\n\}/)?.[1] ?? ''
const aliases = new Set([...redirectsBlock.matchAll(/'([^']+)':/g)].map((match) => match[1]))
const blogSource = await readFile('src/lib/blog.ts', 'utf8')
const blogSlugs = [...blogSource.matchAll(/^\s{4}slug:\s*'([^']+)'/gm)].map((match) => match[1])
const legalSource = await readFile('src/routes/legal.$page.tsx', 'utf8')
const legalSlugs = [...legalSource.matchAll(/^\s{2}([a-z]+): \{/gm)].map((match) => match[1])
const pages = [
  '/',
  '/about',
  '/contact',
  '/help',
  '/blog',
  '/tools',
  ...legalSlugs.map((slug) => `/legal/${slug}`),
  ...blogSlugs.map((slug) => `/blog/${slug}`),
  ...toolEntries
    .filter(({ status, slug }) => status === 'working' && !aliases.has(slug))
    .map(({ slug }) => `/tools/${slug}`),
]
const urls = [...new Set(pages)].map((path) => `  <url><loc>${baseUrl}${path}</loc></url>`).join('\n')
await writeFile('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, 'utf8')
await writeFile('public/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`, 'utf8')

const publisherId = (process.env.ADSENSE_PUBLISHER_ID ?? process.env.VITE_ADSENSE_PUBLISHER_ID)?.trim()
if (publisherId) {
  if (!/^pub-\d{16}$/.test(publisherId)) throw new Error('ADSENSE_PUBLISHER_ID must use the format pub- followed by 16 digits.')
  await writeFile('public/ads.txt', `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`, 'utf8')
} else await writeFile('public/ads.txt', '# Google AdSense is disabled until a verified publisher ID is configured.\n', 'utf8')
