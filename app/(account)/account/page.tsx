"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import AccountPageShell from "../../../components/account/AccountPageShell"
import ApiErrorNotice from "../../../components/ui/ApiErrorNotice"
import AccountSummaryCard from "./_components/AccountSummaryCard"
import AccountActionRequired from "./_components/AccountActionRequired"
import DashboardActivitySection from "./_components/DashboardActivitySection"
import DashboardMoneyDetails from "./_components/DashboardMoneyDetails"
import DashboardPayoutSummary from "./_components/DashboardPayoutSummary"
import DashboardTicketSection from "./_components/DashboardTicketSection"
import NextEventSummary from "./_components/NextEventSummary"
import {
  useGetDashboardTicketsQuery,
  useGetNotificationsQuery,
  useGetPaymentsQuery,
} from "../../../lib/account-data/rtk"
import type { DashboardTicketSummary } from "../../../lib/account-data/types"
import { useGetPayoutAccountsQuery } from "../../../lib/payouts/rtk"
import { useGetSellerEarningsQuery } from "../../../lib/payments/rtk"

type TicketFilter = "All" | "Upcoming" | "Listed" | "Transferred" | "Past"

function isUpcoming(ticket: DashboardTicketSummary, now: number): boolean {
  const date = ticket.eventDate ? new Date(ticket.eventDate).getTime() : NaN
  return Number.isFinite(date) && date >= now
}

function filterTickets(
  tickets: DashboardTicketSummary[],
  filter: TicketFilter,
): DashboardTicketSummary[] {
  const now = Date.now()
  return tickets.filter((ticket) => {
    switch (filter) {
      case "Upcoming":
        return (
          ticket.relationship === "buyer" &&
          ticket.status === "valid" &&
          isUpcoming(ticket, now)
        )
      case "Listed":
        return ticket.status === "listed"
      case "Transferred":
        return ticket.status === "transferred"
      case "Past":
        return (
          ticket.status === "used" ||
          ticket.status === "expired" ||
          ticket.status === "cancelled" ||
          ticket.status === "refunded" ||
          ticket.status === "invalid" ||
          (ticket.eventDate !== null &&
            new Date(ticket.eventDate).getTime() < now)
        )
      default:
        return true
    }
  })
}

function nextEventLabel(value: string | null): string {
  if (!value) return ""
  const difference = new Date(value).getTime() - Date.now()
  if (!Number.isFinite(difference) || difference < 0) return ""
  const days = Math.ceil(difference / (1000 * 60 * 60 * 24))
  if (days === 0) return "Today"
  if (days === 1) return "Tomorrow"
  return `In ${days} days`
}

