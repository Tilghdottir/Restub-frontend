import type { Event } from "../../lib/data"

export default function EventMetadata({
  event,
  variant,
}: {
  event: Pick<Event, "date" | "time" | "venue">
  variant: "card" | "details"
}) {
  if (variant === "card") {
    return (
      <div>
        <p className="text-[11px]" style={{ color: "#292B2F" }}>
          {event.date} · {event.time}
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: "#292B2F" }}>
          {event.venue}
        </p>
      </div>
    )
  }

  return (
    <div
      className="grid grid-cols-3 gap-6 border-t pt-4"
      style={{ borderColor: "#E8E9EB" }}
    >
      {[
        { label: "Date", value: event.date },
        { label: "Time", value: event.time },
        { label: "Venue", value: event.venue },
      ].map(({ label, value }) => (
        <div key={label}>
          <p
            className="mb-1 text-[10px] font-medium uppercase tracking-wide"
            style={{ color: "#292B2F" }}
          >
            {label}
          </p>
          <p className="text-[13px] font-medium" style={{ color: "#111111" }}>
            {value}
          </p>
        </div>
      ))}
    </div>
  )
}
