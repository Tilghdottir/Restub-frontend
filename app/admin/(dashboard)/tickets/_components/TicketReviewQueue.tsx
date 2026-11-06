import type { ManualReviewListingRecord } from "../../../../../lib/listings/types"

export default function TicketReviewQueue({
  submissions,
  selectedId,
  isLoading,
  hasError,
  disabled,
  onSelect,
}: {
  submissions: ManualReviewListingRecord[]
  selectedId: string | null
  isLoading: boolean
  hasError: boolean
  disabled: boolean
  onSelect: (submissionId: string) => void
}) {
  return (
    <section
      aria-label="Ticket review queue"
      className="overflow-hidden rounded-lg border border-[#E8E9EB] bg-white"
    >
      <div className="flex items-center justify-between border-b border-[#E8E9EB] px-4 py-3">
        <h2 className="text-[12px] font-semibold uppercase tracking-wide text-[#111111]">
          Review queue
        </h2>
        <span className="font-mono-data text-[12px] text-[#292B2F]">
          {hasError ? "Unavailable" : `${submissions.length} pending`}
        </span>
      </div>
      {disabled ? (
        <p className="px-4 py-5 text-[13px] text-[#292B2F]">
          Manual review is disabled; no queue is available.
        </p>
      ) : isLoading ? (
        <p className="px-4 py-5 text-[13px] text-[#292B2F]">
          Loading review queue…
        </p>
      ) : hasError && submissions.length === 0 ? (
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
            const isSelected = selectedId === submission.id
            return (
              <li key={submission.id}>
                <button
                  type="button"
                  onClick={() => onSelect(submission.id)}
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
  )
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Date unavailable"
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}
