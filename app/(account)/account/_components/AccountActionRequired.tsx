import Link from "next/link"
import type { DashboardTicketSummary } from "../../../../lib/account-data/types"

export default function AccountActionRequired({
  items,
  payoutBlocked,
}: {
  items: DashboardTicketSummary[]
  payoutBlocked: boolean
}) {
  if (!items.length && !payoutBlocked) return null

  return (
    <section
      aria-label="Action required"
      className="mb-5 overflow-hidden rounded-lg border border-[#E8C6C1] bg-[#FFF6F4]"
    >
      <div className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wide text-[#8A3028]">
        Action required
      </div>
      <ul className="divide-y divide-[#E8C6C1]">
        {items.map((ticket) => (
          <li
            key={`${ticket.id}-attention`}
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-[13px] text-[#292B2F]"
          >
            <span>{ticket.attention}</span>
            {ticket.actionHref ? (
              <Link
                href={ticket.actionHref}
                className="font-medium underline underline-offset-2"
              >
                View details
              </Link>
            ) : null}
          </li>
        ))}
        {payoutBlocked ? (
          <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-[13px] text-[#292B2F]">
            <span>Your payout account needs attention.</span>
            <Link
              href="/payout-account"
              className="font-medium underline underline-offset-2"
            >
              Review payout setup
            </Link>
          </li>
        ) : null}
      </ul>
    </section>
  )
}
