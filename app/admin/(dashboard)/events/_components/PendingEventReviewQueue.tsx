"use client"

import type { PendingCatalogEvent } from "../../../../../lib/events/types"

export default function PendingEventReviewQueue({
  events,
  isLoading,
  isFetching,
  hasError,
  isApproving,
  hasMore,
  nextCursor,
  canGoPrevious,
  formatDate,
  safeExternalUrl,
  onRefresh,
  onApprove,
  onPrevious,
  onNext,
}: {
  events: PendingCatalogEvent[]
  isLoading: boolean
  isFetching: boolean
  hasError: boolean
  isApproving: boolean
  hasMore: boolean
  nextCursor: string | null
  canGoPrevious: boolean
  formatDate: (value: string | null) => string
  safeExternalUrl: (value: string) => string | null
  onRefresh: () => void
  onApprove: (id: string) => void
  onPrevious: () => void
  onNext: () => void
}) {
  return (
    <section className="mb-6 overflow-hidden rounded-lg border border-[#E8E9EB] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E9EB] px-4 py-3">
        <div>
          <h2 className="text-[12px] font-semibold uppercase tracking-wide text-[#111111]">
            Pending event review
          </h2>
          <p className="mt-1 text-[11px] text-[#292B2F]">
            {events.length} shown · approve only after verifying the submitted
            catalog details.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isFetching}
          className="rounded-lg border border-[#E8E9EB] px-3 py-2 text-[11px] font-semibold text-[#111111] disabled:opacity-50"
        >
          {isFetching ? "Refreshing…" : "Refresh pending events"}
        </button>
      </div>
      {isLoading ? (
        <p className="px-4 py-5 text-[13px] text-[#292B2F]">
          Loading pending events…
        </p>
      ) : events.length ? (
        <ul className="divide-y divide-[#E8E9EB]">
          {events.map((event) => {
            const sourceUrl = safeExternalUrl(event.sourceUrl)
            return (
              <li
                key={event.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-mono-data text-[10px] text-[#292B2F]">
                    {event.id} · {event.sourceSlug}
                  </p>
                  <p className="mt-1 text-[14px] font-semibold text-[#111111]">
                    {event.title}
                  </p>
                  <p className="mt-1 text-[12px] text-[#292B2F]">
                    {event.venue ?? "Venue not provided"} · submitted{" "}
                    {formatDate(event.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {sourceUrl ? (
                    <a
                      href={sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-[#E8E9EB] px-3 py-2 text-[11px] font-semibold text-[#111111]"
                    >
                      Review source
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onApprove(event.id)}
                    disabled={isApproving}
                    className="rounded-lg bg-[#111111] px-3 py-2 text-[11px] font-semibold text-white disabled:opacity-50"
                  >
                    {isApproving ? "Approving…" : "Approve"}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      ) : hasError ? null : (
        <p className="px-4 py-5 text-[13px] text-[#292B2F]">
          No events are awaiting review.
        </p>
      )}
      <div className="flex items-center justify-between border-t border-[#E8E9EB] px-4 py-3">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!canGoPrevious || isFetching}
          className="rounded border border-[#E8E9EB] px-3 py-2 text-[11px] font-semibold text-[#111111] disabled:opacity-40"
        >
          Previous
        </button>
        <span className="text-[11px] text-[#292B2F]">
          {events.length} events
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasMore || !nextCursor || isFetching}
          className="rounded border border-[#E8E9EB] px-3 py-2 text-[11px] font-semibold text-[#111111] disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </section>
  )
}
