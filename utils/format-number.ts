/**
 * Formats a number to a more readable format with K, M, B, T suffixes
 */
export function formatNumber(num: number): string {
  if (num < 1000) return num.toFixed(0)

  const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"]
  const exponent = Math.floor(Math.log10(num) / 3)
  const suffix = suffixes[exponent] || `e${exponent * 3}`

  const scaled = num / Math.pow(1000, exponent)
  const formatted = scaled >= 100 ? scaled.toFixed(0) : scaled >= 10 ? scaled.toFixed(1) : scaled.toFixed(2)

  return `${formatted}${suffix}`
}

