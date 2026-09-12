'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'
import { EVENTS, TICKET_SECTIONS } from '../../lib/data'

export default function EventDetail({ id }: { id: string }) {
  const router = useRouter()
  const event = EVENTS.find(e => e.id === Number(id))
  const [selectedSection, setSelectedSection] = useState(0)
  const [qty, setQty] = useState(2)

  if (!event) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FAFAF7' }}>
        <Header />
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <p className="text-[14px] font-medium" style={{ color: '#111111' }}>Event not found.</p>
          <Link href="/" className="text-[13px] mt-3 inline-block underline" style={{ color: '#292B2F' }}>Back to browse</Link>
        </div>
      </div>
    )
  }

  const section = TICKET_SECTIONS[selectedSection]
  const subtotal = section.price * qty
  const fees = Math.round(subtotal * 0.13)
  const total = subtotal + fees

  const handleCheckout = () => {
    const p = new URLSearchParams({
      eventId: String(event.id),
      section: section.label,
      row: section.row,
      seats: section.seats,
      qty: String(qty),
      price: String(section.price),
    })
    router.push(`/checkout?${p.toString()}`)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF7' }}>
      <Header />

      {/* Breadcrumb */}
      <div className="border-b bg-white" style={{ borderColor: '#E8E9EB' }}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-2 text-[12px]" style={{ color: '#292B2F' }}>
          <Link href="/" className="hover:underline">Events</Link>
          <span>/</span>
          <span className="truncate" style={{ color: '#111111' }}>{event.title}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 flex gap-8 items-start">
        {/* Main */}
        <div className="flex-1 min-w-0">
          <div className="rounded-lg overflow-hidden bg-gray-100 mb-6" style={{ aspectRatio: '16/7' }}>
            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          </div>

          <div className="bg-white border rounded-lg p-6 mb-6" style={{ borderColor: '#E8E9EB' }}>
            <p className="text-[11px] font-medium tracking-widest uppercase mb-1" style={{ color: '#292B2F' }}>{event.category}</p>
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#111111' }}>{event.title}</h1>
            <p className="text-[14px] mb-4" style={{ color: '#292B2F' }}>{event.subtitle}</p>
            <div className="grid grid-cols-3 gap-6 pt-4 border-t" style={{ borderColor: '#E8E9EB' }}>
              {[
                { label: 'Date', value: event.date },
                { label: 'Time', value: event.time },
                { label: 'Venue', value: event.venue },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] font-medium tracking-wide uppercase mb-1" style={{ color: '#292B2F' }}>{label}</p>
                  <p className="text-[13px] font-medium" style={{ color: '#111111' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket picker */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-semibold uppercase tracking-wide" style={{ color: '#111111' }}>Select Tickets</h2>
              <div className="flex items-center border rounded-lg overflow-hidden" style={{ borderColor: '#E8E9EB' }}>
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  className="px-3 py-1.5 text-[13px] font-medium hover:opacity-70 transition-opacity disabled:opacity-30"
                  style={{ color: '#111111' }}
                >−</button>
                <span className="font-mono-data text-[13px] font-medium px-3 min-w-[3ch] text-center border-x" style={{ borderColor: '#E8E9EB', color: '#111111' }}>
                  {qty}
                </span>
                <button
                  onClick={() => setQty(q => Math.min(8, q + 1))}
                  disabled={qty >= 8}
                  className="px-3 py-1.5 text-[13px] font-medium hover:opacity-70 transition-opacity disabled:opacity-30"
                  style={{ color: '#111111' }}
                >+</button>
              </div>
            </div>

            <div className="space-y-2">
              {TICKET_SECTIONS.map((sec, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedSection(i)}
                  className="w-full text-left px-4 py-3.5 border rounded-lg flex items-center justify-between gap-4 transition-colors duration-100 focus:outline-none"
                  style={
                    selectedSection === i
                      ? { backgroundColor: '#111111', borderColor: '#111111', color: '#FAFAF7' }
                      : { backgroundColor: '#FFFFFF', borderColor: '#E8E9EB', color: '#111111' }
                  }
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold">{sec.label}</p>
                    <p className="text-[11px] mt-0.5 font-mono-data" style={{ opacity: 0.6 }}>Row {sec.row} · Seats {sec.seats}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono-data text-[15px] font-semibold">${sec.price.toLocaleString()}</p>
                    <p className="text-[10px] mt-0.5" style={{ opacity: 0.6 }}>{sec.qty} avail</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile bottom band */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 px-5 py-4 z-20" style={{ backgroundColor: '#111111' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px]" style={{ color: 'rgba(250,250,247,0.5)' }}>{section.label} · {qty} ticket{qty > 1 ? 's' : ''}</p>
                <span className="font-mono-data text-[16px] font-bold" style={{ color: '#FAFAF7' }}>${total.toLocaleString()}</span>
                <span className="text-[11px] ml-1" style={{ color: 'rgba(250,250,247,0.5)' }}>incl. fees</span>
              </div>
              <button
                onClick={handleCheckout}
                className="px-5 py-2.5 rounded-lg text-[13px] font-semibold"
                style={{ backgroundColor: '#FAFAF7', color: '#111111' }}
              >Checkout</button>
            </div>
          </div>
          <div className="md:hidden h-24" />
        </div>

        {/* Desktop black action rail */}
        <aside
          className="hidden md:flex w-72 shrink-0 flex-col rounded-lg overflow-hidden sticky top-20"
          style={{ backgroundColor: '#111111', color: '#FAFAF7' }}
        >
          <div className="p-6 flex-1">
            <h2 className="text-[11px] font-medium tracking-widest uppercase mb-5" style={{ color: 'rgba(250,250,247,0.5)' }}>
              Order Summary
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-[11px] mb-1" style={{ color: 'rgba(250,250,247,0.5)' }}>Event</p>
                <p className="text-[13px] font-semibold leading-tight">{event.title}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(250,250,247,0.6)' }}>{event.date} · {event.venue}</p>
              </div>
              <div>
                <p className="text-[11px] mb-1" style={{ color: 'rgba(250,250,247,0.5)' }}>Section</p>
                <p className="text-[13px] font-semibold">{section.label}</p>
                <p className="text-[11px] font-mono-data mt-0.5" style={{ color: 'rgba(250,250,247,0.6)' }}>Row {section.row} · Seats {section.seats}</p>
              </div>
              <div>
                <p className="text-[11px] mb-1" style={{ color: 'rgba(250,250,247,0.5)' }}>Quantity</p>
                <p className="font-mono-data text-[13px] font-semibold">{qty} ticket{qty > 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t space-y-2" style={{ borderColor: 'rgba(250,250,247,0.1)' }}>
              <div className="flex justify-between text-[12px]">
                <span style={{ color: 'rgba(250,250,247,0.6)' }}>Tickets ({qty}×)</span>
                <span className="font-mono-data" style={{ color: 'rgba(250,250,247,0.8)' }}>${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span style={{ color: 'rgba(250,250,247,0.6)' }}>Service fees</span>
                <span className="font-mono-data" style={{ color: 'rgba(250,250,247,0.8)' }}>${fees.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[14px] font-semibold pt-2 border-t" style={{ borderColor: 'rgba(250,250,247,0.1)' }}>
                <span>Total</span>
                <span className="font-mono-data">${total.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="p-6 pt-0">
            <button
              onClick={handleCheckout}
              className="w-full py-3 rounded-lg text-[13px] font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#FAFAF7', color: '#111111' }}
            >
              Continue to Checkout
            </button>
            <p className="text-[10px] text-center mt-3" style={{ color: 'rgba(250,250,247,0.4)' }}>
              Secure checkout · Guaranteed authentic
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
