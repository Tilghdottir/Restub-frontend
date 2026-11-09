import type { ReactNode } from "react"
import Link from "next/link"
import EventMetadata from "../../../components/events/EventMetadata"
import type { Event } from "../../../lib/data"
import { formatNaira } from "../../../lib/money"

export default function MarketplaceListingResults({
  events,
  isLoading,
  error,
  hasMore,
  isLoadingMore,
  loadMoreError,
  onLoadMore,
}: {
  events: Event[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  isLoadingMore: boolean
  loadMoreError: string | null
  onLoadMore: () => void
}) {
  if (isLoading) {
    return <EmptyState>Loading listings…</EmptyState>
  }
  if (error) {
    return <EmptyState title="Unable to load listings">{error}</EmptyState>
  }
  if (!events.length) {
    return (
      <EmptyState title="No listings found">
        Try a different search term.
      </EmptyState>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
      {hasMore ? (
        <div className="mt-8 text-center">
          {loadMoreError ? (
            <p className="mb-3 text-[13px] text-[#A03B32]" role="alert">
              Unable to load more listings. {loadMoreError}
            </p>
          ) : null}
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="rounded-lg border bg-white px-5 py-3 text-[13px] font-semibold text-[#111111] disabled:opacity-60"
            style={{ borderColor: "#E8E9EB" }}
          >
            {isLoadingMore ? "Loading…" : "Load more listings"}
          </button>
        </div>
      ) : null}
    </>
  )
}

function EmptyState({
  title,
  children,
}: {
  title?: string
  children: ReactNode
}) {
  return (
    <div
      className="rounded-lg border bg-white py-20 text-center"
      style={{ borderColor: "#E8E9EB" }}
    >
      {title ? (
        <p className="mb-1 text-[14px] font-medium text-[#111111]">{title}</p>
      ) : null}
      <p className="text-[13px] text-[#292B2F]">{children}</p>
    </div>
  )
}

function EventCard({ event }: { event: Event }) {
  return (
    <Link
      href={`/listings/${encodeURIComponent(String(event.id))}`}
      className="group block overflow-hidden rounded-lg border bg-white text-left transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2"
      style={{ borderColor: "#E8E9EB", outlineColor: "#111111" }}
    >
      <div
        className="relative overflow-hidden bg-gray-100"
        style={{ aspectRatio: "3/2" }}
      >
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {event.hot ? (
          <div className="absolute top-3 left-3">
            <span
              className="rounded-sm px-2 py-1 text-[10px] font-medium tracking-widest uppercase"
              style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
            >
              High Demand
            </span>
          </div>
        ) : null}
        {event.ticketsLeft <= 20 ? (
          <div className="absolute top-3 right-3">
            <span
              className="rounded-sm border bg-white px-2 py-1 font-mono-data text-[10px] tracking-wide text-[#111111]"
              style={{ borderColor: "#E8E9EB" }}
            >
              {event.ticketsLeft} left
            </span>
          </div>
        ) : null}
      </div>
      <div className="p-4">
        <p className="mb-1 text-[11px] font-medium tracking-wide text-[#292B2F] uppercase">
          {event.category}
        </p>
        <h3 className="truncate text-[15px] leading-tight font-semibold text-[#111111]">
          {event.title}
        </h3>
        <p className="mt-0.5 truncate text-[13px] text-[#292B2F]">
          {event.subtitle}
        </p>
        <div
          className="mt-3 flex items-end justify-between border-t pt-3"
          style={{ borderColor: "#E8E9EB" }}
        >
          <EventMetadata event={event} variant="card" />
          <div className="text-right">
            <p className="mb-0.5 text-[10px] text-[#292B2F]">from</p>
            <span className="font-mono-data text-[15px] font-semibold text-[#111111]">
              {formatNaira(event.minPrice)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
