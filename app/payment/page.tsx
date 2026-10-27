"use client"

import AccountPageShell, { ResourceCard } from "../components/AccountPageShell"
import ApiErrorNotice from "../components/ApiErrorNotice"
import { useGetPaymentsQuery } from "../lib/account-data/rtk"

export default function PaymentPage() {
  const { data, error } = useGetPaymentsQuery(undefined)
  const methods = data?.methods ?? []

  return (
    <AccountPageShell eyebrow="Billing" title="Payment methods">
      <ApiErrorNotice
        error={error}
        fallback="Unable to load your payment methods."
      />
      <div className="space-y-4">
        {methods.map((method) => (
          <ResourceCard key={method.id}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p
                  className="text-[15px] font-semibold"
                  style={{ color: "#111111" }}
                >
                  {method.brand} ending in {method.last4}
                </p>
                <p className="text-[13px] mt-1" style={{ color: "#292B2F" }}>
                  Expires {method.expiry}
                </p>
              </div>
              {method.isDefault && (
                <span
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                  style={{ backgroundColor: "#E8E9EB", color: "#111111" }}
                >
                  Default
                </span>
              )}
            </div>
          </ResourceCard>
        ))}
        {methods.length === 0 && (
          <p className="text-[13px]" style={{ color: "#292B2F" }}>
            Saved payment methods are not exposed by the current payments API.
            Payments use the secure provider checkout instead.
          </p>
        )}
      </div>
    </AccountPageShell>
  )
}
