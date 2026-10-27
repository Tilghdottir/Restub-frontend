"use client"

import { useEffect, useState } from "react"
import AccountPageShell, { ResourceCard } from "../components/AccountPageShell"
import ApiErrorNotice from "../components/ApiErrorNotice"
import { formatNaira } from "../lib/money"
import {
  useGetPaymentsQuery,
  useLazyGetPaymentsQuery,
} from "../lib/account-data/rtk"
import type { TransactionSummary } from "../lib/account-data/types"

export default function TransactionPage() {
  const { data, error } = useGetPaymentsQuery(undefined)
  const [loadNextPage, { error: nextPageError, isFetching: loadingMore }] =
    useLazyGetPaymentsQuery()
  const [transactions, setTransactions] = useState<TransactionSummary[]>([])
  const nextCursor = data?.hasMore ? data.nextCursor : null

  useEffect(() => {
    setTransactions(data?.transactions ?? [])
  }, [data])

  return (
    <AccountPageShell eyebrow="Account activity" title="Transactions">
      <ApiErrorNotice error={error} fallback="Unable to load transactions." />
      <ApiErrorNotice
        error={nextPageError}
        fallback="Unable to load more payments."
      />
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
                  Payment for order {transaction.orderId}
                </p>
                <p className="text-[12px] mt-1" style={{ color: "#292B2F" }}>
                  {transaction.provider} · {transaction.createdAt} ·{" "}
                  {transaction.providerReference ?? transaction.id}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono-data font-semibold text-[#111111]">
                  {transaction.currency === "NGN"
                    ? formatNaira(transaction.amount)
                    : `${transaction.currency} ${transaction.amount.toLocaleString()}`}
                </span>
                <span
                  className="px-2 py-1 rounded-full text-[11px]"
                  style={{ backgroundColor: "#E8E9EB", color: "#111111" }}
                >
                  {transaction.status.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ResourceCard>
      {nextCursor && (
        <button
          type="button"
          disabled={loadingMore}
          onClick={async () => {
            const response = await loadNextPage(nextCursor)
            if (!response.data) return
            const page = response.data
            setTransactions((current) => [
              ...current,
              ...page.transactions.filter(
                (next) => !current.some((item) => item.id === next.id),
              ),
            ])
          }}
          className="px-5 py-3 rounded-lg text-[13px] font-semibold disabled:opacity-60"
          style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
        >
          {loadingMore ? "Loading…" : "Load more"}
        </button>
      )}
    </AccountPageShell>
  )
}
