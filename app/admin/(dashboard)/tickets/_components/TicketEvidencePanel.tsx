import type { ManualReviewEvidenceRecord } from "../../../../../lib/listings/types"

export default function TicketEvidencePanel({
  evidence,
  isLoading,
  onRefresh,
  formatDate,
}: {
  evidence: ManualReviewEvidenceRecord[]
  isLoading: boolean
  onRefresh: () => void
  formatDate: (value: string) => string
}) {
  return (
    <div className="border-t border-[#E8E9EB] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-[12px] font-semibold uppercase tracking-wide text-[#111111]">
            Private seller evidence
          </h3>
          <p className="mt-1 text-[11px] text-[#292B2F]">
            Evidence links expire; refresh them if they no longer open.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="rounded-lg border border-[#E8E9EB] px-3 py-2 text-[11px] font-semibold text-[#111111] disabled:opacity-50"
        >
          {isLoading ? "Loading…" : "Refresh evidence"}
        </button>
      </div>

      {isLoading && evidence.length === 0 ? (
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
                    {item.ocr.status === "screened"
                      ? `OCR confidence ${Math.round(item.ocr.confidence)}% · ${item.ocr.characterCount} characters · event match ${item.ocr.eventNameMatch ?? "unknown"}`
                      : item.ocr.status === "disabled"
                        ? "OCR screening disabled"
                        : "OCR could not screen this file; inspect the ticket directly"}
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
  )
}
