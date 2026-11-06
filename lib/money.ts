const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatNaira(amount: number): string {
  return nairaFormatter.format(amount)
}

export function formatMinorCurrencyAmount(
  amount: string,
  currency: string,
): string {
  const value = Number(amount)
  if (!Number.isFinite(value)) return "—"
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value / 100)
  } catch {
    return `${currency} ${(value / 100).toLocaleString("en-NG")}`
  }
}
