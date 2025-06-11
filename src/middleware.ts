import { NextResponse } from "next/server";
import { auth } from "./auth";

const AuthRoutes = ["/profile", "/student_courses", "/wallet"];

const signRoute = ["/sign-in", "/sign-up"];

const allowedDashboardRoles = ["ADMIN", "CONSTRUCTOR"];

export default auth(async (req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isAuthRotue = AuthRoutes.includes(req.nextUrl.pathname);
  const isApiRoute = req.nextUrl.pathname.startsWith("/api");
  const origin = req.headers.get("origin");

  const isDashboardAllowed = allowedDashboardRoles.includes(
    req.auth?.user?.role!
  );

  // Handle API routes with proper headers
  if (isApiRoute) {
    const response = NextResponse.next();

    // Add headers for API routes to prevent caching issues on Vercel
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    // CORS headers if needed
    if (origin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }

    return response;
  }

  if (req.auth?.user && signRoute.includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/", req.nextUrl).toString());
  }

  if (!isDashboardAllowed && isAdminRoute) {
    return NextResponse.redirect(new URL("/", req.nextUrl).toString());
  }

  if (!req.auth?.user && isAuthRotue) {
    return NextResponse.redirect(new URL("/", req.nextUrl).toString());
  }

  return NextResponse.next();
});
