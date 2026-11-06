import Link from "next/link"
import ApiErrorNotice from "../../../../components/ui/ApiErrorNotice"
import { ResourceCard } from "../../../../components/account/AccountPageShell"
import { formatMinorCurrencyAmount } from "../../../../lib/money"
import type { SellerEarnings } from "../../../../lib/payments/models"

export default function DashboardPayoutSummary({
  currencies,
  payoutStatus,
  isLoading,
  earningsError,
  payoutsError,
}: {
  currencies: SellerEarnings["currencies"]
  payoutStatus: string | null
  isLoading: boolean
  earningsError: unknown
  payoutsError: unknown
}) {
  const hasEarnings = currencies.some(
    (summary) =>
      summary.pendingAmountMinor !== "0" ||
      summary.heldAmountMinor !== "0" ||
      summary.releasedAmountMinor !== "0",
  )

  return (
    <ResourceCard>
      <p className="text-[11px] uppercase tracking-wide text-[#292B2F]">
        Payouts
      </p>
      {isLoading ? (
        <p className="mt-2 text-[15px] font-semibold text-[#111111]">
          Loading…
        </p>
      ) : hasEarnings ? (
        currencies.map((summary) => (
          <div key={summary.currency} className="mt-2">
            <p className="font-mono-data text-[15px] font-semibold text-[#111111]">
              {formatMinorCurrencyAmount(
                summary.pendingAmountMinor,
                summary.currency,
              )}{" "}
              pending
            </p>
            <p className="mt-1 text-[11px] text-[#292B2F]">
              {formatMinorCurrencyAmount(
                summary.heldAmountMinor,
                summary.currency,
              )}{" "}
              held · {summary.currency}, last 30 days
            </p>
          </div>
        ))
      ) : (
        <p className="mt-2 text-[13px] text-[#292B2F]">
          {payoutStatus
            ? `Payout account ${payoutStatus}.`
            : "No payout activity in the last 30 days."}
        </p>
      )}
      {earningsError || payoutsError ? (
        <ApiErrorNotice
          error={earningsError ?? payoutsError}
          fallback="Payout information is unavailable."
        />
      ) : null}
      {payoutStatus !== "verified" ? (
        <Link
          href="/payout-account"
          className="mt-3 inline-block text-[12px] font-semibold underline underline-offset-2"
        >
          Set up payouts
        </Link>
      ) : null}
    </ResourceCard>
  )
}
