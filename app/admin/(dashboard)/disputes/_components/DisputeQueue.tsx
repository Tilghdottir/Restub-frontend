import type {
  DisputePage,
  DisputeStatus,
} from "../../../../../lib/disputes/types"

export default function DisputeQueue({
  page,
  selectedId,
  status,
  isLoading,
  isFetching,
  canGoPrevious,
  hasError,
  statuses,
  onStatusChange,
  onSelect,
  onPrevious,
  onNext,
}: {
  page?: DisputePage
  selectedId: string | null
  status: DisputeStatus | ""
  isLoading: boolean
  isFetching: boolean
  canGoPrevious: boolean
  hasError: boolean
  statuses: readonly DisputeStatus[]
  onStatusChange: (value: string) => void
  onSelect: (id: string) => void
  onPrevious: () => void
  onNext: () => void
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-[#E8E9EB] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E9EB] p-4">
        <h2 className="text-[12px] font-semibold uppercase tracking-wide text-[#111111]">
          Case queue
        </h2>
        <label className="text-[11px] text-[#292B2F]">
          Status
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            className="ml-2 rounded border border-[#E8E9EB] bg-white px-2 py-1.5 text-[12px] text-[#111111]"
          >
            <option value="">All statuses</option>
            {statuses.map((item) => (
              <option key={item} value={item}>
                {labelStatus(item)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {isLoading ? (
        <p className="px-4 py-5 text-[13px] text-[#292B2F]">
          Loading dispute queue…
        </p>
      ) : page?.items.length ? (
        <ul className="divide-y divide-[#E8E9EB]">
          {page.items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                aria-pressed={selectedId === item.id}
                onClick={() => onSelect(item.id)}
                className="w-full px-4 py-4 text-left hover:bg-[#FAFAF7]"
                style={{
                  backgroundColor:
                    selectedId === item.id ? "#FAFAF7" : "#FFFFFF",
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
                      backgroundColor: item.overdue ? "#FCE8E6" : "#E8E9EB",
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
      ) : hasError ? null : (
        <p className="px-4 py-5 text-[13px] text-[#292B2F]">
          No disputes match this queue filter.
        </p>
      )}
      <div className="flex items-center justify-between border-t border-[#E8E9EB] px-4 py-3">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!canGoPrevious || isFetching}
          className="rounded border border-[#E8E9EB] px-3 py-2 text-[11px] font-semibold text-[#111111] disabled:opacity-40"
        >
          Previous
        </button>
        <span className="text-[11px] text-[#292B2F]">
          {page?.items.length ?? 0} cases
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={!page?.hasMore || !page.nextCursor || isFetching}
          className="rounded border border-[#E8E9EB] px-3 py-2 text-[11px] font-semibold text-[#111111] disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </section>
  )
}

function labelStatus(value: string): string {
  return value.replace(/_/g, " ")
}
