"use client"

import { useState } from "react"
import Link from "next/link"
import Header from "../components/Header"
import { apiClient } from "../lib/api"
import { EVENTS } from "../lib/data"

export default function SellPage() {
  const [eventId, setEventId] = useState(String(EVENTS[0].id))
  const [section, setSection] = useState("Section 101")
  const [row, setRow] = useState("C")
  const [seats, setSeats] = useState("22–23")
  const [qty, setQty] = useState(2)
  const [price, setPrice] = useState(310)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const selectedEvent =
    EVENTS.find((e) => String(e.id) === eventId) ?? EVENTS[0]

  const handlePublishListing = async () => {
    setIsSubmitting(true)
    setErrorMessage(null)
    setStatusMessage(null)

    try {
      const createdListing = await apiClient.createListing({
        title: `${selectedEvent.title} — ${section} ${row}`,
        description: `${selectedEvent.title} • ${selectedEvent.date} • ${selectedEvent.venue} • ${section} ${row} • Seats ${seats}`,
        quantity: qty,
        price,
      })

      await apiClient.publishListing(createdListing.id)
      setStatusMessage("Listing published successfully.")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to publish listing."
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAF7" }}>
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <p
            className="text-[11px] font-medium tracking-widest uppercase mb-2"
            style={{ color: "#292B2F" }}
          >
            Seller dashboard
          </p>
          <h1 className="text-3xl font-bold" style={{ color: "#111111" }}>
            List your tickets
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
          <div className="space-y-5">
            <div
              className="bg-white border rounded-lg p-5"
              style={{ borderColor: "#E8E9EB" }}
            >
              <h2
                className="text-[12px] font-semibold uppercase tracking-wide mb-4"
                style={{ color: "#111111" }}
              >
                Event
              </h2>
              <label
                className="block text-[12px] font-medium mb-1.5"
                style={{ color: "#111111" }}
              >
                Select event
              </label>
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
                style={{
                  backgroundColor: "#FAFAF7",
                  borderColor: "#E8E9EB",
                  color: "#111111",
                }}
              >
                {EVENTS.map((event) => (
                  <option key={event.id} value={String(event.id)}>
                    {event.title} — {event.date}
                  </option>
                ))}
              </select>
            </div>

            <div
              className="bg-white border rounded-lg p-5"
              style={{ borderColor: "#E8E9EB" }}
            >
              <h2
                className="text-[12px] font-semibold uppercase tracking-wide mb-4"
                style={{ color: "#111111" }}
              >
                Ticket details
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    className="block text-[12px] font-medium mb-1.5"
                    style={{ color: "#111111" }}
                  >
                    Section
                  </label>
                  <input
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
                    style={{
                      backgroundColor: "#FAFAF7",
                      borderColor: "#E8E9EB",
                      color: "#111111",
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-[12px] font-medium mb-1.5"
                    style={{ color: "#111111" }}
                  >
                    Row
                  </label>
                  <input
                    value={row}
                    onChange={(e) => setRow(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
                    style={{
                      backgroundColor: "#FAFAF7",
                      borderColor: "#E8E9EB",
                      color: "#111111",
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-[12px] font-medium mb-1.5"
                    style={{ color: "#111111" }}
                  >
                    Seats
                  </label>
                  <input
                    value={seats}
                    onChange={(e) => setSeats(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
                    style={{
                      backgroundColor: "#FAFAF7",
                      borderColor: "#E8E9EB",
                      color: "#111111",
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-[12px] font-medium mb-1.5"
                    style={{ color: "#111111" }}
                  >
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value) || 1)}
                    className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
                    style={{
                      backgroundColor: "#FAFAF7",
                      borderColor: "#E8E9EB",
                      color: "#111111",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <aside className="bg-[#111111] text-[#FAFAF7] rounded-lg p-5 sticky top-20">
            <h2
              className="text-[11px] font-medium tracking-widest uppercase mb-4"
              style={{ color: "rgba(250,250,247,0.55)" }}
            >
              Listing preview
            </h2>
            <div
              className="mb-4 pb-4 border-b"
              style={{ borderColor: "rgba(250,250,247,0.08)" }}
            >
              <p className="text-[15px] font-semibold">{selectedEvent.title}</p>
              <p
                className="text-[12px] mt-1"
                style={{ color: "rgba(250,250,247,0.6)" }}
              >
                {selectedEvent.date} · {selectedEvent.venue}
              </p>
            </div>

            <div
              className="space-y-2 mb-5 text-[12px]"
              style={{ color: "rgba(250,250,247,0.7)" }}
            >
              <p>Section {section}</p>
              <p>
                Row {row} · Seats {seats}
              </p>
              <p>{qty} tickets available</p>
            </div>

            <div
              className="border-t pt-4"
              style={{ borderColor: "rgba(250,250,247,0.08)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-[12px]"
                  style={{ color: "rgba(250,250,247,0.6)" }}
                >
                  Ask price
                </span>
                <span className="font-mono-data text-[16px] font-semibold">
                  ${price.toLocaleString()}
                </span>
              </div>
              <input
                type="number"
                min={1}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value) || 0)}
                className="w-full rounded-lg px-4 py-2.5 text-[14px] focus:outline-none"
                style={{
                  backgroundColor: "#1A1A1A",
                  color: "#FAFAF7",
                  border: "1px solid rgba(250,250,247,0.1)",
                }}
              />
            </div>

            <button
              type="button"
              onClick={handlePublishListing}
              disabled={isSubmitting}
              className="mt-6 w-full py-3 rounded-lg text-[14px] font-semibold disabled:opacity-70"
              style={{ backgroundColor: "#FAFAF7", color: "#111111" }}
            >
              {isSubmitting ? "Publishing…" : "Publish listing"}
            </button>
            {statusMessage ? (
              <p
                className="mt-3 text-[11px] text-center"
                style={{ color: "rgba(250,250,247,0.8)" }}
              >
                {statusMessage}
              </p>
            ) : null}
            {errorMessage ? (
              <p
                className="mt-3 text-[11px] text-center"
                style={{ color: "#F2A1A1" }}
              >
                {errorMessage}
              </p>
            ) : null}
            <p
              className="mt-3 text-[10px] text-center"
              style={{ color: "rgba(250,250,247,0.45)" }}
            >
              No listing fees until sold
            </p>
          </aside>
        </div>

        <div
          className="mt-8 bg-white border rounded-lg p-5"
          style={{ borderColor: "#E8E9EB" }}
        >
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p
                className="text-[11px] font-medium tracking-widest uppercase"
                style={{ color: "#292B2F" }}
              >
                Tips
              </p>
              <h3
                className="text-[15px] font-semibold mt-1"
                style={{ color: "#111111" }}
              >
                How to sell faster
              </h3>
            </div>
            <Link
              href="/account"
              className="text-[13px] underline underline-offset-2"
              style={{ color: "#111111" }}
            >
              View my listings
            </Link>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              "Add a clear section and seat map so buyers know exactly what they’re getting.",
              "Price within a realistic range to attract a quick, authentic sale.",
              "Keep your listing active and respond to buyer messages promptly.",
            ].map((item) => (
              <div
                key={item}
                className="border rounded-lg p-4 text-[13px]"
                style={{ borderColor: "#E8E9EB", color: "#292B2F" }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
