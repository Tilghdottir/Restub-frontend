"use client"

import Link from "next/link"
import { formatNaira } from "../../../../lib/money"
import { isTicketPackage } from "../../../../lib/listings/ticket-types"
import type { ListingDetail } from "../../../../lib/listings/models"
import ListingTicketDescriptor from "../../../../components/tickets/ListingTicketDescriptor"

export default function CheckoutOrderConfirmation({
  listing,
  quantity,
  total,
  orderReference,
}: {
  listing: ListingDetail
  quantity: number
  total: number
  orderReference: string
}) {
  const isPackage = isTicketPackage(listing.ticketType)

  return (
    <div className="max-w-md mx-auto py-12 text-center">
      <div
        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full text-2xl"
        style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
      >
        ✓
      </div>
      <h1 className="mb-2 text-2xl font-bold text-[#111111]">
        Order confirmed
      </h1>
      <p className="mb-2 text-[14px] text-[#292B2F]">
        Your tickets are on their way to your inbox.
      </p>
      <p className="mb-8 font-mono-data text-[12px] text-[#292B2F]">
        Order ref: {orderReference}
      </p>

      <div
        className="mb-8 overflow-hidden rounded-lg border text-left"
        style={{ borderColor: "#E8E9EB" }}
      >
        <div
          className="border-b bg-white p-5"
          style={{ borderColor: "#E8E9EB" }}
        >
          <p className="mb-1 text-[11px] font-medium tracking-wide text-[#292B2F] uppercase">
            Ticket listing
          </p>
          <p className="text-[15px] font-semibold text-[#111111]">
            {listing.title}
          </p>
          <p className="mt-0.5 text-[13px] text-[#292B2F]">
            {listing.quantity} {isPackage ? "packages" : "tickets"} available ·{" "}
            {formatNaira(listing.price)} per {isPackage ? "package" : "ticket"}
          </p>
          <ListingTicketDescriptor
            className="mt-1 text-[12px] text-[#292B2F]"
            category={listing.ticketCategory}
            ticketType={listing.ticketType}
            includedAdmissions={listing.ticketDetails?.includedAdmissions}
          />
        </div>
        <div className="space-y-2 bg-white p-5">
          {[
            {
              label: "Quantity",
              value: `${quantity} ${isPackage ? "package" : "ticket"}${
                quantity > 1 ? "s" : ""
              }`,
            },
            { label: "Total paid", value: formatNaira(total) },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-[13px]">
              <span className="text-[#292B2F]">{label}</span>
              <span className="font-mono-data font-medium text-[#111111]">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Link
        href="/account"
        className="inline-block w-full rounded-lg py-3 text-center text-[14px] font-semibold"
        style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
      >
        View my order
      </Link>
    </div>
  )
}
