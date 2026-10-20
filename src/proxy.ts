// Locale routing. English (the US store's default, user 2026-10-13) is served at the unprefixed URL and Chinese under /zh;
// both are rendered from app/[lang].
//   /collections/tea     → rewritten to /en/collections/tea (the URL in the browser does not change)
//   /zh/collections/tea  → served as is
//   /en/collections/tea  → redirected to /collections/tea so the English page has one address (old /en links keep working)
// No Accept-Language redirect: the language is changed only with the switch in the header.
// Self-hosted `next start` runs the proxy a second time on the rewritten /en/… path (Vercel does not), which then redirected back to
// the unprefixed URL in a loop (found by the checkout tests, 2026-10-14). The rewrite marks its request so that second pass serves it.
import { NextResponse, type NextRequest } from "next/server";

const REWRITTEN = "x-cv-locale-rewrite";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/zh" || pathname.startsWith("/zh/")) return NextResponse.next();
  const url = request.nextUrl.clone();
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    if (!process.env.VERCEL && request.headers.get(REWRITTEN) === "1") return NextResponse.next();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }
  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  const headers = new Headers(request.headers); headers.set(REWRITTEN, "1");
  return NextResponse.rewrite(url, { request: { headers } });
}

// Skip API routes, Next internals, public media and any path with a file extension (sitemap.xml, icon.svg, …).
export const config = { matcher: ["/((?!api|_next|media|brand|.*\\..*).*)"] };
