'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { getEventById } from '../lib/data'

const STEPS = ['Review', 'Payment', 'Confirmation']

function CheckoutContent() {
  const params = useSearchParams()
  const eventId = Number(params.get('eventId'))
  const section = params.get('section') ?? 'Section 101'
  const row = params.get('row') ?? 'C'
  const seats = params.get('seats') ?? '22–23'
  const qty = Number(params.get('qty') ?? 2)
  const priceEach = Number(params.get('price') ?? 212)

  const event = getEventById(eventId)

  const subtotal = priceEach * qty
  const fees = Math.round(subtotal * 0.13)
  const total = subtotal + fees

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  // Payment fields
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [zip, setZip] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const formatCardNumber = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
  const formatExpiry = (v: string) =>
    v.replace(/\D/g, '').slice(0, 4).replace(/(\d{2})(?=\d)/, '$1/')

  const validatePayment = () => {
    const e: Record<string, string> = {}
    if (!cardName.trim()) e.cardName = 'Name on card is required'
    if (cardNumber.replace(/\s/g, '').length < 16) e.cardNumber = 'Enter a valid 16-digit card number'
    if (expiry.length < 5) e.expiry = 'Enter a valid expiry date'
    if (cvv.length < 3) e.cvv = 'Enter a valid CVV'
    if (!zip.trim()) e.zip = 'Billing ZIP is required'
    return e
  }

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validatePayment()
    setErrors(errs)
    if (Object.keys(errs).length) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setStep(2)
  }

  const orderRef = `RC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF7' }}>
      {/* Header */}
      <header className="bg-white border-b" style={{ borderColor: '#E8E9EB' }}>
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-4">
          <Link href="/" className="text-[16px] font-bold tracking-tight shrink-0" style={{ color: '#111111' }}>
            resale<span className="font-normal" style={{ color: '#292B2F' }}>.co</span>
          </Link>
          {step < 2 && (
            <>
              <span className="w-px h-4 mx-2" style={{ backgroundColor: '#E8E9EB' }} />
              <div className="flex items-center gap-3">
                {STEPS.slice(0, 2).map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 transition-colors"
                      style={
                        i < step
                          ? { backgroundColor: '#111111', color: '#FAFAF7' }
                          : i === step
                            ? { backgroundColor: '#111111', color: '#FAFAF7' }
                            : { backgroundColor: '#E8E9EB', color: '#292B2F' }
                      }
                    >
                      {i < step ? '✓' : i + 1}
                    </div>
                    <span className="text-[12px] font-medium hidden sm:inline" style={{ color: i <= step ? '#111111' : '#292B2F' }}>{s}</span>
                    {i < 1 && <span className="text-[#E8E9EB] mx-1 hidden sm:inline">›</span>}
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="ml-auto flex items-center gap-2 text-[12px]" style={{ color: '#292B2F' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="4" width="12" height="9" rx="1.5" stroke="#292B2F" strokeWidth="1.3"/>
              <path d="M4 4V3a3 3 0 0 1 6 0v1" stroke="#292B2F" strokeWidth="1.3"/>
            </svg>
            Secure checkout
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {step === 2 ? (
          /* Confirmation */
          <div className="max-w-md mx-auto text-center py-12">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl"
              style={{ backgroundColor: '#111111', color: '#FAFAF7' }}
            >
              ✓
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#111111' }}>Order confirmed</h1>
            <p className="text-[14px] mb-2" style={{ color: '#292B2F' }}>
              Your tickets are on their way to your inbox.
            </p>
            <p className="font-mono-data text-[12px] mb-8" style={{ color: '#292B2F' }}>Order ref: {orderRef}</p>

            <div className="border rounded-lg overflow-hidden mb-8 text-left" style={{ borderColor: '#E8E9EB' }}>
              {event && (
                <div className="bg-white p-5 border-b" style={{ borderColor: '#E8E9EB' }}>
                  <p className="text-[11px] font-medium tracking-wide uppercase mb-1" style={{ color: '#292B2F' }}>{event.category}</p>
                  <p className="text-[15px] font-semibold" style={{ color: '#111111' }}>{event.title}</p>
                  <p className="text-[13px] mt-0.5" style={{ color: '#292B2F' }}>{event.date} · {event.venue}</p>
                </div>
              )}
              <div className="bg-white p-5 space-y-2">
                {[
                  { label: 'Section', value: section },
                  { label: 'Row / Seats', value: `Row ${row} · ${seats}` },
                  { label: 'Quantity', value: `${qty} ticket${qty > 1 ? 's' : ''}` },
                  { label: 'Total paid', value: `$${total.toLocaleString()}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-[13px]">
                    <span style={{ color: '#292B2F' }}>{label}</span>
                    <span className="font-medium font-mono-data" style={{ color: '#111111' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/"
              className="inline-block w-full py-3 rounded-lg text-[14px] font-semibold text-center"
              style={{ backgroundColor: '#111111', color: '#FAFAF7' }}
            >
              Continue Browsing
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-[1fr_300px] gap-8 items-start">
            {/* Left — steps */}
            <div>
              {step === 0 && (
                <div>
                  <h1 className="text-xl font-bold mb-6" style={{ color: '#111111' }}>Review your order</h1>

                  {event && (
                    <div className="bg-white border rounded-lg overflow-hidden mb-4" style={{ borderColor: '#E8E9EB' }}>
                      <div className="flex gap-4 p-5">
                        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium tracking-wide uppercase mb-0.5" style={{ color: '#292B2F' }}>{event.category}</p>
                          <p className="text-[15px] font-semibold leading-tight" style={{ color: '#111111' }}>{event.title}</p>
                          <p className="text-[13px] mt-0.5" style={{ color: '#292B2F' }}>{event.date} · {event.time}</p>
                          <p className="text-[13px]" style={{ color: '#292B2F' }}>{event.venue}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-white border rounded-lg p-5 mb-4" style={{ borderColor: '#E8E9EB' }}>
                    <h2 className="text-[12px] font-semibold uppercase tracking-wide mb-4" style={{ color: '#111111' }}>Ticket Details</h2>
                    <div className="space-y-3">
                      {[
                        { label: 'Section', value: section },
                        { label: 'Row', value: row },
                        { label: 'Seats', value: seats },
                        { label: 'Quantity', value: `${qty} ticket${qty > 1 ? 's' : ''}` },
                        { label: 'Price each', value: `$${priceEach.toLocaleString()}` },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0" style={{ borderColor: '#E8E9EB' }}>
                          <span className="text-[13px]" style={{ color: '#292B2F' }}>{label}</span>
                          <span className="font-mono-data text-[13px] font-medium" style={{ color: '#111111' }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-5 mb-6" style={{ borderColor: '#E8E9EB' }}>
                    <h2 className="text-[12px] font-semibold uppercase tracking-wide mb-3" style={{ color: '#111111' }}>Delivery</h2>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: '#E8E9EB' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <rect x="1" y="2" width="12" height="10" rx="1.5" stroke="#292B2F" strokeWidth="1.3"/>
                          <path d="M1 5H13" stroke="#292B2F" strokeWidth="1.3"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-[13px] font-medium" style={{ color: '#111111' }}>Instant e-ticket</p>
                        <p className="text-[12px]" style={{ color: '#292B2F' }}>Delivered to your email within minutes of purchase.</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(1)}
                    className="w-full py-3 rounded-lg text-[14px] font-semibold"
                    style={{ backgroundColor: '#111111', color: '#FAFAF7' }}
                  >
                    Continue to Payment
                  </button>
                </div>
              )}

              {step === 1 && (
                <div>
                  <button
                    onClick={() => setStep(0)}
                    className="flex items-center gap-1.5 text-[13px] font-medium mb-6 hover:opacity-70 transition-opacity"
                    style={{ color: '#292B2F' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Back to review
                  </button>

                  <h1 className="text-xl font-bold mb-6" style={{ color: '#111111' }}>Payment</h1>

                  <form onSubmit={handlePay} className="space-y-4">
                    <div className="bg-white border rounded-lg p-5" style={{ borderColor: '#E8E9EB' }}>
                      <h2 className="text-[12px] font-semibold uppercase tracking-wide mb-4" style={{ color: '#111111' }}>Card Details</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[12px] font-medium mb-1.5" style={{ color: '#111111' }}>Name on card</label>
                          <input
                            type="text"
                            value={cardName}
                            onChange={e => setCardName(e.target.value)}
                            placeholder="Jane Smith"
                            autoComplete="cc-name"
                            className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
                            style={{ backgroundColor: '#FAFAF7', borderColor: errors.cardName ? '#292B2F' : '#E8E9EB', color: '#111111' }}
                          />
                          {errors.cardName && <p className="text-[11px] mt-1" style={{ color: '#292B2F' }}>{errors.cardName}</p>}
                        </div>

                        <div>
                          <label className="block text-[12px] font-medium mb-1.5" style={{ color: '#111111' }}>Card number</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                              placeholder="0000 0000 0000 0000"
                              autoComplete="cc-number"
                              inputMode="numeric"
                              className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1 font-mono-data pr-12"
                              style={{ backgroundColor: '#FAFAF7', borderColor: errors.cardNumber ? '#292B2F' : '#E8E9EB', color: '#111111' }}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                              {/* Card type icons placeholder */}
                              <div className="w-7 h-5 rounded-sm border" style={{ backgroundColor: '#E8E9EB', borderColor: '#E8E9EB' }} />
                            </div>
                          </div>
                          {errors.cardNumber && <p className="text-[11px] mt-1" style={{ color: '#292B2F' }}>{errors.cardNumber}</p>}
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-2">
                            <label className="block text-[12px] font-medium mb-1.5" style={{ color: '#111111' }}>Expiry date</label>
                            <input
                              type="text"
                              value={expiry}
                              onChange={e => setExpiry(formatExpiry(e.target.value))}
                              placeholder="MM/YY"
                              autoComplete="cc-exp"
                              inputMode="numeric"
                              className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1 font-mono-data"
                              style={{ backgroundColor: '#FAFAF7', borderColor: errors.expiry ? '#292B2F' : '#E8E9EB', color: '#111111' }}
                            />
                            {errors.expiry && <p className="text-[11px] mt-1" style={{ color: '#292B2F' }}>{errors.expiry}</p>}
                          </div>
                          <div>
                            <label className="block text-[12px] font-medium mb-1.5" style={{ color: '#111111' }}>CVV</label>
                            <input
                              type="text"
                              value={cvv}
                              onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                              placeholder="•••"
                              autoComplete="cc-csc"
                              inputMode="numeric"
                              className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1 font-mono-data"
                              style={{ backgroundColor: '#FAFAF7', borderColor: errors.cvv ? '#292B2F' : '#E8E9EB', color: '#111111' }}
                            />
                            {errors.cvv && <p className="text-[11px] mt-1" style={{ color: '#292B2F' }}>{errors.cvv}</p>}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border rounded-lg p-5" style={{ borderColor: '#E8E9EB' }}>
                      <h2 className="text-[12px] font-semibold uppercase tracking-wide mb-4" style={{ color: '#111111' }}>Billing Address</h2>
                      <div>
                        <label className="block text-[12px] font-medium mb-1.5" style={{ color: '#111111' }}>Billing ZIP / Postal code</label>
                        <input
                          type="text"
                          value={zip}
                          onChange={e => setZip(e.target.value.slice(0, 10))}
                          placeholder="10001"
                          autoComplete="postal-code"
                          inputMode="numeric"
                          className="w-48 border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1 font-mono-data"
                          style={{ backgroundColor: '#FAFAF7', borderColor: errors.zip ? '#292B2F' : '#E8E9EB', color: '#111111' }}
                        />
                        {errors.zip && <p className="text-[11px] mt-1" style={{ color: '#292B2F' }}>{errors.zip}</p>}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-lg text-[14px] font-semibold transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                      style={{ backgroundColor: '#111111', color: '#FAFAF7' }}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="6" stroke="rgba(250,250,247,0.3)" strokeWidth="2"/>
                            <path d="M8 2a6 6 0 0 1 6 6" stroke="#FAFAF7" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          Processing…
                        </>
                      ) : (
                        `Pay $${total.toLocaleString()}`
                      )}
                    </button>

                    <p className="text-[11px] text-center" style={{ color: '#292B2F' }}>
                      Your payment is encrypted and secure. We never store your card details.
                    </p>
                  </form>
                </div>
              )}
            </div>

            {/* Right — persistent order summary (black band) */}
            <aside
              className="rounded-lg overflow-hidden sticky top-20"
              style={{ backgroundColor: '#111111', color: '#FAFAF7' }}
            >
              <div className="p-5">
                <h2 className="text-[11px] font-medium tracking-widest uppercase mb-4" style={{ color: 'rgba(250,250,247,0.5)' }}>
                  Order Summary
                </h2>
                {event && (
                  <div className="mb-4 pb-4 border-b" style={{ borderColor: 'rgba(250,250,247,0.1)' }}>
                    <p className="text-[13px] font-semibold leading-tight">{event.title}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(250,250,247,0.55)' }}>{event.date} · {event.venue}</p>
                  </div>
                )}
                <div className="space-y-2 mb-4 pb-4 border-b" style={{ borderColor: 'rgba(250,250,247,0.1)' }}>
                  {[
                    { label: `${section}`, value: '' },
                    { label: `Row ${row}, ${seats}`, value: '' },
                    { label: `${qty} × $${priceEach.toLocaleString()}`, value: `$${subtotal.toLocaleString()}` },
                    { label: 'Service fees', value: `$${fees.toLocaleString()}` },
                  ].map(({ label, value }) => (
                    value ? (
                      <div key={label} className="flex justify-between text-[12px]">
                        <span style={{ color: 'rgba(250,250,247,0.6)' }}>{label}</span>
                        <span className="font-mono-data" style={{ color: 'rgba(250,250,247,0.8)' }}>{value}</span>
                      </div>
                    ) : (
                      <p key={label} className="text-[12px]" style={{ color: 'rgba(250,250,247,0.6)' }}>{label}</p>
                    )
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[14px] font-semibold">Total</span>
                  <span className="font-mono-data text-[16px] font-bold">${total.toLocaleString()}</span>
                </div>
              </div>

              <div className="px-5 pb-5">
                <div className="pt-4 border-t" style={{ borderColor: 'rgba(250,250,247,0.1)' }}>
                  <div className="flex items-center gap-2 text-[11px]" style={{ color: 'rgba(250,250,247,0.5)' }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
                      <path d="M4 6l1.5 1.5L8 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Guaranteed authentic or full refund
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAF7' }}>
        <p className="text-[14px]" style={{ color: '#292B2F' }}>Loading…</p>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
