"use client"

import Link from "next/link"
import { skipToken } from "@reduxjs/toolkit/query"
import AccountSidebar from "../../../components/account/AccountSidebar"
import ApiErrorNotice from "../../../components/ui/ApiErrorNotice"
import AdminSummaryCard from "../../../components/admin/AdminSummaryCard"
import AdminFinancialReportTable from "../../../components/admin/AdminFinancialReportTable"
import { ProtectedRoute } from "../../../components/ui/ProtectedRoute"
import { useAuth } from "../../hooks/useAuth"
import {
  useGetFinancialReportQuery,
  useGetPlatformSummaryQuery,
} from "../../../lib/admin/rtk"
import { useGetDisputesQuery } from "../../../lib/disputes/rtk"
import { useGetKycCasesQuery } from "../../../lib/kyc/rtk"
import { useGetPendingEventsQuery } from "../../../lib/events/rtk"
import { useGetManualReviewListingsQuery } from "../../../lib/listings/rtk"

export default function AdminPage() {
  return (
    <ProtectedRoute requiredPermission="platform:read">
      <AdminOverview />
    </ProtectedRoute>
  )
}

function AdminOverview() {
  const { hasPermission } = useAuth()
  const canResolveDisputes = hasPermission("disputes:resolve")
  const canReviewKyc = hasPermission("kyc:review")
  const canReviewTickets = hasPermission("tickets:review")
  const canManageEvents = hasPermission("events:manage")
  const canReadReports = hasPermission("financial-reports:read")

  const {
    data: platform,
    error: platformError,
    isLoading: platformLoading,
  } = useGetPlatformSummaryQuery()
  const {
    data: financialReport,
    error: financialError,
    isLoading: financialLoading,
  } = useGetFinancialReportQuery(canReadReports ? undefined : skipToken)
  const {
    data: disputePage,
    error: disputesError,
    isLoading: disputesLoading,
  } = useGetDisputesQuery(canResolveDisputes ? { limit: 100 } : skipToken)
  const {
    data: kycCases = [],
    error: kycError,
    isLoading: kycLoading,
  } = useGetKycCasesQuery(canReviewKyc ? undefined : skipToken)
  const {
    data: manualReviews = [],
    error: ticketError,
    isLoading: ticketLoading,
  } = useGetManualReviewListingsQuery(canReviewTickets ? undefined : skipToken)
  const {
    data: pendingEvents,
    error: eventsError,
    isLoading: eventsLoading,
  } = useGetPendingEventsQuery(canManageEvents ? { limit: 100 } : skipToken)

  const summaryCards = [
    { label: "Users", value: platform?.users },
    { label: "Listings", value: platform?.listings },
    { label: "Orders", value: platform?.orders },
    { label: "Escrows", value: platform?.escrows },
  ]
  const queueCards = [
    ...(canResolveDisputes
      ? [
          {
            label: "Dispute cases",
            count: disputePage?.items.length,
            hasMore: disputePage?.hasMore,
            loading: disputesLoading,
            unavailable: Boolean(disputesError),
            href: "/admin/disputes",
          },
        ]
      : []),
    ...(canReviewKyc
      ? [
          {
            label: "KYC reviews",
            count: kycCases.length,
            loading: kycLoading,
            unavailable: Boolean(kycError),
            href: "/admin/kyc",
          },
        ]
      : []),
    ...(canReviewTickets
      ? [
          {
            label: "Ticket reviews",
            count: manualReviews.length,
            loading: ticketLoading,
            unavailable: Boolean(ticketError),
            href: "/admin/tickets",
          },
        ]
      : []),
    ...(canManageEvents
      ? [
          {
            label: "Pending events",
            count: pendingEvents?.items.length,
            hasMore: pendingEvents?.hasMore,
            loading: eventsLoading,
            unavailable: Boolean(eventsError),
            href: "/admin/events",
          },
        ]
      : []),
  ]
  const financialRows = [
    ...(financialReport?.payments ?? []).map((row) => ({
      ...row,
      kind: "Payment",
    })),
    ...(financialReport?.transactions ?? []).map((row) => ({
      ...row,
      kind: "Transaction",
    })),
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAF7" }}>
      <AccountSidebar />
      <main className="mx-auto max-w-6xl px-6 py-8 lg:ml-64">
        <header className="mb-6">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-[#292B2F]">
            Admin
          </p>
          <h1 className="text-3xl font-bold text-[#111111]">
            Operations overview
          </h1>
          <p className="mt-2 text-[13px] text-[#292B2F]">
            Live platform counts and queues available to your permissions.
          </p>
        </header>

        <ApiErrorNotice
          error={platformError}
          fallback="Unable to load platform summary."
        />

        <section
          aria-label="Platform summary"
          className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {summaryCards.map((card) => (
            <AdminSummaryCard
              key={card.label}
              label={card.label}
              value={card.value}
              loading={platformLoading}
              unavailable={Boolean(platformError)}
              large
            />
          ))}
        </section>

        <section aria-labelledby="queues-heading">
          <h2
            id="queues-heading"
            className="mb-4 text-[12px] font-semibold uppercase tracking-wide text-[#111111]"
          >
            Review queues
          </h2>
          <ApiErrorNotice
            error={disputesError}
            fallback="Unable to load the dispute queue."
          />
          <ApiErrorNotice
            error={kycError}
            fallback="Unable to load KYC reviews."
          />
          <ApiErrorNotice
            error={ticketError}
            fallback="Unable to load ticket reviews."
          />
          <ApiErrorNotice
            error={eventsError}
            fallback="Unable to load pending events."
          />
          {queueCards.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {queueCards.map((card) => (
                <Link
                  key={card.label}
                  href={card.href}
                  className="rounded-lg border border-[#E8E9EB] bg-white p-5 hover:border-[#111111]"
                >
                  <p className="text-[11px] uppercase tracking-wide text-[#292B2F]">
                    {card.label}
                  </p>
                  <p
                    role={card.loading ? "status" : undefined}
                    className="mt-3 font-mono-data text-3xl font-bold text-[#111111]"
                  >
                    {card.loading
                      ? "Loading…"
                      : card.unavailable || card.count === undefined
                        ? "Unavailable"
                        : `${card.count}${card.hasMore ? "+" : ""}`}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-[#E8E9EB] bg-white p-5 text-[13px] text-[#292B2F]">
              No review queues are available for your permissions.
            </p>
          )}
        </section>

        {canReadReports && (
          <section className="mt-8" aria-labelledby="financial-report-heading">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2
                  id="financial-report-heading"
                  className="text-[12px] font-semibold uppercase tracking-wide text-[#111111]"
                >
                  Financial report
                </h2>
                <p className="mt-1 text-[12px] text-[#292B2F]">
                  {financialReport
                    ? `${formatDate(financialReport.from)} – ${formatDate(financialReport.to)}`
                    : "Default backend reporting range"}
                  {" · amounts in minor currency units"}
                </p>
              </div>
            </div>
            <ApiErrorNotice
              error={financialError}
              fallback="Unable to load the financial report."
            />
            <AdminFinancialReportTable
              rows={financialRows}
              isLoading={financialLoading}
              hasError={Boolean(financialError)}
            />
          </section>
        )}
      </main>
    </div>
  )
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date)
}
