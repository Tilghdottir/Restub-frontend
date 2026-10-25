"use client"

import { skipToken } from "@reduxjs/toolkit/query"
import { useState } from "react"
import AccountSidebar from "../../components/AccountSidebar"
import ApiErrorNotice from "../../components/ApiErrorNotice"
import { ProtectedRoute } from "../../components/ProtectedRoute"
import { useAuth } from "../../hooks/useAuth"
import {
  useAssignDisputeMutation,
  useEscalateDisputeMutation,
  useGetDisputeDetailQuery,
  useGetDisputeEvidenceQuery,
  useGetDisputesQuery,
  useResolveDisputeMutation,
} from "../../lib/disputes/rtk"
import { DISPUTE_STATUSES } from "../../lib/disputes/types"
import type { DisputeOutcome, DisputeStatus } from "../../lib/disputes/types"

export default function AdminDisputesPage() {
  return (
    <ProtectedRoute requiredPermission="disputes:resolve">
      <AdminDisputesContent />
    </ProtectedRoute>
  )
}

function AdminDisputesContent() {
  const { user, hasPermission } = useAuth()
  const canResolveDisputes = hasPermission("disputes:resolve")
  const [status, setStatus] = useState<DisputeStatus | "">("")
  const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([
    undefined,
  ])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [escalationReason, setEscalationReason] = useState("")
  const [resolutionNote, setResolutionNote] = useState("")
  const [resolutionOutcome, setResolutionOutcome] =
    useState<DisputeOutcome>("refund")
  const [notice, setNotice] = useState("")

  const cursor = cursorHistory.at(-1)
  const {
    data: page,
    error: queueError,
    isLoading: queueLoading,
    isFetching: queueFetching,
    refetch: refreshQueue,
  } = useGetDisputesQuery({
    limit: 25,
    ...(cursor ? { cursor } : {}),
    ...(status ? { status } : {}),
  })
  const activeId =
    page?.items.find((item) => item.id === selectedId)?.id ??
    page?.items[0]?.id ??
    null
  const {
    currentData: detail,
    error: detailError,
    isLoading: detailLoading,
    refetch: refreshDetail,
  } = useGetDisputeDetailQuery(activeId ?? skipToken)
  const {
    currentData: evidence = [],
    error: evidenceError,
    isLoading: evidenceLoading,
    refetch: refreshEvidence,
  } = useGetDisputeEvidenceQuery(activeId ?? skipToken)

  const [assign, assignState] = useAssignDisputeMutation()
  const [escalate, escalateState] = useEscalateDisputeMutation()
  const [resolve, resolveState] = useResolveDisputeMutation()
  const canModify =
    canResolveDisputes &&
    detail !== undefined &&
    ["open", "under_review", "escalated"].includes(detail.status)
  const canRetryResolution =
    canResolveDisputes && detail?.status === "resolution_failed"

  const changeStatus = (value: string) => {
    setStatus(value as DisputeStatus | "")
    setCursorHistory([undefined])
    setSelectedId(null)
    setNotice("")
  }

  const assignToMe = async () => {
    if (!activeId || !user?.id || !canModify) return
    const result = await assign({
      id: activeId,
      assignedToUserId: user.id,
    })
    if ("error" in result) return
    setNotice("The dispute was assigned to you.")
  }

  const escalateSelected = async () => {
    if (!activeId || !canModify || !escalationReason.trim()) return
    const result = await escalate({
      id: activeId,
      reason: escalationReason.trim(),
    })
    if ("error" in result) return
    setEscalationReason("")
    setNotice("The dispute was escalated.")
  }

  const resolveSelected = async () => {
    if (
      !activeId ||
      (!canModify && !canRetryResolution) ||
      !resolutionNote.trim()
    ) {
      return
    }
    if (
      canRetryResolution &&
      detail?.resolutionOutcome &&
      detail.resolutionOutcome !== resolutionOutcome
    ) {
      return
    }
    const result = await resolve({
      id: activeId,
      outcome:
        canRetryResolution && detail.resolutionOutcome
          ? detail.resolutionOutcome
          : resolutionOutcome,
      note: resolutionNote.trim(),
    })
    if ("error" in result) return
    setResolutionNote("")
    setNotice("The resolution request was accepted.")
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAF7" }}>
      <AccountSidebar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:ml-64 lg:px-8 lg:py-8">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-[#292B2F]">
              Admin · Case operations
            </p>
            <h1 className="text-3xl font-bold text-[#111111]">Disputes</h1>
            <p className="mt-2 text-[13px] text-[#292B2F]">
              Review case evidence, monitor SLA, and record permitted actions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refreshQueue()}
            disabled={queueFetching}
            className="rounded-lg border border-[#111111] bg-white px-3 py-2 text-[11px] font-semibold text-[#111111] disabled:opacity-50"
          >
            {queueFetching ? "Refreshing…" : "Refresh queue"}
          </button>
        </header>

        {notice && (
          <p
            role="status"
            className="mb-5 rounded-lg border border-[#E8E9EB] bg-white px-4 py-3 text-[13px] text-[#111111]"
          >
            {notice}
          </p>
        )}
        <ApiErrorNotice
          error={queueError}
          fallback="Unable to load the dispute queue."
        />
        <ApiErrorNotice
          error={detailError}
          fallback="Unable to load dispute details."
        />
        <ApiErrorNotice
          error={evidenceError}
          fallback="Unable to load dispute evidence."
        />
        <ApiErrorNotice
          error={assignState.error}
          fallback="Unable to assign the dispute."
        />
        <ApiErrorNotice
          error={escalateState.error}
          fallback="Unable to escalate the dispute."
        />
        <ApiErrorNotice
          error={resolveState.error}
          fallback="Unable to resolve the dispute."
        />

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.5fr)]">
          <section className="overflow-hidden rounded-lg border border-[#E8E9EB] bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E9EB] p-4">
              <h2 className="text-[12px] font-semibold uppercase tracking-wide text-[#111111]">
                Case queue
              </h2>
              <label className="text-[11px] text-[#292B2F]">
                Status
                <select
                  value={status}
                  onChange={(event) => changeStatus(event.target.value)}
                  className="ml-2 rounded border border-[#E8E9EB] bg-white px-2 py-1.5 text-[12px] text-[#111111]"
                >
                  <option value="">All statuses</option>
                  {DISPUTE_STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {labelStatus(item)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {queueLoading ? (
              <p className="px-4 py-5 text-[13px] text-[#292B2F]">
                Loading dispute queue…
              </p>
            ) : page?.items.length ? (
              <ul className="divide-y divide-[#E8E9EB]">
                {page.items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      aria-pressed={activeId === item.id}
                      onClick={() => {
                        setSelectedId(item.id)
                        setNotice("")
                      }}
                      className="w-full px-4 py-4 text-left hover:bg-[#FAFAF7]"
                      style={{
                        backgroundColor:
                          activeId === item.id ? "#FAFAF7" : "#FFFFFF",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-mono-data text-[11px] text-[#292B2F]">
                            {item.id}
                          </p>
                          <p className="mt-1 line-clamp-2 text-[13px] font-medium text-[#111111]">
                            {item.reason}
                          </p>
                          <p className="mt-1 text-[11px] text-[#292B2F]">
                            Order {item.orderId} · {labelStatus(item.status)}
                          </p>
                        </div>
                        <span
                          className="shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase"
                          style={{
                            backgroundColor: item.overdue
                              ? "#FCE8E6"
                              : "#E8E9EB",
                            color: item.overdue ? "#9C1C13" : "#111111",
                          }}
                        >
                          {item.overdue ? "SLA overdue" : "Within SLA"}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : queueError ? null : (
              <p className="px-4 py-5 text-[13px] text-[#292B2F]">
                No disputes match this queue filter.
              </p>
            )}
            <div className="flex items-center justify-between border-t border-[#E8E9EB] px-4 py-3">
              <button
                type="button"
                onClick={() =>
                  setCursorHistory((history) =>
                    history.length > 1 ? history.slice(0, -1) : history,
                  )
                }
                disabled={cursorHistory.length < 2 || queueFetching}
                className="rounded border border-[#E8E9EB] px-3 py-2 text-[11px] font-semibold text-[#111111] disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-[11px] text-[#292B2F]">
                {page?.items.length ?? 0} cases
              </span>
              <button
                type="button"
                onClick={() => {
                  if (page?.nextCursor) {
                    setCursorHistory((history) => [
                      ...history,
                      page.nextCursor ?? undefined,
                    ])
                    setSelectedId(null)
                  }
                }}
                disabled={!page?.hasMore || !page.nextCursor || queueFetching}
                className="rounded border border-[#E8E9EB] px-3 py-2 text-[11px] font-semibold text-[#111111] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </section>

          {activeId ? (
            <section className="overflow-hidden rounded-lg border border-[#E8E9EB] bg-white">
              {detailLoading || !detail ? (
                <p className="p-5 text-[13px] text-[#292B2F]">
                  {detailLoading
                    ? "Loading case details…"
                    : "Case details unavailable."}
                </p>
              ) : (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E8E9EB] p-5">
                    <div>
                      <p className="font-mono-data text-[11px] text-[#292B2F]">
                        {detail.id}
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-[#111111]">
                        {labelStatus(detail.status)}
                      </h2>
                      <p className="mt-2 max-w-2xl whitespace-pre-wrap text-[13px] text-[#292B2F]">
                        {detail.reason}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        void refreshDetail()
                        void refreshEvidence()
                      }}
                      disabled={detailLoading || evidenceLoading}
                      className="rounded-lg border border-[#E8E9EB] px-3 py-2 text-[11px] font-semibold text-[#111111] disabled:opacity-50"
                    >
                      Refresh case
                    </button>
                  </div>

                  <div className="grid gap-4 border-b border-[#E8E9EB] p-5 sm:grid-cols-2">
                    <Detail label="Order" value={detail.orderId} />
                    <Detail
                      label="Assigned staff"
                      value={detail.assignedToUserId ?? "Unassigned"}
                    />
                    <Detail
                      label="Opened"
                      value={formatDate(detail.createdAt)}
                    />
                    <Detail
                      label="SLA deadline"
                      value={`${formatDate(detail.sla.dueAt)}${
                        detail.sla.overdue ? " · overdue" : ""
                      }`}
                    />
                    <Detail
                      label="Resolution attempts"
                      value={String(detail.resolutionAttempts)}
                    />
                    {detail.resolutionNote && (
                      <Detail
                        label="Resolution note"
                        value={detail.resolutionNote}
                      />
                    )}
                    {detail.escalationReason && (
                      <Detail
                        label="Escalation reason"
                        value={detail.escalationReason}
                      />
                    )}
                  </div>

                  <div className="border-b border-[#E8E9EB] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-[12px] font-semibold uppercase tracking-wide text-[#111111]">
                          Private evidence
                        </h3>
                        <p className="mt-1 text-[11px] text-[#292B2F]">
                          Evidence URLs are short-lived. Refresh before opening
                          an expired link.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void refreshEvidence()}
                        disabled={evidenceLoading}
                        className="rounded-lg border border-[#E8E9EB] px-3 py-2 text-[11px] font-semibold text-[#111111] disabled:opacity-50"
                      >
                        {evidenceLoading ? "Refreshing…" : "Refresh evidence"}
                      </button>
                    </div>
                    {evidenceLoading && evidence.length === 0 ? (
                      <p className="mt-4 text-[13px] text-[#292B2F]">
                        Loading evidence…
                      </p>
                    ) : evidence.length === 0 && !evidenceError ? (
                      <p className="mt-4 text-[13px] text-[#292B2F]">
                        No evidence was attached to this dispute.
                      </p>
                    ) : (
                      <ul className="mt-4 space-y-2">
                        {evidence.map((file) => (
                          <li
                            key={file.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded border border-[#E8E9EB] p-3"
                          >
                            <div>
                              <p className="text-[13px] font-medium text-[#111111]">
                                Evidence {file.slotIndex} · {file.mimeType}
                              </p>
                              <p className="mt-1 text-[11px] text-[#292B2F]">
                                Expires {formatDate(file.expiresAt)}
                              </p>
                            </div>
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded border border-[#111111] px-3 py-2 text-[11px] font-semibold text-[#111111]"
                            >
                              Open evidence
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="border-b border-[#E8E9EB] p-5">
                    <h3 className="text-[12px] font-semibold uppercase tracking-wide text-[#111111]">
                      Case history
                    </h3>
                    {detail.events.length ? (
                      <ol className="mt-3 space-y-3">
                        {detail.events.map((event) => (
                          <li
                            key={event.id}
                            className="border-l-2 border-[#E8E9EB] pl-3"
                          >
                            <p className="text-[12px] font-medium text-[#111111]">
                              {labelStatus(event.type)}
                            </p>
                            <p className="mt-1 text-[11px] text-[#292B2F]">
                              {formatDate(event.createdAt)} ·{" "}
                              {event.actorUserId}
                            </p>
                            {Object.keys(event.details).length > 0 && (
                              <pre className="mt-1 overflow-x-auto whitespace-pre-wrap text-[10px] text-[#292B2F]">
                                {JSON.stringify(event.details, null, 2)}
                              </pre>
                            )}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="mt-3 text-[13px] text-[#292B2F]">
                        No case history was returned.
                      </p>
                    )}
                  </div>

                  {canResolveDisputes && (
                    <div className="space-y-5 p-5">
                      {canModify && (
                        <>
                          <div>
                            <h3 className="text-[12px] font-semibold uppercase tracking-wide text-[#111111]">
                              Assignment
                            </h3>
                            <button
                              type="button"
                              onClick={() => void assignToMe()}
                              disabled={
                                !user?.id ||
                                assignState.isLoading ||
                                detail.assignedToUserId === user?.id
                              }
                              className="mt-2 rounded-lg border border-[#111111] px-3 py-2 text-[11px] font-semibold text-[#111111] disabled:opacity-40"
                            >
                              {assignState.isLoading
                                ? "Assigning…"
                                : detail.assignedToUserId === user?.id
                                  ? "Assigned to you"
                                  : "Assign to me"}
                            </button>
                          </div>

                          <div>
                            <h3 className="text-[12px] font-semibold uppercase tracking-wide text-[#111111]">
                              Escalate case
                            </h3>
                            <label className="mt-2 block text-[12px] text-[#292B2F]">
                              Reason
                              <textarea
                                value={escalationReason}
                                onChange={(event) =>
                                  setEscalationReason(event.target.value)
                                }
                                maxLength={1000}
                                rows={2}
                                className="mt-1 block w-full rounded-lg border border-[#E8E9EB] px-3 py-2 text-[13px] text-[#111111]"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => void escalateSelected()}
                              disabled={
                                !escalationReason.trim() ||
                                escalateState.isLoading
                              }
                              className="mt-2 rounded-lg border border-[#111111] px-3 py-2 text-[11px] font-semibold text-[#111111] disabled:opacity-40"
                            >
                              {escalateState.isLoading
                                ? "Escalating…"
                                : "Escalate"}
                            </button>
                          </div>
                        </>
                      )}

                      {(canModify || canRetryResolution) && (
                        <div>
                          <h3 className="text-[12px] font-semibold uppercase tracking-wide text-[#111111]">
                            {canRetryResolution
                              ? "Retry failed resolution"
                              : "Resolve case"}
                          </h3>
                          <label className="mt-2 block text-[12px] text-[#292B2F]">
                            Outcome
                            <select
                              value={
                                canRetryResolution && detail.resolutionOutcome
                                  ? detail.resolutionOutcome
                                  : resolutionOutcome
                              }
                              onChange={(event) =>
                                setResolutionOutcome(
                                  event.target.value as DisputeOutcome,
                                )
                              }
                              disabled={canRetryResolution}
                              className="mt-1 block w-full rounded-lg border border-[#E8E9EB] bg-white px-3 py-2 text-[13px] text-[#111111] disabled:opacity-50"
                            >
                              <option value="refund">
                                Refund buyer from escrow
                              </option>
                              <option value="uphold">
                                Uphold order and restore escrow to hold
                              </option>
                            </select>
                          </label>
                          <label className="mt-3 block text-[12px] text-[#292B2F]">
                            Resolution note
                            <textarea
                              value={resolutionNote}
                              onChange={(event) =>
                                setResolutionNote(event.target.value)
                              }
                              maxLength={2000}
                              rows={3}
                              className="mt-1 block w-full rounded-lg border border-[#E8E9EB] px-3 py-2 text-[13px] text-[#111111]"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => void resolveSelected()}
                            disabled={
                              !resolutionNote.trim() || resolveState.isLoading
                            }
                            className="mt-2 rounded-lg bg-[#111111] px-4 py-2.5 text-[11px] font-semibold text-white disabled:opacity-40"
                          >
                            {resolveState.isLoading
                              ? "Submitting…"
                              : canRetryResolution
                                ? "Retry resolution"
                                : "Submit resolution"}
                          </button>
                          <p className="mt-2 text-[11px] text-[#292B2F]">
                            Resolution can trigger escrow refund or restore the
                            order. The backend records the decision and requires
                            an idempotency key.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </section>
          ) : (
            <section className="rounded-lg border border-[#E8E9EB] bg-white p-6 text-[13px] text-[#292B2F]">
              {queueLoading
                ? "Loading cases…"
                : "Select a dispute to inspect its details."}
            </section>
          )}
        </div>
      </main>
    </div>
  )
}

function Detail({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-wide text-[#292B2F]">
        {label}
      </p>
      <p className="mt-1 break-all text-[12px] text-[#111111]">{value}</p>
    </div>
  )
}

function labelStatus(value: string): string {
  return value.replace(/_/g, " ")
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}
