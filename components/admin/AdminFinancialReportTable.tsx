import type { FinancialReportRow } from "../../lib/admin/types"

export default function AdminFinancialReportTable({
  rows,
  isLoading,
  hasError,
}: {
  rows: Array<FinancialReportRow & { kind: string }>
  isLoading: boolean
  hasError: boolean
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[#E8E9EB] bg-white">
      <table className="w-full min-w-[620px] text-left">
        <thead className="bg-[#FAFAF7]">
          <tr className="text-[11px] text-[#292B2F] uppercase tracking-wide">
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Currency</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Records</th>
            <th className="px-4 py-3">Amount (minor)</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={5} className="px-4 py-5 text-[13px] text-[#292B2F]">
                Loading financial report…
              </td>
            </tr>
          ) : hasError ? (
            <tr>
              <td colSpan={5} className="px-4 py-5 text-[13px] text-[#292B2F]">
                Report data is unavailable.
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-5 text-[13px] text-[#292B2F]">
                No financial records were returned for this period.
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
                key={`${row.kind}-${row.currency}-${row.status}-${index}`}
                className="border-t text-[13px] text-[#111111]"
              >
                <td className="px-4 py-3">{row.kind}</td>
                <td className="px-4 py-3">{row.currency}</td>
                <td className="px-4 py-3">{row.status}</td>
                <td className="px-4 py-3 font-mono-data">{row.count}</td>
                <td className="px-4 py-3 font-mono-data">
                  {row.amountMinor.toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
