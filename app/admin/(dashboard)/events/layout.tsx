import type { ReactNode } from "react"
import AdminAccessDenied from "../../../../components/admin/AdminAccessDenied"
import { hasStaffPermission } from "../../../../lib/auth/server"

export default async function EventsLayout({
  children,
}: {
  children: ReactNode
}) {
  if (!(await hasStaffPermission("events:manage"))) {
    return <AdminAccessDenied />
  }
  return children
}
