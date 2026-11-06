"use client"

import Link from "next/link"
import ApiErrorNotice from "../../../../components/ui/ApiErrorNotice"
import { ResourceCard } from "../../../../components/account/AccountPageShell"
import type { NotificationSummary } from "../../../../lib/account-data/types"
import { formatAccountDate } from "./DashboardTicketRow"

export default function DashboardActivitySection({
  notifications,
  isLoading,
  error,
}: {
  notifications: NotificationSummary[]
  isLoading: boolean
  error: unknown
}) {
  return (
    <section className="mt-8" aria-labelledby="activity-heading">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-[#292B2F]">
            Updates
          </p>
          <h2
            id="activity-heading"
            className="mt-1 text-[18px] font-semibold text-[#111111]"
          >
            Activity
          </h2>
        </div>
        <div className="flex gap-3 text-[12px]">
          <Link href="/order" className="underline underline-offset-2">
            All orders
          </Link>
          <Link href="/notification" className="underline underline-offset-2">
            All activity
          </Link>
        </div>
      </div>
      <ApiErrorNotice error={error} fallback="Unable to load activity." />
      {isLoading ? (
        <ResourceCard>
          <p className="text-[13px] text-[#292B2F]">Loading activity…</p>
        </ResourceCard>
      ) : notifications.length === 0 ? (
        <ResourceCard>
          <p className="text-[13px] text-[#292B2F]">
            Activity from purchases, sales, transfers, and payouts will appear
            here.
          </p>
        </ResourceCard>
      ) : (
        <div className="space-y-2">
          {notifications.slice(0, 6).map((notification) => (
            <ResourceCard key={notification.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-[13px] font-semibold text-[#111111] capitalize">
                  {notification.title}
                </p>
                <time
                  dateTime={notification.createdAt}
                  className="text-[11px] text-[#62656A]"
                >
                  {formatAccountDate(notification.createdAt)}
                </time>
              </div>
              {notification.body ? (
                <p className="mt-1 text-[12px] text-[#292B2F]">
                  {notification.body}
                </p>
              ) : null}
            </ResourceCard>
          ))}
        </div>
      )}
    </section>
  )
}
