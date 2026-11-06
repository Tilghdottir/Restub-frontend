export type DateRange = "all" | "30" | "90"
export type TransactionType = "all" | "payments" | "refunds"

export default function TransactionFilters({
  dateRange,
  transactionType,
  search,
  exporting,
  isLoading,
  onDateRangeChange,
  onTransactionTypeChange,
  onSearchChange,
  onExport,
}: {
  dateRange: DateRange
  transactionType: TransactionType
  search: string
  exporting: boolean
  isLoading: boolean
  onDateRangeChange: (value: DateRange) => void
  onTransactionTypeChange: (value: TransactionType) => void
  onSearchChange: (value: string) => void
  onExport: () => void
}) {
  return (
    <section
      aria-label="Transaction filters"
      className="mb-5 grid gap-3 rounded-lg border border-[#E8E9EB] bg-white p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_2fr_auto]"
    >
      <label className="grid gap-1 text-[12px] font-medium text-[#292B2F]">
        Date range
        <select
          value={dateRange}
          onChange={(event) =>
            onDateRangeChange(event.target.value as DateRange)
          }
          className="rounded-md border border-[#D1D3D5] bg-white px-3 py-2 text-[13px] text-[#111111]"
        >
          <option value="all">All time</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </label>
      <label className="grid gap-1 text-[12px] font-medium text-[#292B2F]">
        Type
        <select
          value={transactionType}
          onChange={(event) =>
            onTransactionTypeChange(event.target.value as TransactionType)
          }
          className="rounded-md border border-[#D1D3D5] bg-white px-3 py-2 text-[13px] text-[#111111]"
        >
          <option value="all">Payments and refunds</option>
          <option value="payments">Payments</option>
          <option value="refunds">Refunds</option>
        </select>
      </label>
      <label className="grid gap-1 text-[12px] font-medium text-[#292B2F]">
        Search
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Order, provider, reference, or status"
          className="rounded-md border border-[#D1D3D5] px-3 py-2 text-[13px] text-[#111111] placeholder:text-[#62656A]"
        />
      </label>
      <button
        type="button"
        onClick={onExport}
        disabled={exporting || isLoading}
        className="self-end rounded-lg border border-[#111111] px-4 py-2 text-[13px] font-semibold text-[#111111] disabled:opacity-60"
      >
        {exporting ? "Preparing…" : "Export CSV"}
      </button>
    </section>
  )
}
