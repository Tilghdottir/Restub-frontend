"use client"

import { useEffect, useState } from "react"
import AccountPageShell, { ResourceCard } from "../components/AccountPageShell"
import { apiClient } from "../lib/api"
import type { PayoutAccount } from "../lib/api-types"

export default function PayoutAccountPage() {
  const [accounts, setAccounts] = useState<PayoutAccount[]>([])
  useEffect(() => {
    void apiClient.getPayoutAccounts().then(setAccounts)
  }, [])

  return (
    <AccountPageShell eyebrow="Seller settings" title="Payout account">
      <div className="space-y-4">
        {accounts.map((account) => (
          <ResourceCard key={account.id}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p
                  className="text-[15px] font-semibold"
                  style={{ color: "#111111" }}
                >
                  {account.institution}
                </p>
                <p className="text-[13px] mt-1" style={{ color: "#292B2F" }}>
                  {account.accountName} · ending in {account.last4}
                </p>
              </div>
              <span
                className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                style={{ backgroundColor: "#E8E9EB", color: "#111111" }}
              >
                {account.status}
              </span>
            </div>
          </ResourceCard>
        ))}
        <button
          className="w-full md:w-auto px-5 py-3 rounded-lg text-[13px] font-semibold"
          style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
        >
          Add payout account
        </button>
      </div>
    </AccountPageShell>
  )
}
