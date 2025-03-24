import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is a protected route
  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/profile")

  // Check if the path is an auth route
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register")

  // Get the token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // If it's a protected route and no token exists, redirect to login
  if (isProtectedRoute && !token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(pathname))
    return NextResponse.redirect(url)
  }

  // If it's an auth route and token exists, redirect to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // If it's the root path and token exists, redirect to dashboard
  if (pathname === "/" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Otherwise, continue
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

