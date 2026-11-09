"use client"

import { skipToken } from "@reduxjs/toolkit/query"
import { useMemo, useState } from "react"
import AccountSidebar from "../../../../components/account/AccountSidebar"
import ApiErrorNotice from "../../../../components/ui/ApiErrorNotice"
import AdminSummaryCard from "../../../../components/admin/AdminSummaryCard"
import { ProtectedRoute } from "../../../../components/ui/ProtectedRoute"
import CatalogEventDetails from "./_components/CatalogEventDetails"
import CatalogEventList from "./_components/CatalogEventList"
import PendingEventReviewQueue from "./_components/PendingEventReviewQueue"
import { useAuth } from "../../../../lib/auth/useAuth"
import {
  useApprovePendingEventMutation,
  useGetAdminCatalogEventsQuery,
  useGetPendingEventsQuery,
} from "../../../../lib/events/rtk"
import type { CatalogEvent } from "../../../../lib/events/models"

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
  const [pendingCursorHistory, setPendingCursorHistory] =
    useState<(string | undefined)[]>([undefined])
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

        {canManageEvents ? (
          <PendingEventReviewQueue
            events={pendingPage?.items ?? []}
            isLoading={pendingLoading}
            isFetching={pendingFetching}
            hasError={Boolean(pendingError)}
            isApproving={approveState.isLoading}
            hasMore={pendingPage?.hasMore ?? false}
            nextCursor={pendingPage?.nextCursor ?? null}
            canGoPrevious={pendingCursorHistory.length > 1}
            formatDate={formatDate}
            safeExternalUrl={safeExternalUrl}
            onRefresh={() => void refreshPending()}
            onApprove={(id) => void approve(id)}
            onPrevious={() =>
              setPendingCursorHistory((history) =>
                history.length > 1 ? history.slice(0, -1) : history,
              )
            }
            onNext={() => {
              if (pendingPage?.nextCursor) {
                setPendingCursorHistory((history) => [
                  ...history,
                  pendingPage.nextCursor ?? undefined,
                ])
              }
            }}
          />
        ) : null}

        <section
          className="mb-6 grid gap-3 sm:grid-cols-2"
          aria-label="Catalog summary"
        >
          <AdminSummaryCard label="Partner events" value={events.length} />
          <AdminSummaryCard label="Catalog partners" value={partnerCount} />
        </section>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(300px,0.85fr)_minmax(0,1.4fr)]">
          <CatalogEventList
            events={events}
            filteredEvents={filteredEvents}
            selectedId={selected?.id ?? null}
            search={search}
            isLoading={isLoading}
            onSearchChange={setSearch}
            onSelect={setSelectedId}
            formatDate={formatDate}
            getEventDate={getEventDate}
            isPotentialDuplicate={isPotentialDuplicate}
          />
          <CatalogEventDetails
            selected={selected}
            duplicates={duplicates}
            isLoading={isLoading}
            formatDate={formatDate}
            getEventDate={getEventDate}
            safeExternalUrl={safeExternalUrl}
          />
        </div>
      </main>
    </div>
  )
}
