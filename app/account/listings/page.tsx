"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import AccountPageShell, {
  ResourceCard,
} from "../../components/AccountPageShell"
import { formatNaira } from "../../lib/money"
import { getApiErrorMessage } from "../../lib/rtk-api"
import {
  isTicketPackage,
  LISTING_TICKET_TYPE_LABELS,
} from "../../lib/listings/ticket-types"
import type { ListingDetail } from "../../lib/listings/models"
import {
  useLazyGetListingByIdQuery,
  useLazyGetMyListingByIdQuery,
} from "../../lib/listings/rtk"

export default function AccountListingDetailsPage() {
  const [fetchListing] = useLazyGetMyListingByIdQuery()
  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id")
    if (!id) {
      setError("Listing ID is missing.")
      return
    }

    void fetchListing(id)
      .unwrap()
      .then(setListing)
      .catch((reason: unknown) => {
        setError(getApiErrorMessage(reason, "Unable to load listing."))
      })
  }, [fetchListing])

  return (
    <AccountPageShell eyebrow="My account" title="Listing details">
      {error ? (
        <ResourceCard>
          <p className="text-[14px]" style={{ color: "#292B2F" }}>
            {error}
          </p>
        </ResourceCard>
      ) : !listing ? (
        <ResourceCard>
          <p className="text-[14px]" style={{ color: "#292B2F" }}>
            Loading listing…
          </p>
        </ResourceCard>
      ) : (
        <ResourceCard>
          <Link
            href="/account"
            className="text-[13px] underline underline-offset-2"
            style={{ color: "#111111" }}
          >
            Back to account
          </Link>
          <p
            className="mt-6 text-[11px] uppercase tracking-widest"
            style={{ color: "#292B2F" }}
          >
            My listing
          </p>
          <h2 className="mt-2 text-2xl font-bold" style={{ color: "#111111" }}>
            {listing.title}
          </h2>
          <p
            className="mt-3 text-[14px] leading-relaxed"
            style={{ color: "#292B2F" }}
          >
            {listing.description}
          </p>
          <div className="mt-4 rounded-lg bg-[#FAFAF7] p-4">
            <p className="text-[12px] font-semibold text-[#111111]">
              {listing.ticketCategory ?? "General Admission"} ·{" "}
              {
                LISTING_TICKET_TYPE_LABELS[
                  listing.ticketType ?? "general_admission"
                ]
              }
            </p>
            {listing.ticketDetails?.includedAdmissions ? (
              <p className="mt-1 text-[13px] text-[#292B2F]">
                {listing.ticketDetails.includedAdmissions} admissions per
                package
              </p>
            ) : null}
          </div>
          <div
            className="mt-6 grid gap-4 border-t pt-5 sm:grid-cols-2 lg:grid-cols-4"
            style={{ borderColor: "#E8E9EB" }}
          >
            <div>
              <p className="text-[11px] uppercase" style={{ color: "#292B2F" }}>
                {isTicketPackage(listing.ticketType)
                  ? "Price per package"
                  : "Price per ticket"}
              </p>
              <p className="mt-1 font-mono-data font-semibold">
                {formatNaira(listing.price)}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase" style={{ color: "#292B2F" }}>
                {isTicketPackage(listing.ticketType) ? "Packages" : "Tickets"}
              </p>
              <p className="mt-1 font-semibold">{listing.quantity}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase" style={{ color: "#292B2F" }}>
                Status
              </p>
              <p className="mt-1 font-semibold">{listing.status}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase" style={{ color: "#292B2F" }}>
                Updated
              </p>
              <p className="mt-1 text-[13px]" style={{ color: "#292B2F" }}>
                {listing.updatedAt}
              </p>
            </div>
          </div>
        </ResourceCard>
      )}
    </AccountPageShell>
  )
}
