import {
  LISTING_TICKET_TYPE_LABELS,
  isTicketPackage,
} from "../../lib/listings/ticket-types"
import type { ListingTicketType } from "../../lib/listings/types"

export default function ListingTicketDescriptor({
  category,
  ticketType,
  includedAdmissions,
  className = "text-[12px] text-[#292B2F]",
}: {
  category?: string
  ticketType?: ListingTicketType
  includedAdmissions?: number
  className?: string
}) {
  const resolvedType = ticketType ?? "general_admission"
  const isPackage = isTicketPackage(resolvedType)

  return (
    <p className={className}>
      {category ?? ""} · {LISTING_TICKET_TYPE_LABELS[resolvedType]}
      {isPackage && includedAdmissions
        ? ` · ${includedAdmissions} admissions per package`
        : ""}
    </p>
  )
}
