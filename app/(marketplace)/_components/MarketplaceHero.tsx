import { formatNaira } from "../../../lib/money"
import type { ListingSummary } from "../../../lib/listings/models"
import { isTicketPackage } from "../../../lib/listings/ticket-types"

export default function MarketplaceHero({
  listings,
}: {
  listings: ListingSummary[]
}) {
  const featuredListing = listings.find(
    (listing) => listing.eventTitle.trim().length > 0,
  )
  const isPackage = isTicketPackage(featuredListing?.ticketType)
  const highlights = featuredListing
    ? [
        `${featuredListing.quantity} ${isPackage ? "package" : "ticket"}${
          featuredListing.quantity === 1 ? "" : "s"
        } available`,
        featuredListing.ticketCategory,
        `${formatNaira(featuredListing.askingPrice)} per ${
          isPackage ? "package" : "ticket"
        }`,
      ].filter((highlight): highlight is string => Boolean(highlight?.trim()))
    : []

  return (
    <div
      className="mb-8 overflow-hidden rounded-lg border bg-white"
      style={{ borderColor: "#E8E9EB" }}
    >
      <div className="grid md:grid-cols-2">
        <div className="flex flex-col justify-center p-8">
          <p
            className="mb-3 text-[11px] font-medium tracking-widest uppercase"
            style={{ color: "#292B2F" }}
          >
            {featuredListing ? "Tickets available now" : "Restub marketplace"}
          </p>
          <h1
            className="mb-3 text-3xl leading-tight font-bold"
            style={{ color: "#111111" }}
          >
            {featuredListing?.eventTitle ?? "Find tickets to live events."}
          </h1>
          <p
            className="mb-6 text-[14px] leading-relaxed"
            style={{ color: "#292B2F" }}
          >
            {featuredListing
              ? [featuredListing.venue, featuredListing.date]
                  .filter((detail) => detail.trim())
                  .join(" · ") || "View listing details before you buy."
              : "Browse available tickets and review listing details before you buy."}
          </p>
          {highlights.length > 0 ? (
            <div className="flex flex-wrap items-center gap-4">
              {highlights.map((label) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 text-[12px]"
                  style={{ color: "#292B2F" }}
                >
                  <span className="text-[11px] font-bold text-[#111111]">
                    •
                  </span>
                  {label}
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div className="hidden bg-gray-100 md:block" style={{ minHeight: 240 }}>
          <img
            src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=500&fit=crop&auto=format"
            alt="Concert crowd"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  )
}
