import { NextRequest, NextResponse } from "next/server";

let locales = ["en", "nl"];

// Get the preferred locale, similar to the above or using a library
function getLocale(request: NextRequest) {
  return "en";
}

// Check if the path requires authentication
function requiresAuth(pathname: string): boolean {
  const publicPaths = [
    "/sign-in",
    "/sign-up",
    "/oauth2/success",
    "/oauth2/error",
    "/api/auth/sign-in",
    "/api/auth/sign-up",
    "/api/auth/refresh",
  ];

  return !publicPaths.some((path) => pathname.includes(path));
}

// Check if user is authenticated by looking for tokens in cookies
function isAuthenticated(request: NextRequest): boolean {
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  return !!(accessToken && refreshToken);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if there is any supported locale in the pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Handle locale redirects
  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    const newUrl = new URL(request.url);
    newUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(newUrl);
  }

  // Extract the path without locale for authentication checks
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "");

  // Check if the path requires authentication
  if (requiresAuth(pathWithoutLocale)) {
    // Check if user is authenticated
    if (!isAuthenticated(request)) {
      // Redirect to sign-in page
      const locale = getLocale(request);
      const signInUrl = new URL(request.url);
      signInUrl.pathname = `/${locale}/sign-in`;
      return NextResponse.redirect(signInUrl);
    }
  } else {
    // For public paths like sign-in, if user is already authenticated, redirect to home
    if (
      isAuthenticated(request) &&
      (pathWithoutLocale === "/sign-in" || pathWithoutLocale === "/sign-up")
    ) {
      const locale = getLocale(request);
      const homeUrl = new URL(request.url);
      homeUrl.pathname = `/${locale}`;
      return NextResponse.redirect(homeUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    "/((?!_next).*)",
    // Optional: only run on root (/) URL
    // '/'
  ],
};
