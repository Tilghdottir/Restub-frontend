"use client"

import { useEffect, useState } from "react"
import AccountPageShell, { ResourceCard } from "../components/AccountPageShell"
import { apiClient } from "../lib/api"
import type { RefundSummary } from "../lib/api-types"

export default function RefundPage() {
  const [refunds, setRefunds] = useState<RefundSummary[]>([])
  useEffect(() => {
    void apiClient.getRefunds().then(setRefunds)
  }, [])

  return (
    <AccountPageShell eyebrow="Order support" title="Refunds">
      <div className="space-y-4">
        {refunds.map((refund) => (
          <ResourceCard key={refund.id}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p
                  className="font-mono-data text-[11px]"
                  style={{ color: "#292B2F" }}
                >
                  {refund.id} · Order {refund.orderId}
                </p>
                <p
                  className="text-[15px] font-semibold mt-1"
                  style={{ color: "#111111" }}
                >
                  {refund.reason}
                </p>
                <p className="text-[13px] mt-1" style={{ color: "#292B2F" }}>
                  {refund.createdAt}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono-data font-semibold">
                  ${refund.amount.toLocaleString()}
                </span>
                <span
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                  style={{ backgroundColor: "#E8E9EB", color: "#111111" }}
                >
                  {refund.status}
                </span>
              </div>
            </div>
          </ResourceCard>
        ))}
        <ResourceCard>
          <h2
            className="text-[15px] font-semibold"
            style={{ color: "#111111" }}
          >
            Request a refund
          </h2>
          <p className="text-[13px] mt-1 mb-4" style={{ color: "#292B2F" }}>
            Select an order and tell us what happened.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <select
              className="border rounded-lg px-4 py-2.5 text-[13px]"
              style={{ borderColor: "#E8E9EB", backgroundColor: "#FAFAF7" }}
            >
              <option>RC-8921</option>
              <option>RC-6944</option>
            </select>
            <input
              placeholder="Reason for refund"
              className="border rounded-lg px-4 py-2.5 text-[13px]"
              style={{ borderColor: "#E8E9EB", backgroundColor: "#FAFAF7" }}
            />
          </div>
          <button
            className="mt-4 px-5 py-3 rounded-lg text-[13px] font-semibold"
            style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
          >
            Submit request
          </button>
        </ResourceCard>
      </div>
    </AccountPageShell>
  )
}
