import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const NO_AGE_CHECK_ROUTES = [
  "/age",
  "/api/auth",
];

const PUBLIC_ROUTES = [
  "/",
  "/welcome",
  "/about",
  "/signin",
  "/signup",
];

const AUTH_REQUIRED_ROUTES = [
  "/feed",
  "/profile",
];

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);

  // Always allow age confirmation page and auth API
  if (NO_AGE_CHECK_ROUTES.some(route => url.pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check age confirmation cookie FIRST for all routes
  const hasAgeCookie = req.cookies.get("over18")?.value === "yes";
  if (!hasAgeCookie) {
    return NextResponse.redirect(new URL("/age", url));
  }

  // After age check passes, allow public routes
  if (PUBLIC_ROUTES.some(route => url.pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  if (AUTH_REQUIRED_ROUTES.some(route => url.pathname.startsWith(route))) {
    const sessionToken = req.cookies.get("authjs.session-token")?.value ||
                         req.cookies.get("__Secure-authjs.session-token")?.value;

    if (!sessionToken) {
      return NextResponse.redirect(new URL("/signin", url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|logo.png|assets|public).*)"],
};
