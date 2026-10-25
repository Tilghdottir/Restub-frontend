"use client"

import { skipToken } from "@reduxjs/toolkit/query"
import { useMemo, useState } from "react"
import AccountSidebar from "../../components/AccountSidebar"
import ApiErrorNotice from "../../components/ApiErrorNotice"
import { ProtectedRoute } from "../../components/ProtectedRoute"
import { useAuth } from "../../hooks/useAuth"
import {
  useApprovePendingEventMutation,
  useGetAdminCatalogEventsQuery,
  useGetPendingEventsQuery,
} from "../../lib/events/rtk"
import type { CatalogEvent } from "../../lib/events/models"

type SummaryCardProps = {
  label: string
  value: number
}
type DetailProps = {
  label: string
  value: string
}

function formatDate(value: string | null): string {
  if (!value) return "Date not provided"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

function getEventDate(event: CatalogEvent): string | null {
  return (
    event.startsAt ??
    (event.startDate
      ? `${event.startDate}T${event.startTime ?? "00:00"}`
      : null)
  )
}

function isPotentialDuplicate(
  candidate: CatalogEvent,
  selected: CatalogEvent,
): boolean {
  if (candidate.id === selected.id || !candidate.venue || !selected.venue) {
    return false
  }
  if (
    candidate.venue.trim().toLowerCase() !== selected.venue.trim().toLowerCase()
  ) {
    return false
  }
  const candidateDate = getEventDate(candidate)
  const selectedDate = getEventDate(selected)
  if (!candidateDate || !selectedDate) return false
  const hoursApart =
    Math.abs(Date.parse(candidateDate) - Date.parse(selectedDate)) /
    (60 * 60 * 1000)
  if (!Number.isFinite(hoursApart) || hoursApart > 24) return false

  const words = (title: string) =>
    new Set(
      title
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 2),
    )
  const candidateWords = words(candidate.name)
  const selectedWords = words(selected.name)
  const overlap = [...candidateWords].filter((word) =>
    selectedWords.has(word),
  ).length
  return (
    overlap /
      Math.max(1, new Set([...candidateWords, ...selectedWords]).size) >=
    0.5
  )
}

