import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth";

const SESSION_COOKIE = "cf_session";
const PUBLIC_PATHS = new Set(["/login", "/register"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const isPublic = PUBLIC_PATHS.has(pathname);

  // Redirect unauthenticated visitors away from private pages.
  if (!session && !isPublic) {
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Logged-in users should not land on auth pages.
  if (session && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Logged-in users land on the dashboard instead of the marketing page.
  if (session && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Multi-tenant subdomain hint: slug.churchflow.app -> x-church-slug
  const hostname = (request.headers.get("host") ?? "").split(":")[0];
  const parts = hostname.split(".");
  const response = NextResponse.next();
  if (parts.length >= 3) {
    response.headers.set("x-church-slug", parts[0]);
  }
  return response;
}

export const config = {
  matcher:
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
};
