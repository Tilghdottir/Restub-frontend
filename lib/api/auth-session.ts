import { ApiError, request } from "./http"

let refreshInFlight: Promise<boolean> | undefined

async function refreshSession(): Promise<boolean> {
  try {
    await request("/auth/refresh", { method: "POST" })
    return true
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 401 || error.status === 403)
    ) {
      return false
    }
    throw error
  }
}

export function refreshAuthSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = refreshSession().finally(() => {
      refreshInFlight = undefined
    })
  }
  return refreshInFlight
}
