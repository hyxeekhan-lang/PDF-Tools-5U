export function PageShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string
  title: string
  intro?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <section className="hero-glow border-b border-line">
        <div className="animate-fade-up mx-auto max-w-3xl px-5 pt-16 pb-12 md:pt-20">
          {eyebrow && <p className="text-sm font-semibold tracking-wide text-accent uppercase">{eyebrow}</p>}
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-balance md:text-5xl">{title}</h1>
          {intro && <p className="mt-5 text-lg leading-relaxed text-muted">{intro}</p>}
        </div>
      </section>
      <div className="mx-auto max-w-3xl px-5 py-14 md:py-16">{children}</div>
    </div>
  )
}

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5 text-[17px] leading-relaxed text-ink/85 [&_a]:font-semibold [&_a]:text-accent [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-ink [&_ul]:ms-5 [&_ul]:list-disc [&_ul]:space-y-2">
      {children}
    </div>
  )
}
