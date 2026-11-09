import "server-only"

import { cache } from "react"
import { headers, cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ApiError, request } from "../api/http"
import { parseAuthUserResponse } from "./client"
import type { AuthUserResponse, StaffPermission } from "./types"

const ACCESS_TOKEN_COOKIE = "restub_access_token"
const ACCESS_TOKEN_PATTERN = /^[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+){2}$/

const getServerAuthUser = cache(async (): Promise<AuthUserResponse | null> => {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value
  if (!accessToken || !ACCESS_TOKEN_PATTERN.test(accessToken)) return null

  try {
    const user = await request<unknown>("/auth/me", {
      headers: {
        cookie: `${ACCESS_TOKEN_COOKIE}=${accessToken}`,
      },
      cache: "no-store",
    })
    return parseAuthUserResponse(user)
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 401 || error.status === 403)
    ) {
      return null
    }
    throw error
  }
})

function isSafeReturnPath(value: string | null): value is string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001f]/.test(value)
  ) {
    return false
  }

  try {
    const url = new URL(value, "https://restub.invalid")
    return (
      url.origin === "https://restub.invalid" &&
      url.pathname !== "/login" &&
      url.pathname !== "/admin/login" &&
      url.pathname !== "/register"
    )
  } catch {
    return false
  }
}

async function getLoginDestination(loginPath: string): Promise<string> {
  const returnTo = (await headers()).get("x-restub-return-to")
  const nextPath = isSafeReturnPath(returnTo)
    ? `?next=${encodeURIComponent(returnTo)}`
    : ""
  return `${loginPath}${nextPath}`
}

export async function requireAuthenticatedUser(
  loginPath = "/login",
): Promise<AuthUserResponse> {
  const user = await getServerAuthUser()
  if (user) return user

  redirect(await getLoginDestination(loginPath))
}

export async function hasStaffPermission(
  permission: StaffPermission,
): Promise<boolean> {
  const user = await requireAuthenticatedUser("/admin/login")
  return Boolean(
    user.staffRoles?.length && user.permissions.includes(permission),
  )
}
