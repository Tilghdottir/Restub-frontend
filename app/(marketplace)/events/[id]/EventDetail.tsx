"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Header from "../../../../components/ui/Header"
import EventMetadata from "../../../../components/events/EventMetadata"
import { EVENTS, TICKET_SECTIONS } from "../../../../lib/data"
import EventOrderSummary from "./_components/EventOrderSummary"
import EventTicketPicker from "./_components/EventTicketPicker"

export default function EventDetail({ id }: { id: string }) {
  const router = useRouter()
  const event = EVENTS.find((item) => item.id === Number(id))
  const [selectedSection, setSelectedSection] = useState(0)
  const [quantity, setQuantity] = useState(2)

  if (!event) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#FAFAF7" }}>
        <Header />
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <p className="text-[14px] font-medium" style={{ color: "#111111" }}>
            Event not found.
          </p>
          <Link
            href="/"
            className="mt-3 inline-block text-[13px] underline"
            style={{ color: "#292B2F" }}
          >
            Back to browse
          </Link>
        </div>
      </div>
    )
  }

  const section = TICKET_SECTIONS[selectedSection]
  const subtotal = section.price * quantity
  const handleCheckout = () => {
    router.push(
      `/checkout/${encodeURIComponent(String(event.id))}?qty=${quantity}`,
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAF7" }}>
      <Header />
      <div className="border-b bg-white" style={{ borderColor: "#E8E9EB" }}>
        <div
          className="mx-auto flex max-w-6xl items-center gap-2 px-6 py-3 text-[12px]"
          style={{ color: "#292B2F" }}
        >
          <Link href="/" className="hover:underline">
            Events
          </Link>
          <span>/</span>
          <span className="truncate" style={{ color: "#111111" }}>
            {event.title}
          </span>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl items-start gap-8 px-6 py-8">
        <main className="min-w-0 flex-1">
          <div
            className="mb-6 overflow-hidden rounded-lg bg-gray-100"
            style={{ aspectRatio: "16/7" }}
          >
            <img
              src={event.image}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          </div>

          <section
            className="mb-6 rounded-lg border bg-white p-6"
            style={{ borderColor: "#E8E9EB" }}
          >
            <p
              className="mb-1 text-[11px] font-medium uppercase tracking-widest"
              style={{ color: "#292B2F" }}
            >
              {event.category}
            </p>
            <h1
              className="mb-1 text-2xl font-bold"
              style={{ color: "#111111" }}
            >
              {event.title}
            </h1>
            <p className="mb-4 text-[14px]" style={{ color: "#292B2F" }}>
              {event.subtitle}
            </p>
            <EventMetadata event={event} variant="details" />
          </section>

          <EventTicketPicker
            sections={TICKET_SECTIONS}
            selectedSection={selectedSection}
            quantity={quantity}
            onSelectSection={setSelectedSection}
            onQuantityChange={setQuantity}
          />
        </main>

        <EventOrderSummary
          event={event}
          section={section}
          quantity={quantity}
          subtotal={subtotal}
          total={subtotal}
          onCheckout={handleCheckout}
        />
      </div>
    </div>
  )
}
