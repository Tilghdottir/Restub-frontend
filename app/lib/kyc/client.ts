import type { KycApiRecord, SubmitKycRequest } from "./types"
import type { KycCaseSummary, KycProfile } from "./models"
import { createIdempotencyKey } from "../api/device"
import { authenticatedRequest } from "../auth/request"
import {
  asString,
  expectArray,
  expectRecord,
  requireOneOf,
  requireString,
} from "../api/parse"

export async function submitKyc(
  payload: SubmitKycRequest,
  idempotencyKey = createIdempotencyKey(),
): Promise<KycApiRecord> {
  return authenticatedRequest<KycApiRecord>("/kyc/submit", {
    method: "POST",
    headers: { "idempotency-key": idempotencyKey },
    body: JSON.stringify(payload),
  })
}

export async function getKycCases(): Promise<KycCaseSummary[]> {
  const result = await authenticatedRequest<unknown>("/kyc/review")
  return expectArray(result, "kyc cases").map((item) => {
    const record = expectRecord(item, "kyc case")
    const applicant = requireString(record, "userId", "kyc case")
    const id = requireString(record, "id", "kyc case")
    return {
      id,
      applicant,
      status: requireOneOf(
        record,
        "status",
        ["pending", "verified", "rejected", "requires_review"] as const,
        "kyc case",
      ),
      submittedAt: requireString(
        {
          ...record,
          submittedAt: record.submittedAt ?? record.createdAt,
        },
        "submittedAt",
        "kyc case",
      ),
    }
  })
}

export async function getKycProfile(): Promise<KycProfile> {
  const response = await authenticatedRequest<unknown>("/kyc/me")
  const profile = expectRecord(
    (response && typeof response === "object" && "data" in response
      ? response.data
      : response) ?? {},
    "kyc profile",
  )

  return {
    status: requireOneOf(
      profile,
      "status",
      ["pending", "verified", "rejected", "requires_review"] as const,
      "kyc profile",
    ),
    legalName: asString(profile.legalName ?? profile.name) || null,
    submittedAt:
      asString(profile.submittedAt ?? profile.createdAt ?? profile.updatedAt) ||
      null,
    documentType: asString(profile.documentType) || null,
  }
}
