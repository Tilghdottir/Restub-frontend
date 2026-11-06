export type KycStatus = "pending" | "verified" | "rejected" | "requires_review"

export type SubmitKycRequest = {
  type?: "bvn" | "nin" | "passport" | "driver_license" | "national_id"
  identifier: string
  date_of_birth: string
  consent: boolean
  consent_reference?: string
  evidence_reference?: string
  external_reference?: string
}

export type KycApiRecord = {
  id: string
  userId: string
  providerReference: string | null
  identityId: string | null
  partyId: string | null
  status: KycStatus
  reason: string | null
  verifiedAt: string | null
  createdAt: string
  updatedAt: string
}
