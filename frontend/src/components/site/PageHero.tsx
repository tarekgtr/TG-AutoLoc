import type { ReactNode } from "react";

/** Compact dark banner used at the top of inner pages. */
export function PageHero({ eyebrow, title, subtitle, children }: { eyebrow?: string; title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-ink-900 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -end-24 -top-24 h-72 w-72 rounded-full bg-brand-400/10 blur-3xl"
      />
      <div className="container relative py-12 sm:py-16">
        {eyebrow && <p className="eyebrow text-brand-400">{eyebrow}</p>}
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-white/70">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
