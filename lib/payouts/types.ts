export type PayoutAccountStatus = "pending" | "verified" | "failed" | "suspended"

export type CreatePayoutAccountRequest = {
  bankCode: string
  accountNumber: string
  accountName: string
}

export type PayoutAccountApiRecord = {
  id: string
  userId: string
  providerReference: string | null
  partyId: string | null
  bankCode: string
  accountNumberLast4: string
  accountName: string
  status: PayoutAccountStatus
  reason: string | null
  createdAt: string
  updatedAt: string
}

export type BachsOnboardingResponse = {
  accountId: string
  transfersStatus: string
  payoutsStatus: string
  onboardingUrl: string
}
