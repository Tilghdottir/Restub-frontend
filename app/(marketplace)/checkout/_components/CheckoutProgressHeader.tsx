import BrandLogo from "../../../../components/ui/BrandLogo"

export default function CheckoutProgressHeader({
  step,
  steps,
}: {
  step: number
  steps: readonly string[]
}) {
  return (
    <header className="border-b bg-white" style={{ borderColor: "#E8E9EB" }}>
      <div className="mx-auto flex h-14 max-w-4xl items-center gap-4 px-6">
        <BrandLogo width={120} height={28} />
        {step < 3 ? (
          <>
            <span
              className="mx-2 h-4 w-px"
              style={{ backgroundColor: "#E8E9EB" }}
            />
            <div className="flex items-center gap-3">
              {steps.slice(0, 2).map((label, index) => (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-colors"
                    style={
                      index <= step
                        ? { backgroundColor: "#111111", color: "#FAFAF7" }
                        : { backgroundColor: "#E8E9EB", color: "#292B2F" }
                    }
                  >
                    {index < step ? "✓" : index + 1}
                  </div>
                  <span
                    className="hidden text-[12px] font-medium sm:inline"
                    style={{ color: index <= step ? "#111111" : "#292B2F" }}
                  >
                    {label}
                  </span>
                  {index < 2 ? (
                    <span className="mx-1 hidden text-[#E8E9EB] sm:inline">
                      ›
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </header>
  )
}
