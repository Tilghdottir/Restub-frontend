import { type NextRequest } from "next/server"
import { API_BASE_URL } from "../../../lib/api/http"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

type RouteContext = {
  params: Promise<{ path: string[] }>
}

const UPSTREAM_TIMEOUT_MS = 30_000
const MAX_BODY_BYTES = 10 * 1024 * 1024
const SAFE_METHODS = new Set(["GET", "HEAD"])
const ALLOWED_PREFIXES = new Set([
  "admin",
  "auth",
  "bachs",
  "disputes",
  "events",
  "kyc",
  "listings",
  "notifications",
  "orders",
  "payments",
  "payout-accounts",
  "refunds",
  "tickets",
  "users",
])
const FORWARD_REQUEST_HEADERS = [
  "accept",
  "accept-language",
  "authorization",
  "content-type",
  "cookie",
  "idempotency-key",
  "if-match",
  "if-none-match",
  "user-agent",
  "x-device-id",
]
const HOP_BY_HOP_HEADERS = [
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "server",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "x-powered-by",
]

class RequestBodyTooLargeError extends Error {
  constructor() {
    super("Request body exceeds the allowed size.")
    this.name = "RequestBodyTooLargeError"
  }
}

class InvalidContentLengthError extends Error {
  constructor() {
    super("Invalid content length.")
    this.name = "InvalidContentLengthError"
  }
}

function json(status: number, message: string, requestId: string): Response {
  return Response.json({ message }, {
    status,
    headers: {
      "cache-control": "no-store",
      "x-request-id": requestId,
    },
  })
}

function safeDecode(segment: string): string | null {
  let decoded = segment

  for (let depth = 0; depth < 5; depth += 1) {
    if (!decoded.includes("%")) break
    try {
      const next = decodeURIComponent(decoded)
      if (next === decoded) break
      decoded = next
    } catch {
      return null
    }
  }

  return decoded.includes("%") ? null : decoded
}

function normalizePath(path: string[]): string[] | null {
  if (path.length === 0) return null

  const decoded = path.map(safeDecode)
  const segments = decoded.filter(
    (segment): segment is string => segment !== null,
  )
  if (segments.length !== path.length) return null

  if (!ALLOWED_PREFIXES.has(segments[0])) return null
  if (
    segments.some(
      (segment) =>
        segment === "" ||
        segment === "." ||
        segment === ".." ||
        /[\/\\\u0000-\u001f]/.test(segment),
    )
  ) {
    return null
  }

  return segments
}

function getExpectedOrigin(request: NextRequest): string | null {
  const configuredOrigin = process.env.APP_ORIGIN
  if (!configuredOrigin && process.env.NODE_ENV === "production") return null

  try {
    const url = new URL(configuredOrigin ?? request.nextUrl.origin)
    const isLoopback =
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "[::1]"
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.pathname !== "/" ||
      url.search ||
      url.hash ||
      (process.env.NODE_ENV === "production" &&
        url.protocol !== "https:" &&
        !isLoopback)
    ) {
      return null
    }
    return url.origin
  } catch {
    return null
  }
}

function isSameOrigin(request: NextRequest, expectedOrigin: string): boolean {
  if (SAFE_METHODS.has(request.method)) return true

  const origin = request.headers.get("origin")
  if (origin) {
    try {
      const parsedOrigin = new URL(origin)
      return (
        parsedOrigin.origin === expectedOrigin &&
        parsedOrigin.pathname === "/" &&
        !parsedOrigin.search &&
        !parsedOrigin.hash
      )
    } catch {
      return false
    }
  }

  const fetchSite = request.headers.get("sec-fetch-site")
  return fetchSite === "same-origin" || fetchSite === "none"
}

