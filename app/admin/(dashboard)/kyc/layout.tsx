import type { ReactNode } from "react"
import AdminAccessDenied from "../../../../components/admin/AdminAccessDenied"
import { hasStaffPermission } from "../../../../lib/auth/server"

export default async function KycLayout({ children }: { children: ReactNode }) {
  if (!(await hasStaffPermission("kyc:review"))) {
    return <AdminAccessDenied />
  }
  return children
}
