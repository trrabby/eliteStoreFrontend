import { NextRequest, NextResponse } from "next/server";

// routes that require authentication
const PROTECTED_CUSTOMER = ["/account", "/checkout", "/cart"];
const PROTECTED_VENDOR = ["/vendor"];
const PROTECTED_ADMIN = ["/admin"];

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const accessToken = req.cookies.get("accessToken")?.value;

  // check protected routes
  const isCustomerRoute = PROTECTED_CUSTOMER.some((r) =>
    pathname.startsWith(r),
  );
  const isVendorRoute = PROTECTED_VENDOR.some((r) => pathname.startsWith(r));
  const isAdminRoute = PROTECTED_ADMIN.some((r) => pathname.startsWith(r));

  // no token — redirect to login
  if ((isCustomerRoute || isVendorRoute || isAdminRoute) && !accessToken) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // already logged in — redirect away from auth pages
  const isAuthPage = ["/login", "/register"].some((r) =>
    pathname.startsWith(r),
  );

  if (isAuthPage && accessToken) {
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json|icons).*)",
  ],
};
