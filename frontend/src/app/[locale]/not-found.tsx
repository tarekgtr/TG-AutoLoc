import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-ink-900 px-6 text-center text-white">
      <Link href="/" aria-label="TG AutoLoc" className="rounded-full">
        <Logo size={120} />
      </Link>
      <p className="mt-8 font-display text-6xl font-extrabold text-brand-400">404</p>
      <h1 className="mt-3 text-2xl font-bold">{t("title")}</h1>
      <p className="mt-2 max-w-md text-white/70">{t("text")}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">
          {t("back")}
        </Link>
        <Link href="/cars" className="btn-outline-light">
          {t("seeCars")}
        </Link>
      </div>
    </main>
  );
}