function safeExternalUrl(value: string): string | null {
  try {
    const url = new URL(value)
    return url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}

export default function AdminEventsPage() {
  return (
    <ProtectedRoute requiredPermission="events:manage">
      <EventCatalogContent />
    </ProtectedRoute>
  )
}

function EventCatalogContent() {
  const { hasPermission } = useAuth()
  const canManageEvents = hasPermission("events:manage")
  const [pendingCursorHistory, setPendingCursorHistory] = useState<
    (string | undefined)[]
  >([undefined])
  const pendingCursor = pendingCursorHistory.at(-1)
  const {
    data: events = [],
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetAdminCatalogEventsQuery()
  const {
    data: pendingPage,
    error: pendingError,
    isLoading: pendingLoading,
    isFetching: pendingFetching,
    refetch: refreshPending,
  } = useGetPendingEventsQuery(
    canManageEvents
      ? { limit: 25, ...(pendingCursor ? { cursor: pendingCursor } : {}) }
      : skipToken,
  )
  const [approvePendingEvent, approveState] = useApprovePendingEventMutation()
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [notice, setNotice] = useState("")

  const approve = async (id: string) => {
    const result = await approvePendingEvent(id)
    if ("error" in result) return
    setNotice("The pending event was approved.")
  }

  const filteredEvents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    if (!normalizedSearch) return events
    return events.filter((event) =>
      [event.name, event.venue ?? "", event.partnerSlug, event.slug].some(
        (value) => value.toLowerCase().includes(normalizedSearch),
      ),
    )
  }, [events, search])

  const selected =
    filteredEvents.find((event) => event.id === selectedId) ??
    filteredEvents[0] ??
    null
  const duplicates = selected
    ? events.filter((event) => isPotentialDuplicate(event, selected))
    : []
  const partnerCount = new Set(events.map((event) => event.partnerSlug)).size

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAF7" }}>
      <AccountSidebar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:ml-64 lg:px-8 lg:py-8">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-[#292B2F]">
              Admin · Event operations
            </p>
            <h1 className="text-3xl font-bold text-[#111111]">Event catalog</h1>
            <p className="mt-2 text-[13px] text-[#292B2F]">
              Browse the live partner event catalog from the backend.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="w-fit rounded-lg border border-[#111111] bg-white px-3 py-2 text-[11px] font-semibold text-[#111111] disabled:opacity-50"
          >
            {isFetching ? "Refreshing…" : "Refresh catalog"}
          </button>
        </header>

        <div
          role="status"
          className="mb-6 rounded-lg border border-[#E8E9EB] bg-white px-4 py-3 text-[13px] text-[#292B2F]"
        >
          Catalog details are live. Users with event-management permission can
          review and approve pending partner events below.
        </div>

        <ApiErrorNotice
          error={error}
          fallback="Unable to load the live event catalog."
        />
        <ApiErrorNotice
          error={pendingError}
          fallback="Unable to load pending events."
        />
        <ApiErrorNotice
          error={approveState.error}
          fallback="Unable to approve the pending event."
        />
        {notice && (
          <p
            role="status"
            className="mb-5 rounded-lg border border-[#E8E9EB] bg-white px-4 py-3 text-[13px] text-[#111111]"
          >
            {notice}
          </p>
        )}

        {canManageEvents && (
          <section className="mb-6 overflow-hidden rounded-lg border border-[#E8E9EB] bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E9EB] px-4 py-3">
              <div>
                <h2 className="text-[12px] font-semibold uppercase tracking-wide text-[#111111]">
                  Pending event review
                </h2>
                <p className="mt-1 text-[11px] text-[#292B2F]">
                  {pendingPage?.items.length ?? 0} shown · approve only after
                  verifying the submitted catalog details.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void refreshPending()}
                disabled={pendingFetching}
                className="rounded-lg border border-[#E8E9EB] px-3 py-2 text-[11px] font-semibold text-[#111111] disabled:opacity-50"
              >
                {pendingFetching ? "Refreshing…" : "Refresh pending events"}
              </button>
            </div>
            {pendingLoading ? (
              <p className="px-4 py-5 text-[13px] text-[#292B2F]">
                Loading pending events…
              </p>
            ) : pendingPage?.items.length ? (
              <ul className="divide-y divide-[#E8E9EB]">
                {pendingPage.items.map((event) => (
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
                      {safeExternalUrl(event.sourceUrl) && (
                        <a
                          href={safeExternalUrl(event.sourceUrl) ?? undefined}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-[#E8E9EB] px-3 py-2 text-[11px] font-semibold text-[#111111]"
                        >
                          Review source
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => void approve(event.id)}
                        disabled={!canManageEvents || approveState.isLoading}
                        className="rounded-lg bg-[#111111] px-3 py-2 text-[11px] font-semibold text-white disabled:opacity-50"
                      >
                        {approveState.isLoading ? "Approving…" : "Approve"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : pendingError ? null : (
              <p className="px-4 py-5 text-[13px] text-[#292B2F]">
                No events are awaiting review.
              </p>
            )}
            <div className="flex items-center justify-between border-t border-[#E8E9EB] px-4 py-3">
              <button
                type="button"
                onClick={() =>
                  setPendingCursorHistory((history) =>
                    history.length > 1 ? history.slice(0, -1) : history,
                  )
                }
                disabled={pendingCursorHistory.length < 2 || pendingFetching}
                className="rounded border border-[#E8E9EB] px-3 py-2 text-[11px] font-semibold text-[#111111] disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-[11px] text-[#292B2F]">
                {pendingPage?.items.length ?? 0} events
              </span>
              <button
                type="button"
                onClick={() => {
                  if (pendingPage?.nextCursor) {
                    setPendingCursorHistory((history) => [
                      ...history,
                      pendingPage.nextCursor ?? undefined,
                    ])
                  }
                }}
                disabled={
                  !pendingPage?.hasMore ||
                  !pendingPage.nextCursor ||
                  pendingFetching
                }
                className="rounded border border-[#E8E9EB] px-3 py-2 text-[11px] font-semibold text-[#111111] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </section>
        )}

        <section
          className="mb-6 grid gap-3 sm:grid-cols-2"
          aria-label="Catalog summary"
        >
          <SummaryCard label="Partner events" value={events.length} />
          <SummaryCard label="Catalog partners" value={partnerCount} />
        </section>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(300px,0.85fr)_minmax(0,1.4fr)]">
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
                onChange={(event) => setSearch(event.target.value)}
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
                  const isSelected = selected?.id === event.id
                  const isDuplicate = events.some((candidate) =>
                    isPotentialDuplicate(candidate, event),
                  )
                  return (
                    <li key={event.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(event.id)}
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
                          {isDuplicate && (
                            <span className="shrink-0 rounded-full border border-[#111111] px-2 py-1 text-[10px] font-semibold uppercase text-[#111111]">
                              Possible duplicate
                            </span>
                          )}
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          {selected ? (
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
                    {selected.resaleEnabled
                      ? "Resale enabled"
                      : "Resale disabled"}
                  </span>
                </div>
              </div>

              <div className="grid gap-x-8 gap-y-5 p-5 sm:grid-cols-2">
                <Detail
                  label="Ticketing partner"
                  value={selected.partnerSlug}
                />
                <Detail
                  label="Source event ID"
                  value={selected.externalEventId}
                />
                <Detail
                  label="Address"
                  value={selected.address ?? "Not provided"}
                />
                <Detail
                  label="Price range"
                  value={
                    selected.priceRange ??
                    (selected.currency ? selected.currency : "Not provided")
                  }
                />
                <Detail
                  label="Last partner sync"
                  value={formatDate(selected.lastScrapedAt)}
                />
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-[#292B2F]">
                    Source
                  </p>
                  {safeExternalUrl(selected.url) ? (
                    <a
                      href={safeExternalUrl(selected.url) ?? undefined}
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
                {selected.description && (
                  <p className="mt-4 whitespace-pre-wrap text-[13px] leading-6 text-[#292B2F]">
                    {selected.description}
                  </p>
                )}
              </div>

              {duplicates.length > 0 && (
                <div className="border-t border-[#E8E9EB] p-5">
                  <h3 className="text-[12px] font-semibold uppercase tracking-wide text-[#111111]">
                    Potential duplicate matches
                  </h3>
                  <p className="mt-1 text-[11px] text-[#292B2F]">
                    Heuristic only: same venue, within 24 hours, and similar
                    title. Verify before taking action.
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
              )}
            </section>
          ) : (
            <section className="rounded-lg border border-[#E8E9EB] bg-white p-6 text-[13px] text-[#292B2F]">
              {isLoading
                ? "Loading event details…"
                : "Select an event to view details."}
            </section>
          )}
        </div>
      </main>
    </div>
  )
}

function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <div className="rounded-lg border border-[#E8E9EB] bg-white p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#292B2F]">
        {label}
      </p>
      <p className="mt-2 font-mono-data text-2xl font-semibold text-[#111111]">
        {value}
      </p>
    </div>
  )
}

function Detail({ label, value }: DetailProps) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#292B2F]">
        {label}
      </p>
      <p className="mt-1 break-all text-[13px] text-[#111111]">{value}</p>
    </div>
  )
}
