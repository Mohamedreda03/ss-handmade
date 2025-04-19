import { NextResponse } from "next/server";
import { auth } from "./auth";

const AuthRoutes = ["/profile", "/student_courses", "/wallet"];

const signRoute = ["/sign-in", "/sign-up"];

const allowedDashboardRoles = ["ADMIN", "CONSTRUCTOR"];

export default auth(async (req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isAuthRotue = AuthRoutes.includes(req.nextUrl.pathname);
  const origin = req.headers.get("origin");

  const isDashboardAllowed = allowedDashboardRoles.includes(
    req.auth?.user?.role!
  );

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
