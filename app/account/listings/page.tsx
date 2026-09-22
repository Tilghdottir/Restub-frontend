"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import AccountPageShell, {
  ResourceCard,
} from "../../components/AccountPageShell"
import { apiClient } from "../../lib/api"
import type { ListingApiRecord } from "../../lib/api-types"

export default function AccountListingDetailsPage() {
  const [listing, setListing] = useState<ListingApiRecord | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id")
    if (!id) {
      setError("Listing ID is missing.")
      return
    }

    void apiClient
      .getListingById(id)
      .then(setListing)
      .catch((reason: unknown) => {
        setError(
          reason instanceof Error ? reason.message : "Unable to load listing.",
        )
      })
  }, [])

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
          <div
            className="mt-6 grid gap-4 border-t pt-5 sm:grid-cols-2 lg:grid-cols-4"
            style={{ borderColor: "#E8E9EB" }}
          >
            <div>
              <p className="text-[11px] uppercase" style={{ color: "#292B2F" }}>
                Price
              </p>
              <p className="mt-1 font-mono-data font-semibold">
                ${listing.price.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase" style={{ color: "#292B2F" }}>
                Quantity
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
