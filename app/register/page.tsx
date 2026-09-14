"use client"

// Step 0

// Step 1
/* Left panel */ /* Right panel */ /* Step indicator */ /* Password strength */

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiClient } from "../lib/api"

const STEPS = ["Account", "Profile", "Done"]

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")

  const validate0 = () => {
    const e: Record<string, string> = {}
    if (!email) e.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(email))
      e.email = "Enter a valid email address"
    if (!password) e.password = "Password is required"
    else if (password.length < 8)
      e.password = "Password must be at least 8 characters"
    if (password !== confirmPassword)
      e.confirmPassword = "Passwords do not match"
    return e
  }

  const validate1 = () => {
    const e: Record<string, string> = {}
    if (!firstName.trim()) e.firstName = "First name is required"
    if (!lastName.trim()) e.lastName = "Last name is required"
    return e
  }

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 0) {
      const errs = validate0()
      setErrors(errs)
      if (Object.keys(errs).length) return
      setStep(1)
    } else if (step === 1) {
      const errs = validate1()
      setErrors(errs)
      if (Object.keys(errs).length) return
      setLoading(true)
      try {
        await apiClient.register(email, password)
        setStep(2)
      } catch (error) {
        setErrors({
          form:
            error instanceof Error
              ? error.message
              : "Unable to create account.",
        })
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#FAFAF7" }}>
      {}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-10"
        style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
      >
        <Link href="/" className="text-[16px] font-bold tracking-tight">
          resale
          <span
            className="font-normal"
            style={{ color: "rgba(250,250,247,0.5)" }}
          >
            .co
          </span>
        </Link>
        <div className="space-y-6">
          {[
            {
              icon: "✓",
              title: "No hidden fees",
              desc: "All service fees shown upfront before you pay.",
            },
            {
              icon: "★",
              title: "Verified sellers",
              desc: "Every listing is screened by our trust team.",
            },
            {
              icon: "↓",
              title: "Instant delivery",
              desc: "Tickets arrive in your inbox within minutes.",
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex gap-4">
              <span
                className="text-[18px] font-bold mt-0.5 shrink-0"
                style={{ color: "rgba(250,250,247,0.6)" }}
              >
                {icon}
              </span>
              <div>
                <p className="text-[14px] font-semibold">{title}</p>
                <p
                  className="text-[13px] mt-0.5"
                  style={{ color: "rgba(250,250,247,0.6)" }}
                >
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px]" style={{ color: "rgba(250,250,247,0.35)" }}>
          © 2026 Resale Co.
        </p>
      </div>

      {}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <Link
          href="/"
          className="lg:hidden text-[16px] font-bold tracking-tight mb-8"
          style={{ color: "#111111" }}
        >
          resale
          <span className="font-normal" style={{ color: "#292B2F" }}>
            .co
          </span>
        </Link>

        <div className="w-full max-w-sm">
          {}
          {step < 2 && (
            <div className="flex items-center gap-2 mb-8">
              {STEPS.slice(0, 2).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 transition-colors"
                    style={
                      i <= step
                        ? { backgroundColor: "#111111", color: "#FAFAF7" }
                        : { backgroundColor: "#E8E9EB", color: "#292B2F" }
                    }
                  >
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span
                    className="text-[12px] font-medium"
                    style={{ color: i <= step ? "#111111" : "#292B2F" }}
                  >
                    {s}
                  </span>
                  {i < 1 && (
                    <div
                      className="w-8 h-px mx-1"
                      style={{ backgroundColor: "#E8E9EB" }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {step === 0 && (
            <>
              <h1
                className="text-2xl font-bold mb-1"
                style={{ color: "#111111" }}
              >
                Create account
              </h1>
              <p className="text-[13px] mb-8" style={{ color: "#292B2F" }}>
                Already have one?{" "}
                <Link
                  href="/login"
                  className="font-medium underline underline-offset-2"
                  style={{ color: "#111111" }}
                >
                  Sign in
                </Link>
              </p>

              <form onSubmit={handleNext} className="space-y-4">
                {errors.form && (
                  <div
                    className="px-4 py-3 rounded-lg border text-[13px]"
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
                    className="block text-[12px] font-medium mb-1.5"
                    style={{ color: "#111111" }}
                  >
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1 transition-colors"
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderColor: errors.email ? "#292B2F" : "#E8E9EB",
                      color: "#111111",
                    }}
                  />
                  {errors.email && (
                    <p
                      className="text-[11px] mt-1"
                      style={{ color: "#292B2F" }}
                    >
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className="block text-[12px] font-medium mb-1.5"
                    style={{ color: "#111111" }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1 transition-colors pr-10"
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderColor: errors.password ? "#292B2F" : "#E8E9EB",
                        color: "#111111",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium"
                      style={{ color: "#292B2F" }}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.password && (
                    <p
                      className="text-[11px] mt-1"
                      style={{ color: "#292B2F" }}
                    >
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className="block text-[12px] font-medium mb-1.5"
                    style={{ color: "#111111" }}
                  >
                    Confirm password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1 transition-colors"
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderColor: errors.confirmPassword
                        ? "#292B2F"
                        : "#E8E9EB",
                      color: "#111111",
                    }}
                  />
                  {errors.confirmPassword && (
                    <p
                      className="text-[11px] mt-1"
                      style={{ color: "#292B2F" }}
                    >
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {}
                {password.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((n) => (
                        <div
                          key={n}
                          className="flex-1 h-1 rounded-full transition-colors"
                          style={{
                            backgroundColor:
                              password.length >= n * 2
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
                  className="w-full py-3 rounded-lg text-[14px] font-semibold mt-2"
                  style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
                >
                  Continue
                </button>
              </form>
            </>
          )}

          {step === 1 && (
            <>
              <h1
                className="text-2xl font-bold mb-1"
                style={{ color: "#111111" }}
              >
                Your details
              </h1>
              <p className="text-[13px] mb-8" style={{ color: "#292B2F" }}>
                Tell us a little about yourself.
              </p>

              <form onSubmit={handleNext} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      className="block text-[12px] font-medium mb-1.5"
                      style={{ color: "#111111" }}
                    >
                      First name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      autoComplete="given-name"
                      className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderColor: errors.firstName ? "#292B2F" : "#E8E9EB",
                        color: "#111111",
                      }}
                    />
                    {errors.firstName && (
                      <p
                        className="text-[11px] mt-1"
                        style={{ color: "#292B2F" }}
                      >
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      className="block text-[12px] font-medium mb-1.5"
                      style={{ color: "#111111" }}
                    >
                      Last name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Smith"
                      autoComplete="family-name"
                      className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderColor: errors.lastName ? "#292B2F" : "#E8E9EB",
                        color: "#111111",
                      }}
                    />
                    {errors.lastName && (
                      <p
                        className="text-[11px] mt-1"
                        style={{ color: "#292B2F" }}
                      >
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    className="block text-[12px] font-medium mb-1.5"
                    style={{ color: "#111111" }}
                  >
                    Phone number{" "}
                    <span style={{ color: "#292B2F" }}>(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    autoComplete="tel"
                    className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#E8E9EB",
                      color: "#111111",
                    }}
                  />
                </div>

                <div
                  className="border rounded-lg p-4"
                  style={{ borderColor: "#E8E9EB", backgroundColor: "#FFFFFF" }}
                >
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5 rounded shrink-0"
                      defaultChecked
                    />
                    <span
                      className="text-[12px] leading-relaxed"
                      style={{ color: "#292B2F" }}
                    >
                      Send me alerts for events I'm interested in and exclusive
                      presale offers.
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="flex-1 py-3 rounded-lg text-[14px] font-medium border transition-colors"
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
                    className="flex-1 py-3 rounded-lg text-[14px] font-semibold transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
                  >
                    {loading ? "Creating account…" : "Create account"}
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 2 && (
            <div className="text-center py-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl"
                style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
              >
                ✓
              </div>
              <h1
                className="text-2xl font-bold mb-2"
                style={{ color: "#111111" }}
              >
                You're in.
              </h1>
              <p
                className="text-[14px] leading-relaxed mb-8"
                style={{ color: "#292B2F" }}
              >
                Your account has been created. Start browsing and find your next
                event.
              </p>
              <Link
                href="/"
                className="inline-block w-full py-3 rounded-lg text-[14px] font-semibold text-center"
                style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
              >
                Browse Events
              </Link>
              <p className="text-[12px] mt-4" style={{ color: "#292B2F" }}>
                Check your email for a confirmation link.
              </p>
            </div>
          )}

          {step < 2 && (
            <p
              className="text-[11px] text-center mt-6 leading-relaxed"
              style={{ color: "#292B2F" }}
            >
              By creating an account, you agree to our{" "}
              <a href="#" className="underline underline-offset-2">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="underline underline-offset-2">
                Privacy Policy
              </a>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
