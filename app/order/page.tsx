"use client"

import Link from "next/link"
import AccountPageShell, { ResourceCard } from "../components/AccountPageShell"
import ApiErrorNotice from "../components/ApiErrorNotice"
import { useGetAccountSummaryQuery } from "../lib/account/rtk"

export default function OrderPage() {
  const { data, error } = useGetAccountSummaryQuery()
  const orders = data?.purchases ?? []

  return (
    <AccountPageShell eyebrow="Orders" title="My orders">
      <ApiErrorNotice error={error} fallback="Unable to load your orders." />
      <div className="space-y-3">
        {orders.map((order) => (
          <ResourceCard key={order.id}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p
                  className="font-mono-data text-[11px]"
                  style={{ color: "#292B2F" }}
                >
                  {order.id}
                </p>
                <p
                  className="text-[15px] font-semibold mt-1"
                  style={{ color: "#111111" }}
                >
                  {order.eventTitle}
                </p>
                <p className="text-[13px] mt-1" style={{ color: "#292B2F" }}>
                  {order.date} · {order.venue}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono-data font-semibold">
                  ${order.total.toLocaleString()}
                </span>
                <Link
                  href={`/account/purchases/${order.id}`}
                  className="text-[13px] underline underline-offset-2"
                  style={{ color: "#111111" }}
                >
                  View order
                </Link>
              </div>
            </div>
          </ResourceCard>
        ))}
      </div>
    </AccountPageShell>
  )
}
