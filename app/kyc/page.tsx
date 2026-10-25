"use client"

import { useState } from "react"
import AccountPageShell, { ResourceCard } from "../components/AccountPageShell"
import ApiErrorNotice from "../components/ApiErrorNotice"
import type { SubmitKycRequest } from "../lib/kyc/types"
import { getApiErrorMessage } from "../lib/rtk-api"
import {
  useGetKycProfileQuery,
  useSubmitKycMutation,
} from "../lib/kyc/rtk"

export default function KycPage() {
  const { data: profile, error: profileError } = useGetKycProfileQuery()
  const [submitKyc, { isLoading: submitting }] = useSubmitKycMutation()
  const [type, setType] = useState<NonNullable<SubmitKycRequest["type"]>>("bvn")
  const [identifier, setIdentifier] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [consent, setConsent] = useState(false)
  const [consentReference, setConsentReference] = useState("")
  const [evidenceReference, setEvidenceReference] = useState("")
  const [externalReference, setExternalReference] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [open, setOpen] = useState(false)


  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const parsedDate = new Date(`${dateOfBirth}T00:00:00.000Z`)
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth) ||
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== dateOfBirth
    ) {
      setError("Enter a valid date of birth.")
      return
    }
    setMessage("")
    setError("")
    try {
      await submitKyc({
        payload: {
          type,
          identifier,
          date_of_birth: dateOfBirth,
          consent,
          ...(consentReference.trim()
            ? { consent_reference: consentReference.trim() }
            : {}),
          ...(evidenceReference.trim()
            ? { evidence_reference: evidenceReference.trim() }
            : {}),
          ...(externalReference.trim()
            ? { external_reference: externalReference.trim() }
            : {}),
        },
      }).unwrap()
      setMessage("Your KYC submission has been received.")
    } catch (reason) {
      setError(getApiErrorMessage(reason, "Unable to submit KYC."))
    }
  }

  return (
    <AccountPageShell eyebrow="Account verification" title="KYC verification">
      <ApiErrorNotice
        error={profileError}
        fallback="Unable to load KYC status."
      />
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

      </ResourceCard>
      <button
        type="button"
        onClick={() => {
          setError("")
          setOpen(true)
        }}
        className="w-full md:w-auto px-5 py-3 rounded-lg text-[13px] font-semibold"
        style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
      >
        Add KYC
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false)
          }}
        >
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="kyc-dialog-title"
            className="w-full max-w-md bg-white border rounded-lg p-5 space-y-4 shadow-xl"
            style={{ borderColor: "#E8E9EB" }}
            onSubmit={submit}>
            <select
              value={type}
              onChange={(event) => {
                const value = event.target.value
                if (
                  value === "bvn" ||
                  value === "nin" ||
                  value === "passport" ||
                  value === "driver_license" ||
                  value === "national_id"
                ) {
                  setType(value)
                }
              }}
              className="w-full border rounded-lg px-4 py-2.5 text-[13px]"
            >
              <option value="bvn">Bank Verification Number (BVN)</option>
              <option value="nin">National Identity Number (NIN)</option>
              <option value="passport">Passport</option>
              <option value="driver_license">Driver's license</option>
              <option value="national_id">National ID</option>
            </select>
            <label className="block text-[13px]" style={{ color: "#292B2F" }}>
              Date of birth
              <input
                required
                type="date"
                autoComplete="bday"
                value={dateOfBirth}
                onChange={(event) => setDateOfBirth(event.target.value)}
                className="mt-1 w-full border rounded-lg px-4 py-2.5 text-[13px]"
              />
              <span className="mt-1 block text-[11px]">
                Use the date registered to your identity record.
              </span>
            </label>
            <input
              required
              inputMode="numeric"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Identity number"
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
        </div>
      )}
      {message && <p className="text-[13px] text-green-800">{message}</p>}
    </AccountPageShell>
  )
}
