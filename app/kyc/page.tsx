"use client"

import { useEffect, useState } from "react"
import AccountPageShell, { ResourceCard } from "../components/AccountPageShell"
import { apiClient } from "../lib/api"
import type { KycProfile } from "../lib/api-types"

export default function KycPage() {
  const [profile, setProfile] = useState<KycProfile | null>(null)
  useEffect(() => {
    void apiClient.getKycProfile().then(setProfile)
  }, [])

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
        <button
          className="mt-6 px-5 py-3 rounded-lg text-[13px] font-semibold"
          style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
        >
          Start verification
        </button>
      </ResourceCard>
    </AccountPageShell>
  )
}
