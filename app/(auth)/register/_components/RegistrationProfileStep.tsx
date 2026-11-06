import type { FormEvent } from "react"

export default function RegistrationProfileStep({
  firstName,
  lastName,
  phone,
  errors,
  loading,
  onFirstNameChange,
  onLastNameChange,
  onPhoneChange,
  onBack,
  onSubmit,
}: {
  firstName: string
  lastName: string
  phone: string
  errors: Record<string, string>
  loading: boolean
  onFirstNameChange: (value: string) => void
  onLastNameChange: (value: string) => void
  onPhoneChange: (value: string) => void
  onBack: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <>
      <h1 className="mb-1 text-2xl font-bold" style={{ color: "#111111" }}>
        Your details
      </h1>
      <p className="mb-8 text-[13px]" style={{ color: "#292B2F" }}>
        Tell us a little about yourself.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              className="mb-1.5 block text-[12px] font-medium"
              style={{ color: "#111111" }}
            >
              First name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(event) => onFirstNameChange(event.target.value)}
              placeholder="Jane"
              autoComplete="given-name"
              className="w-full rounded-lg border px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: errors.firstName ? "#292B2F" : "#E8E9EB",
                color: "#111111",
              }}
            />
            {errors.firstName && <FieldError>{errors.firstName}</FieldError>}
          </div>
          <div>
            <label
              className="mb-1.5 block text-[12px] font-medium"
              style={{ color: "#111111" }}
            >
              Last name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(event) => onLastNameChange(event.target.value)}
              placeholder="Smith"
              autoComplete="family-name"
              className="w-full rounded-lg border px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: errors.lastName ? "#292B2F" : "#E8E9EB",
                color: "#111111",
              }}
            />
            {errors.lastName && <FieldError>{errors.lastName}</FieldError>}
          </div>
        </div>

        <div>
          <label
            className="mb-1.5 block text-[12px] font-medium"
            style={{ color: "#111111" }}
          >
            Phone number <span style={{ color: "#292B2F" }}>(optional)</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(event) => onPhoneChange(event.target.value)}
            placeholder="+1 (555) 000-0000"
            autoComplete="tel"
            className="w-full rounded-lg border px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#E8E9EB",
              color: "#111111",
            }}
          />
        </div>

        <div
          className="rounded-lg border p-4"
          style={{ borderColor: "#E8E9EB", backgroundColor: "#FFFFFF" }}
        >
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-0.5 shrink-0 rounded"
              defaultChecked
            />
            <span
              className="text-[12px] leading-relaxed"
              style={{ color: "#292B2F" }}
            >
              Send me alerts for events I&apos;m interested in and exclusive
              presale offers.
            </span>
          </label>
        </div>

        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 rounded-lg border py-3 text-[14px] font-medium transition-colors"
            style={{
              borderColor: "#E8E9EB",
              backgroundColor: "#FFFFFF",
              color: "#292B2F",
            }}
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg py-3 text-[14px] font-semibold transition-opacity disabled:opacity-50"
            style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </div>
      </form>
    </>
  )
}

function FieldError({ children }: { children: string }) {
  return (
    <p className="mt-1 text-[11px]" style={{ color: "#292B2F" }}>
      {children}
    </p>
  )
}
