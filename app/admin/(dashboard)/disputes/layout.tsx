import type { ReactNode } from "react"
import AdminAccessDenied from "../../../../components/admin/AdminAccessDenied"
import { hasStaffPermission } from "../../../../lib/auth/server"

export default async function DisputesLayout({
  children,
}: {
  children: ReactNode
}) {
  if (!(await hasStaffPermission("disputes:resolve"))) {
    return <AdminAccessDenied />
  }
  return children
}
