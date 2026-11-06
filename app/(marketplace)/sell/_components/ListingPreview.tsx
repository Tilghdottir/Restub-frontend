"use client"

import Link from "next/link"

const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
})

export default function ListingPreview({
  eventName,
  eventDate,
  eventVenue,
  ticketTypeLabel,
  ticketDetails,
  quantity,
  isPackage,
  showPrice,
  price,
  onPriceChange,
  isSubmitting,
  showSellerWorkspaceLink,
  onPublish,
  publishDisabled,
  publishLabel,
  showManualReviewButton,
  onManualReview,
  statusMessage,
  errorMessage,
}: {
  eventName: string
  eventDate: string
  eventVenue: string
  ticketTypeLabel: string
  ticketDetails: (string | undefined)[]
  quantity: number
  isPackage: boolean
  showPrice: boolean
  price: number
  onPriceChange: (price: number) => void
  isSubmitting: boolean
  showSellerWorkspaceLink: boolean
  onPublish: () => void
  publishDisabled: boolean
  publishLabel: string
  showManualReviewButton: boolean
  onManualReview: () => void
  statusMessage: string | null
  errorMessage: string | null
}) {
  return (
    <aside className="sticky top-20 rounded-lg bg-[#111111] p-5 text-[#FAFAF7]">
      <h2
        className="mb-4 text-[11px] font-medium tracking-widest uppercase"
        style={{ color: "rgba(250,250,247,0.55)" }}
      >
        Listing preview
      </h2>
      <div
        className="mb-4 border-b pb-4"
        style={{ borderColor: "rgba(250,250,247,0.08)" }}
      >
        <p className="text-[15px] font-semibold">{eventName}</p>
        <p
          className="mt-1 text-[12px]"
          style={{ color: "rgba(250,250,247,0.6)" }}
        >
          {eventDate} · {eventVenue}
        </p>
      </div>

      <div
        className="mb-5 space-y-2 text-[12px]"
        style={{ color: "rgba(250,250,247,0.7)" }}
      >
        <p>{ticketTypeLabel}</p>
        {ticketDetails
          .filter((detail): detail is string => Boolean(detail))
          .map((detail) => (
            <p key={detail}>{detail}</p>
          ))}
        <p>
          {quantity} {isPackage ? "packages" : "tickets"} available
        </p>
      </div>

      {showPrice ? (
        <div
          className="border-t pt-4"
          style={{ borderColor: "rgba(250,250,247,0.08)" }}
        >
          <div className="mb-3 flex items-center justify-between">
            <span
              className="text-[12px]"
              style={{ color: "rgba(250,250,247,0.6)" }}
            >
              {isPackage ? "Price per package (NGN)" : "Price per ticket (NGN)"}
            </span>
            <span className="font-mono-data text-[16px] font-semibold">
              {nairaFormatter.format(price || 0)}
            </span>
          </div>
          <input
            type="number"
            min={0}
            max={21474836}
            step={1}
            required
            disabled={isSubmitting}
            value={price}
            onChange={(event) => onPriceChange(Number(event.target.value) || 0)}
            className="w-full rounded-lg px-4 py-2.5 text-[14px] focus:outline-none"
            style={{
              backgroundColor: "#1A1A1A",
              color: "#FAFAF7",
              border: "1px solid rgba(250,250,247,0.1)",
            }}
          />
        </div>
      ) : (
        <p
          className="border-t pt-4 text-center text-[12px] text-white/70"
          style={{ borderColor: "rgba(250,250,247,0.08)" }}
        >
          Your price is set after ticket screening.
        </p>
      )}

      {showSellerWorkspaceLink ? (
        <Link
          href="/account/my-listings"
          className="mt-6 block w-full rounded-lg py-3 text-center text-[14px] font-semibold"
          style={{ backgroundColor: "#FAFAF7", color: "#111111" }}
        >
          Go to seller workspace
        </Link>
      ) : (
        <button
          type="button"
          onClick={onPublish}
          disabled={publishDisabled}
          className="mt-6 w-full rounded-lg py-3 text-[14px] font-semibold disabled:opacity-70"
          style={{ backgroundColor: "#FAFAF7", color: "#111111" }}
        >
          {publishLabel}
        </button>
      )}

      {showManualReviewButton ? (
        <button
          type="button"
          onClick={onManualReview}
          disabled={isSubmitting}
          className="mt-3 w-full rounded-lg border py-2.5 text-[12px] font-medium disabled:opacity-60"
          style={{
            borderColor: "rgba(250,250,247,0.3)",
            color: "#FAFAF7",
          }}
        >
          Request staff review for tickets that could not be verified
        </button>
      ) : null}
      {statusMessage ? (
        <p
          className="mt-3 text-center text-[11px]"
          style={{ color: "rgba(250,250,247,0.8)" }}
        >
          {statusMessage}
        </p>
      ) : null}
      {errorMessage ? (
        <p
          className="mt-3 text-center text-[11px]"
          style={{ color: "#F2A1A1" }}
        >
          {errorMessage}
        </p>
      ) : null}
      <p
        className="mt-3 text-center text-[10px]"
        style={{ color: "rgba(250,250,247,0.45)" }}
      >
        No listing fees until sold
      </p>
    </aside>
  )
}
