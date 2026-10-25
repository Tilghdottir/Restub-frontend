import type { NextConfig } from "next"
import { PHASE_DEVELOPMENT_SERVER } from "next/constants"

export default function nextConfig(phase: string): NextConfig {
  const isDevelopment = phase === PHASE_DEVELOPMENT_SERVER

  return {
    // output: "export",
    distDir: "dist",
    basePath: isDevelopment ? "" : "/Restub-frontend",
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
    allowedDevOrigins: isDevelopment ? ["http://localhost:3000", "http://localhost:3001", "https://pastime-earthlike-overeater.ngrok-free.dev"] : [],
  }
}
