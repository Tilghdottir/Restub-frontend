"use client"

import { useState } from "react"
import AccountSidebar from "../../../../components/account/AccountSidebar"
import ApiErrorNotice from "../../../../components/ui/ApiErrorNotice"
import AdminDetail from "../../../../components/admin/AdminDetail"
import AdminSummaryCard from "../../../../components/admin/AdminSummaryCard"
import { ProtectedRoute } from "../../../../components/ui/ProtectedRoute"
import TicketReviewQueue from "./_components/TicketReviewQueue"
import TicketEvidencePanel from "./_components/TicketEvidencePanel"
import TicketReviewDecision, {
  TICKET_REJECTION_REASONS,
  type TicketRejectionReason,
} from "./_components/TicketReviewDecision"
import { getApiErrorMessage } from "../../../../lib/rtk-api"
import {
  useGetManualReviewListingsQuery,
  useGetManualReviewEvidenceQuery,
  useReviewManualListingMutation,
} from "../../../../lib/listings/rtk"
import type { ManualReviewDecision } from "../../../../lib/listings/types"

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Date unavailable"
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

export default function AdminTicketVerificationPage() {
  return (
    <ProtectedRoute requiredPermission="tickets:review">
      <TicketVerificationContent />
    </ProtectedRoute>
  )
}

