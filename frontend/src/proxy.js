import { NextResponse } from "next/server";

export function proxy(req) {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const isLoggedIn = cookieHeader.includes("sid=");
  const { pathname } = req.nextUrl;

  const protectedPrefixes = [
    "/basket",
    "/favorite",
    "/myaccount",
    "/order",
    "/myorders",
    "/completion",
  ];

  const requiresAuth = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!isLoggedIn && requiresAuth) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/basket/:path*",
    "/favorite/:path*",
    "/myaccount/:path*",
    "/order/:path*",
    "/myorders/:path*",
    "/completion/:path*",
  ],
};
