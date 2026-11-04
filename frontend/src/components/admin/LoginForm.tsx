"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Logo } from "@/components/Logo";
import { Field } from "@/components/admin/Field";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { api, ApiError } from "@/lib/api/client";

export function LoginForm() {
  const t = useTranslations("admin");
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already signed in: go straight to the dashboard.
  useEffect(() => {
    api.get("/api/auth/me").then(() => router.replace("/admin"), () => undefined);
  }, [router]);

  const notice = params.get("expired") ? t("login.sessionExpired") : params.get("loggedOut") ? t("login.loggedOut") : null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/api/auth/login", { username: username.trim(), password });
      router.replace("/admin");
    } catch (err) {
      const code = err instanceof ApiError ? err.code : "generic";
      setError(t.has(`errors.${code}`) ? t(`errors.${code}`) : t("errors.generic"));
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-ink-950 bg-[radial-gradient(ellipse_at_top,theme(colors.ink.800),transparent_60%)] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
            <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
            {t("login.backToSite")}
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-2xl sm:p-10">
          <div className="flex flex-col items-center text-center">
            <Logo size={112} priority />
            <h1 className="mt-6 text-2xl font-extrabold text-ink-900">{t("login.title")}</h1>
            <p className="mt-2 text-sm text-ink-600">{t("login.subtitle")}</p>
          </div>

          {notice && !error && (
            <p role="status" className="mt-6 rounded-xl bg-brand-50 px-4 py-3 text-sm text-ink-800">
              {notice}
            </p>
          )}
          {error && (
            <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-5" noValidate>
            <Field id="username" label={t("login.username")} required>
              <input
                className="input"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                maxLength={50}
                dir="ltr"
              />
            </Field>
            <div>
              <label htmlFor="password" className="label">
                {t("login.password")}
                <span className="text-red-600" aria-hidden="true">
                  {" "}
                  *
                </span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  className="input pe-12"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-required
                  maxLength={128}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")}
                  aria-controls="password"
                  aria-pressed={showPassword}
                  className="absolute end-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full py-3.5" disabled={submitting || !username || !password}>
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <LogIn className="h-5 w-5 rtl:-scale-x-100" aria-hidden="true" />}
              {submitting ? t("login.submitting") : t("login.submit")}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
