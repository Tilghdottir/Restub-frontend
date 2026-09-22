"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import Header from "../components/Header"
import { apiClient } from "../lib/api"
import type { ListingApiRecord } from "../lib/api-types"

export default function ListingDetailsPage() {
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
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error ? reason.message : "Listing not found.",
        ),
      )
  }, [])

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
    return (
      <div className="min-h-screen bg-[#FAFAF7]">
        <Header />
        <main className="max-w-2xl mx-auto px-6 py-16 text-center text-[14px] text-[#292B2F]">
          Loading listing…
        </main>
      </div>
    )
  }

  const checkoutQuery = new URLSearchParams({
    eventId: listing.id,
    section: "General admission",
    row: "-",
    seats: "Assigned at delivery",
    qty: "1",
    price: String(listing.price),
  })

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
          <div
            className="mt-6 grid gap-4 sm:grid-cols-3 border-t pt-5"
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
                Available
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
            href={`/checkout?${checkoutQuery.toString()}`}
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
