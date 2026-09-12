'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    router.push('/')
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#FAFAF7' }}>
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-10"
        style={{ backgroundColor: '#111111', color: '#FAFAF7' }}
      >
        <Link href="/" className="text-[16px] font-bold tracking-tight">
          resale<span className="font-normal" style={{ color: 'rgba(250,250,247,0.5)' }}>.co</span>
        </Link>
        <div>
          <blockquote className="text-[22px] font-medium leading-snug mb-6">
            "Got floor seats to Hamilton for under face value. Absolutely seamless."
          </blockquote>
          <div>
            <p className="text-[13px] font-semibold">Marcus T.</p>
            <p className="text-[12px] mt-0.5" style={{ color: 'rgba(250,250,247,0.5)' }}>Verified buyer · New York</p>
          </div>
        </div>
        <p className="text-[11px]" style={{ color: 'rgba(250,250,247,0.35)' }}>© 2026 Resale Co.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <Link href="/" className="lg:hidden text-[16px] font-bold tracking-tight mb-8" style={{ color: '#111111' }}>
          resale<span className="font-normal" style={{ color: '#292B2F' }}>.co</span>
        </Link>

        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#111111' }}>Sign in</h1>
          <p className="text-[13px] mb-8" style={{ color: '#292B2F' }}>
            New here?{' '}
            <Link href="/register" className="font-medium underline underline-offset-2" style={{ color: '#111111' }}>
              Create an account
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-4 py-3 rounded-lg border text-[13px]" style={{ backgroundColor: '#FAFAF7', borderColor: '#E8E9EB', color: '#292B2F' }}>
                {error}
              </div>
            )}

            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: '#111111' }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1 transition-colors"
                style={{ backgroundColor: '#FFFFFF', borderColor: '#E8E9EB', color: '#111111' }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12px] font-medium" style={{ color: '#111111' }}>Password</label>
                <a href="#" className="text-[12px] underline underline-offset-2 hover:opacity-70" style={{ color: '#292B2F' }}>
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1 transition-colors pr-10"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#E8E9EB', color: '#111111' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium"
                  style={{ color: '#292B2F' }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-[14px] font-semibold transition-opacity disabled:opacity-50 mt-2"
              style={{ backgroundColor: '#111111', color: '#FAFAF7' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: '#E8E9EB' }} />
            <span className="text-[11px] font-medium tracking-wide uppercase" style={{ color: '#292B2F' }}>or</span>
            <div className="flex-1 h-px" style={{ backgroundColor: '#E8E9EB' }} />
          </div>

          <button
            type="button"
            className="w-full border rounded-lg py-2.5 flex items-center justify-center gap-3 text-[14px] font-medium hover:opacity-80 transition-opacity"
            style={{ borderColor: '#E8E9EB', backgroundColor: '#FFFFFF', color: '#111111' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-[11px] text-center mt-6 leading-relaxed" style={{ color: '#292B2F' }}>
            By signing in, you agree to our{' '}
            <a href="#" className="underline underline-offset-2">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="underline underline-offset-2">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
