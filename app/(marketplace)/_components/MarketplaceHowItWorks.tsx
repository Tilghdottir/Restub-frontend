const steps = [
  {
    step: "01",
    title: "Find Your Event",
    description:
      "Browse thousands of events by date, location, and category. Filter by price range and seat preference.",
  },
  {
    step: "02",
    title: "Choose Your Seats",
    description:
      "Pick from verified listings with transparent pricing. All fees shown upfront — no surprises at checkout.",
  },
  {
    step: "03",
    title: "Get Your Tickets",
    description:
      "Receive your tickets instantly via email. Every ticket is guaranteed authentic or your money back.",
  },
]

export default function MarketplaceHowItWorks() {
  return (
    <section className="mt-12" aria-labelledby="how-it-works-heading">
      <h2
        id="how-it-works-heading"
        className="mb-4 text-[13px] font-semibold tracking-wide text-[#111111] uppercase"
      >
        How It Works
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map(({ step, title, description }) => (
          <div
            key={step}
            className="rounded-lg border bg-white p-5"
            style={{ borderColor: "#E8E9EB" }}
          >
            <p className="mb-3 font-mono-data text-[11px] font-medium text-[#292B2F]">
              {step}
            </p>
            <h3 className="mb-2 text-[14px] font-semibold text-[#111111]">
              {title}
            </h3>
            <p className="text-[13px] leading-relaxed text-[#292B2F]">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
