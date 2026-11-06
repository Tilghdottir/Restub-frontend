import { ApiError, request, type HttpRequestOptions } from "../api/http"
import { refreshAuthSession } from "../api/auth-session"

export async function authenticatedRequest<T>(
  path: string,
  init: RequestInit = {},
  options: HttpRequestOptions = {},
): Promise<T> {
  try {
    return await request<T>(path, init, options)
  } catch (error) {
    if (
      !(error instanceof ApiError) ||
      error.status !== 401 ||
      path === "/auth/refresh" ||
      path === "/auth/login" ||
      path === "/auth/register"
    ) {
      throw error
    }

    if (!(await refreshAuthSession())) throw error
    return request<T>(path, init, options)
  }
}
