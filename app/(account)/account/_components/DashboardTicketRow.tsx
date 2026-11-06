"use client"

import Link from "next/link"
import type { DashboardTicketSummary } from "../../../../lib/account-data/types"

export function formatAccountDate(value: string | null): string {
  if (!value) return "Date to be confirmed"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: value.includes("T") ? "numeric" : undefined,
    minute: value.includes("T") ? "2-digit" : undefined,
  }).format(date)
}

function statusLabel(status: DashboardTicketSummary["status"]): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function actionLabel(action: DashboardTicketSummary["action"]): string | null {
  switch (action) {
    case "open_ticket":
      return "Open ticket"
    case "edit_listing":
      return "Edit listing"
    case "sell":
      return "Sell"
    case "transfer_now":
      return "Transfer now"
    default:
      return null
  }
}

export default function DashboardTicketRow({
  ticket,
}: {
  ticket: DashboardTicketSummary
}) {
  const actionText = actionLabel(ticket.action)
  const canSell = ticket.relationship === "buyer" && ticket.status === "valid"

  return (
    <article
      className={`rounded-lg border p-4 sm:p-5 ${
        ticket.locked
          ? "border-[#E8E9EB] bg-[#F0F0EE]"
          : "border-[#E8E9EB] bg-white"
      }`}
      aria-label={`${ticket.eventTitle}, ${statusLabel(ticket.status)}${
        ticket.locked ? ", ticket unavailable for use" : ""
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[15px] font-semibold text-[#111111]">
              {ticket.eventTitle}
            </h3>
            {ticket.locked ? (
              <span className="text-[10px] uppercase tracking-wide text-[#62656A]">
                Locked
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[12px] text-[#292B2F]">
            {formatAccountDate(ticket.eventDate)}
            {ticket.venue ? ` · ${ticket.venue}` : ""}
          </p>
          <p className="mt-1 text-[12px] text-[#292B2F]">
            {[
              ticket.section,
              ticket.row ? `Row ${ticket.row}` : null,
              ticket.seats ? `Seat ${ticket.seats}` : null,
            ]
              .filter(Boolean)
              .join(" · ") ||
              `${ticket.quantity} ticket${ticket.quantity === 1 ? "" : "s"}`}
          </p>
          {ticket.attention ? (
            <p className="mt-2 text-[12px] font-medium text-[#8A3028]">
              {ticket.attention}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium capitalize text-[#111111]">
            {statusLabel(ticket.status)}
          </span>
          {actionText && ticket.actionHref ? (
            <Link
              href={ticket.actionHref}
              className="rounded-lg bg-[#111111] px-3 py-2 text-[12px] font-semibold text-[#FAFAF7]"
            >
              {actionText}
            </Link>
          ) : actionText ? (
            <span className="text-[12px] font-medium text-[#62656A]">
              {ticket.status === "sold" ? "Awaiting acceptance" : actionText}
            </span>
          ) : null}
          {canSell ? (
            <Link
              href="/sell"
              className="text-[12px] font-medium underline underline-offset-2"
            >
              Sell
            </Link>
          ) : null}
          {ticket.actionHref && ticket.orderId ? (
            <Link
              href={ticket.actionHref}
              className="text-[12px] underline underline-offset-2"
            >
              Order support
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  )
}
