import type { Metadata } from "next"
import Header from "../../../components/ui/Header"
import MarketplaceFooter from "../_components/MarketplaceFooter"

export const metadata: Metadata = {
  title: "Privacy Policy | resale.co",
  description:
    "Learn how resale.co collects, uses, and shares personal information.",
}

const sections = [
  {
    title: "Information we collect",
    paragraphs: [
      "We collect information you provide when you create or use an account, buy or sell tickets, contact support, or use other features. This may include your name, email address, account credentials, profile details, and information about your listings and orders.",
      "To complete transactions and support sellers, we may also process contact and ticket details, payment or payout information, and identity-verification information. Payment and identity details may be collected or handled directly by the providers that perform those services.",
      "When you use the service, we and our service providers may receive technical and usage information, such as device, browser, and request data. We use essential cookies to support account authentication and service functionality.",
    ],
  },
  {
    title: "How we use information",
    paragraphs: [
      "We use information to provide and operate the marketplace; create and secure accounts; facilitate purchases, sales, payments, and payouts; verify identity where required; provide support; communicate about accounts and transactions; prevent fraud and misuse; and meet legal obligations.",
    ],
  },
  {
    title: "How information is shared",
    paragraphs: [
      "We share information when needed to provide the service. This can include sharing relevant order or ticket details between buyers and sellers, and sharing information with service providers that support hosting, payment processing, identity verification, communications, and customer support.",
      "We may also disclose information when required by law, to respond to valid legal requests, to protect users and the service, or in connection with a business transfer. We do not authorize service providers to use personal information for purposes unrelated to providing their services to us.",
    ],
  },
  {
    title: "Retention and security",
    paragraphs: [
      "We retain personal information for as long as needed to provide the service, maintain transaction and business records, resolve disputes, enforce our agreements, and meet legal obligations. Retention periods depend on the type of information and why it was collected.",
      "We use reasonable measures designed to protect personal information. No method of storage or transmission is completely secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    title: "Your choices and rights",
    paragraphs: [
      "You can review and update certain account information through your account. Depending on where you live, you may have rights to request access to, correction or deletion of, or a copy of your personal information, or to object to or restrict certain processing. Contact us to make a request. We may need to verify your identity and may retain information where the law allows or requires it.",
    ],
  },
  {
    title: "Children's privacy",
    paragraphs: [
      "Our marketplace is not intended for children who are not legally able to enter into transactions in their place of residence. If you believe a child has provided us with personal information, contact us so we can review the matter.",
    ],
  },
  {
    title: "Changes and contact",
    paragraphs: [
      "We may update this policy as our service or practices change. We will post the current version on this page and update the date below.",
    ],
  },
]

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAF7" }}>
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-12 md:py-16">
        <article
          className="rounded-lg border bg-white p-6 md:p-10"
          style={{ borderColor: "#E8E9EB" }}
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[#292B2F]">
            resale.co
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#111111]">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-[#292B2F]">
            Last updated: November 9, 2026
          </p>
          <p className="mt-6 text-sm leading-7 text-[#292B2F]">
            This policy explains how Resale Co. (&quot;resale.co,&quot;
            &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) handles
            information when you visit or use our ticket marketplace and related
            services.
          </p>

          <div className="mt-8 space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-semibold text-[#111111]">
                  {section.title}
                </h2>
                <div className="mt-2 space-y-3">
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-sm leading-7 text-[#292B2F]"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <p
            className="mt-8 border-t pt-6 text-sm leading-7 text-[#292B2F]"
            style={{ borderColor: "#E8E9EB" }}
          >
            Questions or privacy requests? Email{" "}
            <a
              href="mailto:tilghmantechnologiessupport@gmail.com"
              className="font-medium text-[#111111] underline underline-offset-2"
            >
              tilghmantechnologiessupport@gmail.com
            </a>
            .
          </p>
        </article>
      </main>
      <MarketplaceFooter />
    </div>
  )
}
