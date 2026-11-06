"use client"

import Link from "next/link"
import AccountPageShell from "../../../../components/account/AccountPageShell"
import { useGetDashboardTicketsQuery } from "../../../../lib/account-data/rtk"
import type { DashboardTicketSummary } from "../../../../lib/account-data/types"
import { useGetMyListingsQuery } from "../../../../lib/listings/rtk"
import MyListingInventory from "./_components/MyListingInventory"
import MyListingSales from "./_components/MyListingSales"

function hasSellerOrder(
  ticket: DashboardTicketSummary,
): ticket is DashboardTicketSummary & { orderId: string } {
  return ticket.relationship === "seller" && ticket.orderId !== null
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
      tickets.filter(hasSellerOrder).map((ticket) => [ticket.orderId, ticket]),
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
      <MyListingInventory
        listings={listings}
        error={listingsError}
        isLoading={listingsLoading}
      />
      <MyListingSales
        sales={sales}
        error={ticketsError}
        isLoading={ticketsLoading}
      />
    </AccountPageShell>
  )
}
