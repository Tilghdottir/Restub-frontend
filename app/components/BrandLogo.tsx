import Image from "next/image"
import Link from "next/link"

type BrandLogoProps = {
  className?: string
  width?: number
  height?: number
}

export default function BrandLogo({
  className = "",
  width = 120,
  height = 28,
}: BrandLogoProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center shrink-0 ${className}`.trim()}
      aria-label="Resale home"
    >
      <Image
        src="/logo.png"
        alt="Resale.co logo"
        width={width}
        height={height}
        priority
        sizes="(max-width: 768px) 120px, 140px"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          objectFit: "contain",
          display: "block",
        }}
        className="block object-contain"
      />
    </Link>
  )
}
