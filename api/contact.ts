import type { IncomingMessage, ServerResponse } from 'node:http'

type RequestWithBody = IncomingMessage & { body?: unknown }
type ResponseLike = ServerResponse & { status?: (code: number) => ResponseLike; json?: (body: unknown) => ResponseLike }
const limits = new Map<string, { count: number; resetAt: number }>()

function reply(res: ResponseLike, status: number, body: Record<string, unknown>) {
  if (res.status && res.json) {
    const response = res.status(status)
    response.json?.(body)
    return response
  }
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
  return res
}

export default async function contact(req: RequestWithBody, res: ResponseLike) {
  if (req.method !== 'POST') return reply(res, 405, { error: 'Method not allowed.' })
  const ip = String(req.headers['x-forwarded-for'] ?? req.headers['x-real-ip'] ?? 'unknown').split(',')[0].trim()
  const now = Date.now()
  const current = limits.get(ip)
  if (!current || current.resetAt <= now) limits.set(ip, { count: 1, resetAt: now + 60_000 })
  else if (current.count >= 5) return reply(res, 429, { error: 'Too many messages. Please try again later.' })
  else current.count += 1

  const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>
  if (String(body.website ?? '').trim()) return reply(res, 400, { error: 'Unable to submit this message.' })
  const name = String(body.name ?? '').trim()
  const email = String(body.email ?? '').trim()
  const topic = String(body.topic ?? 'Website enquiry').trim()
  const message = String(body.message ?? '').trim()
  if (!name || name.length > 100 || !/^\S+@\S+\.\S+$/.test(email) || email.length > 254 || !message || message.length > 5000) return reply(res, 400, { error: 'Please provide a valid name, email address and message.' })
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return reply(res, 503, { error: 'Contact delivery is not configured yet. Please email hyxeekhan@gmail.com directly.' })
  const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: process.env.CONTACT_FROM_EMAIL ?? 'PDF Pilot 5U <onboarding@resend.dev>', to: [process.env.CONTACT_TO_EMAIL ?? 'hyxeekhan@gmail.com'], reply_to: email, subject: `[PDF Pilot 5U] ${topic}`, text: `Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}` }) })
  if (!response.ok) return reply(res, 502, { error: 'Message delivery failed. Please try again or email us directly.' })
  return reply(res, 200, { ok: true })
}
