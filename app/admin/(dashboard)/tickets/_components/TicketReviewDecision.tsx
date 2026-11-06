export const TICKET_REJECTION_REASONS = [
  "Proof is invalid or unreadable",
  "Event or ticket details do not match",
  "Duplicate or reused ticket evidence",
  "Other policy reason",
] as const

export type TicketRejectionReason = typeof TICKET_REJECTION_REASONS[number]

export default function TicketReviewDecision({
  rejecting,
  rejectionReason,
  note,
  isSaving,
  onReasonChange,
  onNoteChange,
  onApprove,
  onReject,
  onBeginReject,
  onCancelReject,
}: {
  rejecting: boolean
  rejectionReason: TicketRejectionReason
  note: string
  isSaving: boolean
  onReasonChange: (reason: TicketRejectionReason) => void
  onNoteChange: (note: string) => void
  onApprove: () => void
  onReject: () => void
  onBeginReject: () => void
  onCancelReject: () => void
}) {
  return (
    <div className="border-t border-[#E8E9EB] p-5">
      {rejecting ? (
        <div className="space-y-3">
          <label className="block text-[12px] font-medium text-[#111111]">
            Rejection reason
            <select
              value={rejectionReason}
              onChange={(event) =>
                onReasonChange(event.target.value as TicketRejectionReason)
              }
              className="mt-1.5 block w-full rounded-lg border border-[#E8E9EB] bg-white px-3 py-2.5 text-[13px] text-[#111111]"
            >
              {TICKET_REJECTION_REASONS.map((reason) => (
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
              onChange={(event) => onNoteChange(event.target.value)}
              rows={3}
              maxLength={900}
              required
              className="mt-1.5 block w-full resize-y rounded-lg border border-[#E8E9EB] bg-white px-3 py-2.5 text-[13px] text-[#111111]"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!note.trim() || isSaving}
              onClick={onReject}
              className="rounded-lg bg-[#111111] px-4 py-2.5 text-[12px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSaving ? "Saving…" : "Confirm rejection"}
            </button>
            <button
              type="button"
              onClick={onCancelReject}
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
            disabled={isSaving}
            onClick={onApprove}
            className="rounded-lg bg-[#111111] px-4 py-2.5 text-[12px] font-semibold text-white disabled:opacity-40"
          >
            {isSaving ? "Saving…" : "Approve evidence"}
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={onBeginReject}
            className="rounded-lg border border-[#111111] px-4 py-2.5 text-[12px] font-semibold text-[#111111] disabled:opacity-40"
          >
            Reject evidence
          </button>
        </div>
      )}
    </div>
  )
}
