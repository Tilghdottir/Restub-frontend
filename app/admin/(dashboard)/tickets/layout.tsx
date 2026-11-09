import type { ReactNode } from "react"
import AdminAccessDenied from "../../../../components/admin/AdminAccessDenied"
import { hasStaffPermission } from "../../../../lib/auth/server"

export default async function TicketsLayout({
  children,
}: {
  children: ReactNode
}) {
  if (!(await hasStaffPermission("tickets:review"))) {
    return <AdminAccessDenied />
  }
  return children
}