export default function AccountPage() {
  const [activeFilter, setActiveFilter] = useState<TicketFilter>("All")
  const {
    data: tickets = [],
    error: ticketsError,
    isLoading: ticketsLoading,
  } = useGetDashboardTicketsQuery()
  const {
    data: notifications = [],
    error: notificationsError,
    isLoading: notificationsLoading,
  } = useGetNotificationsQuery()
  const hasSellingActivity = tickets.some(
    (ticket) => ticket.relationship === "seller",
  )
  const sellerOrders = tickets.filter(
    (ticket) => ticket.relationship === "seller" && ticket.orderId !== null,
  )
  const {
    data: earnings,
    error: earningsError,
    isLoading: earningsLoading,
  } = useGetSellerEarningsQuery(undefined, { skip: !hasSellingActivity })
  const { data: payoutAccounts = [], error: payoutsError } =
    useGetPayoutAccountsQuery(undefined, { skip: !hasSellingActivity })
  const {
    data: payments,
    error: paymentsError,
    isLoading: paymentsLoading,
  } = useGetPaymentsQuery(undefined, { skip: !hasSellingActivity })

  const sortedTickets = useMemo(
    () =>
      [...tickets].sort((left, right) => {
        const leftDate = left.eventDate
          ? new Date(left.eventDate).getTime()
          : Number.MAX_SAFE_INTEGER
        const rightDate = right.eventDate
          ? new Date(right.eventDate).getTime()
          : Number.MAX_SAFE_INTEGER
        return leftDate - rightDate || left.id.localeCompare(right.id)
      }),
    [tickets],
  )
  const nextEvent = sortedTickets.find(
    (ticket) =>
      ticket.relationship === "buyer" &&
      ticket.status === "valid" &&
      !ticket.eventCancelled &&
      isUpcoming(ticket, Date.now()),
  )
  const ticketsOwned = tickets
    .filter((ticket) => ticket.status === "valid" || ticket.status === "listed")
    .reduce((count, ticket) => count + ticket.quantity, 0)
  const activeListings = tickets
    .filter(
      (ticket) =>
        ticket.relationship === "seller" && ticket.status === "listed",
    )
    .reduce((count, ticket) => count + ticket.quantity, 0)
  const visibleTickets = filterTickets(sortedTickets, activeFilter)
  const urgentItems = [
    ...new Map(
      tickets
        .filter((ticket) => ticket.attention)
        .map((ticket) => [
          `${ticket.attention}|${ticket.orderId ?? ticket.listingId ?? ticket.id}`,
          ticket,
        ]),
    ).values(),
  ]
  const payoutStatus =
    earnings?.payoutAccountStatus ?? payoutAccounts[0]?.status ?? null
  const payoutBlocked =
    payoutStatus === "failed" || payoutStatus === "suspended"
  const relevantEarnings = earnings?.currencies ?? []
  return (
    <AccountPageShell
      eyebrow="Your tickets and money"
      title="My account"
      headerAction={
        <div className="flex flex-wrap gap-2">
          <Link
            href="/account/my-listings"
            className="rounded-lg border border-[#E8E9EB] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#111111]"
          >
            Seller workspace
          </Link>
          <Link
            href="/sell"
            className="rounded-lg bg-[#111111] px-4 py-2.5 text-[12px] font-semibold text-[#FAFAF7]"
          >
            List tickets
          </Link>
        </div>
      }
    >
      {ticketsError ? (
        <ApiErrorNotice
          error={ticketsError}
          fallback="Unable to load your tickets."
        />
      ) : null}

      <AccountActionRequired
        items={urgentItems}
        payoutBlocked={payoutBlocked}
      />

      <section
        aria-label="Account summary"
        className="-mx-6 mb-7 flex snap-x gap-3 overflow-x-auto px-6 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4"
      >
        <NextEventSummary event={nextEvent} relativeDate={nextEventLabel} />
        <AccountSummaryCard
          label="Tickets owned"
          value={ticketsLoading ? "…" : String(ticketsOwned)}
          detail="Tickets and listings in your account"
        />
        {!hasSellingActivity ? (
          <AccountSummaryCard
            label="Recent updates"
            value={notificationsLoading ? "…" : String(notifications.length)}
            detail="Purchases, sales, and account activity"
            href="#activity-heading"
          />
        ) : null}
        {hasSellingActivity ? (
          <>
            <AccountSummaryCard
              label="Active listings"
              value={ticketsLoading ? "…" : String(activeListings)}
              detail="Tickets currently listed"
              href="/account/my-listings"
            />
            <AccountSummaryCard
              label="Sales"
              value={ticketsLoading ? "…" : String(sellerOrders.length)}
              detail="Orders and delivery status"
              href="/account/my-listings"
            />
            <DashboardPayoutSummary
              currencies={relevantEarnings}
              payoutStatus={payoutStatus}
              isLoading={earningsLoading}
              earningsError={earningsError}
              payoutsError={payoutsError}
            />
          </>
        ) : null}
      </section>

      <DashboardTicketSection
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        isLoading={ticketsLoading}
        hasError={Boolean(ticketsError)}
        tickets={visibleTickets}
      />

      <DashboardActivitySection
        notifications={notifications}
        isLoading={notificationsLoading}
        error={notificationsError}
      />

      {hasSellingActivity ? (
        <DashboardMoneyDetails
          currencies={relevantEarnings}
          earningsLoading={earningsLoading}
          earningsError={earningsError}
          paymentsError={paymentsError}
          paymentsLoading={paymentsLoading}
          payments={payments}
        />
      ) : null}
    </AccountPageShell>
  )
}
