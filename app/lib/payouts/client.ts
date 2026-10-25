import type {
  CreatePayoutAccountRequest,
  PayoutAccountApiRecord,
} from "./types"
import type { PayoutAccount } from "./models"
import { createIdempotencyKey } from "../api/device"
import { authenticatedRequest } from "../auth/request"
import {
  expectArray,
  expectRecord,
  isRecord,
  requireOneOf,
  requireString,
} from "../api/parse"

export async function getPayoutAccounts(): Promise<PayoutAccount[]> {
  const response = await authenticatedRequest<unknown>("/payout-accounts/me")
  const payload =
    isRecord(response) && "data" in response ? response.data : response
  const rawAccounts = Array.isArray(payload) ? payload : [payload]

  return expectArray(rawAccounts, "payout accounts").map((item) => {
    const account = expectRecord(item, "payout account")
    const accountName = requireString(
      { ...account, accountName: account.accountName ?? account.name },
      "accountName",
      "payout account",
    )
    const institution = requireString(
      {
        ...account,
        institution: account.institution ?? account.bankCode ?? "Bank",
      },
      "institution",
      "payout account",
    )
    return {
      id: requireString(account, "id", "payout account"),
      institution,
      accountName,
      last4: requireString(
        {
          ...account,
          last4: account.accountNumberLast4 ?? account.last4,
        },
        "last4",
        "payout account",
      ),
      status: requireOneOf(
        { ...account, status: account.status ?? "pending" },
        "status",
        ["pending", "verified", "failed", "suspended"] as const,
        "payout account",
      ),
    }
  })
}

export async function createPayoutAccount(
  payload: CreatePayoutAccountRequest,
  idempotencyKey = createIdempotencyKey(),
): Promise<PayoutAccountApiRecord> {
  return authenticatedRequest<PayoutAccountApiRecord>("/payout-accounts", {
    method: "POST",
    headers: { "idempotency-key": idempotencyKey },
    body: JSON.stringify(payload),
  })
}
