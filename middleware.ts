import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

function isPublicPath(pathname: string): boolean {
  if (pathname === "/auth/login") return true;
  if (pathname === "/api/auth/login") return true;
  if (pathname === "/api/auth/logout") return true;
  return false;
}

function unauthorized(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const loginUrl = new URL("/auth/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    /\.(?:ico|png|jpg|jpeg|svg|gif|webp)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (isPublicPath(pathname)) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (pathname === "/auth/login" && token) {
      try {
        await verifySessionToken(token);
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } catch {
        // invalid or expired session: show login
      }
    }
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return unauthorized(request);
  }

  try {
    await verifySessionToken(token);
    return NextResponse.next();
  } catch {
    return unauthorized(request);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
