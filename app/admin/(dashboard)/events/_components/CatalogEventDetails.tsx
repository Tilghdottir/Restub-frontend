"use client"

import AdminDetail from "../../../../../components/admin/AdminDetail"
import type { CatalogEvent } from "../../../../../lib/events/models"

export default function CatalogEventDetails({
  selected,
  duplicates,
  isLoading,
  formatDate,
  getEventDate,
  safeExternalUrl,
}: {
  selected: CatalogEvent | null
  duplicates: CatalogEvent[]
  isLoading: boolean
  formatDate: (value: string | null) => string
  getEventDate: (event: CatalogEvent) => string | null
  safeExternalUrl: (value: string) => string | null
}) {
  if (!selected) {
    return (
      <section className="rounded-lg border border-[#E8E9EB] bg-white p-6 text-[13px] text-[#292B2F]">
        {isLoading
          ? "Loading event details…"
          : "Select an event to view details."}
      </section>
    )
  }

  const sourceUrl = safeExternalUrl(selected.url)

  return (
    <section className="overflow-hidden rounded-lg border border-[#E8E9EB] bg-white">
      <div className="border-b border-[#E8E9EB] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono-data text-[11px] text-[#292B2F]">
              {selected.id}
            </p>
            <h2 className="mt-1 text-xl font-bold text-[#111111]">
              {selected.name}
            </h2>
            <p className="mt-1 text-[13px] text-[#292B2F]">
              {selected.venue ?? "Venue not provided"} ·{" "}
              {formatDate(getEventDate(selected))}
            </p>
          </div>
          <span className="rounded-full bg-[#E8E9EB] px-2.5 py-1 text-[11px] font-medium text-[#111111]">
            {selected.resaleEnabled ? "Resale enabled" : "Resale disabled"}
          </span>
        </div>
      </div>

      <div className="grid gap-x-8 gap-y-5 p-5 sm:grid-cols-2">
        <AdminDetail label="Ticketing partner" value={selected.partnerSlug} />
        <AdminDetail label="Source event ID" value={selected.externalEventId} />
        <AdminDetail
          label="Address"
          value={selected.address ?? "Not provided"}
        />
        <AdminDetail
          label="Price range"
          value={
            selected.priceRange ??
            (selected.currency ? selected.currency : "Not provided")
          }
        />
        <AdminDetail
          label="Last partner sync"
          value={formatDate(selected.lastScrapedAt)}
        />
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-[#292B2F]">
            Source
          </p>
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block break-all text-[13px] text-[#111111] underline"
            >
              Open partner event
            </a>
          ) : (
            <p className="mt-1 text-[13px] text-[#111111]">
              No secure source link
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-[#E8E9EB] p-5">
        <h3 className="text-[12px] font-semibold uppercase tracking-wide text-[#111111]">
          Ticket categories
        </h3>
        {selected.tickets.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {selected.tickets.map((ticket, index) => (
              <li
                key={`${ticket.name}-${index}`}
                className="rounded-full border border-[#E8E9EB] px-3 py-1.5 text-[12px] text-[#111111]"
              >
                {ticket.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[13px] text-[#292B2F]">
            No ticket categories provided by the partner.
          </p>
        )}
        {selected.description ? (
          <p className="mt-4 whitespace-pre-wrap text-[13px] leading-6 text-[#292B2F]">
            {selected.description}
          </p>
        ) : null}
      </div>

      {duplicates.length > 0 ? (
        <div className="border-t border-[#E8E9EB] p-5">
          <h3 className="text-[12px] font-semibold uppercase tracking-wide text-[#111111]">
            Potential duplicate matches
          </h3>
          <p className="mt-1 text-[11px] text-[#292B2F]">
            Heuristic only: same venue, within 24 hours, and similar title.
            Verify before taking action.
          </p>
          <ul className="mt-3 space-y-2">
            {duplicates.map((event) => (
              <li
                key={event.id}
                className="rounded-lg border border-[#E8E9EB] px-3 py-2 text-[12px] text-[#111111]"
              >
                {event.name} · {event.partnerSlug} ·{" "}
                {formatDate(getEventDate(event))}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
