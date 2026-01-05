import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/profile"];
const publicRoutes = ["/signin", "/signup"];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isPublicRoute = publicRoutes.includes(path);

  // 🔧 BUSCAR JWT DE STRAPI
  const token = req.cookies.get("strapi_jwt")?.value;

  // Si la ruta está protegida y no hay token → redirect a signin
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/signin", req.nextUrl));
  }

  // Si está en signin/signup Y tiene token → redirect a dashboard
  if (isPublicRoute && token && !path.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
