"use client"

import { useEffect, useState } from "react"

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
    setUser({
      id: "authenticated-user",
      name: "Account holder",
      email: window.localStorage.getItem("restub_email") ?? "",
      role: "buyer",
    })
  }, [])

  return {
    user,
    isAuthenticated: user !== null,
    isAdmin: user?.role === "admin",
  }
}
