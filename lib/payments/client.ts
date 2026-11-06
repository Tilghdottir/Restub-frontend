import { authenticatedRequest } from "../auth/request"
import {
  expectArray,
  expectRecord,
  requireBoolean,
  requireNumber,
  requireNullableString,
  requireOneOf,
  requireString,
} from "../api/parse"
import type { SellerEarnings } from "./models"

function parseCountMap(value: unknown, label: string): Record<string, number> {
  const record = expectRecord(value, label)
  return Object.fromEntries(
    Object.entries(record).map(([key, count]) => {
      if (typeof count !== "number" || !Number.isInteger(count) || count < 0) {
        throw new Error(
          `Invalid API response: ${label}.${key} must be a non-negative integer.`,
        )
      }
      return [key, count]
    }),
  )
}

export async function getSellerEarnings(
  range: {
    from?: string
    to?: string
  } = {},
): Promise<SellerEarnings> {
  const query = new URLSearchParams()
  if (range.from) query.set("from", range.from)
  if (range.to) query.set("to", range.to)
  const suffix = query.size > 0 ? `?${query.toString()}` : ""
  const response = expectRecord(
    await authenticatedRequest<unknown>(`/payments/earnings${suffix}`),
    "seller earnings",
  )
  if (
    requireBoolean(response, "amountsAreMinorUnits", "seller earnings") !== true
  ) {
    throw new Error(
      "Invalid API response: seller earnings amounts must be minor units.",
    )
  }
  const payout = expectRecord(response.payout, "seller earnings payout")
  return {
    from: requireString(response, "from", "seller earnings"),
    to: requireString(response, "to", "seller earnings"),
    currencies: expectArray(
      response.currencies,
      "seller earnings currencies",
    ).map((item) => {
      const currency = expectRecord(item, "seller earnings currency")
      const sellerFeesStatus = requireOneOf(
        currency,
        "sellerFeesStatus",
        ["recorded", "not_recorded"] as const,
        "seller earnings currency",
      )
      const sellerFeesMinor = requireNullableString(
        currency,
        "sellerFeesMinor",
        "seller earnings currency",
      )
      if (sellerFeesStatus === "recorded" && sellerFeesMinor === null) {
        throw new Error(
          "Invalid API response: recorded seller fees require a fee amount.",
        )
      }
      return {
        currency: requireString(
          currency,
          "currency",
          "seller earnings currency",
        ),
        paymentCount: requireNumber(
          currency,
          "paymentCount",
          "seller earnings currency",
        ),
        grossAmountMinor: requireString(
          currency,
          "grossAmountMinor",
          "seller earnings currency",
        ),
        pendingAmountMinor: requireString(
          currency,
          "pendingAmountMinor",
          "seller earnings currency",
        ),
        heldAmountMinor: requireString(
          currency,
          "heldAmountMinor",
          "seller earnings currency",
        ),
        releasedAmountMinor: requireString(
          currency,
          "releasedAmountMinor",
          "seller earnings currency",
        ),
        refundedAmountMinor: requireString(
          currency,
          "refundedAmountMinor",
          "seller earnings currency",
        ),
        sellerFeesMinor,
        sellerFeesStatus,
        escrowCountsByStatus: parseCountMap(
          currency.escrowCountsByStatus,
          "seller earnings escrow counts",
        ),
        releaseCountsByProviderStatus: parseCountMap(
          currency.releaseCountsByProviderStatus,
          "seller earnings release counts",
        ),
      }
    }),
    payoutAccountStatus: requireNullableString(
      payout,
      "accountStatus",
      "seller earnings payout",
    ),
  }
}
