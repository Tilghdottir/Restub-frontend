"use client"

import { useGetCurrentUserQuery } from "../lib/auth/rtk"
import type { StaffPermission, StaffRole } from "../lib/auth/types"
export { STAFF_PERMISSIONS, type StaffPermission } from "../lib/auth/types"
const adminRoles = ["admin", "superadmin"] as const

export type AuthUser = {
  id: string
  name: string
  email: string
  staffRoles: StaffRole[]
  permissions: StaffPermission[]
}

export function useAuth(): {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  isStaff: boolean
  isAdmin: boolean
  hasPermission: (permission: StaffPermission) => boolean
} {
  const { data: profile, isLoading, isFetching } = useGetCurrentUserQuery()

  const staffRoles = profile?.staffRoles ?? []
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ")
  const user: AuthUser | null = profile
    ? {
        id: profile.sub,
        name: name || "Account holder",
        email: profile.email,
        staffRoles,
        permissions: profile.permissions,
      }
    : null
  const isAdmin = staffRoles.some((role) =>
    adminRoles.some((adminRole) => adminRole === role),
  )

  return {
    user,
    isLoading: isLoading || isFetching,
    isAuthenticated: user !== null,
    isStaff: staffRoles.length > 0,
    isAdmin,
    hasPermission: (permission) =>
      profile?.permissions.includes(permission) ?? false,
  }
}
