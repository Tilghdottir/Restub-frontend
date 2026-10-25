import type { KycStatus } from "./types"

export type KycCaseSummary = {
  id: string
  applicant: string
  status: KycStatus
  submittedAt: string
}

export type KycProfile = {
  status: KycStatus
  legalName: string | null
  submittedAt: string | null
  documentType: string | null
}
