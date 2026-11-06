import Link from "next/link"
import ApiErrorNotice from "../../../../components/ui/ApiErrorNotice"
import type { PaymentsData } from "../../../../lib/account-data/types"
import { formatMinorCurrencyAmount } from "../../../../lib/money"
import type { SellerEarnings } from "../../../../lib/payments/models"

export default function DashboardMoneyDetails({
  currencies,
  earningsLoading,
  earningsError,
  paymentsError,
  paymentsLoading,
  payments,
}: {
  currencies: SellerEarnings["currencies"]
  earningsLoading: boolean
  earningsError: unknown
  paymentsError: unknown
  paymentsLoading: boolean
  payments: PaymentsData | undefined
}) {
  return (
    <details className="mt-8 rounded-lg border border-[#E8E9EB] bg-white">
      <summary className="cursor-pointer px-5 py-4 text-[14px] font-semibold text-[#111111]">
        Money and payouts
      </summary>
      <div className="space-y-4 border-t border-[#E8E9EB] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[14px] font-semibold text-[#111111]">
              Earnings and escrow
            </h2>
            <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-[#292B2F]">
              Figures cover the last 30 days. The current payout API reports
              pending, held, and released amounts, but does not provide an
              available wallet balance.
            </p>
          </div>
          <Link
            href="/payout-account"
            className="text-[12px] underline underline-offset-2"
          >
            Payout settings
          </Link>
        </div>
        <ApiErrorNotice
          error={earningsError}
          fallback="Unable to load earnings."
        />
        {earningsLoading ? (
          <p className="text-[13px] text-[#292B2F]">Loading earnings…</p>
        ) : currencies.length ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {currencies.flatMap((summary) =>
              [
                ["Pending", summary.pendingAmountMinor],
                ["Held in escrow", summary.heldAmountMinor],
                ["Released", summary.releasedAmountMinor],
                ["Refunded", summary.refundedAmountMinor],
              ].map(([label, amount]) => (
                <div
                  key={`${summary.currency}-${label}`}
                  className="rounded-lg border border-[#E8E9EB] p-4"
                >
                  <p className="text-[11px] uppercase tracking-wide text-[#292B2F]">
                    {label} · {summary.currency}
                  </p>
                  <p className="mt-2 font-mono-data text-[17px] font-semibold text-[#111111]">
                    {formatMinorCurrencyAmount(amount, summary.currency)}
                  </p>
                </div>
              )),
            )}
          </div>
        ) : (
          <p className="text-[13px] text-[#292B2F]">
            No earnings were recorded in the last 30 days.
          </p>
        )}
        {currencies.some(
          (summary) => summary.sellerFeesStatus === "not_recorded",
        ) ? (
          <p className="text-[12px] text-[#62656A]">
            Seller fee breakdowns are not yet recorded by the payment API.
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-4 border-t border-[#E8E9EB] pt-4 text-[12px]">
          <Link href="/payment" className="underline underline-offset-2">
            Payment methods
          </Link>
          <Link href="/transaction" className="underline underline-offset-2">
            Transactions
          </Link>
          {paymentsError ? (
            <span role="status" className="text-[#8A3028]">
              Payment records unavailable.
            </span>
          ) : paymentsLoading ? (
            <span className="text-[#62656A]">Loading payments…</span>
          ) : (
            <span className="text-[#62656A]">
              {payments?.transactions.length ?? 0} recent payment
              {(payments?.transactions.length ?? 0) === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </div>
    </details>
  )
}
