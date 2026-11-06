"use client"

import type { FormEvent } from "react"
import Link from "next/link"
import type { CheckoutIdType } from "./CheckoutIdentityDetails"
import CheckoutContactFields from "./CheckoutContactFields"
import CheckoutIdentityDetails from "./CheckoutIdentityDetails"

export default function CheckoutContactStep({
  firstName,
  lastName,
  email,
  phone,
  idType,
  dateOfBirth,
  idNumber,
  identityConsent,
  authChecked,
  isAuthenticated,
  identityRequired,
  errors,
  submitError,
  accountKycRequired,
  loading,
  onBack,
  onSubmit,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPhoneChange,
  onIdTypeChange,
  onDateOfBirthChange,
  onIdNumberChange,
  onIdentityConsentChange,
}: {
  firstName: string
  lastName: string
  email: string
  phone: string
  idType: CheckoutIdType | ""
  dateOfBirth: string
  idNumber: string
  identityConsent: boolean
  authChecked: boolean
  isAuthenticated: boolean
  identityRequired: boolean
  errors: Record<string, string>
  submitError: string
  accountKycRequired: boolean
  loading: boolean
  onBack: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onFirstNameChange: (value: string) => void
  onLastNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPhoneChange: (value: string) => void
  onIdTypeChange: (value: CheckoutIdType) => void
  onDateOfBirthChange: (value: string) => void
  onIdNumberChange: (value: string) => void
  onIdentityConsentChange: (value: boolean) => void
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-6 flex items-center gap-1.5 text-[13px] font-medium text-[#292B2F] transition-opacity hover:opacity-70"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M9 11L5 7L9 3"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to review
      </button>
      <h1 className="mb-6 text-xl font-bold text-[#111111]">Contact Details</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <CheckoutContactFields
          firstName={firstName}
          lastName={lastName}
          email={email}
          phone={phone}
          errors={errors}
          onFirstNameChange={onFirstNameChange}
          onLastNameChange={onLastNameChange}
          onEmailChange={onEmailChange}
          onPhoneChange={onPhoneChange}
        />
        <CheckoutIdentityDetails
          authChecked={authChecked}
          isAuthenticated={isAuthenticated}
          identityRequired={identityRequired}
          idType={idType}
          dateOfBirth={dateOfBirth}
          idNumber={idNumber}
          identityConsent={identityConsent}
          errors={errors}
          onIdTypeChange={onIdTypeChange}
          onDateOfBirthChange={onDateOfBirthChange}
          onIdNumberChange={onIdNumberChange}
          onIdentityConsentChange={onIdentityConsentChange}
        />
        {submitError ? (
          <div
            className="rounded-lg border px-3 py-2 text-[12px]"
            style={{
              backgroundColor: "#FAFAF7",
              borderColor: "#E8E9EB",
              color: "#292B2F",
            }}
          >
            {submitError}
            {accountKycRequired ? (
              <Link
                href="/kyc"
                className="ml-1 font-semibold underline underline-offset-2"
              >
                Complete account verification
              </Link>
            ) : null}
          </div>
        ) : null}
        {!authChecked ? (
          <button
            type="submit"
            disabled={!authChecked}
            className="w-full rounded-lg py-3 text-[14px] font-semibold disabled:opacity-60"
            style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
          >
            Checking account…
          </button>
        ) : (
          <div className="space-y-2 text-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-3 text-[14px] font-semibold disabled:opacity-60"
              style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
            >
              {loading ? "Starting checkout…" : "Continue to secure checkout"}
            </button>
            <p className="text-[11px] text-[#8A8D91]">
              You’ll continue with the payment provider selected for this
              checkout.
            </p>
          </div>
        )}
      </form>
    </div>
  )
}
