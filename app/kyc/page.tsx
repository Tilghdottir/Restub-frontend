"use client"

import { useEffect, useState } from "react"
import AccountPageShell, { ResourceCard } from "../components/AccountPageShell"
import { apiClient } from "../lib/api"
import type { KycProfile } from "../lib/api-types"

export default function KycPage() {
  const [profile, setProfile] = useState<KycProfile | null>(null)
  const [identifier, setIdentifier] = useState("")
  const [consent, setConsent] = useState(false)
  const [consentReference, setConsentReference] = useState("")
  const [evidenceReference, setEvidenceReference] = useState("")
  const [externalReference, setExternalReference] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  useEffect(() => {
    void apiClient.getKycProfile().then(setProfile)
  }, [])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage("")
    setError("")
    try {
      await apiClient.submitKyc({
        identifier,
        consent,
        consent_reference: consentReference,
        evidence_reference: evidenceReference,
        external_reference: externalReference,
      })
      setMessage("Your KYC submission has been received.")
      const updated = await apiClient.getKycProfile()
      setProfile(updated)
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to submit KYC.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AccountPageShell eyebrow="Account verification" title="KYC verification">
      <ResourceCard>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              className="text-[15px] font-semibold"
              style={{ color: "#111111" }}
            >
              Verify your identity
            </h2>
            <p className="text-[13px] mt-1" style={{ color: "#292B2F" }}>
              Verification helps keep buyers and sellers safe.
            </p>
          </div>
          <span
            className="px-2.5 py-1 rounded-full text-[11px] font-medium"
            style={{ backgroundColor: "#E8E9EB", color: "#111111" }}
          >
            {profile?.status ?? "Loading"}
          </span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <p
              className="text-[11px] uppercase tracking-wide"
              style={{ color: "#292B2F" }}
            >
              Legal name
            </p>
            <p
              className="text-[14px] font-medium mt-1"
              style={{ color: "#111111" }}
            >
              {profile?.legalName ?? "—"}
            </p>
          </div>
          <div>
            <p
              className="text-[11px] uppercase tracking-wide"
              style={{ color: "#292B2F" }}
            >
              Document
            </p>
            <p
              className="text-[14px] font-medium mt-1"
              style={{ color: "#111111" }}
            >
              {profile?.documentType ?? "Not submitted"}
            </p>
          </div>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Identity number"
            className="w-full border rounded-lg px-4 py-2.5 text-[13px]"
          />
          <input
            required
            value={consentReference}
            onChange={(e) => setConsentReference(e.target.value)}
            placeholder="Consent reference"
            className="w-full border rounded-lg px-4 py-2.5 text-[13px]"
          />
          <input
            required
            value={evidenceReference}
            onChange={(e) => setEvidenceReference(e.target.value)}
            placeholder="Evidence reference"
            className="w-full border rounded-lg px-4 py-2.5 text-[13px]"
          />
          <input
            required
            value={externalReference}
            onChange={(e) => setExternalReference(e.target.value)}
            placeholder="External reference"
            className="w-full border rounded-lg px-4 py-2.5 text-[13px]"
          />
          <label
            className="flex items-start gap-2 text-[13px]"
            style={{ color: "#292B2F" }}
          >
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              required
            />
            I consent to identity verification.
          </label>
          {message && (
            <p className="text-[13px]" style={{ color: "#166534" }}>
              {message}
            </p>
          )}
          {error && (
            <p className="text-[13px]" style={{ color: "#991B1B" }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-3 rounded-lg text-[13px] font-semibold disabled:opacity-60"
            style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
          >
            {submitting ? "Submitting…" : "Submit verification"}
          </button>
        </form>
      </ResourceCard>
    </AccountPageShell>
  )
}
