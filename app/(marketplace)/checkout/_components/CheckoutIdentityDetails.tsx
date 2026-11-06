export type CheckoutIdType = "bvn" | "nin"
interface CheckoutIdOption {
  value: CheckoutIdType
  label: string
}

const ID_TYPES: CheckoutIdOption[] = [
  { value: "nin", label: "National Identity Number" },
  { value: "bvn", label: "Bank Verification Number (BVN)" },
]

export default function CheckoutIdentityDetails({
  authChecked,
  isAuthenticated,
  identityRequired,
  idType,
  dateOfBirth,
  idNumber,
  identityConsent,
  errors,
  onIdTypeChange,
  onDateOfBirthChange,
  onIdNumberChange,
  onIdentityConsentChange,
}: {
  authChecked: boolean
  isAuthenticated: boolean
  identityRequired: boolean
  idType: CheckoutIdType | ""
  dateOfBirth: string
  idNumber: string
  identityConsent: boolean
  errors: Record<string, string>
  onIdTypeChange: (value: CheckoutIdType) => void
  onDateOfBirthChange: (value: string) => void
  onIdNumberChange: (value: string) => void
  onIdentityConsentChange: (value: boolean) => void
}) {
  if (!authChecked) {
    return <p className="text-[13px] text-[#292B2F]">Checking account…</p>
  }

  if (isAuthenticated) return null

  return (
    <details
      open={identityRequired || undefined}
      className="rounded-lg border bg-white p-5"
      style={{ borderColor: "#E8E9EB" }}
    >
      <summary className="cursor-pointer text-[12px] font-semibold uppercase tracking-wide text-[#111111]">
        Identity details {identityRequired ? "(required)" : "(if requested)"}
      </summary>
      <p className="mt-3 mb-4 text-[13px] text-[#292B2F]">
        Some checkout providers require guest identity verification. We will
        request these details only if the checkout service requires them.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <label
            htmlFor="id_type"
            className="mb-1.5 block text-[12px] font-medium text-[#111111]"
          >
            ID Type
          </label>
          <div className="relative">
            <select
              id="id_type"
              value={idType}
              onChange={(event) => {
                if (
                  event.target.value === "bvn" ||
                  event.target.value === "nin"
                ) {
                  onIdTypeChange(event.target.value)
                }
              }}
              className="w-full appearance-none rounded-lg border px-4 py-2.5 pr-10 text-[14px]"
              style={{
                backgroundColor: "#FAFAF7",
                borderColor: errors.id_type ? "#292B2F" : "#E8E9EB",
                color: idType ? "#111111" : "#8A8D91",
              }}
            >
              <option value="" disabled>
                Select ID type
              </option>
              {ID_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#111111"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          {errors.id_type && (
            <p className="mt-1 text-[11px] text-[#292B2F]">{errors.id_type}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="date_of_birth"
            className="mb-1.5 block text-[12px] font-medium text-[#111111]"
          >
            Date of birth
          </label>
          <input
            id="date_of_birth"
            type="date"
            autoComplete="bday"
            value={dateOfBirth}
            onChange={(event) => onDateOfBirthChange(event.target.value)}
            className="w-full rounded-lg border px-4 py-2.5 text-[14px]"
            style={{
              backgroundColor: "#FAFAF7",
              borderColor: errors.dateOfBirth ? "#292B2F" : "#E8E9EB",
              color: "#111111",
            }}
          />
          <p className="mt-1 text-[11px] text-[#292B2F]">
            Enter the date of birth registered to your BVN or NIN.
          </p>
          {errors.dateOfBirth && (
            <p className="mt-1 text-[11px] text-[#292B2F]">
              {errors.dateOfBirth}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="id_number"
            className="mb-1.5 block text-[12px] font-medium text-[#111111]"
          >
            ID Number
          </label>
          <input
            id="id_number"
            type="text"
            autoComplete="off"
            inputMode="numeric"
            maxLength={11}
            value={idNumber}
            onChange={(event) => onIdNumberChange(event.target.value)}
            className="w-full rounded-lg border px-4 py-2.5 text-[14px]"
            style={{
              backgroundColor: "#FAFAF7",
              borderColor: errors.id_number ? "#292B2F" : "#E8E9EB",
              color: "#111111",
            }}
          />
          {errors.id_number && (
            <p className="mt-1 text-[11px] text-[#292B2F]">
              {errors.id_number}
            </p>
          )}
        </div>

        <label
          className="md:col-span-2 flex items-start gap-2 text-[12px]"
          style={{ color: "#292B2F" }}
        >
          <input
            type="checkbox"
            checked={identityConsent}
            onChange={(event) => onIdentityConsentChange(event.target.checked)}
            className="mt-0.5"
          />
          <span>
            I consent to identity verification using these details as part of
            this guest checkout.
          </span>
        </label>
        {errors.identityConsent && (
          <p className="md:col-span-2 text-[11px] text-[#292B2F]">
            {errors.identityConsent}
          </p>
        )}
      </div>
    </details>
  )
}
