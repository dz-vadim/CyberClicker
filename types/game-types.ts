import type { ReactNode } from "react"

export type UpgradeId =
  | "doubleValue"
  | "autoClicker"
  | "criticalClick"
  | "passiveIncome"
  | "clickMultiplier"
  | "autoClickerSpeed"
  | "clickCombo"
  | "offlineEarnings"
  | "luckyClicks"
  | "megaClick"

export type UpgradeCategory = "basic" | "advanced" | "special"

export type SkinId =
  | "cyberpunk"
  | "vaporwave"
  | "retro"
  | "matrix"
  | "neon"
  | "synthwave"
  | "outrun"
  | "holographic"
  | "glitch"
  | "quantum"
  | "cosmic"
  | "binary"
  | "hyperspace"
  | "digital"
  | "ethereal"

// Обновляем типы для TabId, удаляем "wheel"
export type TabId = "upgrades" | "skins" | "cases" | "leaderboard"

export interface Upgrade {
  name: string
  description: string
  icon: ReactNode
  level: number
  baseCost: number
  costMultiplier: number
  owned: boolean
  effect: number
  effectMultiplier: number
  category: UpgradeCategory
  unlockCost: number
}

export interface Skin {
  name: string
  description: string
  cost: number
  owned: boolean
  unlockRequirement: SkinId | null
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
}

export interface GameState {
  money: number
  totalEarned: number
  clickCount: number
  moneyPerClick: number
  upgrades: Record<string, { level: number; owned: boolean }>
  skins: Record<string, { owned: boolean }>
  activeSkin: string
  playerName: string
  unlockedRewards: string[]
  lastSaved: number
  robocoins: number
  totalRobocoins: number
  prestigeCount: number
  activeAntiEffects: any[]
  language: "en" | "uk"
  unlockedCases: string[]
  musicEnabled: boolean
}
