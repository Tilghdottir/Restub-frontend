"use client"

import { skipToken } from "@reduxjs/toolkit/query"
import { useState } from "react"
import AccountSidebar from "../../../../components/account/AccountSidebar"
import ApiErrorNotice from "../../../../components/ui/ApiErrorNotice"
import AdminDetail from "../../../../components/admin/AdminDetail"
import { ProtectedRoute } from "../../../../components/ui/ProtectedRoute"
import DisputeActions from "./_components/DisputeActions"
import DisputeEvidenceHistory from "./_components/DisputeEvidenceHistory"
import DisputeQueue from "./_components/DisputeQueue"
import { useAuth } from "../../../../lib/auth/useAuth"
import {
  useAssignDisputeMutation,
  useEscalateDisputeMutation,
  useGetDisputeDetailQuery,
  useGetDisputeEvidenceQuery,
  useGetDisputesQuery,
  useResolveDisputeMutation,
} from "../../../../lib/disputes/rtk"
import { DISPUTE_STATUSES } from "../../../../lib/disputes/types"
import type {
  DisputeOutcome,
  DisputeStatus,
} from "../../../../lib/disputes/types"

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
          <DisputeQueue
            page={page}
            selectedId={activeId}
            status={status}
            isLoading={queueLoading}
            isFetching={queueFetching}
            canGoPrevious={cursorHistory.length > 1}
            hasError={Boolean(queueError)}
            statuses={DISPUTE_STATUSES}
            onStatusChange={changeStatus}
            onSelect={(id) => {
              setSelectedId(id)
              setNotice("")
            }}
            onPrevious={() =>
              setCursorHistory((history) =>
                history.length > 1 ? history.slice(0, -1) : history,
              )
            }
            onNext={() => {
              if (!page?.nextCursor) return
              setCursorHistory((history) => [
                ...history,
                page.nextCursor ?? undefined,
              ])
              setSelectedId(null)
            }}
          />

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
                    <AdminDetail label="Order" value={detail.orderId} compact />
                    <AdminDetail
                      compact
                      label="Assigned staff"
                      value={detail.assignedToUserId ?? "Unassigned"}
                    />
                    <AdminDetail
                      compact
                      label="Opened"
                      value={formatDate(detail.createdAt)}
                    />
                    <AdminDetail
                      compact
                      label="SLA deadline"
                      value={`${formatDate(detail.sla.dueAt)}${
                        detail.sla.overdue ? " · overdue" : ""
                      }`}
                    />
                    <AdminDetail
                      compact
                      label="Resolution attempts"
                      value={String(detail.resolutionAttempts)}
                    />
                    {detail.resolutionNote && (
                      <AdminDetail
                        compact
                        label="Resolution note"
                        value={detail.resolutionNote}
                      />
                    )}
                    {detail.escalationReason && (
                      <AdminDetail
                        compact
                        label="Escalation reason"
                        value={detail.escalationReason}
                      />
                    )}
                  </div>

                  <DisputeEvidenceHistory
                    detail={detail}
                    evidence={evidence}
                    evidenceLoading={evidenceLoading}
                    hasEvidenceError={Boolean(evidenceError)}
                    onRefreshEvidence={() => void refreshEvidence()}
                  />

                  {canResolveDisputes && (
                    <DisputeActions
                      detail={detail}
                      canModify={canModify}
                      canRetryResolution={canRetryResolution}
                      currentUserId={user?.id}
                      assigning={assignState.isLoading}
                      escalating={escalateState.isLoading}
                      resolving={resolveState.isLoading}
                      escalationReason={escalationReason}
                      resolutionNote={resolutionNote}
                      resolutionOutcome={resolutionOutcome}
                      onEscalationReasonChange={setEscalationReason}
                      onResolutionNoteChange={setResolutionNote}
                      onResolutionOutcomeChange={setResolutionOutcome}
                      onAssign={() => void assignToMe()}
                      onEscalate={() => void escalateSelected()}
                      onResolve={() => void resolveSelected()}
                    />
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
