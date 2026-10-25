"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import BrandLogo from "./BrandLogo"
import { useLogoutMutation } from "../lib/auth/rtk"
import { useAuth } from "../hooks/useAuth"

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [logout] = useLogoutMutation()

  const handleSignOut = async () => {
    try {
      await logout().unwrap()
    } catch (error) {
      console.error("Sign-out request failed.", error)
    } finally {
      window.localStorage.removeItem("restub_email")
      setMenuOpen(false)
      router.push("/")
      router.refresh()
    }
  }

  return (
    <header
      className="bg-white border-b sticky top-0 z-30"
      style={{ borderColor: "#E8E9EB" }}
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-6">
        <BrandLogo className="" width={120} height={28} />
        <nav className="hidden md:flex items-center gap-5 ml-auto">
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: "#292B2F" }}
          >
            Browse
          </Link>
          <Link
            href="/sell"
            className="text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: "#292B2F" }}
          >
            Sell Tickets
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                href="/account"
                className="text-sm font-medium transition-colors hover:opacity-70"
                style={{ color: "#292B2F" }}
              >
                My Account
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-sm font-medium transition-colors hover:opacity-70"
                style={{ color: "#292B2F" }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium transition-colors hover:opacity-70"
                style={{ color: "#292B2F" }}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
              >
                Register
              </Link>
            </>
          )}
        </nav>
        <button
          className="md:hidden ml-auto p-2"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M2 4H16M2 9H16M2 14H16"
              stroke="#111111"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      {menuOpen && (
        <div
          className="md:hidden bg-white border-t px-6 py-4 flex flex-col gap-3"
          style={{ borderColor: "#E8E9EB" }}
        >
          <Link
            href="/"
            className="text-sm font-medium py-1"
            style={{ color: "#292B2F" }}
          >
            Browse
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                href="/account"
                className="text-sm font-medium py-1"
                style={{ color: "#292B2F" }}
                onClick={() => setMenuOpen(false)}
              >
                My Account
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-left text-sm font-semibold py-1"
                style={{ color: "#111111" }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium py-1"
                style={{ color: "#292B2F" }}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold py-1"
                style={{ color: "#111111" }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
