import Link from "next/link"
import { ResourceCard } from "../../../../../components/account/AccountPageShell"
import ApiErrorNotice from "../../../../../components/ui/ApiErrorNotice"
import { formatNaira } from "../../../../../lib/money"
import type { ListingSummary } from "../../../../../lib/listings/models"

function listingStatusLabel(
  status: "draft" | "published" | "suspended" | "rejected",
  manualReviewStatus?: "not_submitted" | "pending" | "approved" | "rejected",
  publicationBlockers: string[] = [],
): string {
  if (status === "published") return "Published"
  if (manualReviewStatus === "pending") return "Under review · not live"
  if (manualReviewStatus === "approved" && publicationBlockers.length > 0) {
    return "Approved · action needed"
  }
  if (manualReviewStatus === "approved") return "Approved · ready to publish"
  if (manualReviewStatus === "rejected")
    return "Review rejected · replace evidence"
  if (status === "suspended") return "Suspended"
  if (status === "rejected") return "Rejected"
  return "Draft · continue setup"
}

export default function MyListingInventory({
  listings,
  error,
  isLoading,
}: {
  listings: ListingSummary[]
  error: unknown
  isLoading: boolean
}) {
  return (
    <section aria-labelledby="seller-listings-heading">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-[#292B2F]">
            Inventory and review
          </p>
          <h2
            id="seller-listings-heading"
            className="mt-1 text-[19px] font-semibold text-[#111111]"
          >
            Listings
          </h2>
        </div>
        <Link
          href="/account"
          className="text-[12px] text-[#111111] underline underline-offset-2"
        >
          Account dashboard
        </Link>
      </div>
      <ApiErrorNotice error={error} fallback="Unable to load your listings." />
      {isLoading ? (
        <ResourceCard>
          <p className="text-[13px] text-[#292B2F]">Loading listings…</p>
        </ResourceCard>
      ) : listings.length === 0 ? (
        <ResourceCard>
          <p className="text-[14px] font-semibold text-[#111111]">
            No listings yet.
          </p>
          <Link
            href="/sell"
            className="mt-3 inline-block text-[12px] font-medium text-[#111111] underline underline-offset-2"
          >
            Start listing tickets
          </Link>
        </ResourceCard>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <ResourceCard key={listing.id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="truncate text-[15px] font-semibold text-[#111111]">
                    {listing.eventTitle}
                  </h3>
                  <p className="mt-1 text-[12px] text-[#292B2F]">
                    {listing.ticketCategory ?? "General Admission"} ·{" "}
                    {listing.quantity} ticket{listing.quantity === 1 ? "" : "s"}
                  </p>
                  <p className="mt-1 text-[12px] text-[#292B2F]">
                    <span className="font-mono-data font-semibold">
                      {formatNaira(listing.askingPrice)}
                    </span>{" "}
                    ·{" "}
                    {listingStatusLabel(
                      listing.status,
                      listing.manualReviewStatus,
                      listing.publicationBlockers,
                    )}
                  </p>
                  {listing.publicationBlockers?.length ? (
                    <ul className="mt-2 list-inside list-disc space-y-1 text-[12px] text-[#6A5318]">
                      {listing.publicationBlockers.map((blocker) => (
                        <li key={blocker}>{blocker}</li>
                      ))}
                    </ul>
                  ) : null}
                  {listing.manualReviewNote ? (
                    <p className="mt-2 text-[12px] text-[#8A3028]">
                      Reviewer note: {listing.manualReviewNote}
                    </p>
                  ) : null}
                </div>
                {listing.status === "draft" ? (
                  <Link
                    href={`/sell?listingId=${encodeURIComponent(listing.id)}`}
                    className="shrink-0 rounded-lg bg-[#111111] px-4 py-2.5 text-center text-[12px] font-semibold text-[#FAFAF7]"
                  >
                    {listing.manualReviewStatus === "pending"
                      ? "View review status"
                      : listing.manualReviewStatus === "approved"
                        ? listing.publicationBlockers?.length
                          ? "Complete next steps"
                          : "Publish listing"
                        : listing.manualReviewStatus === "rejected"
                          ? "Replace rejected files"
                          : "Continue draft"}
                  </Link>
                ) : (
                  <Link
                    href={`/account/listings?id=${encodeURIComponent(listing.id)}`}
                    className="shrink-0 text-[12px] font-medium text-[#111111] underline underline-offset-2"
                  >
                    View listing
                  </Link>
                )}
              </div>
            </ResourceCard>
          ))}
        </div>
      )}
    </section>
  )
}
