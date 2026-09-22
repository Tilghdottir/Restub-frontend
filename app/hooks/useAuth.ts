"use client"

import { useEffect, useState } from "react"
import { apiClient } from "../lib/api"

export type AuthUser = {
  id: string
  name: string
  email: string
  role: "buyer" | "seller" | "admin"
}

export function useAuth(): {
  user: AuthUser | null
  isAuthenticated: boolean
  isAdmin: boolean
} {
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const token = window.localStorage.getItem("restub_access_token")
    if (!token) return
    void apiClient
      .getCurrentUser()
      .then((profile) => {
        const name = [profile.firstName, profile.lastName]
          .filter(Boolean)
          .join(" ")
        setUser({
          id: profile.sub,
          name: name || "Account holder",
          email: profile.email,
          role: profile.staffRoles?.includes("admin") ? "admin" : "buyer",
        })
      })
      .catch(() => {
        window.localStorage.removeItem("restub_access_token")
        window.localStorage.removeItem("restub_refresh_token")
      })
  }, [])

  return {
    user,
    isAuthenticated: user !== null,
    isAdmin: user?.role === "admin",
  }
}
