import type {
  DisputeDetail,
  DisputeOutcome,
} from "../../../../../lib/disputes/types"

export default function DisputeActions({
  detail,
  canModify,
  canRetryResolution,
  currentUserId,
  assigning,
  escalating,
  resolving,
  escalationReason,
  resolutionNote,
  resolutionOutcome,
  onEscalationReasonChange,
  onResolutionNoteChange,
  onResolutionOutcomeChange,
  onAssign,
  onEscalate,
  onResolve,
}: {
  detail: DisputeDetail
  canModify: boolean
  canRetryResolution: boolean
  currentUserId?: string
  assigning: boolean
  escalating: boolean
  resolving: boolean
  escalationReason: string
  resolutionNote: string
  resolutionOutcome: DisputeOutcome
  onEscalationReasonChange: (value: string) => void
  onResolutionNoteChange: (value: string) => void
  onResolutionOutcomeChange: (value: DisputeOutcome) => void
  onAssign: () => void
  onEscalate: () => void
  onResolve: () => void
}) {
  return (
    <div className="space-y-5 p-5">
      {canModify && (
        <>
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-wide text-[#111111]">
              Assignment
            </h3>
            <button
              type="button"
              onClick={onAssign}
              disabled={
                !currentUserId ||
                assigning ||
                detail.assignedToUserId === currentUserId
              }
              className="mt-2 rounded-lg border border-[#111111] px-3 py-2 text-[11px] font-semibold text-[#111111] disabled:opacity-40"
            >
              {assigning
                ? "Assigning…"
                : detail.assignedToUserId === currentUserId
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
                  onEscalationReasonChange(event.target.value)
                }
                maxLength={1000}
                rows={2}
                className="mt-1 block w-full rounded-lg border border-[#E8E9EB] px-3 py-2 text-[13px] text-[#111111]"
              />
            </label>
            <button
              type="button"
              onClick={onEscalate}
              disabled={!escalationReason.trim() || escalating}
              className="mt-2 rounded-lg border border-[#111111] px-3 py-2 text-[11px] font-semibold text-[#111111] disabled:opacity-40"
            >
              {escalating ? "Escalating…" : "Escalate"}
            </button>
          </div>
        </>
      )}

      {(canModify || canRetryResolution) && (
        <div>
          <h3 className="text-[12px] font-semibold uppercase tracking-wide text-[#111111]">
            {canRetryResolution ? "Retry failed resolution" : "Resolve case"}
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
                onResolutionOutcomeChange(event.target.value as DisputeOutcome)
              }
              disabled={canRetryResolution}
              className="mt-1 block w-full rounded-lg border border-[#E8E9EB] bg-white px-3 py-2 text-[13px] text-[#111111] disabled:opacity-50"
            >
              <option value="refund">Refund buyer from escrow</option>
              <option value="uphold">
                Uphold order and restore escrow to hold
              </option>
            </select>
          </label>
          <label className="mt-3 block text-[12px] text-[#292B2F]">
            Resolution note
            <textarea
              value={resolutionNote}
              onChange={(event) => onResolutionNoteChange(event.target.value)}
              maxLength={2000}
              rows={3}
              className="mt-1 block w-full rounded-lg border border-[#E8E9EB] px-3 py-2 text-[13px] text-[#111111]"
            />
          </label>
          <button
            type="button"
            onClick={onResolve}
            disabled={!resolutionNote.trim() || resolving}
            className="mt-2 rounded-lg bg-[#111111] px-4 py-2.5 text-[11px] font-semibold text-white disabled:opacity-40"
          >
            {resolving
              ? "Submitting…"
              : canRetryResolution
                ? "Retry resolution"
                : "Submit resolution"}
          </button>
          <p className="mt-2 text-[11px] text-[#292B2F]">
            Resolution can trigger escrow refund or restore the order. The
            backend records the decision and requires an idempotency key.
          </p>
        </div>
      )}
    </div>
  )
}
