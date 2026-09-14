import { useState } from "react"

const CATEGORIES = [
  "All",
  "Concerts",
  "Sports",
  "Theatre",
  "Comedy",
  "Festivals",
]

const EVENTS = [
  {
    id: 1,
    title: "Kendrick Lamar",
    subtitle: "Grand National Tour",
    venue: "Madison Square Garden",
    city: "New York, NY",
    date: "Sat, Oct 11",
    time: "8:00 PM",
    category: "Concerts",
    image:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop&auto=format",
    minPrice: 148,
    maxPrice: 890,
    ticketsLeft: 34,
    hot: true,
  },
  {
    id: 2,
    title: "New York Knicks vs. Boston Celtics",
    subtitle: "NBA Regular Season",
    venue: "Madison Square Garden",
    city: "New York, NY",
    date: "Thu, Oct 16",
    time: "7:30 PM",
    category: "Sports",
    image:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=400&fit=crop&auto=format",
    minPrice: 95,
    maxPrice: 1240,
    ticketsLeft: 128,
    hot: false,
  },
  {
    id: 3,
    title: "Sabrina Carpenter",
    subtitle: "Short n' Sweet Tour",
    venue: "Barclays Center",
    city: "Brooklyn, NY",
    date: "Fri, Oct 24",
    time: "7:00 PM",
    category: "Concerts",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop&auto=format",
    minPrice: 210,
    maxPrice: 650,
    ticketsLeft: 12,
    hot: true,
  },
  {
    id: 4,
    title: "Hamilton",
    subtitle: "Broadway Revival",
    venue: "Richard Rodgers Theatre",
    city: "New York, NY",
    date: "Tue, Nov 4",
    time: "8:00 PM",
    category: "Theatre",
    image:
      "https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=600&h=400&fit=crop&auto=format",
    minPrice: 185,
    maxPrice: 2100,
    ticketsLeft: 7,
    hot: true,
  },
  {
    id: 5,
    title: "Dave Chappelle",
    subtitle: "Live Stand-Up",
    venue: "Radio City Music Hall",
    city: "New York, NY",
    date: "Sat, Nov 8",
    time: "9:00 PM",
    category: "Comedy",
    image:
      "https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=600&h=400&fit=crop&auto=format",
    minPrice: 120,
    maxPrice: 480,
    ticketsLeft: 55,
    hot: false,
  },
  {
    id: 6,
    title: "Governors Ball 2025",
    subtitle: "Music Festival — 3-Day Pass",
    venue: "Flushing Meadows Corona Park",
    city: "Queens, NY",
    date: "Fri–Sun, Jun 6–8",
    time: "All Day",
    category: "Festivals",
    image:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&h=400&fit=crop&auto=format",
    minPrice: 340,
    maxPrice: 780,
    ticketsLeft: 204,
    hot: false,
  },
  {
    id: 7,
    title: "NY Rangers vs. Pittsburgh Penguins",
    subtitle: "NHL Regular Season",
    venue: "Madison Square Garden",
    city: "New York, NY",
    date: "Wed, Oct 29",
    time: "7:00 PM",
    category: "Sports",
    image:
      "https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=600&h=400&fit=crop&auto=format",
    minPrice: 78,
    maxPrice: 620,
    ticketsLeft: 89,
    hot: false,
  },
  {
    id: 8,
    title: "Chappell Roan",
    subtitle: "The Rise and Fall Tour",
    venue: "Forest Hills Stadium",
    city: "Queens, NY",
    date: "Sun, Sep 28",
    time: "6:30 PM",
    category: "Concerts",
    image:
      "https://images.unsplash.com/photo-1501386761578-eaa54b45c5e0?w=600&h=400&fit=crop&auto=format",
    minPrice: 175,
    maxPrice: 540,
    ticketsLeft: 21,
    hot: true,
  },
]

const TICKET_DETAIL = {
  sections: [
    {
      label: "Floor GA",
      row: "—",
      seats: "General Admission",
      qty: 2,
      price: 310,
    },
    { label: "Pit A", row: "A", seats: "14–15", qty: 2, price: 428 },
    { label: "Section 101", row: "C", seats: "22–23", qty: 2, price: 212 },
    { label: "Section 104", row: "F", seats: "7–8", qty: 2, price: 185 },
    { label: "Section 108", row: "J", seats: "1–2", qty: 2, price: 148 },
    { label: "Section 201", row: "B", seats: "11–12", qty: 2, price: 162 },
  ],
}

