import type { Metadata } from "next"
import StoreProvider from "./components/StoreProvider"
import "./globals.css"

export const metadata: Metadata = {
  title: "resale.co — Guaranteed Tickets",
  description:
    "The best seats to every concert, game, and show. Guaranteed authentic tickets with transparent pricing.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className="min-h-screen"
        style={{ backgroundColor: "#FAFAF7", color: "#111111" }}
        suppressHydrationWarning
      >
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  )
}
