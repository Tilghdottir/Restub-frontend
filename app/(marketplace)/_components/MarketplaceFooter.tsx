import Link from "next/link"
import BrandLogo from "../../../components/ui/BrandLogo"

export default function MarketplaceFooter() {
  return (
    <footer
      className="mt-12 border-t bg-white"
      style={{ borderColor: "#E8E9EB" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-8 md:flex-row md:items-center">
        <div>
          <BrandLogo width={120} height={28} />
          <p className="mt-1 text-[12px] text-[#292B2F]">
            © 2026 Resale Co. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/privacy-policy"
            className="text-[12px] text-[#292B2F] transition-colors hover:opacity-70"
          >
            Privacy Policy
          </Link>
          {["Terms of Service", "Seller FAQ", "Contact"].map((label) => (
            <a
              key={label}
              href="#"
              className="text-[12px] text-[#292B2F] transition-colors hover:opacity-70"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
