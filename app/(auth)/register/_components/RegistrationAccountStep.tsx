import type { FormEvent } from "react"
import Link from "next/link"

export default function RegistrationAccountStep({
  email,
  password,
  confirmPassword,
  showPassword,
  errors,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onTogglePassword,
  onSubmit,
}: {
  email: string
  password: string
  confirmPassword: string
  showPassword: boolean
  errors: Record<string, string>
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
  onTogglePassword: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <>
      <h1 className="mb-1 text-2xl font-bold" style={{ color: "#111111" }}>
        Create account
      </h1>
      <p className="mb-8 text-[13px]" style={{ color: "#292B2F" }}>
        Already have one?{" "}
        <Link
          href="/login"
          className="font-medium underline underline-offset-2"
          style={{ color: "#111111" }}
        >
          Sign in
        </Link>
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        {errors.form && (
          <div
            className="rounded-lg border px-4 py-3 text-[13px]"
            style={{
              backgroundColor: "#FAFAF7",
              borderColor: "#E8E9EB",
              color: "#292B2F",
            }}
          >
            {errors.form}
          </div>
        )}
        <div>
          <label
            className="mb-1.5 block text-[12px] font-medium"
            style={{ color: "#111111" }}
          >
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full rounded-lg border px-4 py-2.5 text-[14px] transition-colors focus:outline-none focus:ring-1"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: errors.email ? "#292B2F" : "#E8E9EB",
              color: "#111111",
            }}
          />
          {errors.email && <FieldError>{errors.email}</FieldError>}
        </div>

        <div>
          <label
            className="mb-1.5 block text-[12px] font-medium"
            style={{ color: "#111111" }}
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              className="w-full rounded-lg border py-2.5 pr-10 pl-4 text-[14px] transition-colors focus:outline-none focus:ring-1"
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: errors.password ? "#292B2F" : "#E8E9EB",
                color: "#111111",
              }}
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-[11px] font-medium"
              style={{ color: "#292B2F" }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && <FieldError>{errors.password}</FieldError>}
        </div>

        <div>
          <label
            className="mb-1.5 block text-[12px] font-medium"
            style={{ color: "#111111" }}
          >
            Confirm password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(event) => onConfirmPasswordChange(event.target.value)}
            placeholder="Repeat your password"
            autoComplete="new-password"
            className="w-full rounded-lg border px-4 py-2.5 text-[14px] transition-colors focus:outline-none focus:ring-1"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: errors.confirmPassword ? "#292B2F" : "#E8E9EB",
              color: "#111111",
            }}
          />
          {errors.confirmPassword && (
            <FieldError>{errors.confirmPassword}</FieldError>
          )}
        </div>

        {password.length > 0 && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className="h-1 flex-1 rounded-full transition-colors"
                  style={{
                    backgroundColor:
                      password.length >= level * 2
                        ? password.length >= 12
                          ? "#111111"
                          : "#292B2F"
                        : "#E8E9EB",
                  }}
                />
              ))}
            </div>
            <p className="text-[11px]" style={{ color: "#292B2F" }}>
              {password.length < 6
                ? "Weak"
                : password.length < 10
                  ? "Fair"
                  : password.length < 14
                    ? "Strong"
                    : "Very strong"}
            </p>
          </div>
        )}

        <button
          type="submit"
          className="mt-2 w-full rounded-lg py-3 text-[14px] font-semibold"
          style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
        >
          Continue
        </button>
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
