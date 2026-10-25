import Link from "next/link"
import Header from "../../components/Header"
import { formatNaira } from "../../lib/money"
import { getListingById } from "../../lib/listings/client"
import {
  isTicketPackage,
  LISTING_TICKET_TYPE_LABELS,
} from "../../lib/listings/ticket-types"

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function ListingDetailsPage({ params }: Props) {
  const { id } = await params

  let listing
  let error = ""

  if (!id) {
    error = "Listing ID is missing."
  } else {
    try {
      listing = await getListingById(id)
    } catch {
      error = "Listing not found."
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAF7]">
        <Header />
        <main className="max-w-2xl mx-auto px-6 py-16 text-center">
          <p className="text-[14px] text-[#292B2F]">{error}</p>
          <Link href="/" className="mt-4 inline-block text-[13px] underline">
            Back to listings
          </Link>
        </main>
      </div>
    )
  }

  if (!listing) {
    return null
  }

  const checkoutHref = `/checkout/${encodeURIComponent(listing.id)}`
  const ticketType = listing.ticketType ?? "general_admission"
  const ticketDetails = listing.ticketDetails
  const isPackage = isTicketPackage(ticketType)
  const detailRows: Array<[string, string | number | undefined]> = [
    ["Section", ticketDetails?.section],
    ["Row", ticketDetails?.row],
    ["Seats", ticketDetails?.seatNumbers],
    ["Access area", ticketDetails?.accessArea],
    ["Session", ticketDetails?.sessionName],
    ["Package", ticketDetails?.packageName],
    ["Admissions per package", ticketDetails?.includedAdmissions],
    ["Accessibility", ticketDetails?.accessibilityNotes],
    ["Details", ticketDetails?.otherDetails],
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAF7" }}>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <Link
          href="/"
          className="text-[13px] underline"
          style={{ color: "#111111" }}
        >
          Back to listings
        </Link>
        <div
          className="mt-5 bg-white border rounded-lg p-6"
          style={{ borderColor: "#E8E9EB" }}
        >
          <p
            className="text-[11px] uppercase tracking-widest"
            style={{ color: "#292B2F" }}
          >
            Ticket listing
          </p>
          <h1 className="mt-2 text-3xl font-bold" style={{ color: "#111111" }}>
            {listing.title}
          </h1>
          <p
            className="mt-3 text-[14px] leading-relaxed"
            style={{ color: "#292B2F" }}
          >
            {listing.description}
          </p>
          <div className="mt-5 rounded-lg bg-[#FAFAF7] p-4">
            <p className="text-[12px] font-semibold text-[#111111]">
              {listing.ticketCategory} ·{" "}
              {LISTING_TICKET_TYPE_LABELS[ticketType]}
            </p>
            {detailRows.some(
              ([, value]) => value !== undefined && value !== "",
            ) && (
              <dl className="mt-3 grid gap-2 text-[13px] sm:grid-cols-2">
                {detailRows
                  .filter(([, value]) => value !== undefined && value !== "")
                  .map(([label, value]) => (
                    <div key={label} className="flex flex-col">
                      <dt className="text-[#67696D]">{label}</dt>
                      <dd className="font-medium text-[#111111]">{value}</dd>
                    </div>
                  ))}
              </dl>
            )}
          </div>
          <div
            className="mt-6 grid gap-4 sm:grid-cols-3 border-t pt-5"
            style={{ borderColor: "#E8E9EB" }}
          >
            <div>
              <p className="text-[11px] uppercase" style={{ color: "#292B2F" }}>
                {isPackage ? "Price per package" : "Price per ticket"}
              </p>
              <p className="mt-1 font-mono-data font-semibold">
                {formatNaira(listing.price)}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase" style={{ color: "#292B2F" }}>
                {isPackage ? "Packages available" : "Tickets available"}
              </p>
              <p className="mt-1 font-semibold">{listing.quantity}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase" style={{ color: "#292B2F" }}>
                Status
              </p>
              <p className="mt-1 font-semibold">{listing.status}</p>
            </div>
          </div>
          <Link
            href={checkoutHref}
            className="mt-7 inline-flex rounded-lg px-5 py-3 text-[14px] font-semibold"
            style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
          >
            Buy this listing
          </Link>
        </div>
      </main>
    </div>
  )
}
