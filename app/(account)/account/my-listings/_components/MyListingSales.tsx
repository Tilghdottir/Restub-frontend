import Link from "next/link"
import { ResourceCard } from "../../../../../components/account/AccountPageShell"
import ApiErrorNotice from "../../../../../components/ui/ApiErrorNotice"
import type { DashboardTicketSummary } from "../../../../../lib/account-data/types"

export default function MyListingSales({
  sales,
  error,
  isLoading,
}: {
  sales: Array<DashboardTicketSummary & { orderId: string }>
  error: unknown
  isLoading: boolean
}) {
  return (
    <section className="mt-8" aria-labelledby="seller-sales-heading">
      <div className="mb-3">
        <p className="text-[11px] uppercase tracking-wide text-[#292B2F]">
          Orders, delivery, and settlement
        </p>
        <h2
          id="seller-sales-heading"
          className="mt-1 text-[19px] font-semibold text-[#111111]"
        >
          Sales
        </h2>
      </div>
      <ApiErrorNotice
        error={error}
        fallback="Unable to load seller order status."
      />
      {isLoading ? (
        <ResourceCard>
          <p className="text-[13px] text-[#292B2F]">Loading sales…</p>
        </ResourceCard>
      ) : sales.length === 0 ? (
        <ResourceCard>
          <p className="text-[13px] text-[#292B2F]">
            Sales and delivery updates will appear here. Open an order to manage
            ticket delivery and escrow status.
          </p>
        </ResourceCard>
      ) : (
        <div className="space-y-3">
          {sales.map((sale) => (
            <ResourceCard key={sale.orderId}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[14px] font-semibold text-[#111111]">
                    {sale.eventTitle}
                  </p>
                  <p className="mt-1 text-[12px] text-[#292B2F]">
                    {sale.quantity} ticket{sale.quantity === 1 ? "" : "s"} ·{" "}
                    {sale.status.replace(/_/g, " ")}
                  </p>
                </div>
                <Link
                  href={`/account/purchases/${encodeURIComponent(sale.orderId)}`}
                  className="shrink-0 text-[12px] font-medium text-[#111111] underline underline-offset-2"
                >
                  View delivery and payout status
                </Link>
              </div>
            </ResourceCard>
          ))}
        </div>
      )}
    </section>
  )
}
