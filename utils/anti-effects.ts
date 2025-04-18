export type AntiEffect = {
  id: string
  name: string
  description: string
  type: "income" | "click" | "auto" | "critical" | "combo" | "passive" | "upgrade"
  targetUpgrade?: string // For upgrade-specific anti-effects
  severity: number // 0-1, percentage of reduction
  fixCost: number
  duration: number // in seconds, -1 for permanent until fixed
  applied: boolean
  timeRemaining?: number
}

export const antiEffects: AntiEffect[] = [
  {
    id: "virus",
    name: "Вірус",
    description: "Зменшує дохід від кліків на 30%",
    type: "click",
    severity: 0.3,
    fixCost: 5000,
    duration: -1,
    applied: false,
  },
  {
    id: "glitch",
    name: "Глюк",
    description: "Блокує критичні кліки",
    type: "critical",
    severity: 1,
    fixCost: 10000,
    duration: -1,
    applied: false,
  },
  {
    id: "malware",
    name: "Шкідливе ПЗ",
    description: "Знижує швидкість авто-кліків на 50%",
    type: "auto",
    severity: 0.5,
    fixCost: 15000,
    duration: -1,
    applied: false,
  },
  {
    id: "corruption",
    name: "Пошкодження даних",
    description: "Блокує комбо-систему",
    type: "combo",
    severity: 1,
    fixCost: 25000,
    duration: -1,
    applied: false,
  },
  {
    id: "firewall",
    name: "Брандмауер",
    description: "Блокує пасивний дохід",
    type: "passive",
    severity: 1,
    fixCost: 50000,
    duration: -1,
    applied: false,
  },
  {
    id: "ddos",
    name: "DDoS атака",
    description: "Знижує весь дохід на 20% на 60 секунд",
    type: "income",
    severity: 0.2,
    fixCost: 100000,
    duration: 60,
    applied: false,
  },
  // New upgrade-specific anti-effects
  {
    id: "double-value-block",
    name: "Блок подвійного значення",
    description: "Блокує ефект подвійного значення",
    type: "upgrade",
    targetUpgrade: "doubleValue",
    severity: 1,
    fixCost: 20000,
    duration: -1,
    applied: false,
  },
  {
    id: "auto-hack-block",
    name: "Блок авто-хаку",
    description: "Блокує авто-хак повністю",
    type: "upgrade",
    targetUpgrade: "autoClicker",
    severity: 1,
    fixCost: 30000,
    duration: -1,
    applied: false,
  },
  {
    id: "critical-hack-block",
    name: "Блок критичного хаку",
    description: "Блокує критичний хак",
    type: "upgrade",
    targetUpgrade: "criticalClick",
    severity: 1,
    fixCost: 40000,
    duration: -1,
    applied: false,
  },
  {
    id: "passive-income-block",
    name: "Блок пасивного доходу",
    description: "Блокує пасивний дохід",
    type: "upgrade",
    targetUpgrade: "passiveIncome",
    severity: 1,
    fixCost: 60000,
    duration: -1,
    applied: false,
  },
  {
    id: "click-multiplier-block",
    name: "Блок множника кліків",
    description: "Блокує множник кліків",
    type: "upgrade",
    targetUpgrade: "clickMultiplier",
    severity: 1,
    fixCost: 80000,
    duration: -1,
    applied: false,
  },
  {
    id: "system-slowdown",
    name: "Уповільнення системи",
    description: "Знижує всі доходи на 40%",
    type: "income",
    severity: 0.4,
    fixCost: 150000,
    duration: -1,
    applied: false,
  },
  {
    id: "memory-leak",
    name: "Витік пам'яті",
    description: "Поступово знижує ефективність кліків",
    type: "click",
    severity: 0.05, // Increases over time
    fixCost: 200000,
    duration: 120,
    applied: false,
  },
  {
    id: "ransomware",
    name: "Програма-вимагач",
    description: "Блокує всі покращення, поки не виправлено",
    type: "income",
    severity: 0.7,
    fixCost: 500000,
    duration: -1,
    applied: false,
  },
]

// English translations
export const antiEffectsEN: Record<string, { name: string; description: string }> = {
  virus: {
    name: "Virus",
    description: "Reduces click income by 30%",
  },
  glitch: {
    name: "Glitch",
    description: "Blocks critical clicks",
  },
  malware: {
    name: "Malware",
    description: "Reduces auto-click speed by 50%",
  },
  corruption: {
    name: "Data Corruption",
    description: "Blocks combo system",
  },
  firewall: {
    name: "Firewall",
    description: "Blocks passive income",
  },
  ddos: {
    name: "DDoS Attack",
    description: "Reduces all income by 20% for 60 seconds",
  },
  "double-value-block": {
    name: "Double Value Block",
    description: "Blocks double value effect",
  },
  "auto-hack-block": {
    name: "Auto Hack Block",
    description: "Completely blocks auto hack",
  },
  "critical-hack-block": {
    name: "Critical Hack Block",
    description: "Blocks critical hack",
  },
  "passive-income-block": {
    name: "Passive Income Block",
    description: "Blocks passive income",
  },
  "click-multiplier-block": {
    name: "Click Multiplier Block",
    description: "Blocks click multiplier",
  },
  "system-slowdown": {
    name: "System Slowdown",
    description: "Reduces all income by 40%",
  },
  "memory-leak": {
    name: "Memory Leak",
    description: "Gradually reduces click efficiency",
  },
  ransomware: {
    name: "Ransomware",
    description: "Blocks all upgrades until fixed",
  },
}

// Apply a random anti-effect based on time rather than clicks
export function applyRandomAntiEffect(
  currentEffects: AntiEffect[],
  totalEarned: number,
  chance = 0.01, // 1% chance by default
): AntiEffect | null {
  if (Math.random() > chance) return null

  // Get available effects that aren't already applied
  const availableEffects = antiEffects.filter((effect) => !currentEffects.some((e) => e.id === effect.id && e.applied))

  if (availableEffects.length === 0) return null

  // Filter effects based on player's progress
  let eligibleEffects = availableEffects

  if (totalEarned < 50000) {
    // Early game: only basic anti-effects
    eligibleEffects = availableEffects.filter((e) => ["virus", "glitch"].includes(e.id))
  } else if (totalEarned < 500000) {
    // Mid game: exclude the most severe effects
    eligibleEffects = availableEffects.filter((e) => !["ransomware", "system-slowdown"].includes(e.id))
  }

  if (eligibleEffects.length === 0) return null

  // Select a random effect
  const selectedEffect = { ...eligibleEffects[Math.floor(Math.random() * eligibleEffects.length)] }
  selectedEffect.applied = true

  if (selectedEffect.duration > 0) {
    selectedEffect.timeRemaining = selectedEffect.duration
  }

  return selectedEffect
}
