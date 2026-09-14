"use client"

import { useEffect, useState } from "react"
import AccountPageShell, { ResourceCard } from "../components/AccountPageShell"
import { apiClient } from "../lib/api"
import type { TransactionSummary } from "../lib/api-types"

export default function TransactionPage() {
  const [transactions, setTransactions] = useState<TransactionSummary[]>([])
  useEffect(() => {
    void apiClient.getTransactions().then(setTransactions)
  }, [])

  return (
    <AccountPageShell eyebrow="Account activity" title="Transactions">
      <ResourceCard>
        <div className="divide-y" style={{ borderColor: "#E8E9EB" }}>
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="py-4 first:pt-0 last:pb-0 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p
                  className="text-[14px] font-medium"
                  style={{ color: "#111111" }}
                >
                  {transaction.description}
                </p>
                <p className="text-[12px] mt-1" style={{ color: "#292B2F" }}>
                  {transaction.type} · {transaction.createdAt} ·{" "}
                  {transaction.id}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`font-mono-data font-semibold ${
                    transaction.amount < 0 ? "text-[#111111]" : "text-[#292B2F]"
                  }`}
                >
                  {transaction.amount < 0 ? "-" : "+"}$
                  {Math.abs(transaction.amount).toLocaleString()}
                </span>
                <span
                  className="px-2 py-1 rounded-full text-[11px]"
                  style={{ backgroundColor: "#E8E9EB", color: "#111111" }}
                >
                  {transaction.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ResourceCard>
    </AccountPageShell>
  )
}
