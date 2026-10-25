import { type NextRequest } from "next/server"
import { API_BASE_URL } from "../../lib/api/http"

type RouteContext = {
  params: Promise<{ path: string[] }>
}

async function proxyApiRequest(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  if (path.some((segment) => segment === "." || segment === "..")) {
    return Response.json({ message: "Invalid API path" }, { status: 400 })
  }
  const target = new URL(
    `${API_BASE_URL}/${path.map((segment) => encodeURIComponent(segment)).join("/")}${request.nextUrl.search}`,
  )
  const headers = new Headers(request.headers)
  headers.delete("connection")
  headers.delete("content-length")
  headers.delete("host")

  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
    body:
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : request.body,
    cache: "no-store",
    redirect: "manual",
    ...(request.body ? { duplex: "half" as const } : {}),
  }
  const upstream = await fetch(target, init)
  const responseHeaders = new Headers(upstream.headers)
  responseHeaders.delete("connection")
  responseHeaders.delete("content-length")
  responseHeaders.delete("content-encoding")
  responseHeaders.delete("transfer-encoding")
  const cookies = upstream.headers.getSetCookie()
  if (cookies.length > 0) {
    responseHeaders.delete("set-cookie")
    for (const cookie of cookies) responseHeaders.append("set-cookie", cookie)
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  })
}

export const GET = proxyApiRequest
export const HEAD = proxyApiRequest
export const POST = proxyApiRequest
export const PUT = proxyApiRequest
export const PATCH = proxyApiRequest
export const DELETE = proxyApiRequest