function PriceTag({
  value,
  className = "",
}: {
  value: number
  className?: string
}) {
  return (
    <span className={`font-mono-data ${className}`}>
      ${value.toLocaleString("en-US")}
    </span>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase border border-current rounded-sm">
      {children}
    </span>
  )
}

function EventCard({
  event,
  onClick,
}: {
  event: typeof EVENTS[0]
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group text-left bg-white border border-[#E8E9EB] rounded-lg overflow-hidden hover:border-[#292B2F] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#111111] focus:ring-offset-2"
    >
      <div
        className="relative bg-[#E8E9EB] overflow-hidden"
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
            <span className="bg-[#111111] text-[#FAFAF7] text-[10px] font-medium tracking-widest uppercase px-2 py-1 rounded-sm">
              High Demand
            </span>
          </div>
        )}
        {event.ticketsLeft <= 20 && (
          <div className="absolute top-3 right-3">
            <span className="bg-white text-[#111111] text-[10px] font-medium tracking-wide border border-[#E8E9EB] px-2 py-1 rounded-sm font-mono-data">
              {event.ticketsLeft} left
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-[#292B2F] tracking-wide uppercase mb-1">
              {event.category}
            </p>
            <h3 className="text-[15px] font-semibold text-[#111111] leading-tight truncate">
              {event.title}
            </h3>
            <p className="text-[13px] text-[#292B2F] mt-0.5 truncate">
              {event.subtitle}
            </p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-[#E8E9EB] flex items-end justify-between">
          <div>
            <p className="text-[11px] text-[#292B2F]">
              {event.date} · {event.time}
            </p>
            <p className="text-[11px] text-[#292B2F] mt-0.5">{event.venue}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[#292B2F] mb-0.5">from</p>
            <PriceTag
              value={event.minPrice}
              className="text-[15px] font-semibold text-[#111111]"
            />
          </div>
        </div>
      </div>
    </button>
  )
}

function TicketRow({
  section,
  selected,
  onClick,
}: {
  section: typeof TICKET_DETAIL.sections[0]
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 border rounded-lg flex items-center justify-between gap-4 transition-colors duration-100 focus:outline-none focus:ring-2 focus:ring-[#111111] focus:ring-offset-1 ${
        selected
          ? "bg-[#111111] border-[#111111] text-white"
          : "bg-white border-[#E8E9EB] hover:border-[#292B2F] text-[#111111]"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p
          className={`text-[13px] font-semibold ${
            selected ? "text-white" : "text-[#111111]"
          }`}
        >
          {section.label}
        </p>
        <p
          className={`text-[11px] mt-0.5 font-mono-data ${
            selected ? "text-[#FAFAF7]/70" : "text-[#292B2F]"
          }`}
        >
          Row {section.row} · Seats {section.seats}
        </p>
      </div>
      <div className="text-right shrink-0">
        <PriceTag
          value={section.price}
          className={`text-[15px] font-semibold ${
            selected ? "text-white" : "text-[#111111]"
          }`}
        />
        <p
          className={`text-[10px] mt-0.5 ${
            selected ? "text-[#FAFAF7]/60" : "text-[#292B2F]"
          }`}
        >
          ea · {section.qty} avail
        </p>
      </div>
    </button>
  )
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [selectedEvent, setSelectedEvent] = useState<typeof EVENTS[0] | null>(
    null,
  )
  const [selectedSection, setSelectedSection] = useState(0)
  const [qty, setQty] = useState(2)
  const [searchQuery, setSearchQuery] = useState("")
  const [view, setView] = useState<"browse" | "detail">("browse")

  const filtered = EVENTS.filter((e) => {
    const matchCat = activeCategory === "All" || e.category === activeCategory
    const matchSearch =
      !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  })

  const openEvent = (event: typeof EVENTS[0]) => {
    setSelectedEvent(event)
    setSelectedSection(0)
    setQty(2)
    setView("detail")
  }

  const section = TICKET_DETAIL.sections[selectedSection]
  const total = section ? section.price * qty : 0
  const fees = Math.round(total * 0.13)

  if (view === "detail" && selectedEvent) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-[#E8E9EB] px-6 py-3.5 flex items-center gap-4">
          <button
            onClick={() => setView("browse")}
            className="flex items-center gap-2 text-[13px] font-medium text-[#292B2F] hover:text-[#111111] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </button>
          <span className="w-px h-4 bg-[#E8E9EB]" />
          <span className="text-[13px] text-[#292B2F] truncate">
            {selectedEvent.title} · {selectedEvent.date}
          </span>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Main content */}
          <div className="flex-1 overflow-y-auto">
            {/* Hero */}
            <div className="relative bg-[#E8E9EB]" style={{ height: "280px" }}>
              <img
                src={selectedEvent.image}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-[11px] font-medium tracking-widest uppercase text-white/70 mb-1">
                  {selectedEvent.category}
                </p>
                <h1 className="text-2xl font-bold text-white leading-tight">
                  {selectedEvent.title}
                </h1>
                <p className="text-[14px] text-white/80 mt-1">
                  {selectedEvent.subtitle}
                </p>
              </div>
            </div>

            {/* Event meta */}
            <div className="px-6 py-4 bg-white border-b border-[#E8E9EB]">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Date", value: selectedEvent.date },
                  { label: "Time", value: selectedEvent.time },
                  { label: "Venue", value: selectedEvent.venue },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] font-medium tracking-wide uppercase text-[#292B2F] mb-1">
                      {label}
                    </p>
                    <p className="text-[13px] font-medium text-[#111111]">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity selector */}
            <div className="px-6 pt-5 pb-3">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[#111111]">
                  Select Tickets
                </h2>
                <div className="flex items-center gap-2 border border-[#E8E9EB] rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-[13px] font-medium hover:bg-[#E8E9EB] transition-colors"
                    disabled={qty <= 1}
                  >
                    −
                  </button>
                  <span className="font-mono-data text-[13px] font-medium px-2 min-w-[2ch] text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => Math.min(8, q + 1))}
                    className="px-3 py-1.5 text-[13px] font-medium hover:bg-[#E8E9EB] transition-colors"
                    disabled={qty >= 8}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {TICKET_DETAIL.sections.map((sec, i) => (
                  <TicketRow
                    key={i}
                    section={sec}
                    selected={selectedSection === i}
                    onClick={() => setSelectedSection(i)}
                  />
                ))}
              </div>
            </div>

            {/* Spacer for action band */}
            <div className="h-32" />
          </div>

          {/* Black action band — right rail on detail */}
          <aside className="w-[280px] bg-[#111111] text-[#FAFAF7] flex flex-col p-6 hidden md:flex">
            <div className="flex-1">
              <h2 className="text-[11px] font-medium tracking-widest uppercase text-[#FAFAF7]/50 mb-5">
                Order Summary
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] text-[#FAFAF7]/50 mb-1">Section</p>
                  <p className="text-[14px] font-semibold">{section?.label}</p>
                  <p className="text-[12px] text-[#FAFAF7]/60 font-mono-data mt-0.5">
                    Row {section?.row} · Seats {section?.seats}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#FAFAF7]/50 mb-1">Quantity</p>
                  <p className="font-mono-data text-[14px] font-semibold">
                    {qty} tickets
                  </p>
                </div>
                <div className="border-t border-[#FAFAF7]/10 pt-4 space-y-2">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-[#FAFAF7]/60">Tickets ({qty}×)</span>
                    <PriceTag
                      value={section?.price * qty}
                      className="text-[#FAFAF7]/80"
                    />
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-[#FAFAF7]/60">Service fees</span>
                    <PriceTag value={fees} className="text-[#FAFAF7]/80" />
                  </div>
                  <div className="flex justify-between text-[14px] font-semibold pt-1 border-t border-[#FAFAF7]/10">
                    <span>Total</span>
                    <PriceTag value={total + fees} className="text-[#FAFAF7]" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <button className="w-full bg-[#FAFAF7] text-[#111111] py-3 rounded-lg text-[13px] font-semibold hover:bg-white transition-colors">
                Continue to Checkout
              </button>
              <p className="text-[10px] text-[#FAFAF7]/40 text-center leading-relaxed">
                Secure checkout · Guaranteed authentic
              </p>
            </div>
          </aside>
        </div>

        {/* Mobile bottom action band */}
        <div className="md:hidden bg-[#111111] text-[#FAFAF7] px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[11px] text-[#FAFAF7]/50">
                {section?.label} · {qty} tickets
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <PriceTag
                  value={total + fees}
                  className="text-[16px] font-bold"
                />
                <span className="text-[11px] text-[#FAFAF7]/50">
                  incl. fees
                </span>
              </div>
            </div>
            <button className="bg-[#FAFAF7] text-[#111111] px-5 py-2.5 rounded-lg text-[13px] font-semibold">
              Checkout
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E9EB] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-6">
          <a
            href="#"
            className="text-[16px] font-bold tracking-tight text-[#111111] shrink-0"
          >
            resale<span className="font-normal text-[#292B2F]">.co</span>
          </a>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#292B2F]"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
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
                className="w-full bg-[#FAFAF7] border border-[#E8E9EB] rounded-lg pl-9 pr-4 py-2 text-[13px] placeholder:text-[#292B2F] focus:outline-none focus:border-[#292B2F] focus:ring-1 focus:ring-[#292B2F] transition-colors"
              />
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-5 ml-auto">
            <a
              href="#"
              className="text-[13px] font-medium text-[#292B2F] hover:text-[#111111] transition-colors"
            >
              Sell Tickets
            </a>
            <a
              href="#"
              className="text-[13px] font-medium text-[#292B2F] hover:text-[#111111] transition-colors"
            >
              My Account
            </a>
            <button className="bg-[#111111] text-[#FAFAF7] text-[12px] font-semibold px-4 py-2 rounded-lg hover:bg-[#292B2F] transition-colors">
              Sign In
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero strip */}
        <div className="mb-8 border border-[#E8E9EB] rounded-lg overflow-hidden bg-white">
          <div className="grid md:grid-cols-2">
            <div className="p-8 flex flex-col justify-center">
              <p className="text-[11px] font-medium tracking-widest uppercase text-[#292B2F] mb-3">
                New York City · September 2026
              </p>
              <h1 className="text-3xl font-bold text-[#111111] leading-tight mb-3">
                The best seats.
                <br />
                No surprises.
              </h1>
              <p className="text-[14px] text-[#292B2F] leading-relaxed mb-6">
                Guaranteed authentic tickets to every concert, game, and show —
                with transparent pricing and no hidden fees.
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[12px] text-[#292B2F]">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M7 1L8.5 5H13L9.5 7.5L11 12L7 9.5L3 12L4.5 7.5L1 5H5.5L7 1Z"
                      fill="#111111"
                    />
                  </svg>
                  <span>Verified sellers</span>
                </div>
                <span className="w-px h-3 bg-[#E8E9EB]" />
                <div className="flex items-center gap-1.5 text-[12px] text-[#292B2F]">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect
                      x="1"
                      y="3"
                      width="12"
                      height="9"
                      rx="1.5"
                      stroke="#111111"
                      strokeWidth="1.3"
                    />
                    <path d="M1 6H13" stroke="#111111" strokeWidth="1.3" />
                  </svg>
                  <span>Instant e-delivery</span>
                </div>
                <span className="w-px h-3 bg-[#E8E9EB]" />
                <div className="flex items-center gap-1.5 text-[12px] text-[#292B2F]">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle
                      cx="7"
                      cy="7"
                      r="5.5"
                      stroke="#111111"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M4.5 7L6.5 9L9.5 5"
                      stroke="#111111"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Money-back guarantee</span>
                </div>
              </div>
            </div>
            <div
              className="relative bg-[#E8E9EB] hidden md:block"
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

        {/* Category filter */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-2 text-[12px] font-medium rounded-lg border transition-colors duration-100 focus:outline-none focus:ring-2 focus:ring-[#111111] focus:ring-offset-1 ${
                activeCategory === cat
                  ? "bg-[#111111] border-[#111111] text-[#FAFAF7]"
                  : "bg-white border-[#E8E9EB] text-[#292B2F] hover:border-[#292B2F]"
              }`}
            >
              {cat}
            </button>
          ))}
          <div className="ml-auto shrink-0 flex items-center gap-2">
            <span className="text-[12px] text-[#292B2F] font-mono-data">
              {filtered.length} events
            </span>
          </div>
        </div>

        {/* Event grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => openEvent(event)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-[#E8E9EB] rounded-lg bg-white">
            <p className="text-[14px] font-medium text-[#111111] mb-1">
              No events found
            </p>
            <p className="text-[13px] text-[#292B2F]">
              Try a different category or search term.
            </p>
          </div>
        )}

        {/* How it works */}
        <div className="mt-12 mb-2">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[#111111] mb-4">
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
                className="bg-white border border-[#E8E9EB] rounded-lg p-5"
              >
                <p className="font-mono-data text-[11px] font-medium text-[#292B2F] mb-3">
                  {step}
                </p>
                <h3 className="text-[14px] font-semibold text-[#111111] mb-2">
                  {title}
                </h3>
                <p className="text-[13px] text-[#292B2F] leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E9EB] mt-12 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-[14px] font-bold text-[#111111]">
              resale<span className="font-normal text-[#292B2F]">.co</span>
            </p>
            <p className="text-[12px] text-[#292B2F] mt-1">
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
                className="text-[12px] text-[#292B2F] hover:text-[#111111] transition-colors"
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
