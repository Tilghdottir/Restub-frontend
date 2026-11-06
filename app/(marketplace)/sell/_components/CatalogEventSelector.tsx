import ApiErrorNotice from "../../../../components/ui/ApiErrorNotice"
import type { CatalogEvent } from "../../../../lib/events/models"

export default function CatalogEventSelector({
  events,
  selectedPartner,
  value,
  disabled,
  isFetching,
  error,
  onRetry,
  onChange,
}: {
  events: CatalogEvent[]
  selectedPartner: boolean
  value: string
  disabled: boolean
  isFetching: boolean
  error: unknown
  onRetry: () => void
  onChange: (value: string) => void
}) {
  return (
    <>
      {error ? (
        <>
          <ApiErrorNotice error={error} fallback="Unable to load events." />
          <button
            type="button"
            onClick={onRetry}
            className="mb-4 text-[12px] underline text-[#111111]"
          >
            Retry loading events
          </button>
        </>
      ) : null}
      {isFetching ? (
        <p className="mt-3 text-[12px] text-[#292B2F]">Loading events…</p>
      ) : null}
      {selectedPartner ? (
        <>
          <label
            htmlFor="catalog-event"
            className="mt-4 mb-1.5 block text-[12px] font-medium text-[#111111]"
          >
            Select catalog event
          </label>
          <select
            id="catalog-event"
            value={value}
            disabled={isFetching || disabled}
            onChange={(event) => onChange(event.target.value)}
            className="w-full rounded-lg border px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
            style={{
              backgroundColor: "#FAFAF7",
              borderColor: "#E8E9EB",
              color: "#111111",
            }}
          >
            <option value="">--- Select event ---</option>
            {events.map((event) => (
              <option key={event.id} value={String(event.id)}>
                {event.name}
              </option>
            ))}
            <option value="__manual__">Other / enter event</option>
          </select>
        </>
      ) : null}
    </>
  )
}
