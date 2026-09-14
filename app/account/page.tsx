"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Header from "../components/Header"
import { apiClient } from "../lib/api"
import type {
  AccountSummaryResponse,
  ListingSummary,
  OrderSummary,
} from "../lib/api-types"

const tabs = ["My Purchases", "My Listings"] as const

type TabKey = typeof tabs[number]

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("My Purchases")
  const [data, setData] = useState<AccountSummaryResponse | null>(null)

  useEffect(() => {
    apiClient.getAccountSummary().then(setData)
  }, [])

  const purchases = data?.purchases ?? []
  const listings = data?.listings ?? []

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAF7" }}>
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-8">
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
                        ${purchase.total.toLocaleString()}
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
                  <div>
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
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p
                        className="text-[11px] uppercase tracking-wide"
                        style={{ color: "#292B2F" }}
                      >
                        Asking
                      </p>
                      <p
                        className="font-mono-data text-[16px] font-semibold"
                        style={{ color: "#111111" }}
                      >
                        ${listing.askingPrice.toLocaleString()}
                      </p>
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                      style={{ backgroundColor: "#E8E9EB", color: "#111111" }}
                    >
                      {listing.status}
                    </span>
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
