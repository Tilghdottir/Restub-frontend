import type { TicketSection } from "../../../../../lib/data"

export default function EventTicketPicker({
  sections,
  selectedSection,
  quantity,
  onSelectSection,
  onQuantityChange,
}: {
  sections: TicketSection[]
  selectedSection: number
  quantity: number
  onSelectSection: (index: number) => void
  onQuantityChange: (quantity: number) => void
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2
          className="text-[13px] font-semibold uppercase tracking-wide"
          style={{ color: "#111111" }}
        >
          Select Tickets
        </h2>
        <div
          className="flex items-center overflow-hidden rounded-lg border"
          style={{ borderColor: "#E8E9EB" }}
        >
          <button
            type="button"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="px-3 py-1.5 text-[13px] font-medium transition-opacity hover:opacity-70 disabled:opacity-30"
            style={{ color: "#111111" }}
          >
            −
          </button>
          <span
            className="min-w-[3ch] border-x px-3 text-center font-mono-data text-[13px] font-medium"
            style={{ borderColor: "#E8E9EB", color: "#111111" }}
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => onQuantityChange(Math.min(8, quantity + 1))}
            disabled={quantity >= 8}
            className="px-3 py-1.5 text-[13px] font-medium transition-opacity hover:opacity-70 disabled:opacity-30"
            style={{ color: "#111111" }}
          >
            +
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {sections.map((section, index) => (
          <button
            key={`${section.label}-${section.row}-${section.seats}`}
            type="button"
            onClick={() => onSelectSection(index)}
            aria-pressed={selectedSection === index}
            className="flex w-full items-center justify-between gap-4 rounded-lg border px-4 py-3.5 text-left transition-colors duration-100 focus:outline-none"
            style={
              selectedSection === index
                ? {
                    backgroundColor: "#111111",
                    borderColor: "#111111",
                    color: "#FAFAF7",
                  }
                : {
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E8E9EB",
                    color: "#111111",
                  }
            }
          >
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold">{section.label}</p>
              <p
                className="mt-0.5 font-mono-data text-[11px]"
                style={{ opacity: 0.6 }}
              >
                Row {section.row} · Seats {section.seats}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-mono-data text-[15px] font-semibold">
                ${section.price.toLocaleString()}
              </p>
              <p className="mt-0.5 text-[10px]" style={{ opacity: 0.6 }}>
                {section.qty} avail
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
