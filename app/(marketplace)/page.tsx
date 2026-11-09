"use client" /* Search bar */ /* Hero strip */ /* Category pills */ /* Event grid */ /* How it works */ /* Footer */
import { useEffect, useMemo, useState } from "react"
import Header from "../../components/ui/Header"
import MarketplaceFooter from "./_components/MarketplaceFooter"
import MarketplaceHero from "./_components/MarketplaceHero"
import MarketplaceHowItWorks from "./_components/MarketplaceHowItWorks"
import MarketplaceListingResults from "./_components/MarketplaceListingResults"
import {
  MarketplaceCategoryFilter,
  MarketplaceSearchInput,
} from "./_components/MarketplaceFilters"
import type { Event } from "../../lib/data"
import type { ListingSummary } from "../../lib/listings/models"
import { getApiErrorMessage } from "../../lib/rtk-api"
import { useLazyGetListingsQuery } from "../../lib/listings/rtk"

function listingToEvent(listing: ListingSummary): Event {
  return {
    id: listing.id,
    title: listing.eventTitle,
    subtitle: `${listing.quantity} ticket${
      listing.quantity === 1 ? "" : "s"
    } available`,
    venue: listing.venue || "Online marketplace",
    city: "",
    date: listing.date || "Date to be announced",
    time: "",
    category: "Listings",
    image:
      "https://images.unsplash.com/photo-1501386761578-eaa54b45c5e0?w=600&h=400&fit=crop&auto=format",
    minPrice: listing.askingPrice,
    maxPrice: listing.askingPrice,
    ticketsLeft: listing.quantity,
    hot: listing.quantity <= 3,
  }
}

export default function BrowsePage() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [listings, setListings] = useState<ListingSummary[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)
  const [fetchListings, { isLoading }] = useLazyGetListingsQuery()

  useEffect(() => {
    let active = true

    fetchListings({ limit: 24 })
      .unwrap()
      .then((result) => {
        if (!active) return
        setListings(result.items)
        setNextCursor(result.nextCursor)
        setHasMore(result.hasMore)
      })
      .catch((error: unknown) => {
        if (!active) return
        setErrorMessage(getApiErrorMessage(error, "Unable to load listings."))
      })

    return () => {
      active = false
    }
  }, [fetchListings])

  const loadMore = async () => {
    if (!nextCursor || isLoadingMore) return
    setIsLoadingMore(true)
    setLoadMoreError(null)
    try {
      const result = await fetchListings({
        limit: 24,
        cursor: nextCursor,
      }).unwrap()
      setListings((current) => [...current, ...result.items])
      setNextCursor(result.nextCursor)
      setHasMore(result.hasMore)
    } catch (error) {
      setLoadMoreError(getApiErrorMessage(error, "Please try again."))
    } finally {
      setIsLoadingMore(false)
    }
  }

  const events = useMemo(() => listings.map(listingToEvent), [listings])
  const filtered = events.filter((e) => {
    const matchCat = activeCategory === "All" || e.category === activeCategory
    const matchSearch =
      !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAF7" }}>
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <MarketplaceSearchInput
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <MarketplaceHero listings={listings} />
        <MarketplaceCategoryFilter
          activeCategory={activeCategory}
          resultCount={filtered.length}
          onCategoryChange={setActiveCategory}
        />

        <MarketplaceListingResults
          events={filtered}
          isLoading={isLoading}
          error={errorMessage}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          loadMoreError={loadMoreError}
          onLoadMore={() => void loadMore()}
        />

        <MarketplaceHowItWorks />
      </main>

      <MarketplaceFooter />
    </div>
  )
}
