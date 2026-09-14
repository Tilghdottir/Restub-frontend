"use client"

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
  const user: AuthUser = {
    id: "user_123",
    name: "Avery Stone",
    email: "avery@example.com",
    role: "buyer",
  }

  return {
    user,
    isAuthenticated: true,
    isAdmin: user.role === "admin",
  }
}
