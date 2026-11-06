import ApiErrorNotice from "../../../../components/ui/ApiErrorNotice"
import type { CatalogPartner } from "../../../../lib/events/models"

export default function PartnerSelector({
  partners,
  selectedPartner,
  value,
  disabled,
  isLoading,
  error,
  onRetry,
  onChange,
}: {
  partners: CatalogPartner[]
  selectedPartner: CatalogPartner | undefined
  value: string
  disabled: boolean
  isLoading: boolean
  error: unknown
  onRetry: () => void
  onChange: (value: string) => void
}) {
  return (
    <>
      {error ? (
        <>
          <ApiErrorNotice
            error={error}
            fallback="Unable to load event partners."
          />
          <button
            type="button"
            onClick={onRetry}
            className="mb-4 text-[12px] underline text-[#111111]"
          >
            Retry loading partners
          </button>
        </>
      ) : null}
      {isLoading ? (
        <p className="mb-4 text-[12px] text-[#292B2F]">
          Loading event partners…
        </p>
      ) : null}
      <label
        htmlFor="partner-select"
        className="mb-1.5 block text-[12px] font-medium text-[#111111]"
      >
        Select ticket partner
      </label>
      <select
        id="partner-select"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
        style={{
          backgroundColor: "#FAFAF7",
          borderColor: "#E8E9EB",
          color: "#111111",
        }}
      >
        <option value="">--- Select partner ---</option>
        {selectedPartner &&
        !partners.some((partner) => partner.id === selectedPartner.id) ? (
          <option value={selectedPartner.id}>{selectedPartner.name}</option>
        ) : null}
        {partners.map((partner) => (
          <option key={partner.id} value={String(partner.id)}>
            {partner.name}
          </option>
        ))}
        <option value="__manual__">Other / enter partner</option>
      </select>
    </>
  )
}
