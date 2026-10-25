import { authenticatedRequest } from "../auth/request"
import {
  expectArray,
  expectRecord,
  requireNumber,
  requireString,
} from "../api/parse"
import type {
  FinancialReport,
  FinancialReportRow,
  PlatformSummary,
} from "./types"

export async function getPlatformSummary(): Promise<PlatformSummary> {
  const response = expectRecord(
    await authenticatedRequest<unknown>("/admin/platform/summary"),
    "platform summary",
  )
  return {
    users: requireNumber(response, "users", "platform summary"),
    listings: requireNumber(response, "listings", "platform summary"),
    orders: requireNumber(response, "orders", "platform summary"),
    escrows: requireNumber(response, "escrows", "platform summary"),
  }
}

export async function getFinancialReport(
  range: {
    from?: string
    to?: string
  } = {},
): Promise<FinancialReport> {
  const query = new URLSearchParams()
  if (range.from) query.set("from", range.from)
  if (range.to) query.set("to", range.to)
  const suffix = query.size ? `?${query.toString()}` : ""
  const response = expectRecord(
    await authenticatedRequest<unknown>(`/admin/reports/financial${suffix}`),
    "financial report",
  )
  if (response.amountsAreMinorUnits !== true) {
    throw new Error(
      "Invalid API response: financial report amountsAreMinorUnits must be true.",
    )
  }
  return {
    from: requireString(response, "from", "financial report"),
    to: requireString(response, "to", "financial report"),
    amountsAreMinorUnits: true,
    payments: parseReportRows(response.payments, "financial report payments"),
    transactions: parseReportRows(
      response.transactions,
      "financial report transactions",
    ),
  }
}

function parseReportRows(value: unknown, label: string): FinancialReportRow[] {
  return expectArray(value, label).map((item) => {
    const row = expectRecord(item, label)
    const amount = row.amountMinor
    const amountMinor =
      typeof amount === "number"
        ? amount
        : typeof amount === "string" && amount.trim() !== ""
          ? Number(amount)
          : Number.NaN
    if (!Number.isFinite(amountMinor)) {
      throw new Error(
        `Invalid API response: ${label}.amountMinor must be a finite number.`,
      )
    }
    return {
      currency: requireString(row, "currency", label),
      status: requireString(row, "status", label),
      count: requireNumber(row, "count", label),
      amountMinor,
    }
  })
}
