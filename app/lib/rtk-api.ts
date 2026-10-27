import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"

export type ApiFailure = {
  status: number | "CUSTOM_ERROR"
  data: unknown
  error: string
}

export function asApiFailure(error: unknown): ApiFailure {
  if (error instanceof Error) {
    const status =
      typeof error === "object" &&
      "status" in error &&
      typeof error.status === "number"
        ? error.status
        : "CUSTOM_ERROR"
    return {
      status,
      data: { message: error.message },
      error: error.message,
    }
  }

  return {
    status: "CUSTOM_ERROR",
    data: error,
    error: "An unexpected API error occurred.",
  }
}

export async function runQuery<T>(operation: () => Promise<T>) {
  try {
    return { data: await operation() }
  } catch (error) {
    return { error: asApiFailure(error) }
  }
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "string") return error
  if (typeof error !== "object" || error === null) return fallback

  if (
    "data" in error &&
    typeof error.data === "object" &&
    error.data !== null
  ) {
    const message = (error.data as { message?: unknown }).message
    if (typeof message === "string") return message
    if (
      Array.isArray(message) &&
      message.every((item) => typeof item === "string")
    ) {
      return message.join(". ")
    }
  }

  if ("error" in error && typeof error.error === "string") return error.error
  return fallback
}

export const rtkApi = createApi({
  reducerPath: "rtkApi",
  baseQuery: fakeBaseQuery<ApiFailure>(),
  tagTypes: [
    "AuthUser",
    "Listings",
    "AccountSummary",
    "Order",
    "Escrow",
    "KycProfile",
    "KycCases",
    "PayoutAccounts",
    "Tickets",
    "Events",
    "PaymentMethods",
    "Transactions",
    "Notifications",
    "Refunds",
    "AdminSummary",
    "FinancialReport",
    "Disputes",
    "Partners",
  ],
  endpoints: () => ({}),
})
