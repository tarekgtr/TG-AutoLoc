import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/Logo";
import { PageHero } from "@/components/site/PageHero";
import { alternates } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("aboutTitle"),
    description: t("aboutDescription"),
    alternates: alternates(locale, "/about"),
  };
}

/** Content lives in messages/fr.json and messages/ar.json ("about" section) so it can be edited without code changes. */
export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tHero] = await Promise.all([getTranslations("about"), getTranslations("hero")]);
  const steps = [1, 2, 3].map((n) => ({ n, title: t(`step${n}Title`), text: t(`step${n}Text`) }));

  return (
    <>
      <PageHero eyebrow="TG AutoLoc" title={t("title")} subtitle={t("lead")} />

      <section className="section bg-white">
        <div className="container grid items-center gap-12 lg:grid-cols-[1fr_auto]">
          <div className="max-w-2xl space-y-5 text-lg leading-relaxed text-ink-700">
            <p>{t("p1")}</p>
            <p>{t("p2")}</p>
          </div>
          <div className="mx-auto">
            <Logo size={220} />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="how-title">
        <div className="container">
          <h2 id="how-title" className="text-3xl font-extrabold text-ink-900">
            {t("howTitle")}
          </h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <li key={s.n} className="card p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-400 font-display text-lg font-extrabold text-ink-900">
                  {s.n}
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{s.text}</p>
              </li>
            ))}
          </ol>

          <div className="mt-14 flex flex-col items-start justify-between gap-6 rounded-3xl bg-ink-900 p-8 text-white sm:flex-row sm:items-center sm:p-10">
            <div>
              <h2 className="text-2xl font-extrabold">{t("ctaTitle")}</h2>
              <p className="mt-2 text-white/70">{t("ctaText")}</p>
            </div>
            <Link href="/cars" className="btn-primary">
              {tHero("ctaCars")}
              <ArrowRight className="h-5 w-5 rtl:-scale-x-100" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
