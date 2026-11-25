export default function health(_req: Request, res: { status: (code: number) => { json: (body: unknown) => void } }) {
  res.status(200).json({ ok: true, service: 'pdfpilot5u', timestamp: new Date().toISOString() })
}
