"use client"

import Link from "next/link"
import type { DashboardTicketSummary } from "../../../../lib/account-data/types"
import { ResourceCard } from "../../../../components/account/AccountPageShell"
import DashboardTicketRow from "./DashboardTicketRow"

const filters = ["All", "Upcoming", "Listed", "Transferred", "Past"] as const
type TicketFilter = typeof filters[number]

export default function DashboardTicketSection({
  activeFilter,
  onFilterChange,
  isLoading,
  hasError,
  tickets,
}: {
  activeFilter: TicketFilter
  onFilterChange: (filter: TicketFilter) => void
  isLoading: boolean
  hasError: boolean
  tickets: DashboardTicketSummary[]
}) {
  return (
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
            onClick={() => onFilterChange(filter)}
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
      {isLoading ? (
        <ResourceCard>
          <p role="status" className="text-[13px] text-[#292B2F]">
            Loading tickets…
          </p>
        </ResourceCard>
      ) : hasError ? (
        <ResourceCard>
          <p className="text-[13px] text-[#292B2F]">
            Your ticket list is unavailable right now.
          </p>
        </ResourceCard>
      ) : tickets.length === 0 ? (
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
          {tickets.map((ticket) => (
            <DashboardTicketRow key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </section>
  )
}
