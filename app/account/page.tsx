"use client"

import { useState } from "react"
import Link from "next/link"
import AccountSidebar from "../components/AccountSidebar"
import ApiErrorNotice from "../components/ApiErrorNotice"
import { formatNaira } from "../lib/money"
import type { ListingSummary } from "../lib/listings/models"
import {
  isTicketPackage,
  LISTING_TICKET_TYPE_LABELS,
} from "../lib/listings/ticket-types"
import type { OrderSummary } from "../lib/orders/models"
import { useGetAccountSummaryQuery } from "../lib/account/rtk"
import { useGetKycProfileQuery } from "../lib/kyc/rtk"

const tabs = ["My Purchases", "My Listings"] as const

type TabKey = typeof tabs[number]

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("My Purchases")
  const { data, error } = useGetAccountSummaryQuery()
  const {
    data: kycProfile,
    error: kycError,
    isLoading: kycLoading,
  } = useGetKycProfileQuery()

  const purchases = data?.purchases ?? []
  const listings = data?.listings ?? []

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAF7" }}>
      <AccountSidebar />

      <main className="lg:ml-64 max-w-5xl mx-auto px-6 py-8">
        <ApiErrorNotice
          error={error}
          fallback="Unable to load your account summary."
        />
        <div className="mb-6">
          <p
            className="text-[11px] font-medium tracking-widest uppercase mb-2"
            style={{ color: "#292B2F" }}
          >
            My account
          </p>
          <h1 className="text-3xl font-bold" style={{ color: "#111111" }}>
            Avery Stone
          </h1>
        </div>

        <section
          className="mb-6 rounded-lg border bg-white p-5"
          style={{ borderColor: "#E8E9EB" }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p
                className="text-[11px] font-medium tracking-widest uppercase"
                style={{ color: "#292B2F" }}
              >
                Identity verification
              </p>
              <h2
                className="mt-1 text-[16px] font-semibold"
                style={{ color: "#111111" }}
              >
                {kycLoading
                  ? "Checking verification status…"
                  : kycProfile?.status === "verified"
                    ? "Your identity is verified"
                    : kycProfile?.status === "pending" ||
                        kycProfile?.status === "requires_review"
                      ? "Your verification is being reviewed"
                      : kycProfile?.status === "rejected"
                        ? "Identity verification needs attention"
                        : "Complete identity verification"}
              </h2>
              <p className="mt-1 text-[13px]" style={{ color: "#292B2F" }}>
                {kycError
                  ? "View your verification status or submit identity details."
                  : kycProfile?.status === "verified"
                    ? "Your account verification status is up to date."
                    : kycProfile?.status === "pending" ||
                        kycProfile?.status === "requires_review"
                      ? "We’ll update your status when review is complete."
                      : kycProfile?.status === "rejected"
                        ? "Review the status and submit updated details if needed."
                        : "Some payment and seller flows may require account verification."}
              </p>
            </div>
            <Link
              href="/account/kyc"
              className="inline-flex shrink-0 items-center justify-center rounded-lg px-5 py-3 text-[13px] font-semibold"
              style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
            >
              {kycProfile?.status === "verified"
                ? "View verification"
                : kycProfile?.status
                  ? "Manage verification"
                  : "Add KYC"}
            </Link>
          </div>
          {kycError && (
            <p
              role="status"
              className="mt-3 text-[12px]"
              style={{ color: "#6A5318" }}
            >
              Verification status could not be loaded. You can still open the
              KYC page to continue.
            </p>
          )}
        </section>

        <div className="border-b mb-6" style={{ borderColor: "#E8E9EB" }}>
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors"
                style={{
                  borderColor: activeTab === tab ? "#111111" : "transparent",
                  color: activeTab === tab ? "#111111" : "#292B2F",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "My Purchases" ? (
          <div className="space-y-3">
            {purchases.length === 0 ? (
              <div
                className="border rounded-lg bg-white p-8 text-center"
                style={{ borderColor: "#E8E9EB" }}
              >
                <p
                  className="text-[14px] font-medium"
                  style={{ color: "#111111" }}
                >
                  No purchases yet.
                </p>
              </div>
            ) : (
              purchases.map((purchase: OrderSummary) => (
                <div
                  key={purchase.id}
                  className="bg-white border rounded-lg p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                  style={{ borderColor: "#E8E9EB" }}
                >
                  <div>
                    <p
                      className="text-[11px] font-medium tracking-wide uppercase"
                      style={{ color: "#292B2F" }}
                    >
                      {purchase.id}
                    </p>
                    <p
                      className="text-[15px] font-semibold mt-1"
                      style={{ color: "#111111" }}
                    >
                      {purchase.eventTitle}
                    </p>
                    <p
                      className="text-[13px] mt-1"
                      style={{ color: "#292B2F" }}
                    >
                      {purchase.date} · {purchase.venue}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p
                        className="text-[11px] uppercase tracking-wide"
                        style={{ color: "#292B2F" }}
                      >
                        Total
                      </p>
                      <p
                        className="font-mono-data text-[16px] font-semibold"
                        style={{ color: "#111111" }}
                      >
                        {formatNaira(purchase.total)}
                      </p>
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                      style={{ backgroundColor: "#E8E9EB", color: "#111111" }}
                    >
                      {purchase.status}
                    </span>
                    <Link
                      href={`/account/purchases/${purchase.id}`}
                      className="text-[13px] font-medium underline underline-offset-2"
                      style={{ color: "#111111" }}
                    >
                      View status
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {listings.length === 0 ? (
              <div
                className="border rounded-lg bg-white p-8 text-center"
                style={{ borderColor: "#E8E9EB" }}
              >
                <p
                  className="text-[14px] font-medium"
                  style={{ color: "#111111" }}
                >
                  No listings yet.
                </p>
              </div>
            ) : (
              listings.map((listing: ListingSummary) => (
                <div
                  key={listing.id}
                  className="bg-white border rounded-lg p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                  style={{ borderColor: "#E8E9EB" }}
                >
                  <Link
                    href={`/account/listings?id=${encodeURIComponent(listing.id)}`}
                    className="min-w-0"
                  >
                    <p
                      className="text-[11px] font-medium tracking-wide uppercase"
                      style={{ color: "#292B2F" }}
                    >
                      {listing.id}
                    </p>
                    <p
                      className="text-[15px] font-semibold mt-1"
                      style={{ color: "#111111" }}
                    >
                      {listing.eventTitle}
                    </p>
                    <p
                      className="text-[13px] mt-1"
                      style={{ color: "#292B2F" }}
                    >
                      {listing.date} · {listing.venue}
                    </p>
                    <p
                      className="text-[12px] mt-1"
                      style={{ color: "#292B2F" }}
                    >
                      {listing.ticketCategory ?? "General Admission"} ·{" "}
                      {
                        LISTING_TICKET_TYPE_LABELS[
                          listing.ticketType ?? "general_admission"
                        ]
                      }{" "}
                      · {listing.quantity}{" "}
                      {isTicketPackage(listing.ticketType)
                        ? "packages"
                        : "tickets"}
                    </p>
                    {listing.manualReviewStatus &&
                    listing.manualReviewStatus !== "not_submitted" ? (
                      <p
                        className="mt-2 text-[12px] font-medium"
                        style={{
                          color:
                            listing.manualReviewStatus === "rejected"
                              ? "#A03B32"
                              : listing.manualReviewStatus === "approved"
                                ? "#22633D"
                                : "#6A5318",
                        }}
                      >
                        Ticket review: {listing.manualReviewStatus}
                        {listing.manualReviewStatus === "rejected" &&
                        listing.manualReviewNote
                          ? ` — ${listing.manualReviewNote}`
                          : ""}
                      </p>
                    ) : null}
                  </Link>
                  <div className="flex items-center justify-between gap-4 md:justify-end">
                    <div className="text-right">
                      <p
                        className="text-[11px] uppercase tracking-wide"
                        style={{ color: "#292B2F" }}
                      >
                        {isTicketPackage(listing.ticketType)
                          ? "Asking per package"
                          : "Asking per ticket"}
                      </p>
                      <p
                        className="font-mono-data text-[16px] font-semibold"
                        style={{ color: "#111111" }}
                      >
                        {formatNaira(listing.askingPrice)}
                      </p>
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                      style={{ backgroundColor: "#E8E9EB", color: "#111111" }}
                    >
                      {listing.status}
                    </span>
                    {listing.status === "draft" ? (
                      <Link
                        href={`/sell?listingId=${encodeURIComponent(listing.id)}`}
                        className="rounded-md bg-[#111111] px-3 py-2 text-[12px] font-semibold text-white"
                      >
                        Continue listing
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}
