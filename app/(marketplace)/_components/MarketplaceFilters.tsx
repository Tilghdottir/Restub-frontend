export function MarketplaceSearchInput({
  searchQuery,
  onSearchChange,
}: {
  searchQuery: string
  onSearchChange: (value: string) => void
}) {
  return (
    <div className="relative mb-6 max-w-lg">
      <svg
        className="absolute top-1/2 left-3 -translate-y-1/2"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        style={{ color: "#292B2F" }}
        aria-hidden="true"
      >
        <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
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
        onChange={(event) => onSearchChange(event.target.value)}
        className="w-full rounded-lg border py-2.5 pr-4 pl-9 text-[13px] transition-colors focus:outline-none focus:ring-1"
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: "#E8E9EB",
          color: "#111111",
        }}
      />
    </div>
  )
}

export function MarketplaceCategoryFilter({
  activeCategory,
  resultCount,
  onCategoryChange,
}: {
  activeCategory: string
  resultCount: number
  onCategoryChange: (value: string) => void
}) {
  return (
    <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1">
      {["All", "Listings"].map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onCategoryChange(category)}
          className="shrink-0 rounded-lg border px-4 py-2 text-[12px] font-medium transition-colors duration-100 focus:outline-none"
          style={
            activeCategory === category
              ? {
                  backgroundColor: "#111111",
                  borderColor: "#111111",
                  color: "#FAFAF7",
                }
              : {
                  backgroundColor: "#FFFFFF",
                  borderColor: "#E8E9EB",
                  color: "#292B2F",
                }
          }
        >
          {category}
        </button>
      ))}
      <span className="ml-auto shrink-0 font-mono-data text-[12px] text-[#292B2F]">
        {resultCount} listings
      </span>
    </div>
  )
}
