"use client"

import { formatNaira } from "../../../../lib/money"
import { isTicketPackage } from "../../../../lib/listings/ticket-types"
import type { ListingDetail } from "../../../../lib/listings/models"
import ListingTicketDescriptor from "../../../../components/tickets/ListingTicketDescriptor"

export default function CheckoutReviewSection({
  listing,
  quantity,
  onQuantityChange,
  onContinue,
}: {
  listing: ListingDetail
  quantity: number
  onQuantityChange: (quantity: number) => void
  onContinue: () => void
}) {
  const isPackage = isTicketPackage(listing.ticketType)

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-[#111111]">
        Review your order
      </h1>

      <div
        className="mb-4 rounded-lg border bg-white p-5"
        style={{ borderColor: "#E8E9EB" }}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="mb-0.5 text-[11px] font-medium tracking-wide text-[#292B2F] uppercase">
              Ticket listing
            </p>
            <p className="text-[15px] leading-tight font-semibold text-[#111111]">
              {listing.title}
            </p>
            <p className="mt-1 text-[13px] text-[#292B2F]">
              {listing.description}
            </p>
            <ListingTicketDescriptor
              className="mt-2 text-[12px] text-[#292B2F]"
              category={listing.ticketCategory}
              ticketType={listing.ticketType}
              includedAdmissions={listing.ticketDetails?.includedAdmissions}
            />
          </div>
          <div className="text-right">
            <p className="font-mono-data text-[15px] font-semibold text-[#111111]">
              {formatNaira(listing.price)}
            </p>
            <p className="text-[11px] text-[#292B2F]">
              per {isPackage ? "package" : "ticket"}
            </p>
          </div>
        </div>
      </div>

      <div
        className="mb-4 rounded-lg border bg-white p-5"
        style={{ borderColor: "#E8E9EB" }}
      >
        <h2 className="mb-4 text-[12px] font-semibold tracking-wide text-[#111111] uppercase">
          {isPackage ? "Packages" : "Tickets"}
        </h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="rounded-lg border px-3 py-2 text-[18px] leading-none"
            style={{ borderColor: "#E8E9EB", color: "#111111" }}
          >
            −
          </button>
          <span className="min-w-[3ch] text-center text-[14px] font-medium text-[#111111]">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() =>
              onQuantityChange(Math.min(listing.quantity, quantity + 1))
            }
            className="rounded-lg border px-3 py-2 text-[18px] leading-none"
            style={{ borderColor: "#E8E9EB", color: "#111111" }}
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="w-full rounded-lg py-3 text-[14px] font-semibold"
        style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
      >
        Continue to Contact Details
      </button>
    </div>
  )
}
