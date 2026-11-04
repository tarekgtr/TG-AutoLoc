import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/** Matches /admin, /admin/..., /ar/admin/... and captures the locale prefix and sub-path. */
const ADMIN_PATH = /^(?:\/(fr|ar))?\/admin(\/.*)?$/;
const SESSION_COOKIE = "TGSESSION";

/**
 * UX convenience only: visitors without a session cookie are sent to the login page before the
 * admin shell renders. Real authorization is enforced by Spring Security on every /api/admin call.
 */
export default function middleware(request: NextRequest) {
  const match = request.nextUrl.pathname.match(ADMIN_PATH);
  if (match) {
    const [, locale, rest = ""] = match;
    const isLogin = rest === "/login" || rest.startsWith("/login/");
    if (!isLogin && !request.cookies.has(SESSION_COOKIE)) {
      const prefix = locale && locale !== routing.defaultLocale ? `/${locale}` : "";
      const url = request.nextUrl.clone();
      url.pathname = `${prefix}/admin/login`;
      url.search = "";
      return NextResponse.redirect(url);
    }
  }
  return intlMiddleware(request);
}

export const config = {
  // Everything except the API proxy, Next internals and files with an extension (images, robots.txt, ...).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
