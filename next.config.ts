import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  distDir: "dist",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://pastime-earthlike-overeater.ngrok-free.dev",
  ],
}

export default nextConfig
