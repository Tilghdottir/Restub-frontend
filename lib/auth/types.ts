export const STAFF_ROLES = ["admin", "superadmin", "developer"] as const
export type StaffRole = typeof STAFF_ROLES[number]
const staffRoleSet: ReadonlySet<string> = new Set(STAFF_ROLES)

export const STAFF_PERMISSIONS = [
  "platform:read",
  "disputes:resolve",
  "kyc:review",
  "users:suspend",
  "escrow:override",
  "users:delete",
  "staff:manage",
  "financial-reports:read",
  "infrastructure:read",
  "tickets:review",
  "events:manage",
] as const
export type StaffPermission = typeof STAFF_PERMISSIONS[number]
const staffPermissionSet: ReadonlySet<string> = new Set(STAFF_PERMISSIONS)

export function isStaffRole(value: string): value is StaffRole {
  return staffRoleSet.has(value)
}

export function isStaffPermission(value: string): value is StaffPermission {
  return staffPermissionSet.has(value)
}

export type AuthTokenResponse = {
  accessToken: string
  refreshToken: string
}

export type AuthUserResponse = {
  sub: string
  email: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  eventAlerts?: boolean
  exclusivePresaleOffers?: boolean
  customerType: string
  tokenVersion?: number
  staffRoles?: StaffRole[]
  permissions: StaffPermission[]
  items?: unknown[]
}
