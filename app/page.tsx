"use client" /* Search bar */ /* Hero strip */ /* Category pills */ /* Event grid */ /* How it works */ /* Footer */
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Header from "./components/Header"
import type { Event } from "./lib/data"
import { apiClient } from "./lib/api"
import type { ListingSummary } from "./lib/api-types"

function listingToEvent(listing: ListingSummary): Event {
  return {
    id: listing.id,
    title: listing.eventTitle,
    subtitle: `${listing.quantity} ticket${
      listing.quantity === 1 ? "" : "s"
    } available`,
    venue: listing.venue || "Online marketplace",
    city: "",
    date: listing.date || "Date to be announced",
    time: "",
    category: "Listings",
    image:
      "https://images.unsplash.com/photo-1501386761578-eaa54b45c5e0?w=600&h=400&fit=crop&auto=format",
    minPrice: listing.askingPrice,
    maxPrice: listing.askingPrice,
    ticketsLeft: listing.quantity,
    hot: listing.quantity <= 3,
  }
}

function EventCard({ event }: { event: Event }) {
  return (
    <Link
      href={`/checkout?${new URLSearchParams({
        eventId: String(event.id),
        section: "General admission",
        row: "-",
        seats: "Assigned at delivery",
        qty: "1",
        price: String(event.minPrice),
      }).toString()}`}
      className="group text-left bg-white border rounded-lg overflow-hidden block transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2"
      style={{ borderColor: "#E8E9EB", outlineColor: "#111111" }}
    >
      <div
        className="relative overflow-hidden bg-gray-100"
        style={{ aspectRatio: "3/2" }}
      >
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {event.hot && (
          <div className="absolute top-3 left-3">
            <span
              className="text-[10px] font-medium tracking-widest uppercase px-2 py-1 rounded-sm"
              style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
            >
              High Demand
            </span>
          </div>
        )}
        {event.ticketsLeft <= 20 && (
          <div className="absolute top-3 right-3">
            <span
              className="text-[10px] font-medium tracking-wide border px-2 py-1 rounded-sm font-mono-data bg-white"
              style={{ color: "#111111", borderColor: "#E8E9EB" }}
            >
              {event.ticketsLeft} left
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <p
          className="text-[11px] font-medium tracking-wide uppercase mb-1"
          style={{ color: "#292B2F" }}
        >
          {event.category}
        </p>
        <h3
          className="text-[15px] font-semibold leading-tight truncate"
          style={{ color: "#111111" }}
        >
          {event.title}
        </h3>
        <p className="text-[13px] mt-0.5 truncate" style={{ color: "#292B2F" }}>
          {event.subtitle}
        </p>
        <div
          className="mt-3 pt-3 border-t flex items-end justify-between"
          style={{ borderColor: "#E8E9EB" }}
        >
          <div>
            <p className="text-[11px]" style={{ color: "#292B2F" }}>
              {event.date} · {event.time}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: "#292B2F" }}>
              {event.venue}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] mb-0.5" style={{ color: "#292B2F" }}>
              from
            </p>
            <span
              className="font-mono-data text-[15px] font-semibold"
              style={{ color: "#111111" }}
            >
              ${event.minPrice.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function BrowsePage() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [listings, setListings] = useState<ListingSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    apiClient
      .getListings()
      .then((result) => {
        if (active) setListings(result)
      })
      .catch((error: unknown) => {
        if (!active) return
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load listings.",
        )
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const events = useMemo(() => listings.map(listingToEvent), [listings])
  const filtered = events.filter((e) => {
    const matchCat = activeCategory === "All" || e.category === activeCategory
    const matchSearch =
      !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAF7" }}>
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-8">
        {}
        <div className="mb-6 relative max-w-lg">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            style={{ color: "#292B2F" }}
          >
            <circle
              cx="6"
              cy="6"
              r="4.5"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <path
              d="M9.5 9.5L12.5 12.5"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            placeholder="Search events, artists, venues…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border rounded-lg pl-9 pr-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 transition-colors"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#E8E9EB",
              color: "#111111",
            }}
          />
        </div>

        {}
        <div
          className="mb-8 border rounded-lg overflow-hidden bg-white"
          style={{ borderColor: "#E8E9EB" }}
        >
          <div className="grid md:grid-cols-2">
            <div className="p-8 flex flex-col justify-center">
              <p
                className="text-[11px] font-medium tracking-widest uppercase mb-3"
                style={{ color: "#292B2F" }}
              >
                New York City · September 2026
              </p>
              <h1
                className="text-3xl font-bold leading-tight mb-3"
                style={{ color: "#111111" }}
              >
                The best seats.
                <br />
                No surprises.
              </h1>
              <p
                className="text-[14px] leading-relaxed mb-6"
                style={{ color: "#292B2F" }}
              >
                Guaranteed authentic tickets to every concert, game, and show —
                transparent pricing, no hidden fees.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                {[
                  { label: "Verified sellers", icon: "★" },
                  { label: "Instant e-delivery", icon: "↓" },
                  { label: "Money-back guarantee", icon: "✓" },
                ].map(({ label, icon }) => (
                  <div
                    key={label}
                    className="flex items-center gap-1.5 text-[12px]"
                    style={{ color: "#292B2F" }}
                  >
                    <span
                      className="font-bold text-[11px]"
                      style={{ color: "#111111" }}
                    >
                      {icon}
                    </span>
                    {label}
                  </div>
                ))}
              </div>
            </div>
            <div
              className="hidden md:block bg-gray-100"
              style={{ minHeight: "240px" }}
            >
              <img
                src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=500&fit=crop&auto=format"
                alt="Concert crowd"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {["All", "Listings"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="shrink-0 px-4 py-2 text-[12px] font-medium rounded-lg border transition-colors duration-100 focus:outline-none"
              style={
                activeCategory === cat
                  ? {
                      backgroundColor: "#111111",
                      borderColor: "#111111",
                      color: "#FAFAF7",
                    }
                  : {
                      backgroundColor: "#FFFFFF",
                      borderColor: "#E8E9EB",
                      color: "#292B2F",
                    }
              }
            >
              {cat}
            </button>
          ))}
          <span
            className="ml-auto shrink-0 text-[12px] font-mono-data"
            style={{ color: "#292B2F" }}
          >
            {filtered.length} listings
          </span>
        </div>

        {}
        {isLoading ? (
          <div
            className="text-center py-20 border rounded-lg bg-white"
            style={{ borderColor: "#E8E9EB" }}
          >
            <p className="text-[14px]" style={{ color: "#292B2F" }}>
              Loading listings…
            </p>
          </div>
        ) : errorMessage ? (
          <div
            className="text-center py-20 border rounded-lg bg-white"
            style={{ borderColor: "#E8E9EB" }}
          >
            <p
              className="text-[14px] font-medium mb-1"
              style={{ color: "#111111" }}
            >
              Unable to load listings
            </p>
            <p className="text-[13px]" style={{ color: "#292B2F" }}>
              {errorMessage}
            </p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-20 border rounded-lg bg-white"
            style={{ borderColor: "#E8E9EB" }}
          >
            <p
              className="text-[14px] font-medium mb-1"
              style={{ color: "#111111" }}
            >
              No listings found
            </p>
            <p className="text-[13px]" style={{ color: "#292B2F" }}>
              Try a different search term.
            </p>
          </div>
        )}

        {}
        <div className="mt-12">
          <h2
            className="text-[13px] font-semibold uppercase tracking-wide mb-4"
            style={{ color: "#111111" }}
          >
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                step: "01",
                title: "Find Your Event",
                desc: "Browse thousands of events by date, location, and category. Filter by price range and seat preference.",
              },
              {
                step: "02",
                title: "Choose Your Seats",
                desc: "Pick from verified listings with transparent pricing. All fees shown upfront — no surprises at checkout.",
              },
              {
                step: "03",
                title: "Get Your Tickets",
                desc: "Receive your tickets instantly via email. Every ticket is guaranteed authentic or your money back.",
              },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="bg-white border rounded-lg p-5"
                style={{ borderColor: "#E8E9EB" }}
              >
                <p
                  className="font-mono-data text-[11px] font-medium mb-3"
                  style={{ color: "#292B2F" }}
                >
                  {step}
                </p>
                <h3
                  className="text-[14px] font-semibold mb-2"
                  style={{ color: "#111111" }}
                >
                  {title}
                </h3>
                <p
                  className="text-[13px] leading-relaxed"
                  style={{ color: "#292B2F" }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {}
      <footer
        className="border-t mt-12 bg-white"
        style={{ borderColor: "#E8E9EB" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-[14px] font-bold" style={{ color: "#111111" }}>
              resale
              <span className="font-normal" style={{ color: "#292B2F" }}>
                .co
              </span>
            </p>
            <p className="text-[12px] mt-1" style={{ color: "#292B2F" }}>
              © 2026 Resale Co. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-6">
            {[
              "Privacy Policy",
              "Terms of Service",
              "Seller FAQ",
              "Contact",
            ].map((link) => (
              <a
                key={link}
                href="#"
                className="text-[12px] transition-colors hover:opacity-70"
                style={{ color: "#292B2F" }}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
