"use client"

import type { CatalogEvent } from "../../../../../lib/events/models"

export default function CatalogEventList({
  events,
  filteredEvents,
  selectedId,
  search,
  isLoading,
  onSearchChange,
  onSelect,
  formatDate,
  getEventDate,
  isPotentialDuplicate,
}: {
  events: CatalogEvent[]
  filteredEvents: CatalogEvent[]
  selectedId: string | null
  search: string
  isLoading: boolean
  onSearchChange: (value: string) => void
  onSelect: (id: string) => void
  formatDate: (value: string | null) => string
  getEventDate: (event: CatalogEvent) => string | null
  isPotentialDuplicate: (
    candidate: CatalogEvent,
    selected: CatalogEvent,
  ) => boolean
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-[#E8E9EB] bg-white">
      <div className="border-b border-[#E8E9EB] p-4">
        <label
          htmlFor="catalog-search"
          className="text-[12px] font-semibold uppercase tracking-wide text-[#111111]"
        >
          Search catalog
        </label>
        <input
          id="catalog-search"
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Event, venue, or partner"
          className="mt-2 block w-full rounded-lg border border-[#E8E9EB] bg-white px-3 py-2.5 text-[13px] text-[#111111]"
        />
        <p className="mt-2 font-mono-data text-[11px] text-[#292B2F]">
          {filteredEvents.length} events
        </p>
      </div>

      {isLoading ? (
        <p className="px-4 py-5 text-[13px] text-[#292B2F]">
          Loading live events…
        </p>
      ) : filteredEvents.length === 0 ? (
        <p className="px-4 py-5 text-[13px] text-[#292B2F]">
          {events.length === 0
            ? "The backend returned no catalog events."
            : "No events match this search."}
        </p>
      ) : (
        <ul className="max-h-[720px] divide-y divide-[#E8E9EB] overflow-y-auto">
          {filteredEvents.map((event) => {
            const isSelected = selectedId === event.id
            const isDuplicate = events.some((candidate) =>
              isPotentialDuplicate(candidate, event),
            )
            return (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => onSelect(event.id)}
                  aria-pressed={isSelected}
                  className="w-full px-4 py-4 text-left transition-colors hover:bg-[#FAFAF7]"
                  style={{
                    backgroundColor: isSelected ? "#FAFAF7" : "#FFFFFF",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-[#111111]">
                        {event.name}
                      </p>
                      <p className="mt-1 text-[12px] text-[#292B2F]">
                        {event.venue ?? "Venue not provided"} ·{" "}
                        {formatDate(getEventDate(event))}
                      </p>
                      <p className="mt-1 text-[11px] uppercase tracking-wide text-[#292B2F]">
                        {event.partnerSlug}
                      </p>
                    </div>
                    {isDuplicate ? (
                      <span className="shrink-0 rounded-full border border-[#111111] px-2 py-1 text-[10px] font-semibold uppercase text-[#111111]">
                        Possible duplicate
                      </span>
                    ) : null}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