function TicketVerificationContent() {
  const {
    data: submissions = [],
    error,
    isLoading,
  } = useGetManualReviewListingsQuery()
  const manualReviewDisabled = getApiErrorMessage(error, "")
    .toLowerCase()
    .includes("manual ticket review is not enabled")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = manualReviewDisabled
    ? null
    : (submissions.find((submission) => submission.id === selectedId) ??
      submissions[0] ??
      null)
  const {
    data: evidence = [],
    error: evidenceError,
    isFetching: evidenceLoading,
    refetch: refreshEvidence,
  } = useGetManualReviewEvidenceQuery(selected?.id ?? "", {
    skip: !selected,
    refetchOnMountOrArgChange: true,
  })
  const [review, reviewState] = useReviewManualListingMutation()
  const [rejectionReason, setRejectionReason] = useState<TicketRejectionReason>(
    TICKET_REJECTION_REASONS[0],
  )
  const [note, setNote] = useState("")
  const [rejecting, setRejecting] = useState(false)
  const [notice, setNotice] = useState("")

  const decide = async (decision: ManualReviewDecision) => {
    if (!selected) return
    const reviewNote =
      decision === "reject" ? `${rejectionReason}: ${note.trim()}` : undefined
    const result = await review({
      listingId: selected.id,
      decision,
      ...(reviewNote ? { note: reviewNote } : {}),
    })
    if ("error" in result) return
    setSelectedId(null)
    setNote("")
    setRejecting(false)
    setNotice(
      decision === "approve"
        ? "Ticket evidence approved. The backend has saved the decision."
        : "Ticket evidence rejected. The backend has saved the reason.",
    )
  }

  const evidenceCount = submissions.reduce(
    (total, submission) => total + submission.quantity,
    0,
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAF7" }}>
      <AccountSidebar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:ml-64 lg:px-8 lg:py-8">
        <header className="mb-6">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-[#292B2F]">
            Admin · Ticket operations
          </p>
          <h1 className="text-3xl font-bold text-[#111111]">
            Ticket verification
          </h1>
          <p className="mt-2 text-[13px] text-[#292B2F]">
            Review private seller evidence and record an approval or rejection
            through the backend.
          </p>
        </header>

        <div
          role="status"
          className="mb-6 rounded-lg border border-[#E8E9EB] bg-white px-4 py-3 text-[13px] text-[#292B2F]"
        >
          Live backend queue. Seller names, contact details, event metadata, and
          barcode-level duplicate signals are not returned by the current review
          API, so this page shows the available listing and evidence fields
          only.
        </div>

        {notice && (
          <p
            role="status"
            className="mb-5 rounded-lg border border-[#E8E9EB] bg-white px-4 py-3 text-[13px] text-[#111111]"
          >
            {notice}
          </p>
        )}
        {manualReviewDisabled ? (
          <p
            role="alert"
            className="mb-4 rounded-lg border border-[#E8E9EB] bg-white px-4 py-3 text-[13px] text-[#292B2F]"
          >
            Manual ticket review is disabled by the backend
            (MANUAL_TICKET_REVIEW_ENABLED). The queue and review actions are
            unavailable until the backend enables this feature.
          </p>
        ) : (
          <ApiErrorNotice
            error={error}
            fallback="Unable to load the ticket review queue."
          />
        )}
        <ApiErrorNotice
          error={evidenceError}
          fallback="Unable to load private ticket evidence."
        />
        <ApiErrorNotice
          error={reviewState.error}
          fallback="Unable to save the ticket review decision."
        />

        <section
          aria-label="Queue summary"
          className="mb-6 grid gap-3 sm:grid-cols-2"
        >
          <AdminSummaryCard
            label="Pending listings"
            value={error ? "Unavailable" : submissions.length}
          />
          <AdminSummaryCard
            label="Tickets in pending listings"
            value={error ? "Unavailable" : evidenceCount}
          />
        </section>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.5fr)]">
          <TicketReviewQueue
            submissions={submissions}
            selectedId={selected?.id ?? null}
            isLoading={isLoading}
            hasError={Boolean(error)}
            disabled={manualReviewDisabled}
            onSelect={(submissionId) => {
              setSelectedId(submissionId)
              setRejecting(false)
              setNote("")
              setNotice("")
            }}
          />

          {selected ? (
            <section
              aria-labelledby="submission-heading"
              className="rounded-lg border border-[#E8E9EB] bg-white"
            >
              <div className="flex flex-col gap-3 border-b border-[#E8E9EB] p-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono-data text-[11px] text-[#292B2F]">
                    {selected.id}
                  </p>
                  <h2
                    id="submission-heading"
                    className="mt-1 text-xl font-bold text-[#111111]"
                  >
                    {selected.title}
                  </h2>
                  <p className="mt-1 text-[13px] text-[#292B2F]">
                    Submitted {formatDate(selected.createdAt)}
                  </p>
                </div>
                <span className="w-fit rounded-full bg-[#E8E9EB] px-2.5 py-1 text-[11px] font-medium text-[#111111]">
                  Pending review
                </span>
              </div>

              <div className="grid gap-x-8 gap-y-5 p-5 sm:grid-cols-2">
                <AdminDetail
                  label="Seller account ID"
                  value={selected.ownerId}
                />
                <AdminDetail
                  label="Partner event ID"
                  value={selected.partnerEventId ?? "Not linked"}
                />
                <AdminDetail
                  label="Ticket category"
                  value={selected.ticketCategory}
                />
                <AdminDetail
                  label="Quantity"
                  value={`${selected.quantity} ${
                    selected.quantity === 1 ? "ticket" : "tickets"
                  }`}
                />
                <AdminDetail
                  label="Listing price"
                  value={`₦${selected.price.toLocaleString("en-NG")}`}
                />
              </div>

              <TicketEvidencePanel
                evidence={evidence}
                isLoading={evidenceLoading}
                onRefresh={() => void refreshEvidence()}
                formatDate={formatDate}
              />
              <TicketReviewDecision
                rejecting={rejecting}
                rejectionReason={rejectionReason}
                note={note}
                isSaving={reviewState.isLoading}
                onReasonChange={setRejectionReason}
                onNoteChange={setNote}
                onApprove={() => void decide("approve")}
                onReject={() => void decide("reject")}
                onBeginReject={() => setRejecting(true)}
                onCancelReject={() => setRejecting(false)}
              />
            </section>
          ) : (
            <section className="rounded-lg border border-[#E8E9EB] bg-white p-6 text-[13px] text-[#292B2F]">
              {isLoading
                ? "Loading review details…"
                : "Select a pending listing to review its evidence."}
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
