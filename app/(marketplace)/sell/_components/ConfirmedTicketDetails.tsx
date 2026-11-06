"use client"

import { LISTING_TICKET_TYPES } from "../../../../lib/listings/types"
import type {
  ListingTicketDetails,
  ListingTicketType,
} from "../../../../lib/listings/types"
import {
  isTicketPackage,
  LISTING_TICKET_TYPE_LABELS,
} from "../../../../lib/listings/ticket-types"

type DetailField = Exclude<keyof ListingTicketDetails, "includedAdmissions">

export default function ConfirmedTicketDetails({
  ticketCategory,
  onTicketCategoryChange,
  ticketType,
  onTicketTypeChange,
  ticketDetails,
  onTicketDetailsChange,
  quantity,
  onQuantityChange,
  isFormLocked,
  isSubmitting,
  hasPendingSubmission,
}: {
  ticketCategory: string
  onTicketCategoryChange: (value: string) => void
  ticketType: ListingTicketType
  onTicketTypeChange: (value: ListingTicketType) => void
  ticketDetails: ListingTicketDetails
  onTicketDetailsChange: (
    field: keyof ListingTicketDetails,
    value: string | number,
  ) => void
  quantity: number
  onQuantityChange: (value: number) => void
  isFormLocked: boolean
  isSubmitting: boolean
  hasPendingSubmission: boolean
}) {
  const isPackage = isTicketPackage(ticketType)

  const renderDetailInput = (
    label: string,
    field: DetailField,
    options: {
      required?: boolean
      wide?: boolean
      multiline?: boolean
    } = {},
  ) => {
    const fieldId = `ticket-${field}`
    const className =
      "w-full rounded-lg border px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
    const style = {
      backgroundColor: "#FAFAF7",
      borderColor: "#E8E9EB",
      color: "#111111",
    }

    return (
      <div className={options.wide ? "md:col-span-2" : undefined}>
        <label
          className="mb-1.5 block text-[12px] font-medium text-[#111111]"
          htmlFor={fieldId}
        >
          {label}
        </label>
        {options.multiline ? (
          <textarea
            id={fieldId}
            required={options.required}
            disabled={isFormLocked}
            value={ticketDetails[field] ?? ""}
            onChange={(event) =>
              onTicketDetailsChange(field, event.target.value)
            }
            rows={3}
            className={className}
            style={style}
          />
        ) : (
          <input
            id={fieldId}
            required={options.required}
            disabled={isFormLocked}
            value={ticketDetails[field] ?? ""}
            onChange={(event) =>
              onTicketDetailsChange(field, event.target.value)
            }
            className={className}
            style={style}
          />
        )}
      </div>
    )
  }

  return (
    <>
      <h2 className="mb-4 text-[12px] font-semibold tracking-wide text-[#111111] uppercase">
        Confirm ticket details
      </h2>
      <div className="mb-4 grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="ticket-category"
            className="mb-1.5 block text-[12px] font-medium text-[#111111]"
          >
            Ticket tier or package name
          </label>
          <input
            id="ticket-category"
            required
            maxLength={100}
            disabled={isFormLocked}
            value={ticketCategory}
            onChange={(event) => onTicketCategoryChange(event.target.value)}
            placeholder="e.g. Early Bird, Free RSVP, Lovers Table"
            className="w-full rounded-lg border px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
            style={{
              backgroundColor: "#FAFAF7",
              borderColor: "#E8E9EB",
              color: "#111111",
            }}
          />
        </div>
        <div>
          <label
            htmlFor="ticket-type"
            className="mb-1.5 block text-[12px] font-medium text-[#111111]"
          >
            Ticket structure
          </label>
          <select
            id="ticket-type"
            disabled={isFormLocked}
            value={ticketType}
            onChange={(event) => {
              const nextTicketType = event.target.value as ListingTicketType
              onTicketTypeChange(nextTicketType)
            }}
            className="w-full rounded-lg border px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
            style={{
              backgroundColor: "#FAFAF7",
              borderColor: "#E8E9EB",
              color: "#111111",
            }}
          >
            {LISTING_TICKET_TYPES.map((type) => (
              <option key={type} value={type}>
                {LISTING_TICKET_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {ticketType === "reserved_seating" ? (
          <>
            {renderDetailInput("Section", "section")}
            {renderDetailInput("Row", "row")}
            {renderDetailInput("Seat numbers", "seatNumbers")}
          </>
        ) : null}
        {ticketType === "general_admission" || ticketType === "standing"
          ? renderDetailInput("Area or access tier (optional)", "accessArea", {
              wide: true,
            })
          : null}
        {ticketType === "pass_session" ? (
          <>
            {renderDetailInput("Pass or session", "sessionName", {
              required: true,
            })}
            {renderDetailInput("Area or stage (optional)", "accessArea")}
          </>
        ) : null}
        {isPackage ? (
          <>
            {renderDetailInput("Package name (optional)", "packageName")}
            <div>
              <label
                className="mb-1.5 block text-[12px] font-medium text-[#111111]"
                htmlFor="ticket-included-admissions"
              >
                Admissions included per package
              </label>
              <input
                id="ticket-included-admissions"
                type="number"
                min={1}
                max={100}
                step={1}
                required
                disabled={isFormLocked}
                value={ticketDetails.includedAdmissions ?? ""}
                onChange={(event) =>
                  onTicketDetailsChange(
                    "includedAdmissions",
                    Number(event.target.value),
                  )
                }
                className="w-full rounded-lg border px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
                style={{
                  backgroundColor: "#FAFAF7",
                  borderColor: "#E8E9EB",
                  color: "#111111",
                }}
              />
            </div>
          </>
        ) : null}
        {ticketType === "accessible" ? (
          <>
            {renderDetailInput("Accessibility details", "accessibilityNotes", {
              required: true,
              wide: true,
              multiline: true,
            })}
            {renderDetailInput("Section (optional)", "section")}
            {renderDetailInput("Seat numbers (optional)", "seatNumbers")}
          </>
        ) : null}
        {ticketType === "other"
          ? renderDetailInput("Ticket details", "otherDetails", {
              required: true,
              wide: true,
              multiline: true,
            })
          : null}
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-[#111111]">
            Quantity
          </label>
          <input
            type="number"
            min={1}
            max={10}
            step={1}
            required
            disabled={isSubmitting || hasPendingSubmission}
            value={quantity}
            onChange={(event) =>
              onQuantityChange(Number(event.target.value) || 1)
            }
            className="w-full rounded-lg border px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
            style={{
              backgroundColor: "#FAFAF7",
              borderColor: "#E8E9EB",
              color: "#111111",
            }}
          />
        </div>
      </div>
    </>
  )
}
