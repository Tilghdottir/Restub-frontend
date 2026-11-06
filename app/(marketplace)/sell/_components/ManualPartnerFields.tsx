import type { CatalogPartner } from "../../../../lib/events/models"
import PartnerMatchSuggestions from "./PartnerMatchSuggestions"

export default function ManualPartnerFields({
  disabled,
  name,
  onNameChange,
  website,
  onWebsiteChange,
  searchTerm,
  searchedTerm,
  matches,
  isSearching,
  hasSearchError,
  confirmedNewPartner,
  onRetrySearch,
  onSelectMatch,
  onConfirmNew,
}: {
  disabled: boolean
  name: string
  onNameChange: (value: string) => void
  website: string
  onWebsiteChange: (value: string) => void
  searchTerm: string
  searchedTerm: string
  matches: CatalogPartner[]
  isSearching: boolean
  hasSearchError: boolean
  confirmedNewPartner: boolean
  onRetrySearch: () => void
  onSelectMatch: (partner: CatalogPartner) => void
  onConfirmNew: () => void
}) {
  return (
    <div className="mt-3 grid gap-3">
      <label className="text-[12px] font-medium" htmlFor="manual-partner-name">
        Partner name
      </label>
      <input
        id="manual-partner-name"
        required
        disabled={disabled}
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        placeholder="Enter partner name"
        className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
        style={{
          backgroundColor: "#FAFAF7",
          borderColor: "#E8E9EB",
          color: "#111111",
        }}
      />
      <label className="text-[12px] font-medium" htmlFor="manual-partner-url">
        Partner website (optional)
      </label>
      <input
        id="manual-partner-url"
        type="url"
        disabled={disabled}
        value={website}
        onChange={(event) => onWebsiteChange(event.target.value)}
        placeholder="https://example.com"
        className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
        style={{
          backgroundColor: "#FAFAF7",
          borderColor: "#E8E9EB",
          color: "#111111",
        }}
      />
      <p className="text-[11px]" style={{ color: "#62656A" }}>
        We’ll check existing partners to help you select the canonical record
        and avoid duplicate names.
      </p>
      <PartnerMatchSuggestions
        searchTerm={searchTerm}
        searchedTerm={searchedTerm}
        matches={matches}
        isSearching={isSearching}
        hasSearchError={hasSearchError}
        confirmedNewPartner={confirmedNewPartner}
        onRetry={onRetrySearch}
        onSelect={onSelectMatch}
        onConfirmNew={onConfirmNew}
      />
    </div>
  )
}
