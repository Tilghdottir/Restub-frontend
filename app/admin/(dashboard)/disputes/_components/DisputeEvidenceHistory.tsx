import type {
  DisputeDetail,
  DisputeEvidence,
} from "../../../../../lib/disputes/types"

export default function DisputeEvidenceHistory({
  detail,
  evidence,
  evidenceLoading,
  hasEvidenceError,
  onRefreshEvidence,
}: {
  detail: DisputeDetail
  evidence: DisputeEvidence[]
  evidenceLoading: boolean
  hasEvidenceError: boolean
  onRefreshEvidence: () => void
}) {
  return (
    <>
      <section className="border-b border-[#E8E9EB] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-wide text-[#111111]">
              Private evidence
            </h3>
            <p className="mt-1 text-[11px] text-[#292B2F]">
              Evidence URLs are short-lived. Refresh before opening an expired
              link.
            </p>
          </div>
          <button
            type="button"
            onClick={onRefreshEvidence}
            disabled={evidenceLoading}
            className="rounded-lg border border-[#E8E9EB] px-3 py-2 text-[11px] font-semibold text-[#111111] disabled:opacity-50"
          >
            {evidenceLoading ? "Refreshing…" : "Refresh evidence"}
          </button>
        </div>
        {evidenceLoading && evidence.length === 0 ? (
          <p className="mt-4 text-[13px] text-[#292B2F]">Loading evidence…</p>
        ) : evidence.length === 0 && !hasEvidenceError ? (
          <p className="mt-4 text-[13px] text-[#292B2F]">
            No evidence was attached to this dispute.
          </p>
        ) : evidence.length > 0 ? (
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
        ) : null}
      </section>

      <section className="border-b border-[#E8E9EB] p-5">
        <h3 className="text-[12px] font-semibold uppercase tracking-wide text-[#111111]">
          Case history
        </h3>
        {detail.events.length ? (
          <ol className="mt-3 space-y-3">
            {detail.events.map((event) => (
              <li key={event.id} className="border-l-2 border-[#E8E9EB] pl-3">
                <p className="text-[12px] font-medium text-[#111111]">
                  {labelStatus(event.type)}
                </p>
                <p className="mt-1 text-[11px] text-[#292B2F]">
                  {formatDate(event.createdAt)} · {event.actorUserId}
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
      </section>
    </>
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
