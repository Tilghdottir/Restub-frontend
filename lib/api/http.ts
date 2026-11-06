import { isRecord } from "./parse"

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://restub.onrender.com/api"
    : "http://localhost:3000/api")
).replace(/\/+$/, "")

const API_PROXY_BASE = `${(process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(
  /\/+$/,
  "",
)}/api`

export function getApiProxyUrl(path: string): string {
  return `${API_PROXY_BASE}${path}`
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export type HttpRequestOptions = {
  unwrapEnvelope?: boolean
}

function errorMessage(body: unknown, status: number): string {
  const rawMessage = isRecord(body) ? body.message : undefined
  if (typeof rawMessage === "string") return rawMessage
  if (
    Array.isArray(rawMessage) &&
    rawMessage.every((item) => typeof item === "string")
  ) {
    return rawMessage.join(". ")
  }
  return `API request failed (${status})`
}

export async function request<T>(
  path: string,
  init: RequestInit = {},
  options: HttpRequestOptions = {},
): Promise<T> {
  const unwrapEnvelope = options.unwrapEnvelope ?? true
  const headers = new Headers(init.headers)
  headers.set("Content-Type", "application/json")

  const requestUrl =
    typeof window === "undefined"
      ? `${API_BASE_URL}${path}`
      : getApiProxyUrl(path)
  const response = await fetch(requestUrl, {
    ...init,
    credentials: init.credentials ?? "include",
    headers,
  })
  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const message = errorMessage(body, response.status)
    throw new ApiError(message, response.status)
  }

  if (unwrapEnvelope && isRecord(body) && "success" in body && "data" in body) {
    if (body.success === false) {
      throw new ApiError(errorMessage(body, response.status), response.status)
    }
    return body.data as T
  }

  return body as T
}
