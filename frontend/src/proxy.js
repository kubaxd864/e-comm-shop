import { NextResponse } from "next/server";

const PROTECTED_PREFIXES = [
  "/basket",
  "/favorite",
  "/myaccount",
  "/order",
  "/myorders",
  "/completion",
];

const ADMIN_PREFIXES = ["/admin_panel"];

export async function proxy(req) {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const { pathname } = req.nextUrl;
  const isLoggedIn = cookieHeader.includes("sid=");

  const requiresAuth = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const requiresAdmin = ADMIN_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!isLoggedIn && (requiresAuth || requiresAdmin)) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (requiresAdmin && isLoggedIn) {
    try {
      const response = await fetch("http://localhost:5000/api/me", {
        headers: { cookie: cookieHeader },
        credentials: "include",
      });

      if (response.status === 401) {
        const loginUrl = new URL("/login", req.nextUrl);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
      }
      if (response.status === 403) {
        return NextResponse.redirect(new URL("/404", req.nextUrl));
      }
      if (!response.ok) {
        return NextResponse.redirect(new URL("/404", req.nextUrl));
      }

      const data = await response.json();
      const role = data?.user?.role;
      if (role !== "admin" && role !== "owner") {
        return NextResponse.redirect(new URL("/404", req.nextUrl));
      }
    } catch (err) {
      return NextResponse.redirect(new URL("/404", req.nextUrl));
    }
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
    "/admin_panel/:path*",
  ],
};
