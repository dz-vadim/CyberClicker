// Types
export type PrestigeData = {
  robocoins: number
  totalRobocoins: number
  prestigeCount: number
  bonusMultiplier: number
  lastPrestigeAmount: number
}

// Calculate how many robocoins would be earned from a prestige
export function calculateRobocoinsGain(totalEarned: number): number {
  // Base formula: totalEarned / 1T (1 trillion)
  const baseGain = totalEarned / 1_000_000_000

  // Apply a square root to make the growth more balanced
  return Math.floor(Math.sqrt(baseGain) * 100) / 100
}

// Calculate the bonus multiplier from robocoins
export function calculateBonusMultiplier(robocoins: number): number {
  // Each robocoin gives a 10% boost
  return 1 + robocoins * 0.1
}
