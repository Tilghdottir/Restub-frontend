"use client"

import { useEffect, useState } from "react"
import AccountPageShell, { ResourceCard } from "../components/AccountPageShell"
import { apiClient } from "../lib/api"
import type { TicketSummary } from "../lib/api-types"

export default function TicketPage() {
  const [tickets, setTickets] = useState<TicketSummary[]>([])
  useEffect(() => {
    void apiClient.getTickets().then(setTickets)
  }, [])

  return (
    <AccountPageShell eyebrow="Digital tickets" title="My tickets">
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <ResourceCard key={ticket.id}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p
                  className="text-[15px] font-semibold"
                  style={{ color: "#111111" }}
                >
                  {ticket.eventTitle}
                </p>
                <p className="text-[13px] mt-1" style={{ color: "#292B2F" }}>
                  {ticket.eventDate} · {ticket.section}, Row {ticket.row}, Seats{" "}
                  {ticket.seats}
                </p>
              </div>
              <span
                className="px-2.5 py-1 rounded-full text-[11px] font-medium self-start"
                style={{ backgroundColor: "#E8E9EB", color: "#111111" }}
              >
                {ticket.deliveryStatus}
              </span>
            </div>
            <button
              className="mt-5 px-4 py-2.5 border rounded-lg text-[13px] font-semibold"
              style={{ borderColor: "#E8E9EB", color: "#111111" }}
            >
              View ticket
            </button>
          </ResourceCard>
        ))}
      </div>
    </AccountPageShell>
  )
}
