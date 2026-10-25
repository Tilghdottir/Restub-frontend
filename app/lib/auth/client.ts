import { isStaffPermission, isStaffRole, type AuthUserResponse } from "./types"
import { authenticatedRequest } from "./request"
import { expectRecord, requireString } from "../api/parse"

export async function login(email: string, password: string): Promise<void> {
  await authenticatedRequest<unknown>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export async function register(
  email: string,
  password: string,
  profile: {
    firstName?: string
    lastName?: string
    phoneNumber?: string
    eventAlerts?: boolean
    exclusivePresaleOffers?: boolean
  } = {},
): Promise<void> {
  await authenticatedRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      phoneNumber: profile.phoneNumber ?? "",
      eventAlerts: profile.eventAlerts ?? false,
      exclusivePresaleOffers: profile.exclusivePresaleOffers ?? false,
    }),
  })
}

export async function logout(): Promise<void> {
  await authenticatedRequest("/auth/logout", {
    method: "POST",
  })
}

export async function getCurrentUser(): Promise<AuthUserResponse> {
  const result = expectRecord(
    await authenticatedRequest<unknown>("/auth/me"),
    "current user",
  )
  const profile: AuthUserResponse = {
    sub: requireString(result, "sub", "current user"),
    email: requireString(result, "email", "current user"),
    customerType: requireString(result, "customerType", "current user"),
    ...(typeof result.firstName === "string"
      ? { firstName: result.firstName }
      : {}),
    ...(typeof result.lastName === "string"
      ? { lastName: result.lastName }
      : {}),
    ...(typeof result.phoneNumber === "string"
      ? { phoneNumber: result.phoneNumber }
      : {}),
    ...(result.staffRoles === undefined
      ? {}
      : {
          staffRoles: parseStaffRoles(result.staffRoles),
        }),
    permissions: parseStaffPermissions(result.permissions),
  }
  return profile
}

function parseStaffRoles(value: unknown): AuthUserResponse["staffRoles"] {
  if (
    !Array.isArray(value) ||
    !value.every((role) => typeof role === "string" && isStaffRole(role))
  ) {
    throw new Error(
      "Invalid API response: current user.staffRoles contains an unsupported role.",
    )
  }
  return value
}

function parseStaffPermissions(
  value: unknown,
): NonNullable<AuthUserResponse["permissions"]> {
  if (
    !Array.isArray(value) ||
    !value.every((permission) => typeof permission === "string")
  ) {
    throw new Error(
      "Invalid API response: current user.permissions must be an array of strings.",
    )
  }
  return value.filter(isStaffPermission)
}
