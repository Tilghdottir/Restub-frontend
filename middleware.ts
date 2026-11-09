import { NextResponse, type NextRequest } from "next/server"

const protectedPrefixes = [
  "/account",
  "/kyc",
  "/notification",
  "/order",
  "/payment",
  "/payout-account",
  "/refund",
  "/seller",
  "/ticket",
  "/transaction",
  "/sell",
]

function normalizedPathname(request: NextRequest): string {
  const pathname = request.nextUrl.pathname
  const basePath = request.nextUrl.basePath || ""
  if (basePath && pathname.startsWith(`${basePath}/`)) {
    return pathname.slice(basePath.length)
  }
  return pathname
}

function isProtectedPath(pathname: string): boolean {
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return false
  }
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return true

  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

export function middleware(request: NextRequest) {
  const pathname = normalizedPathname(request)
  if (!isProtectedPath(pathname)) return NextResponse.next()

  const requestHeaders = new Headers(request.headers)
  const searchParams = new URLSearchParams(request.nextUrl.search)
  searchParams.delete("_rsc")
  const search = searchParams.size ? `?${searchParams}` : ""
  requestHeaders.set("x-restub-return-to", `${pathname}${search}`)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ["/((?!api/|_next/|favicon.ico).*)"],
}
