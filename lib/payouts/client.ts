import type {
  BachsOnboardingResponse,
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

export async function startBachsSellerOnboarding(
  idempotencyKey = createIdempotencyKey(),
): Promise<BachsOnboardingResponse> {
  const result = expectRecord(
    await authenticatedRequest<unknown>("/bachs/seller-account/onboarding", {
      method: "POST",
      headers: { "idempotency-key": idempotencyKey },
    }),
    "Bachs seller onboarding",
  )
  const onboardingUrl = requireString(
    result,
    "onboardingUrl",
    "Bachs seller onboarding",
  )
  let url: URL
  try {
    url = new URL(onboardingUrl)
  } catch {
    throw new Error("Invalid API response: onboardingUrl must be a URL.")
  }
  if (url.protocol !== "https:") {
    throw new Error("Invalid API response: onboardingUrl must use HTTPS.")
  }
  return {
    accountId: requireString(result, "accountId", "Bachs seller onboarding"),
    transfersStatus: requireString(
      result,
      "transfersStatus",
      "Bachs seller onboarding",
    ),
    payoutsStatus: requireString(
      result,
      "payoutsStatus",
      "Bachs seller onboarding",
    ),
    onboardingUrl: url.toString(),
  }
}
