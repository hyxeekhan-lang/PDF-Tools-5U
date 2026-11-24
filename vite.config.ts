import { whop } from '@whop/cli/vite'
import { defineConfig, loadEnv } from 'vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { env } from 'node:process'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { Plugin, ViteDevServer } from 'vite'

type AiRequest = IncomingMessage & { body?: unknown }
type AiResponse = ServerResponse & {
  status?: (code: number) => AiResponse
  json?: (body: unknown) => AiResponse
}
type AiHandler = (request: AiRequest, response: AiResponse) => Promise<unknown>

function localAiApi(configuredEnv: Record<string, string | undefined>): Plugin {
  return {
    name: 'pdf-pilot-local-ai-api',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      for (const name of [
        'GEMINI_API_KEY',
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY',
        'VITE_SUPABASE_URL',
        'VITE_SUPABASE_ANON_KEY',
      ]) {
        if (!env[name] && configuredEnv[name]) env[name] = configuredEnv[name]
      }

      server.middlewares.use('/api/ai', async (request, response, next) => {
        const req = request as AiRequest
        const res = response as AiResponse

        if (req.method === 'POST') {
          const chunks: Buffer[] = []
          let bytes = 0
          let tooLarge = false

          try {
            for await (const chunk of req) {
              const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
              bytes += buffer.byteLength
              if (bytes > 1_000_000) {
                tooLarge = true
                continue
              }
              chunks.push(buffer)
            }
          } catch (error) {
            next(error instanceof Error ? error : new Error('Could not read the AI request body.'))
            return
          }

          if (tooLarge) {
            res.statusCode = 413
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ error: 'The AI request body is too large.' }))
            return
          }

          const rawBody = Buffer.concat(chunks).toString('utf8')
          try {
            req.body = rawBody ? JSON.parse(rawBody) : undefined
          } catch {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ error: 'The request body must be valid JSON.' }))
            return
          }
        }

        try {
          const handlerUrl = pathToFileURL(resolve(server.config.root, 'api/ai.ts')).href
          const { default: handler } = await import(handlerUrl) as { default: AiHandler }
          await handler(req, res)
        } catch (error) {
          next(error instanceof Error ? error : new Error('The local AI endpoint failed.'))
        }
      })
    },
  }
}

const config = defineConfig(({ mode }) => {
  const configuredEnv = { ...loadEnv(mode, '.', ''), ...env }
  return {
    resolve: { tsconfigPaths: true },
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(configuredEnv.VITE_SUPABASE_URL || configuredEnv.SUPABASE_URL || ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(configuredEnv.VITE_SUPABASE_ANON_KEY || configuredEnv.SUPABASE_ANON_KEY || ''),
      'import.meta.env.VITE_PUBLIC_SITE_URL': JSON.stringify(configuredEnv.VITE_PUBLIC_SITE_URL || configuredEnv.PUBLIC_SITE_URL || ''),
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(configuredEnv.VITE_FIREBASE_API_KEY || ''),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(configuredEnv.VITE_FIREBASE_AUTH_DOMAIN || ''),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(configuredEnv.VITE_FIREBASE_PROJECT_ID || ''),
      'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(configuredEnv.VITE_FIREBASE_STORAGE_BUCKET || ''),
      'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(configuredEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || ''),
      'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(configuredEnv.VITE_FIREBASE_APP_ID || ''),
      'import.meta.env.VITE_FIREBASE_MEASUREMENT_ID': JSON.stringify(configuredEnv.VITE_FIREBASE_MEASUREMENT_ID || ''),
    },
    plugins: [
      localAiApi(configuredEnv),
      whop({ disableTanstackDevtools: true }),
      cloudflare({ viteEnvironment: { name: 'ssr' } }),
      tailwindcss(),
      tanstackStart(),
      viteReact(),
    ],
  }
})

export default config
