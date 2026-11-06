"use client"

import { useState } from "react"
import Link from "next/link"
import BrandLogo from "../../../components/ui/BrandLogo"
import { getApiErrorMessage } from "../../../lib/rtk-api"
import { useRegisterMutation } from "../../../lib/auth/rtk"
import RegistrationAccountStep from "./_components/RegistrationAccountStep"
import RegistrationProfileStep from "./_components/RegistrationProfileStep"

const STEPS = ["Account", "Profile"]

export default function RegisterPage() {
  const [register, { isLoading: loading }] = useRegisterMutation()
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")

  const validateAccount = () => {
    const nextErrors: Record<string, string> = {}
    if (!email) nextErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(email))
      nextErrors.email = "Enter a valid email address"
    if (!password) nextErrors.password = "Password is required"
    else if (password.length < 8)
      nextErrors.password = "Password must be at least 8 characters"
    if (password !== confirmPassword)
      nextErrors.confirmPassword = "Passwords do not match"
    return nextErrors
  }

  const validateProfile = () => {
    const nextErrors: Record<string, string> = {}
    if (!firstName.trim()) nextErrors.firstName = "First name is required"
    if (!lastName.trim()) nextErrors.lastName = "Last name is required"
    if (!phone.trim()) nextErrors.phone = "Phone number is required"
    else if (!/^\+?[0-9\s()\-.]{7,}$/.test(phone.trim()))
      nextErrors.phone = "Enter a valid phone number"
    return nextErrors
  }

  const handleNext = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (step === 0) {
      const nextErrors = validateAccount()
      setErrors(nextErrors)
      if (Object.keys(nextErrors).length) return
      setStep(1)
      return
    }

    const nextErrors = validateProfile()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    try {
      await register({
        email,
        password,
        profile: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phoneNumber: phone.trim(),
          eventAlerts: true,
          exclusivePresaleOffers: true,
        },
      }).unwrap()
      window.localStorage.setItem("restub_email", email)
      window.localStorage.setItem("restub_first_name", firstName.trim())
      window.localStorage.setItem("restub_last_name", lastName.trim())
      window.localStorage.setItem("restub_phone_number", phone.trim())
      setStep(2)
    } catch (error) {
      setErrors({
        form: getApiErrorMessage(error, "Unable to create account."),
      })
    }
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#FAFAF7" }}>
      <aside
        className="hidden w-[420px] shrink-0 flex-col justify-between p-10 lg:flex"
        style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
      >
        <BrandLogo width={140} height={32} className="" />
        <div className="space-y-6">
          {[
            {
              icon: "✓",
              title: "No hidden fees",
              desc: "See the order amount and any provider fees before payment.",
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
                className="mt-0.5 shrink-0 text-[18px] font-bold"
                style={{ color: "rgba(250,250,247,0.6)" }}
              >
                {icon}
              </span>
              <div>
                <p className="text-[14px] font-semibold">{title}</p>
                <p
                  className="mt-0.5 text-[13px]"
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
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <BrandLogo width={120} height={28} className="mb-8 lg:hidden" />
        <div className="w-full max-w-sm">
          {step < 2 && (
            <div className="mb-8 flex items-center gap-2">
              {STEPS.map((label, index) => (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors"
                    style={
                      index <= step
                        ? { backgroundColor: "#111111", color: "#FAFAF7" }
                        : { backgroundColor: "#E8E9EB", color: "#292B2F" }
                    }
                  >
                    {index < step ? "✓" : index + 1}
                  </div>
                  <span
                    className="text-[12px] font-medium"
                    style={{ color: index <= step ? "#111111" : "#292B2F" }}
                  >
                    {label}
                  </span>
                  {index === 0 && (
                    <div
                      className="mx-1 h-px w-8"
                      style={{ backgroundColor: "#E8E9EB" }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {step === 0 && (
            <RegistrationAccountStep
              email={email}
              password={password}
              confirmPassword={confirmPassword}
              showPassword={showPassword}
              errors={errors}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onConfirmPasswordChange={setConfirmPassword}
              onTogglePassword={() => setShowPassword((visible) => !visible)}
              onSubmit={handleNext}
            />
          )}
          {step === 1 && (
            <RegistrationProfileStep
              firstName={firstName}
              lastName={lastName}
              phone={phone}
              errors={errors}
              loading={loading}
              onFirstNameChange={setFirstName}
              onLastNameChange={setLastName}
              onPhoneChange={setPhone}
              onBack={() => setStep(0)}
              onSubmit={handleNext}
            />
          )}
          {step === 2 && (
            <div className="py-4 text-center">
              <div
                className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full text-2xl"
                style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
              >
                ✓
              </div>
              <h1
                className="mb-2 text-2xl font-bold"
                style={{ color: "#111111" }}
              >
                You&apos;re in.
              </h1>
              <p
                className="mb-8 text-[14px] leading-relaxed"
                style={{ color: "#292B2F" }}
              >
                Your account has been created. Start browsing and find your next
                event.
              </p>
              <Link
                href="/"
                className="inline-block w-full rounded-lg py-3 text-center text-[14px] font-semibold"
                style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
              >
                Browse Events
              </Link>
              <p className="mt-4 text-[12px]" style={{ color: "#292B2F" }}>
                Check your email for a confirmation link.
              </p>
            </div>
          )}

          {step < 2 && (
            <p
              className="mt-6 text-center text-[11px] leading-relaxed"
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
      </main>
    </div>
  )
}
