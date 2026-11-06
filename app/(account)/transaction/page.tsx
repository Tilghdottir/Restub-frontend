"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import AccountPageShell, {
  ResourceCard,
} from "../../../components/account/AccountPageShell"
import {
  useGetPaymentsQuery,
  useLazyGetPaymentsQuery,
} from "../../../lib/account-data/rtk"
import type { TransactionSummary } from "../../../lib/account-data/types"
import TransactionFilters, {
  type DateRange,
  type TransactionType,
} from "./_components/TransactionFilters"
import TransactionList from "./_components/TransactionList"

function csvCell(value: string | number): string {
  return `"${String(value).replace(/"/g, '""')}"`
}

function matchesSearch(
  transaction: TransactionSummary,
  query: string,
): boolean {
  if (!query) return true
  const searchable = [
    transaction.orderId,
    transaction.provider,
    transaction.providerReference,
    transaction.status,
  ]
  return searchable.some((value) => value?.toLowerCase().includes(query))
}

export default function TransactionPage() {
  const { data, error, isLoading, isFetching, refetch } =
    useGetPaymentsQuery(undefined)
  const [loadPage] = useLazyGetPaymentsQuery()
  const [transactions, setTransactions] = useState<TransactionSummary[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>("all")
  const [transactionType, setTransactionType] = useState<TransactionType>("all")
  const [search, setSearch] = useState("")
  const [loadingMore, setLoadingMore] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [pageError, setPageError] = useState("")
  const [exportError, setExportError] = useState("")

  useEffect(() => {
    setTransactions(data?.transactions ?? [])
    setNextCursor(data?.hasMore ? data.nextCursor : null)
    setPageError("")
  }, [data])

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase()
    const earliestDate =
      dateRange === "all"
        ? null
        : Date.now() - Number(dateRange) * 24 * 60 * 60 * 1000
    return transactions.filter((transaction) => {
      if (transactionType === "refunds" && transaction.status !== "refunded") {
        return false
      }
      if (transactionType === "payments" && transaction.status === "refunded") {
        return false
      }
      if (earliestDate !== null) {
        const createdAt = new Date(transaction.createdAt).getTime()
        if (!Number.isFinite(createdAt) || createdAt < earliestDate) {
          return false
        }
      }
      return matchesSearch(transaction, query)
    })
  }, [dateRange, search, transactionType, transactions])

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return
    setPageError("")
    setLoadingMore(true)
    try {
      const page = await loadPage(nextCursor).unwrap()
      setTransactions((current) => [
        ...current,
        ...page.transactions.filter(
          (next) => !current.some((item) => item.id === next.id),
        ),
      ])
      setNextCursor(page.hasMore ? page.nextCursor : null)
    } catch {
      setPageError("We couldn’t load more transactions. Try again.")
    } finally {
      setLoadingMore(false)
    }
  }

  const exportTransactions = async () => {
    setExportError("")
    setExporting(true)
    try {
      const complete = [...transactions]
      const seenCursors = new Set<string>()
      let cursor = nextCursor
      while (cursor) {
        if (seenCursors.has(cursor)) {
          throw new Error("The transaction page cursor did not advance.")
        }
        seenCursors.add(cursor)
        const page = await loadPage(cursor).unwrap()
        complete.push(
          ...page.transactions.filter(
            (next) => !complete.some((item) => item.id === next.id),
          ),
        )
        cursor = page.hasMore ? page.nextCursor : null
      }

      const query = search.trim().toLowerCase()
      const earliestDate =
        dateRange === "all"
          ? null
          : Date.now() - Number(dateRange) * 24 * 60 * 60 * 1000
      const rows = complete.filter((transaction) => {
        if (
          transactionType === "refunds" &&
          transaction.status !== "refunded"
        ) {
          return false
        }
        if (
          transactionType === "payments" &&
          transaction.status === "refunded"
        ) {
          return false
        }
        if (earliestDate !== null) {
          const createdAt = new Date(transaction.createdAt).getTime()
          if (!Number.isFinite(createdAt) || createdAt < earliestDate) {
            return false
          }
        }
        return matchesSearch(transaction, query)
      })

      const csv = [
        ["Date", "Order", "Type", "Status", "Amount", "Provider", "Reference"]
          .map(csvCell)
          .join(","),
        ...rows.map((transaction) =>
          [
            transaction.createdAt,
            transaction.orderId,
            transaction.status === "refunded" ? "Refund" : "Payment",
            transaction.status,
            `${transaction.currency} ${transaction.amount.toFixed(2)}`,
            transaction.provider,
            transaction.providerReference ?? transaction.id,
          ]
            .map(csvCell)
            .join(","),
        ),
      ].join("\r\n")
      const url = URL.createObjectURL(
        new Blob([csv], { type: "text/csv;charset=utf-8" }),
      )
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = "restub-transactions.csv"
      anchor.click()
      URL.revokeObjectURL(url)
    } catch {
      setExportError("We couldn’t export transactions. Please try again.")
    } finally {
      setExporting(false)
    }
  }

  return (
    <AccountPageShell eyebrow="Money" title="Transactions">
      <p className="mb-5 max-w-3xl text-[14px] leading-relaxed text-[#292B2F]">
        Payments and refunds recorded against your orders. Orders track tickets;
        this page tracks money movements.{" "}
        <Link
          href="/payout-account"
          className="font-medium underline underline-offset-2"
        >
          Manage payout settings
        </Link>
        .
      </p>
      <p className="mb-3 text-[12px] text-[#62656A]">
        Filters apply to transactions currently loaded. Load more to include
        older records; CSV export includes all pages that match your filters.
      </p>

      <TransactionFilters
        dateRange={dateRange}
        transactionType={transactionType}
        search={search}
        exporting={exporting}
        isLoading={isLoading}
        onDateRangeChange={setDateRange}
        onTransactionTypeChange={setTransactionType}
        onSearchChange={setSearch}
        onExport={() => void exportTransactions()}
      />
      {exportError ? (
        <p role="alert" className="mb-4 text-[13px] text-[#8A3028]">
          {exportError}
        </p>
      ) : null}
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[12px] text-[#62656A]">
          {filteredTransactions.length} transaction
          {filteredTransactions.length === 1 ? "" : "s"}
          {isFetching && !isLoading ? " · Updating…" : ""}
        </p>
        {data && !isLoading ? (
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="text-[12px] underline underline-offset-2 disabled:opacity-60"
          >
            Refresh
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <ResourceCard>
          <div
            className="animate-pulse space-y-4"
            aria-label="Loading transactions"
          >
            {[0, 1, 2].map((row) => (
              <div
                key={row}
                className="flex items-center justify-between gap-6 border-b border-[#E8E9EB] pb-4 last:border-0 last:pb-0"
              >
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 rounded bg-[#E8E9EB]" />
                  <div className="h-3 w-64 max-w-full rounded bg-[#F0F0EE]" />
                </div>
                <div className="h-5 w-24 rounded bg-[#E8E9EB]" />
              </div>
            ))}
          </div>
          <span className="sr-only" role="status">
            Loading transactions…
          </span>
        </ResourceCard>
      ) : error ? (
        <ResourceCard>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p role="alert" className="text-[13px] text-[#8A3028]">
              We couldn’t load your transactions.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="rounded-lg bg-[#111111] px-4 py-2 text-[13px] font-semibold text-[#FAFAF7] disabled:opacity-60"
            >
              {isFetching ? "Retrying…" : "Retry"}
            </button>
          </div>
        </ResourceCard>
      ) : transactions.length === 0 ? (
        <ResourceCard>
          <h2 className="text-[15px] font-semibold text-[#111111]">
            No transactions yet
          </h2>
          <p className="mt-1 text-[13px] text-[#292B2F]">
            Payments and refunds will appear here when you buy or sell tickets.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-lg bg-[#111111] px-4 py-2.5 text-[13px] font-semibold text-[#FAFAF7]"
            >
              Find events
            </Link>
            <Link
              href="/sell"
              className="rounded-lg border border-[#111111] px-4 py-2.5 text-[13px] font-semibold text-[#111111]"
            >
              Sell a ticket
            </Link>
          </div>
        </ResourceCard>
      ) : filteredTransactions.length === 0 ? (
        <ResourceCard>
          <p className="text-[14px] font-medium text-[#111111]">
            No transactions match these filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setDateRange("all")
              setTransactionType("all")
              setSearch("")
            }}
            className="mt-3 text-[13px] font-medium underline underline-offset-2"
          >
            Clear filters
          </button>
        </ResourceCard>
      ) : (
        <ResourceCard>
          <TransactionList transactions={filteredTransactions} />
        </ResourceCard>
      )}

      {pageError ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p role="alert" className="text-[13px] text-[#8A3028]">
            {pageError}
          </p>
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loadingMore}
            className="text-[13px] font-medium underline underline-offset-2 disabled:opacity-60"
          >
            Retry
          </button>
        </div>
      ) : null}
      {nextCursor ? (
        <button
          type="button"
          disabled={loadingMore}
          onClick={() => void loadMore()}
          className="mt-4 rounded-lg bg-[#111111] px-5 py-3 text-[13px] font-semibold text-[#FAFAF7] disabled:opacity-60"
        >
          {loadingMore ? "Loading…" : "Load more"}
        </button>
      ) : null}
    </AccountPageShell>
  )
}
