export default function ManualEventFields({
  disabled,
  name,
  onNameChange,
  url,
  onUrlChange,
  date,
  onDateChange,
  time,
  onTimeChange,
  venue,
  onVenueChange,
}: {
  disabled: boolean
  name: string
  onNameChange: (value: string) => void
  url: string
  onUrlChange: (value: string) => void
  date: string
  onDateChange: (value: string) => void
  time: string
  onTimeChange: (value: string) => void
  venue: string
  onVenueChange: (value: string) => void
}) {
  return (
    <div className="mt-3 grid gap-3 md:grid-cols-2">
      <div>
        <label
          className="block text-[12px] font-medium mb-1.5"
          htmlFor="manual-event-name"
          style={{ color: "#111111" }}
        >
          Event name
        </label>
        <input
          id="manual-event-name"
          required
          disabled={disabled}
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
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
          htmlFor="manual-event-url"
          style={{ color: "#111111" }}
        >
          Event ticket page URL
        </label>
        <input
          id="manual-event-url"
          type="url"
          required
          disabled={disabled}
          value={url}
          onChange={(event) => onUrlChange(event.target.value)}
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
          htmlFor="manual-event-date"
          style={{ color: "#111111" }}
        >
          Event date (optional)
        </label>
        <input
          id="manual-event-date"
          type="date"
          disabled={disabled}
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
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
          htmlFor="manual-event-time"
          style={{ color: "#111111" }}
        >
          Event time (optional)
        </label>
        <input
          id="manual-event-time"
          type="time"
          disabled={disabled}
          value={time}
          onChange={(event) => onTimeChange(event.target.value)}
          className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
          style={{
            backgroundColor: "#FAFAF7",
            borderColor: "#E8E9EB",
            color: "#111111",
          }}
        />
      </div>
      <div className="md:col-span-2">
        <label
          className="block text-[12px] font-medium mb-1.5"
          htmlFor="manual-event-venue"
          style={{ color: "#111111" }}
        >
          Venue (optional)
        </label>
        <input
          id="manual-event-venue"
          disabled={disabled}
          value={venue}
          onChange={(event) => onVenueChange(event.target.value)}
          className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
          style={{
            backgroundColor: "#FAFAF7",
            borderColor: "#E8E9EB",
            color: "#111111",
          }}
        />
      </div>
    </div>
  )
}
