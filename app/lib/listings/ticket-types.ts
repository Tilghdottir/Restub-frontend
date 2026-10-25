import type { ListingTicketType } from "./types"

export const LISTING_TICKET_TYPE_LABELS: Record<ListingTicketType, string> = {
  reserved_seating: "Reserved seating",
  general_admission: "General admission",
  standing: "Standing",
  pass_session: "Pass or session",
  vip_package: "VIP package",
  table_hospitality: "Table or hospitality",
  accessible: "Accessible seating",
  group_bundle: "Group bundle",
  other: "Other",
}

export function isTicketPackage(ticketType?: ListingTicketType): boolean {
  return (
    ticketType === "vip_package" ||
    ticketType === "table_hospitality" ||
    ticketType === "group_bundle"
  )
}
