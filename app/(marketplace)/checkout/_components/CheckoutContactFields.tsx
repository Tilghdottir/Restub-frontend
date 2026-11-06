export default function CheckoutContactFields({
  firstName,
  lastName,
  email,
  phone,
  errors,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPhoneChange,
}: {
  firstName: string
  lastName: string
  email: string
  phone: string
  errors: Record<string, string>
  onFirstNameChange: (value: string) => void
  onLastNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPhoneChange: (value: string) => void
}) {
  return (
    <section
      className="rounded-lg border bg-white p-5"
      style={{ borderColor: "#E8E9EB" }}
    >
      <h2 className="mb-4 text-[12px] font-semibold uppercase tracking-wide text-[#111111]">
        Contact details
      </h2>
      <div className="grid gap-3 md:grid-cols-2">
        <ContactField
          label="First name"
          value={firstName}
          error={errors.firstName}
          onChange={onFirstNameChange}
        />
        <ContactField
          label="Last name"
          value={lastName}
          error={errors.lastName}
          onChange={onLastNameChange}
        />
        <ContactField
          label="Email address"
          type="email"
          value={email}
          error={errors.customerEmail}
          onChange={onEmailChange}
          wide
        />
        <ContactField
          label="Phone number"
          type="tel"
          value={phone}
          error={errors.phone}
          onChange={onPhoneChange}
          wide
        />
      </div>
    </section>
  )
}

function ContactField({
  label,
  type = "text",
  value,
  error,
  onChange,
  wide = false,
}: {
  label: string
  type?: string
  value: string
  error?: string
  onChange: (value: string) => void
  wide?: boolean
}) {
  return (
    <div className={wide ? "md:col-span-2" : undefined}>
      <label className="mb-1.5 block text-[12px] font-medium text-[#111111]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border px-4 py-2.5 text-[14px]"
        style={{
          backgroundColor: "#FAFAF7",
          borderColor: error ? "#292B2F" : "#E8E9EB",
          color: "#111111",
        }}
      />
      {error && <p className="mt-1 text-[11px] text-[#292B2F]">{error}</p>}
    </div>
  )
}
