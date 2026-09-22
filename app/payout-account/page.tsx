"use client"

import { useEffect, useState } from "react"
import AccountPageShell, { ResourceCard } from "../components/AccountPageShell"
import { apiClient } from "../lib/api"
import type { PayoutAccount } from "../lib/api-types"

export default function PayoutAccountPage() {
  const [accounts, setAccounts] = useState<PayoutAccount[]>([])
  const [open, setOpen] = useState(false)
  const [bankCode, setBankCode] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountName, setAccountName] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
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
          type="button"
          onClick={() => {
            setError("")
            setOpen(true)
          }}
          className="w-full md:w-auto px-5 py-3 rounded-lg text-[13px] font-semibold"
          style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
        >
          Add payout account
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
              aria-labelledby="payout-account-dialog-title"
              className="w-full max-w-md bg-white border rounded-lg p-5 space-y-4 shadow-xl"
              style={{ borderColor: "#E8E9EB" }}
              onSubmit={async (event) => {
                event.preventDefault()
                setSubmitting(true)
                setMessage("")
                setError("")
                try {
                  await apiClient.createPayoutAccount({
                    bankCode,
                    accountNumber,
                    accountName,
                  })
                  setMessage("Payout account submitted.")
                  setOpen(false)
                  setBankCode("")
                  setAccountNumber("")
                  setAccountName("")
                  setAccounts(await apiClient.getPayoutAccounts())
                } catch (reason) {
                  setError(
                    reason instanceof Error
                      ? reason.message
                      : "Unable to create payout account.",
                  )
                } finally {
                  setSubmitting(false)
                }
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2
                    id="payout-account-dialog-title"
                    className="text-[17px] font-semibold"
                    style={{ color: "#111111" }}
                  >
                    Add payout account
                  </h2>
                  <p className="text-[13px] mt-1" style={{ color: "#292B2F" }}>
                    Add the account where your seller payouts should be sent.
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close dialog"
                  onClick={() => setOpen(false)}
                  className="text-xl leading-none"
                  style={{ color: "#292B2F" }}
                >
                  ×
                </button>
              </div>
              <input
                required
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                placeholder="Bank code"
                className="w-full border rounded-lg px-4 py-2.5 text-[13px]"
              />
              <input
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Account number"
                className="w-full border rounded-lg px-4 py-2.5 text-[13px]"
              />
              <input
                required
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Account name"
                className="w-full border rounded-lg px-4 py-2.5 text-[13px]"
              />
              {error && <p className="text-[13px] text-red-800">{error}</p>}
              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-[13px] font-semibold"
                  style={{ color: "#292B2F" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-lg text-[13px] font-semibold disabled:opacity-60"
                  style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
                >
                  {submitting ? "Saving…" : "Save payout account"}
                </button>
              </div>
            </form>
          </div>
        )}
        {message && <p className="text-[13px] text-green-800">{message}</p>}
      </div>
    </AccountPageShell>
  )
}