async function readLimitedBody(
  request: NextRequest,
): Promise<ArrayBuffer | null> {
  if (SAFE_METHODS.has(request.method) || !request.body) return null

  const declaredLength = request.headers.get("content-length")
  if (declaredLength !== null) {
    const length = Number(declaredLength)
    if (!Number.isSafeInteger(length) || length < 0) {
      throw new InvalidContentLengthError()
    }
    if (length > MAX_BODY_BYTES) throw new RequestBodyTooLargeError()
  }

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      totalBytes += value.byteLength
      if (totalBytes > MAX_BODY_BYTES) {
        try {
          await reader.cancel()
        } catch (error) {
          const errorName = error instanceof Error ? error.name : "UnknownError"
          console.error("proxy.request_body_cancel_failed", { errorName })
        }
        throw new RequestBodyTooLargeError()
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }

  if (totalBytes === 0) return null

  const body = new ArrayBuffer(totalBytes)
  const bytes = new Uint8Array(body)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return body
}

function stripHopByHopHeaders(headers: Headers): void {
  const connectionHeader = headers.get("connection")
  for (const token of connectionHeader?.split(",") ?? []) {
    const name = token.trim()
    if (name) headers.delete(name)
  }
  for (const name of HOP_BY_HOP_HEADERS) headers.delete(name)
}

async function proxyApiRequest(request: NextRequest, context: RouteContext) {
  const requestId = crypto.randomUUID()
  const { path: requestedPath } = await context.params
  const path = normalizePath(requestedPath)
  if (!path) return json(404, "No such endpoint.", requestId)

  const expectedOrigin = getExpectedOrigin(request)
  if (!expectedOrigin) {
    console.error("proxy.invalid_origin_configuration", { requestId })
    return json(500, "Proxy origin is not configured correctly.", requestId)
  }
  if (!isSameOrigin(request, expectedOrigin)) {
    return json(403, "Cross-origin request refused.", requestId)
  }

  let body: ArrayBuffer | null
  try {
    body = await readLimitedBody(request)
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return json(413, "Request too large.", requestId)
    }
    if (request.signal.aborted) return new Response(null, { status: 499 })
    if (error instanceof InvalidContentLengthError) {
      return json(400, "Invalid request body.", requestId)
    }
    const errorName = error instanceof Error ? error.name : "UnknownError"
    console.error("proxy.request_body_read_failed", { requestId, errorName })
    return json(400, "Could not read request body.", requestId)
  }

  const target = new URL(
    `${API_BASE_URL}/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`,
  )
  const headers = new Headers()
  for (const name of FORWARD_REQUEST_HEADERS) {
    const value = request.headers.get(name)
    if (value) headers.set(name, value)
  }
  if (!SAFE_METHODS.has(request.method)) {
    headers.set("origin", expectedOrigin)
  }
  headers.set("accept-encoding", "identity")
  headers.set("x-request-id", requestId)

  const timeoutSignal = AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
  const signal = AbortSignal.any([request.signal, timeoutSignal])
  let upstream: Response
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
      signal,
    })
  } catch (error) {
    if (request.signal.aborted) return new Response(null, { status: 499 })
    if (timeoutSignal.aborted) {
      return json(504, "Upstream timed out.", requestId)
    }
    const errorName = error instanceof Error ? error.name : "UnknownError"
    console.error("proxy.upstream_failed", { requestId, errorName })
    return json(502, "Upstream unavailable.", requestId)
  }

  if (
    upstream.status >= 300 &&
    upstream.status < 400 &&
    upstream.status !== 304
  ) {
    console.error("proxy.unexpected_redirect", {
      requestId,
      status: upstream.status,
    })
    return json(502, "Unexpected upstream response.", requestId)
  }

  const responseHeaders = new Headers(upstream.headers)
  stripHopByHopHeaders(responseHeaders)
  responseHeaders.delete("content-length")
  responseHeaders.delete("content-encoding")
  responseHeaders.delete("set-cookie")
  for (const cookie of upstream.headers.getSetCookie()) {
    responseHeaders.append(
      "set-cookie",
      cookie.replace(/;\s*domain=[^;]*/i, ""),
    )
  }

  if (!responseHeaders.has("cache-control")) {
    responseHeaders.set("cache-control", "no-store")
  }
  responseHeaders.set("x-content-type-options", "nosniff")
  responseHeaders.set("x-request-id", requestId)

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
