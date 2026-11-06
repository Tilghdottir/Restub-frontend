import Link from "next/link"
import { ResourceCard } from "../../../../components/account/AccountPageShell"
import type { DashboardTicketSummary } from "../../../../lib/account-data/types"
import { formatAccountDate } from "./DashboardTicketRow"

export default function NextEventSummary({
  event,
  relativeDate,
}: {
  event: DashboardTicketSummary | undefined
  relativeDate: (value: string | null) => string
}) {
  return (
    <div className="min-w-[250px] snap-start sm:min-w-0">
      <ResourceCard>
        <p className="text-[11px] uppercase tracking-wide text-[#292B2F]">
          Next event
        </p>
        {event ? (
          <>
            <h2 className="mt-2 truncate text-[15px] font-semibold text-[#111111]">
              {event.eventTitle}
            </h2>
            <p className="mt-1 text-[12px] text-[#292B2F]">
              {formatAccountDate(event.eventDate)}
            </p>
            <p className="mt-1 truncate text-[12px] text-[#292B2F]">
              {event.venue ?? "Venue to be confirmed"} ·{" "}
              {relativeDate(event.eventDate)}
            </p>
            <Link
              href={
                event.actionHref ??
                (event.orderId
                  ? `/account/purchases/${encodeURIComponent(event.orderId)}`
                  : "/order")
              }
              className="mt-3 inline-block text-[12px] font-semibold underline underline-offset-2"
            >
              Open ticket
            </Link>
          </>
        ) : (
          <>
            <h2 className="mt-2 text-[15px] font-semibold text-[#111111]">
              No upcoming event
            </h2>
            <Link
              href="/"
              className="mt-3 inline-block text-[12px] font-semibold underline underline-offset-2"
            >
              Find events
            </Link>
          </>
        )}
      </ResourceCard>
    </div>
  )
}
