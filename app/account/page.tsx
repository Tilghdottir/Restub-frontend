"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import AccountPageShell, { ResourceCard } from "../components/AccountPageShell"
import ApiErrorNotice from "../components/ApiErrorNotice"
import {
  useGetDashboardTicketsQuery,
  useGetNotificationsQuery,
  useGetPaymentsQuery,
} from "../lib/account-data/rtk"
import type { DashboardTicketSummary } from "../lib/account-data/types"
import { formatNaira } from "../lib/money"
import { useGetPayoutAccountsQuery } from "../lib/payouts/rtk"
import { useGetSellerEarningsQuery } from "../lib/payments/rtk"

const filters = ["All", "Upcoming", "Listed", "Transferred", "Past"] as const
type TicketFilter = typeof filters[number]

function isUpcoming(ticket: DashboardTicketSummary, now: number): boolean {
  const date = ticket.eventDate ? new Date(ticket.eventDate).getTime() : NaN
  return Number.isFinite(date) && date >= now
}

function formatEventDate(value: string | null): string {
  if (!value) return "Date to be confirmed"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: value.includes("T") ? "numeric" : undefined,
    minute: value.includes("T") ? "2-digit" : undefined,
  }).format(date)
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

function statusLabel(status: DashboardTicketSummary["status"]): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function actionLabel(action: DashboardTicketSummary["action"]): string | null {
  switch (action) {
    case "open_ticket":
      return "Open ticket"
    case "edit_listing":
      return "Edit listing"
    case "sell":
      return "Sell"
    case "transfer_now":
      return "Transfer now"
    default:
      return null
  }
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
  const hasEarnings = relevantEarnings.some(
    (summary) =>
      summary.pendingAmountMinor !== "0" ||
      summary.heldAmountMinor !== "0" ||
      summary.releasedAmountMinor !== "0",
  )

  return (
    <AccountPageShell
      eyebrow="Your tickets and money"
      title="My account"
      headerAction={
        <Link
          href="/sell"
          className="rounded-lg bg-[#111111] px-4 py-2.5 text-[12px] font-semibold text-[#FAFAF7]"
        >
          List tickets
        </Link>
      }
    >
      {ticketsError ? (
        <ApiErrorNotice
          error={ticketsError}
          fallback="Unable to load your tickets."
        />
      ) : null}

      {urgentItems.length > 0 || payoutBlocked ? (
        <section
          aria-label="Action required"
          className="mb-5 overflow-hidden rounded-lg border border-[#E8C6C1] bg-[#FFF6F4]"
        >
          <div className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wide text-[#8A3028]">
            Action required
          </div>
          <ul className="divide-y divide-[#E8C6C1]">
            {urgentItems.map((ticket) => (
              <li
                key={`${ticket.id}-attention`}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-[13px] text-[#292B2F]"
              >
                <span>{ticket.attention}</span>
                {ticket.actionHref ? (
                  <Link
                    href={ticket.actionHref}
                    className="font-medium underline underline-offset-2"
                  >
                    View details
                  </Link>
                ) : null}
              </li>
            ))}
            {payoutBlocked ? (
              <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-[13px] text-[#292B2F]">
                <span>Your payout account needs attention.</span>
                <Link
                  href="/payout-account"
                  className="font-medium underline underline-offset-2"
                >
                  Review payout setup
                </Link>
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}

      <section
        aria-label="Account summary"
        className="-mx-6 mb-7 flex snap-x gap-3 overflow-x-auto px-6 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4"
      >
        <div className="min-w-[250px] snap-start sm:min-w-0">
          <ResourceCard>
            <p className="text-[11px] uppercase tracking-wide text-[#292B2F]">
              Next event
            </p>
            {nextEvent ? (
              <>
                <h2 className="mt-2 truncate text-[15px] font-semibold text-[#111111]">
                  {nextEvent.eventTitle}
                </h2>
                <p className="mt-1 text-[12px] text-[#292B2F]">
                  {formatEventDate(nextEvent.eventDate)}
                </p>
                <p className="mt-1 truncate text-[12px] text-[#292B2F]">
                  {nextEvent.venue ?? "Venue to be confirmed"} ·{" "}
                  {nextEventLabel(nextEvent.eventDate)}
                </p>
                <Link
                  href={
                    nextEvent.actionHref ??
                    (nextEvent.orderId
                      ? `/account/purchases/${encodeURIComponent(nextEvent.orderId)}`
                      : "/order")
                  }
                  className="mt-3 inline-block text-[12px] font-semibold underline underline-offset-2"
                >
                  Open ticket
                </Link>
              </>
            ) : (
              <>
                <h2 className="mt-2 text-[15px] font-semibold text-[#111111]">
                  No upcoming event
                </h2>
                <Link
                  href="/"
                  className="mt-3 inline-block text-[12px] font-semibold underline underline-offset-2"
                >
                  Find events
                </Link>
              </>
            )}
          </ResourceCard>
        </div>
        <SummaryCard
          label="Tickets owned"
          value={ticketsLoading ? "…" : String(ticketsOwned)}
          detail="Tickets and listings in your account"
        />
        {!hasSellingActivity ? (
          <SummaryCard
            label="Recent updates"
            value={notificationsLoading ? "…" : String(notifications.length)}
            detail="Purchases, sales, and account activity"
            href="#activity-heading"
          />
        ) : null}
        {hasSellingActivity ? (
          <>
            <SummaryCard
              label="Active listings"
              value={ticketsLoading ? "…" : String(activeListings)}
              detail="Tickets currently listed"
            />
            <ResourceCard>
              <p className="text-[11px] uppercase tracking-wide text-[#292B2F]">
                Payouts
              </p>
              {earningsLoading ? (
                <p className="mt-2 text-[15px] font-semibold text-[#111111]">
                  Loading…
                </p>
              ) : hasEarnings ? (
                relevantEarnings.map((summary) => (
                  <div key={summary.currency} className="mt-2">
                    <p className="font-mono-data text-[15px] font-semibold text-[#111111]">
                      {formatMinorAmount(
                        summary.pendingAmountMinor,
                        summary.currency,
                      )}{" "}
                      pending
                    </p>
                    <p className="mt-1 text-[11px] text-[#292B2F]">
                      {formatMinorAmount(
                        summary.heldAmountMinor,
                        summary.currency,
                      )}{" "}
                      held · {summary.currency}, last 30 days
                    </p>
                  </div>
                ))
              ) : (
                <p className="mt-2 text-[13px] text-[#292B2F]">
                  {payoutStatus
                    ? `Payout account ${payoutStatus}.`
                    : "No payout activity in the last 30 days."}
                </p>
              )}
              {earningsError || payoutsError ? (
                <ApiErrorNotice
                  error={earningsError ?? payoutsError}
                  fallback="Payout information is unavailable."
                />
              ) : null}
              {payoutStatus !== "verified" ? (
                <Link
                  href="/payout-account"
                  className="mt-3 inline-block text-[12px] font-semibold underline underline-offset-2"
                >
                  Set up payouts
                </Link>
              ) : null}
            </ResourceCard>
          </>
        ) : null}
      </section>

      <section aria-labelledby="tickets-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-[#292B2F]">
              Your tickets
            </p>
            <h2
              id="tickets-heading"
              className="mt-1 scroll-mt-20 text-[20px] font-semibold text-[#111111]"
            >
              Tickets and listings
            </h2>
          </div>
        </div>
        <div
          role="group"
          aria-label="Filter tickets"
          className="mb-4 flex gap-2 overflow-x-auto pb-1"
        >
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              aria-pressed={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-medium ${
                activeFilter === filter
                  ? "border-[#111111] bg-[#111111] text-white"
                  : "border-[#E8E9EB] bg-white text-[#292B2F]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        {ticketsLoading ? (
          <ResourceCard>
            <p role="status" className="text-[13px] text-[#292B2F]">
              Loading tickets…
            </p>
          </ResourceCard>
        ) : ticketsError ? (
          <ResourceCard>
            <p className="text-[13px] text-[#292B2F]">
              Your ticket list is unavailable right now.
            </p>
          </ResourceCard>
        ) : visibleTickets.length === 0 ? (
          <ResourceCard>
            <p className="text-[14px] font-semibold text-[#111111]">
              {activeFilter === "All"
                ? "No tickets yet."
                : `No ${activeFilter.toLowerCase()} tickets.`}
            </p>
            {activeFilter === "All" ? (
              <div className="mt-3 flex flex-wrap gap-4 text-[12px]">
                <Link
                  href="/"
                  className="font-medium underline underline-offset-2"
                >
                  Find events
                </Link>
                <Link
                  href="/sell"
                  className="font-medium underline underline-offset-2"
                >
                  Sell a ticket
                </Link>
              </div>
            ) : null}
          </ResourceCard>
        ) : (
          <div className="space-y-3">
            {visibleTickets.map((ticket) => (
              <TicketRow key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8" aria-labelledby="activity-heading">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-[#292B2F]">
              Updates
            </p>
            <h2
              id="activity-heading"
              className="mt-1 text-[18px] font-semibold text-[#111111]"
            >
              Activity
            </h2>
          </div>
          <div className="flex gap-3 text-[12px]">
            <Link href="/order" className="underline underline-offset-2">
              All orders
            </Link>
            <Link href="/notification" className="underline underline-offset-2">
              All activity
            </Link>
          </div>
        </div>
        <ApiErrorNotice
          error={notificationsError}
          fallback="Unable to load activity."
        />
        {notificationsLoading ? (
          <ResourceCard>
            <p className="text-[13px] text-[#292B2F]">Loading activity…</p>
          </ResourceCard>
        ) : notifications.length === 0 ? (
          <ResourceCard>
            <p className="text-[13px] text-[#292B2F]">
              Activity from purchases, sales, transfers, and payouts will appear
              here.
            </p>
          </ResourceCard>
        ) : (
          <div className="space-y-2">
            {notifications.slice(0, 6).map((notification) => (
              <ResourceCard key={notification.id}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-[13px] font-semibold capitalize text-[#111111]">
                    {notification.title}
                  </p>
                  <time
                    dateTime={notification.createdAt}
                    className="text-[11px] text-[#62656A]"
                  >
                    {formatEventDate(notification.createdAt)}
                  </time>
                </div>
                {notification.body ? (
                  <p className="mt-1 text-[12px] text-[#292B2F]">
                    {notification.body}
                  </p>
                ) : null}
              </ResourceCard>
            ))}
          </div>
        )}
      </section>

      {hasSellingActivity ? (
        <details className="mt-8 rounded-lg border border-[#E8E9EB] bg-white">
          <summary className="cursor-pointer px-5 py-4 text-[14px] font-semibold text-[#111111]">
            Money and payouts
          </summary>
          <div className="space-y-4 border-t border-[#E8E9EB] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-[14px] font-semibold text-[#111111]">
                  Earnings and escrow
                </h2>
                <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-[#292B2F]">
                  Figures cover the last 30 days. The current payout API reports
                  pending, held, and released amounts, but does not provide an
                  available wallet balance.
                </p>
              </div>
              <Link
                href="/payout-account"
                className="text-[12px] underline underline-offset-2"
              >
                Payout settings
              </Link>
            </div>
            <ApiErrorNotice
              error={earningsError}
              fallback="Unable to load earnings."
            />
            {earningsLoading ? (
              <p className="text-[13px] text-[#292B2F]">Loading earnings…</p>
            ) : relevantEarnings.length ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {relevantEarnings.flatMap((summary) =>
                  [
                    ["Pending", summary.pendingAmountMinor],
                    ["Held in escrow", summary.heldAmountMinor],
                    ["Released", summary.releasedAmountMinor],
                    ["Refunded", summary.refundedAmountMinor],
                  ].map(([label, amount]) => (
                    <div
                      key={`${summary.currency}-${label}`}
                      className="rounded-lg border border-[#E8E9EB] p-4"
                    >
                      <p className="text-[11px] uppercase tracking-wide text-[#292B2F]">
                        {label} · {summary.currency}
                      </p>
                      <p className="mt-2 font-mono-data text-[17px] font-semibold text-[#111111]">
                        {formatMinorAmount(amount, summary.currency)}
                      </p>
                    </div>
                  )),
                )}
              </div>
            ) : (
              <p className="text-[13px] text-[#292B2F]">
                No earnings were recorded in the last 30 days.
              </p>
            )}
            {relevantEarnings.some(
              (summary) => summary.sellerFeesStatus === "not_recorded",
            ) ? (
              <p className="text-[12px] text-[#62656A]">
                Seller fee breakdowns are not yet recorded by the payment API.
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-4 border-t border-[#E8E9EB] pt-4 text-[12px]">
              <Link href="/payment" className="underline underline-offset-2">
                Payment methods
              </Link>
              <Link
                href="/transaction"
                className="underline underline-offset-2"
              >
                Transactions
              </Link>
              {paymentsError ? (
                <span role="status" className="text-[#8A3028]">
                  Payment records unavailable.
                </span>
              ) : paymentsLoading ? (
                <span className="text-[#62656A]">Loading payments…</span>
              ) : (
                <span className="text-[#62656A]">
                  {payments?.transactions.length ?? 0} recent payment
                  {(payments?.transactions.length ?? 0) === 1 ? "" : "s"}
                </span>
              )}
            </div>
          </div>
        </details>
      ) : null}
    </AccountPageShell>
  )
}

function SummaryCard({
  label,
  value,
  detail,
  href,
}: {
  label: string
  value: string
  detail: string
  href?: string
}) {
  const card = (
    <ResourceCard>
      <p className="text-[11px] uppercase tracking-wide text-[#292B2F]">
        {label}
      </p>
      <p className="mt-2 font-mono-data text-[24px] font-semibold text-[#111111]">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-[#292B2F]">{detail}</p>
    </ResourceCard>
  )
  return href ? (
    <Link href={href} className="block min-w-[180px] snap-start sm:min-w-0">
      {card}
    </Link>
  ) : (
    <div className="min-w-[180px] snap-start sm:min-w-0">{card}</div>
  )
}

function TicketRow({ ticket }: { ticket: DashboardTicketSummary }) {
  const actionText = actionLabel(ticket.action)
  const canSell = ticket.relationship === "buyer" && ticket.status === "valid"
  return (
    <article
      className={`rounded-lg border p-4 sm:p-5 ${
        ticket.locked
          ? "border-[#E8E9EB] bg-[#F0F0EE]"
          : "border-[#E8E9EB] bg-white"
      }`}
      aria-label={`${ticket.eventTitle}, ${statusLabel(ticket.status)}${
        ticket.locked ? ", ticket unavailable for use" : ""
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[15px] font-semibold text-[#111111]">
              {ticket.eventTitle}
            </h3>
            {ticket.locked ? (
              <span className="text-[10px] uppercase tracking-wide text-[#62656A]">
                Locked
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[12px] text-[#292B2F]">
            {formatEventDate(ticket.eventDate)}
            {ticket.venue ? ` · ${ticket.venue}` : ""}
          </p>
          <p className="mt-1 text-[12px] text-[#292B2F]">
            {[
              ticket.section,
              ticket.row ? `Row ${ticket.row}` : null,
              ticket.seats ? `Seat ${ticket.seats}` : null,
            ]
              .filter(Boolean)
              .join(" · ") ||
              `${ticket.quantity} ticket${ticket.quantity === 1 ? "" : "s"}`}
          </p>
          {ticket.attention ? (
            <p className="mt-2 text-[12px] font-medium text-[#8A3028]">
              {ticket.attention}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium capitalize text-[#111111]">
            {statusLabel(ticket.status)}
          </span>
          {actionText && ticket.actionHref ? (
            <Link
              href={ticket.actionHref}
              className="rounded-lg bg-[#111111] px-3 py-2 text-[12px] font-semibold text-[#FAFAF7]"
            >
              {actionText}
            </Link>
          ) : actionText ? (
            <span className="text-[12px] font-medium text-[#62656A]">
              {ticket.status === "sold" ? "Awaiting acceptance" : actionText}
            </span>
          ) : null}
          {canSell ? (
            <Link
              href="/sell"
              className="text-[12px] font-medium underline underline-offset-2"
            >
              Sell
            </Link>
          ) : null}
          {ticket.actionHref && ticket.orderId ? (
            <Link
              href={ticket.actionHref}
              className="text-[12px] underline underline-offset-2"
            >
              Order support
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function formatMinorAmount(amount: string, currency: string): string {
  const value = Number(amount)
  if (!Number.isFinite(value)) return "—"
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value / 100)
  } catch {
    return `${currency} ${(value / 100).toLocaleString("en-NG")}`
  }
}
