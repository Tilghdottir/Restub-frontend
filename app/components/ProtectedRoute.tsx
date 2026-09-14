"use client"

import type { ReactNode } from "react"
import { useAuth } from "../hooks/useAuth"

export function ProtectedRoute({
  children,
  fallback,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  const { user } = useAuth()

  if (!user) {
    return (
      <>
        {fallback ?? (
          <div className="p-6 text-sm text-[#292B2F]">
            Please sign in to continue.
          </div>
        )}
      </>
    )
  }

  return <>{children}</>
}
