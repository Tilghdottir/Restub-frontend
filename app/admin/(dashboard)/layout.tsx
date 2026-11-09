import type { ReactNode } from "react"
import AdminAccessDenied from "../../../components/admin/AdminAccessDenied"
import { requireAuthenticatedUser } from "../../../lib/auth/server"

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const user = await requireAuthenticatedUser("/admin/login")
  if (!user.staffRoles?.length) return <AdminAccessDenied />

  return children
}
