export default function MarketplaceHero() {
  return (
    <div
      className="mb-8 overflow-hidden rounded-lg border bg-white"
      style={{ borderColor: "#E8E9EB" }}
    >
      <div className="grid md:grid-cols-2">
        <div className="flex flex-col justify-center p-8">
          <p
            className="mb-3 text-[11px] font-medium tracking-widest uppercase"
            style={{ color: "#292B2F" }}
          >
            New York City · September 2026
          </p>
          <h1
            className="mb-3 text-3xl leading-tight font-bold"
            style={{ color: "#111111" }}
          >
            The best seats.
            <br />
            No surprises.
          </h1>
          <p
            className="mb-6 text-[14px] leading-relaxed"
            style={{ color: "#292B2F" }}
          >
            Guaranteed authentic tickets to every concert, game, and show —
            transparent pricing, no hidden fees.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {[
              { label: "Verified sellers", icon: "★" },
              { label: "Instant e-delivery", icon: "↓" },
              { label: "Money-back guarantee", icon: "✓" },
            ].map(({ label, icon }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 text-[12px]"
                style={{ color: "#292B2F" }}
              >
                <span
                  className="text-[11px] font-bold"
                  style={{ color: "#111111" }}
                >
                  {icon}
                </span>
                {label}
              </div>
            ))}
          </div>
        </div>
        <div className="hidden bg-gray-100 md:block" style={{ minHeight: 240 }}>
          <img
            src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=500&fit=crop&auto=format"
            alt="Concert crowd"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  )
}
