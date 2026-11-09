import type { ReactNode } from "react"
import { requireAuthenticatedUser } from "../../../lib/auth/server"

export default async function SellLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireAuthenticatedUser()
  return children
}
