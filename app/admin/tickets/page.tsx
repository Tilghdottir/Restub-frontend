"use client"

import { useState } from "react"
import AccountSidebar from "../../components/AccountSidebar"
import ApiErrorNotice from "../../components/ApiErrorNotice"
import { ProtectedRoute } from "../../components/ProtectedRoute"
import { getApiErrorMessage } from "../../lib/rtk-api"
import {
  useGetManualReviewListingsQuery,
  useGetManualReviewEvidenceQuery,
  useReviewManualListingMutation,
} from "../../lib/listings/rtk"
import type { ManualReviewDecision } from "../../lib/listings/types"

type SummaryCardProps = {
  label: string
  value: number | string
}
type DetailProps = {
  label: string
  value: string
}

const rejectionReasons = [
  "Proof is invalid or unreadable",
  "Event or ticket details do not match",
  "Duplicate or reused ticket evidence",
  "Other policy reason",
] as const

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
  const manualReviewDisabled =
    getApiErrorMessage(error, "")
      .toLowerCase()
      .includes("manual ticket review is not enabled")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected =
    manualReviewDisabled
      ? null
      : submissions.find((submission) => submission.id === selectedId) ??
        submissions[0] ??
        null
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
  const [rejectionReason, setRejectionReason] =
    useState<typeof rejectionReasons[number]>(rejectionReasons[0])
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
          <SummaryCard
            label="Pending listings"
            value={error ? "Unavailable" : submissions.length}
          />
          <SummaryCard
            label="Tickets awaiting review"
            value={error ? "Unavailable" : evidenceCount}
          />
        </section>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.5fr)]">
          <section
            aria-label="Ticket review queue"
            className="overflow-hidden rounded-lg border border-[#E8E9EB] bg-white"
          >
            <div className="flex items-center justify-between border-b border-[#E8E9EB] px-4 py-3">
              <h2 className="text-[12px] font-semibold uppercase tracking-wide text-[#111111]">
                Review queue
              </h2>
              <span className="font-mono-data text-[12px] text-[#292B2F]">
                {error ? "Unavailable" : `${submissions.length} pending`}
              </span>
            </div>
            {manualReviewDisabled ? (
              <p className="px-4 py-5 text-[13px] text-[#292B2F]">
                Manual review is disabled; no queue is available.
              </p>
            ) : isLoading ? (
              <p className="px-4 py-5 text-[13px] text-[#292B2F]">
                Loading review queue…
              </p>
            ) : error && submissions.length === 0 ? (
              <p className="px-4 py-5 text-[13px] text-[#292B2F]">
                The review queue is unavailable.
              </p>
            ) : submissions.length === 0 ? (
              <p className="px-4 py-5 text-[13px] text-[#292B2F]">
                No listings are awaiting manual ticket review.
              </p>
            ) : (
              <ul className="divide-y divide-[#E8E9EB]">
                {submissions.map((submission) => {
                  const isSelected = selected?.id === submission.id
                  return (
                    <li key={submission.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(submission.id)
                          setRejecting(false)
                          setNote("")
                          setNotice("")
                        }}
                        aria-pressed={isSelected}
                        className="w-full px-4 py-4 text-left transition-colors hover:bg-[#FAFAF7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#111111]"
                        style={{
                          backgroundColor: isSelected ? "#FAFAF7" : "#FFFFFF",
                        }}
                      >
                        <p className="font-mono-data text-[11px] text-[#292B2F]">
                          {submission.id}
                        </p>
                        <p className="mt-1 text-[14px] font-semibold text-[#111111]">
                          {submission.title}
                        </p>
                        <p className="mt-1 text-[12px] text-[#292B2F]">
                          {submission.quantity}{" "}
                          {submission.quantity === 1 ? "ticket" : "tickets"} ·{" "}
                          {submission.ticketCategory}
                        </p>
                        <p className="mt-2 text-[11px] text-[#292B2F]">
                          Pending · submitted {formatDate(submission.createdAt)}
                        </p>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

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
                <Detail label="Seller account ID" value={selected.ownerId} />
                <Detail
                  label="Partner event ID"
                  value={selected.partnerEventId ?? "Not linked"}
                />
                <Detail
                  label="Ticket category"
                  value={selected.ticketCategory}
                />
                <Detail
                  label="Quantity"
                  value={`${selected.quantity} ${
                    selected.quantity === 1 ? "ticket" : "tickets"
                  }`}
                />
                <Detail
                  label="Listing price"
                  value={`₦${selected.price.toLocaleString("en-NG")}`}
                />
              </div>

              <div className="border-t border-[#E8E9EB] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-[12px] font-semibold uppercase tracking-wide text-[#111111]">
                      Private seller evidence
                    </h3>
                    <p className="mt-1 text-[11px] text-[#292B2F]">
                      Evidence links expire; refresh them if they no longer
                      open.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void refreshEvidence()}
                    disabled={evidenceLoading}
                    className="rounded-lg border border-[#E8E9EB] px-3 py-2 text-[11px] font-semibold text-[#111111] disabled:opacity-50"
                  >
                    {evidenceLoading ? "Loading…" : "Refresh evidence"}
                  </button>
                </div>

                {evidenceLoading && evidence.length === 0 ? (
                  <p className="mt-4 text-[13px] text-[#292B2F]">
                    Loading private evidence…
                  </p>
                ) : evidence.length === 0 ? (
                  <p className="mt-4 text-[13px] text-[#292B2F]">
                    No evidence files were returned for this listing.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {evidence.map((item) => (
                      <li
                        key={item.uploadId}
                        className="rounded-lg border border-[#E8E9EB] p-3"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-[13px] font-medium text-[#111111]">
                              Ticket {item.slotIndex} · {item.mimeType}
                            </p>
                            <p className="mt-1 text-[11px] text-[#292B2F]">
                              {item.ocr.status === "disabled"
                                ? "OCR screening unavailable"
                                : `OCR confidence ${Math.round(item.ocr.confidence * 100)}% · ${item.ocr.characterCount} characters · event match ${item.ocr.eventNameMatch ?? "unknown"}`}
                            </p>
                            <p className="mt-1 text-[11px] text-[#292B2F]">
                              Link expires {formatDate(item.expiresAt)}
                            </p>
                          </div>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0 rounded-lg border border-[#111111] px-3 py-2 text-center text-[11px] font-semibold text-[#111111]"
                          >
                            Open evidence
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="border-t border-[#E8E9EB] p-5">
                {rejecting ? (
                  <div className="space-y-3">
                    <label className="block text-[12px] font-medium text-[#111111]">
                      Rejection reason
                      <select
                        value={rejectionReason}
                        onChange={(event) =>
                          setRejectionReason(
                            event.target
                              .value as typeof rejectionReasons[number],
                          )
                        }
                        className="mt-1.5 block w-full rounded-lg border border-[#E8E9EB] bg-white px-3 py-2.5 text-[13px] text-[#111111]"
                      >
                        {rejectionReasons.map((reason) => (
                          <option key={reason} value={reason}>
                            {reason}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-[12px] font-medium text-[#111111]">
                      Explanation for the seller
                      <textarea
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        rows={3}
                        maxLength={900}
                        required
                        className="mt-1.5 block w-full resize-y rounded-lg border border-[#E8E9EB] bg-white px-3 py-2.5 text-[13px] text-[#111111]"
                      />
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={!note.trim() || reviewState.isLoading}
                        onClick={() => void decide("reject")}
                        className="rounded-lg bg-[#111111] px-4 py-2.5 text-[12px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {reviewState.isLoading
                          ? "Saving…"
                          : "Confirm rejection"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejecting(false)}
                        className="rounded-lg border border-[#E8E9EB] px-4 py-2.5 text-[12px] font-semibold text-[#111111]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={reviewState.isLoading}
                      onClick={() => void decide("approve")}
                      className="rounded-lg bg-[#111111] px-4 py-2.5 text-[12px] font-semibold text-white disabled:opacity-40"
                    >
                      {reviewState.isLoading ? "Saving…" : "Approve evidence"}
                    </button>
                    <button
                      type="button"
                      disabled={reviewState.isLoading}
                      onClick={() => setRejecting(true)}
                      className="rounded-lg border border-[#111111] px-4 py-2.5 text-[12px] font-semibold text-[#111111] disabled:opacity-40"
                    >
                      Reject evidence
                    </button>
                  </div>
                )}
              </div>
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
