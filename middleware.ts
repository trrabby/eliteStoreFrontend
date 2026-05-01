import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { getCurrentUser } from "@/services/auth.service";

// type Role = "CUSTOMER" | "VENDOR" | "ADMIN" | "SUPERADMIN";

// Public routes (no auth required)
const publicRoutes = ["/"];

// Auth routes (redirect to dashboard if already logged in)
const authRoutes = ["/login", "/register"];

// Role-based route patterns
const roleBasedRoutes = {
  CUSTOMER: [/^\/account\/.*/, /^\/cart$/, /^\/checkout$/],
  VENDOR: [/^\/vendor\/.*/],
  ADMIN: [/^\/admin\/.*/],
  SUPERADMIN: [/^\/admin\/.*/],
};

// ✅ i18n middleware instance
const intlMiddleware = createMiddleware({
  locales: ["en", "bn"],
  defaultLocale: "en",
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Run i18n FIRST (critical)
  const intlResponse = intlMiddleware(request);

  // If i18n already wants to redirect (e.g. add /en), return it
  if (intlResponse) return intlResponse;

  // 2. Get user info
  const userInfo = await getCurrentUser();

  // 3. Check if route is public (no auth required)
  const isPublicRoute = publicRoutes.some((route) => pathname === route);

  // 4. Check if route is auth route (login/register)
  const isAuthRoute = authRoutes.includes(pathname);

  // 5. Handle unauthenticated users
  if (!userInfo) {
    // Allow access to public and auth routes
    if (isPublicRoute || isAuthRoute) {
      return NextResponse.next();
    }

    // Redirect to login for protected routes
    return NextResponse.redirect(
      new URL(`/login?redirectPath=${pathname}`, request.url),
    );
  }

  // 6. Redirect authenticated users away from auth routes
  if (isAuthRoute && userInfo) {
    // Redirect based on role to their respective dashboards/landing pages
    if (userInfo.role === "VENDOR") {
      return NextResponse.redirect(new URL("/vendor", request.url));
    } else if (userInfo.role === "ADMIN" || userInfo.role === "SUPERADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    } else {
      // Customer or other roles go to homepage or account
      return NextResponse.redirect(new URL("/account", request.url));
    }
  }

  // 7. Role-based access control for authenticated users

  // Vendor access check
  if (userInfo.role === "VENDOR") {
    const allowedRoutes = roleBasedRoutes.VENDOR;
    const isAuthorized = allowedRoutes.some((pattern) =>
      pattern.test(pathname),
    );

    // Vendor can access their own routes only
    if (isAuthorized) {
      return NextResponse.next();
    }

    return NextResponse.redirect(
      new URL("/vendor?error=Unauthorized Access", request.url),
    );
  }

  // Admin and Superadmin access check
  if (userInfo.role === "ADMIN" || userInfo.role === "SUPERADMIN") {
    const allowedRoutes = roleBasedRoutes.ADMIN;
    const isAuthorized = allowedRoutes.some((pattern) =>
      pattern.test(pathname),
    );

    if (isAuthorized) {
      return NextResponse.next();
    }

    return NextResponse.redirect(
      new URL("/admin?error=Unauthorized Access", request.url),
    );
  }

  // Customer access check
  if (userInfo.role === "CUSTOMER") {
    const allowedRoutes = roleBasedRoutes.CUSTOMER;
    const isAuthorized = allowedRoutes.some((pattern) =>
      pattern.test(pathname),
    );

    // Checkout requires authentication (already authenticated)
    // Additional checkout-specific validation can be added here if needed
    if (pathname === "/checkout" && isAuthorized) {
      return NextResponse.next();
    }

    if (isAuthorized) {
      return NextResponse.next();
    }

    return NextResponse.redirect(
      new URL("/?error=Unauthorized Access", request.url),
    );
  }

  // Default: allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next|.*\\..*).*)", // required for next-intl
    "/",
    "/login",
    "/register",
    "/cart",
    "/checkout",
    "/account/:path*",
    "/vendor/:path*",
    "/admin/:path*",
  ],
};
