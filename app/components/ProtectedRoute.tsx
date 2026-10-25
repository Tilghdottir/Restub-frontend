"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "../hooks/useAuth"
import type { StaffPermission } from "../hooks/useAuth"
import type { StaffRole } from "../lib/auth/types"

export function ProtectedRoute({
  children,
  fallback,
  deniedFallback,
  requiredRoles,
  requiredPermission,
}: {
  children: ReactNode
  fallback?: ReactNode
  deniedFallback?: ReactNode
  requiredRoles?: StaffRole[]
  requiredPermission?: StaffPermission
}) {
  const pathname = usePathname()
  const { user, isLoading, hasPermission } = useAuth()

  if (isLoading) {
    return (
      <div role="status" className="p-6 text-sm text-[#292B2F]">
        Checking your session…
      </div>
    )
  }

  if (!user) {
    return (
      <>
        {fallback ?? (
          <div className="p-6 text-sm text-[#292B2F]">
            <p>Please sign in to continue.</p>
            <Link
              href={
                pathname.startsWith("/admin")
                  ? "/admin/login"
                  : "/login"
              }
              className="mt-2 inline-block underline underline-offset-2"
            >
              Sign in
            </Link>
          </div>
        )}
      </>
    )
  }

  const hasRequiredRole =
    !requiredRoles ||
    user.staffRoles.some((role) => requiredRoles.includes(role))
  const hasRequiredPermission =
    !requiredPermission || hasPermission(requiredPermission)
  if (!hasRequiredRole || !hasRequiredPermission) {
    return (
      <>
        {deniedFallback ?? (
          <div className="p-6 text-sm text-[#292B2F]">
            You don’t have permission to view this page.
          </div>
        )}
      </>
    )
  }

  return <>{children}</>
}
