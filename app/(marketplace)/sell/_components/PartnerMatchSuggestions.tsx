import type { CatalogPartner } from "../../../../lib/events/models"

export default function PartnerMatchSuggestions({
  searchTerm,
  searchedTerm,
  matches,
  isSearching,
  hasSearchError,
  confirmedNewPartner,
  onRetry,
  onSelect,
  onConfirmNew,
}: {
  searchTerm: string
  searchedTerm: string
  matches: CatalogPartner[]
  isSearching: boolean
  hasSearchError: boolean
  confirmedNewPartner: boolean
  onRetry: () => void
  onSelect: (partner: CatalogPartner) => void
  onConfirmNew: () => void
}) {
  if (isSearching) {
    return (
      <p className="text-[12px] text-[#62656A]" role="status">
        Checking existing partners…
      </p>
    )
  }

  if (hasSearchError) {
    return (
      <div className="space-y-2">
        <p className="text-[12px] text-[#A03B32]" role="alert">
          Could not check the partner catalog. Retry before continuing.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="text-[12px] font-medium underline text-[#111111]"
        >
          Retry partner search
        </button>
      </div>
    )
  }

  if (searchedTerm !== searchTerm || searchTerm.length < 2) return null

  if (matches.length === 0) {
    return (
      <p className="text-[12px] text-[#22633D]" role="status">
        No close matches found. You can continue with a new partner.
      </p>
    )
  }

  return (
    <div
      className="rounded-lg border p-3"
      style={{ borderColor: "#EAD9A8", backgroundColor: "#FFF8E7" }}
    >
      <p className="mb-2 text-[12px] font-medium text-[#6A5318]">
        These existing partners may match:
      </p>
      <div className="space-y-2">
        {matches.map((partner) => (
          <button
            key={partner.id}
            type="button"
            onClick={() => onSelect(partner)}
            className="block w-full rounded-md border bg-white px-3 py-2 text-left"
            style={{ borderColor: "#E8E9EB" }}
          >
            <span className="block text-[12px] font-semibold text-[#111111]">
              {partner.name}
            </span>
            {partner.websiteUrl ? (
              <span className="block text-[11px] text-[#62656A]">
                {partner.websiteUrl}
              </span>
            ) : null}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onConfirmNew}
        className="mt-3 text-[11px] font-medium underline text-[#6A5318]"
      >
        None of these match; use a different partner
      </button>
      {confirmedNewPartner ? (
        <p className="mt-2 text-[11px] text-[#6A5318]">
          We’ll still prevent creating a likely duplicate on the server.
        </p>
      ) : null}
    </div>
  )
}
