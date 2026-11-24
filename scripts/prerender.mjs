import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import app from '../dist/server/index.js'

const siteUrl = process.env.PUBLIC_SITE_URL ?? 'https://pdfpilot5u.vercel.app'
const routeFiles = await readdir('src/routes')
const staticPaths = routeFiles
  .filter((file) => file.endsWith('.tsx') && file !== '__root.tsx' && !file.includes('$'))
  .map((file) => {
    const route = file.slice(0, -4).replace(/\.index$/, '')
    return route === 'index' ? '/' : `/${route.replaceAll('.', '/')}`
  })

const toolsSource = await readFile('src/lib/tools.ts', 'utf8')
const blogSource = await readFile('src/lib/blog.ts', 'utf8')
const legalSource = await readFile('src/routes/legal.$page.tsx', 'utf8')
const redirectsBlock = toolsSource.match(/export const TOOL_REDIRECTS:[^{]+\{([\s\S]*?)\n\}/)?.[1] ?? ''
const aliases = new Set([...redirectsBlock.matchAll(/'([^']+)':/g)].map((match) => match[1]))
const toolSlugs = [...toolsSource.matchAll(/slug:\s*'([^']+)'/g)]
  .map((match) => match[1])
  .filter((slug) => !aliases.has(slug))
const blogSlugs = [...blogSource.matchAll(/^\s{4}slug:\s*'([^']+)'/gm)].map((match) => match[1])
const legalSlugs = [...legalSource.matchAll(/^\s{2}([a-z]+): \{/gm)].map((match) => match[1])
const paths = new Set([
  ...staticPaths,
  ...toolSlugs.map((slug) => `/tools/${slug}`),
  ...blogSlugs.map((slug) => `/blog/${slug}`),
  ...legalSlugs.map((slug) => `/legal/${slug}`),
])

for (const path of paths) {
  const response = await app.fetch(new Request(new URL(path, siteUrl)))
  if (!response.ok) throw new Error(`SSR failed for ${path}: ${response.status}`)
  const destination = join('dist/client', path === '/' ? 'index.html' : `${path.slice(1)}.html`)
  await mkdir(dirname(destination), { recursive: true })
  await writeFile(destination, await response.text())
}

console.log(`Prerendered ${paths.size} routes.`)
