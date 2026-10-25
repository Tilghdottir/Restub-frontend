import type { AccountSummaryResponse } from "./types"
import { expectArray } from "../api/parse"
import { authenticatedRequest } from "../auth/request"
import { normalizeListing, normalizeOrder } from "../api/normalize"

export async function getAccountSummary(): Promise<AccountSummaryResponse> {
  const [ordersResult, listingsResult] = await Promise.all([
    authenticatedRequest<unknown>("/orders"),
    authenticatedRequest<unknown>("/listings/mine/all"),
  ])
  return {
    purchases: expectArray(ordersResult, "account orders").map(normalizeOrder),
    listings: expectArray(listingsResult, "account listings").map(
      normalizeListing,
    ),
  }
}
