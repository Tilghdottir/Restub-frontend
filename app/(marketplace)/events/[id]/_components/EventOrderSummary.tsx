import type { Event, TicketSection } from "../../../../../lib/data"

export default function EventOrderSummary({
  event,
  section,
  quantity,
  subtotal,
  total,
  onCheckout,
}: {
  event: Event
  section: TicketSection
  quantity: number
  subtotal: number
  total: number
  onCheckout: () => void
}) {
  return (
    <>
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-20 px-5 py-4"
        style={{ backgroundColor: "#111111" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-[11px]"
              style={{ color: "rgba(250,250,247,0.5)" }}
            >
              {section.label} · {quantity} ticket{quantity > 1 ? "s" : ""}
            </p>
            <span
              className="font-mono-data text-[16px] font-bold"
              style={{ color: "#FAFAF7" }}
            >
              ${total.toLocaleString()}
            </span>
            <span
              className="ml-1 text-[11px]"
              style={{ color: "rgba(250,250,247,0.5)" }}
            >
              incl. fees
            </span>
          </div>
          <button
            type="button"
            onClick={onCheckout}
            className="rounded-lg px-5 py-2.5 text-[13px] font-semibold"
            style={{ backgroundColor: "#FAFAF7", color: "#111111" }}
          >
            Checkout
          </button>
        </div>
      </div>
      <div className="md:hidden h-24" />

      <aside
        className="sticky top-20 hidden w-72 shrink-0 flex-col overflow-hidden rounded-lg md:flex"
        style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
      >
        <div className="flex-1 p-6">
          <h2
            className="mb-5 text-[11px] font-medium uppercase tracking-widest"
            style={{ color: "rgba(250,250,247,0.5)" }}
          >
            Order Summary
          </h2>
          <div className="space-y-4">
            <SummaryItem label="Event">
              <p className="text-[13px] font-semibold leading-tight">
                {event.title}
              </p>
              <p
                className="mt-0.5 text-[11px]"
                style={{ color: "rgba(250,250,247,0.6)" }}
              >
                {event.date} · {event.venue}
              </p>
            </SummaryItem>
            <SummaryItem label="Section">
              <p className="text-[13px] font-semibold">{section.label}</p>
              <p
                className="mt-0.5 font-mono-data text-[11px]"
                style={{ color: "rgba(250,250,247,0.6)" }}
              >
                Row {section.row} · Seats {section.seats}
              </p>
            </SummaryItem>
            <SummaryItem label="Quantity">
              <p className="font-mono-data text-[13px] font-semibold">
                {quantity} ticket{quantity > 1 ? "s" : ""}
              </p>
            </SummaryItem>
          </div>
          <div
            className="mt-5 space-y-2 border-t pt-4"
            style={{ borderColor: "rgba(250,250,247,0.1)" }}
          >
            <div className="flex justify-between text-[12px]">
              <span style={{ color: "rgba(250,250,247,0.6)" }}>
                Tickets ({quantity}×)
              </span>
              <span
                className="font-mono-data"
                style={{ color: "rgba(250,250,247,0.8)" }}
              >
                ${subtotal.toLocaleString()}
              </span>
            </div>
            <div
              className="flex justify-between border-t pt-2 text-[14px] font-semibold"
              style={{ borderColor: "rgba(250,250,247,0.1)" }}
            >
              <span>Total</span>
              <span className="font-mono-data">${total.toLocaleString()}</span>
            </div>
            <p
              className="text-[10px]"
              style={{ color: "rgba(250,250,247,0.55)" }}
            >
              Payment providers may add their own processing fee at checkout.
            </p>
          </div>
        </div>
        <div className="p-6 pt-0">
          <button
            type="button"
            onClick={onCheckout}
            className="w-full rounded-lg py-3 text-[13px] font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#FAFAF7", color: "#111111" }}
          >
            Continue to Checkout
          </button>
          <p
            className="mt-3 text-center text-[10px]"
            style={{ color: "rgba(250,250,247,0.4)" }}
          >
            Secure checkout · Guaranteed authentic
          </p>
        </div>
      </aside>
    </>
  )
}

function SummaryItem({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p
        className="mb-1 text-[11px]"
        style={{ color: "rgba(250,250,247,0.5)" }}
      >
        {label}
      </p>
      {children}
    </div>
  )
}
