"use client"

import Link from "next/link"
import AccountPageShell, {
  ResourceCard,
} from "../../components/AccountPageShell"
import ApiErrorNotice from "../../components/ApiErrorNotice"
import { useGetDashboardTicketsQuery } from "../../lib/account-data/rtk"
import type { DashboardTicketSummary } from "../../lib/account-data/types"
import { formatNaira } from "../../lib/money"
import { useGetMyListingsQuery } from "../../lib/listings/rtk"

function hasSellerOrder(
  ticket: DashboardTicketSummary,
): ticket is DashboardTicketSummary & { orderId: string } {
  return ticket.relationship === "seller" && ticket.orderId !== null
}

function listingStatusLabel(
  status: "draft" | "published" | "suspended" | "rejected",
  manualReviewStatus?: "not_submitted" | "pending" | "approved" | "rejected",
): string {
  if (status === "published") return "Published"
  if (manualReviewStatus === "pending") return "Awaiting staff review"
  if (manualReviewStatus === "approved") return "Approved · ready to publish"
  if (manualReviewStatus === "rejected") return "Review rejected · replace evidence"
  if (status === "suspended") return "Suspended"
  if (status === "rejected") return "Rejected"
  return "Draft · continue setup"
}

export default function MyListingsPage() {
  const {
    data: listings = [],
    error: listingsError,
    isLoading: listingsLoading,
  } = useGetMyListingsQuery()
  const {
    data: tickets = [],
    error: ticketsError,
    isLoading: ticketsLoading,
  } = useGetDashboardTicketsQuery()
  const sales = [
    ...new Map(
      tickets
        .filter(hasSellerOrder)
        .map((ticket) => [ticket.orderId, ticket]),
    ).values(),
  ]

  return (
    <AccountPageShell
      eyebrow="Seller workspace"
      title="My listings and sales"
      headerAction={
        <Link
          href="/sell"
          className="rounded-lg bg-[#111111] px-4 py-2.5 text-[12px] font-semibold text-[#FAFAF7]"
        >
          List tickets
        </Link>
      }
    >
      <section aria-labelledby="seller-listings-heading">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-[#292B2F]">
              Inventory and review
            </p>
            <h2
              id="seller-listings-heading"
              className="mt-1 text-[19px] font-semibold text-[#111111]"
            >
              Listings
            </h2>
          </div>
          <Link
            href="/account"
            className="text-[12px] underline underline-offset-2 text-[#111111]"
          >
            Account dashboard
          </Link>
        </div>
        <ApiErrorNotice
          error={listingsError}
          fallback="Unable to load your listings."
        />
        {listingsLoading ? (
          <ResourceCard>
            <p className="text-[13px] text-[#292B2F]">Loading listings…</p>
          </ResourceCard>
        ) : listings.length === 0 ? (
          <ResourceCard>
            <p className="text-[14px] font-semibold text-[#111111]">
              No listings yet.
            </p>
            <Link
              href="/sell"
              className="mt-3 inline-block text-[12px] font-medium underline underline-offset-2 text-[#111111]"
            >
              Start listing tickets
            </Link>
          </ResourceCard>
        ) : (
          <div className="space-y-3">
            {listings.map((listing) => (
              <ResourceCard key={listing.id}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="truncate text-[15px] font-semibold text-[#111111]">
                      {listing.eventTitle}
                    </h3>
                    <p className="mt-1 text-[12px] text-[#292B2F]">
                      {listing.ticketCategory ?? "General Admission"} ·{" "}
                      {listing.quantity} ticket
                      {listing.quantity === 1 ? "" : "s"}
                    </p>
                    <p className="mt-1 text-[12px] text-[#292B2F]">
                      <span className="font-mono-data font-semibold">
                        {formatNaira(listing.askingPrice)}
                      </span>{" "}
                      ·{" "}
                      {listingStatusLabel(
                        listing.status,
                        listing.manualReviewStatus,
                      )}
                    </p>
                    {listing.manualReviewNote ? (
                      <p className="mt-2 text-[12px] text-[#8A3028]">
                        Reviewer note: {listing.manualReviewNote}
                      </p>
                    ) : null}
                  </div>
                  {listing.status === "draft" ? (
                    <Link
                      href={`/sell?listingId=${encodeURIComponent(listing.id)}`}
                      className="shrink-0 rounded-lg bg-[#111111] px-4 py-2.5 text-center text-[12px] font-semibold text-[#FAFAF7]"
                    >
                      {listing.manualReviewStatus === "pending"
                        ? "Check review status"
                        : listing.manualReviewStatus === "approved"
                          ? "Continue to publish"
                          : "Continue draft"}
                    </Link>
                  ) : (
                    <Link
                      href={`/account/listings?id=${encodeURIComponent(listing.id)}`}
                      className="shrink-0 text-[12px] font-medium underline underline-offset-2 text-[#111111]"
                    >
                      View listing
                    </Link>
                  )}
                </div>
              </ResourceCard>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8" aria-labelledby="seller-sales-heading">
        <div className="mb-3">
          <p className="text-[11px] uppercase tracking-wide text-[#292B2F]">
            Orders, delivery, and settlement
          </p>
          <h2
            id="seller-sales-heading"
            className="mt-1 text-[19px] font-semibold text-[#111111]"
          >
            Sales
          </h2>
        </div>
        <ApiErrorNotice
          error={ticketsError}
          fallback="Unable to load seller order status."
        />
        {ticketsLoading ? (
          <ResourceCard>
            <p className="text-[13px] text-[#292B2F]">Loading sales…</p>
          </ResourceCard>
        ) : sales.length === 0 ? (
          <ResourceCard>
            <p className="text-[13px] text-[#292B2F]">
              Sales and delivery updates will appear here. Open an order to
              manage ticket delivery and escrow status.
            </p>
          </ResourceCard>
        ) : (
          <div className="space-y-3">
            {sales.map((sale) => (
              <ResourceCard key={sale.orderId}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[14px] font-semibold text-[#111111]">
                      {sale.eventTitle}
                    </p>
                    <p className="mt-1 text-[12px] text-[#292B2F]">
                      {sale.quantity} ticket{sale.quantity === 1 ? "" : "s"} ·{" "}
                      {sale.status.replace(/_/g, " ")}
                    </p>
                  </div>
                  <Link
                    href={`/account/purchases/${encodeURIComponent(sale.orderId)}`}
                    className="shrink-0 text-[12px] font-medium underline underline-offset-2 text-[#111111]"
                  >
                    View delivery and payout status
                  </Link>
                </div>
              </ResourceCard>
            ))}
          </div>
        )}
      </section>
    </AccountPageShell>
  )
}
