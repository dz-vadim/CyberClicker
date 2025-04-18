// Format large numbers to K, M, B, T notation
export function formatNumber(num: number): string {
  if (num < 1000) return num.toString()

  const units = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"]
  const unit = Math.floor(Math.log10(num) / 3)
  const value = num / Math.pow(1000, unit)

  return value.toFixed(value < 10 ? 1 : 0) + units[unit]
}

// Types
export type AntiEffect = {
  id: string
  duration: number
  startTime: number
}

export type GameSave = {
  money: number
  totalEarned: number
  clickCount: number
  moneyPerClick: number
  upgrades: Record<
    string,
    {
      level: number
      owned: boolean
    }
  >
  skins: Record<
    string,
    {
      owned: boolean
    }
  >
  activeSkin: string
  playerName: string
  unlockedRewards: string[]
  lastSaved: number
  // New fields
  robocoins: number
  totalRobocoins: number
  prestigeCount: number
  activeAntiEffects: AntiEffect[]
  language: "en" | "uk"
}

// Save game state to localStorage
export function saveGame(gameState: GameSave): void {
  try {
    localStorage.setItem("cyber-clicker-save", JSON.stringify(gameState))
    console.log("Game saved successfully")
  } catch (error) {
    console.error("Failed to save game:", error)
  }
}

// Load game state from localStorage
export function loadGame(): GameSave | null {
  try {
    const savedGame = localStorage.getItem("cyber-clicker-save")
    if (savedGame) {
      return JSON.parse(savedGame)
    }
    return null
  } catch (error) {
    console.error("Failed to load game:", error)
    return null
  }
}

// Reset game state (clear save)
export function resetGame(): void {
  try {
    localStorage.removeItem("cyber-clicker-save")
    console.log("Game reset successfully")
  } catch (error) {
    console.error("Failed to reset game:", error)
  }
}

// Save leaderboard entry
export function saveLeaderboardEntry(name: string, score: number): void {
  try {
    const leaderboard = getLeaderboard()

    // Check if player already exists
    const existingIndex = leaderboard.findIndex((entry) => entry.name === name)

    if (existingIndex >= 0) {
      // Update if new score is higher
      if (score > leaderboard[existingIndex].score) {
        leaderboard[existingIndex].score = score
      }
    } else {
      // Add new entry
      leaderboard.push({ name, score })
    }

    // Sort by score (descending)
    leaderboard.sort((a, b) => b.score - a.score)

    // Keep only top 100
    const topEntries = leaderboard.slice(0, 100)

    localStorage.setItem("cyber-clicker-leaderboard", JSON.stringify(topEntries))
  } catch (error) {
    console.error("Failed to save leaderboard entry:", error)
  }
}

// Get leaderboard
export function getLeaderboard(): Array<{ name: string; score: number }> {
  try {
    const leaderboard = localStorage.getItem("cyber-clicker-leaderboard")
    if (leaderboard) {
      return JSON.parse(leaderboard)
    }
    return []
  } catch (error) {
    console.error("Failed to get leaderboard:", error)
    return []
  }
}

