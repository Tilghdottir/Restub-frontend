import AdminAccessDenied from "../../../components/admin/AdminAccessDenied"
import { hasStaffPermission } from "../../../lib/auth/server"
import AdminDashboard from "./dashboard-client"

export default async function AdminPage() {
  if (!(await hasStaffPermission("platform:read"))) {
    return <AdminAccessDenied />
  }
  return <AdminDashboard />
}
