"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Clock,
  TrendingUp,
  Cpu,
  Layers,
  Repeat,
  Sparkles,
  Target,
  Coins,
  Gauge,
  Rocket,
  Zap,
  Shield,
} from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import AchievementNotification from "@/components/achievement-notification"
import type { Prize } from "@/components/fortune-wheel"
import FortuneWheel from "@/components/fortune-wheel"
import type { CaseReward } from "@/components/case-system"
import { saveGame, loadGame, resetGame, saveLeaderboardEntry } from "@/utils/save-system"
import { calculateRobocoinsGain, calculateBonusMultiplier } from "@/utils/prestige-system"
import { type AntiEffect, applyRandomAntiEffect, antiEffects } from "@/utils/anti-effects"
import type { Language } from "@/utils/language"
import MobileInterface from "@/components/mobile-interface"
import DesktopInterface from "@/components/desktop-interface"
import type { UpgradeId, SkinId, TabId, UpgradeCategory } from "@/types/game-types"
import { Settings } from "lucide-react"
import MusicPlayer from "@/components/music-player"
import AdminPanel from "@/components/admin-panel"
import CustomThemeCreator from "@/components/custom-theme-creator"

// Define the unlock requirements for advanced and special upgrades
const ADVANCED_REQUIREMENTS = {
  doubleValue: 15,
  autoClicker: 10,
  criticalClick: 5,
  passiveIncome: 1,
}

const SPECIAL_REQUIREMENTS = {
  clickMultiplier: 10,
  autoClickerSpeed: 8,
  clickCombo: 5,
  offlineEarnings: 3,
}

export default function MoneyClicker() {
  const [money, setMoney] = useState(0)
  const [totalEarned, setTotalEarned] = useState(0)
  const [clickCount, setClickCount] = useState(0)
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 })
  const [showEffect, setShowEffect] = useState(false)
  // Начальное значение клика теперь 1 вместо 500
  const [moneyPerClick, setMoneyPerClick] = useState(1)
  const [critText, setCritText] = useState("")
  const [showCrit, setShowCrit] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>("upgrades")
  const [activeCategory, setActiveCategory] = useState<UpgradeCategory>("basic")
  const { theme, setTheme } = useTheme()
  const [comboCount, setComboCount] = useState(0)
  const [comboTimer, setComboTimer] = useState(0)
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [showAchievement, setShowAchievement] = useState(false)
  const [achievementText, setAchievementText] = useState("")
  const [playerName, setPlayerName] = useState("Player")
  const [clickEffects, setClickEffects] = useState<string[]>([])
  const [visualEffects, setVisualEffects] = useState<string[]>([])
  const [bonusEffects, setBonusEffects] = useState<string[]>([])
  const [specialEffects, setSpecialEffects] = useState<string[]>([])
  const [temporaryMultiplier, setTemporaryMultiplier] = useState(1)
  const [multiplierTimeLeft, setMultiplierTimeLeft] = useState(0)
  const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null)
  const [lastSavedTime, setLastSavedTime] = useState(Date.now())
  const [showSettings, setShowSettings] = useState(false)
  // Add the following state variables
  const [robocoins, setRobocoins] = useState(0)
  const [totalRobocoins, setTotalRobocoins] = useState(0)
  const [prestigeCount, setPrestigeCount] = useState(0)
  const [activeAntiEffects, setActiveAntiEffects] = useState<AntiEffect[]>([])
  const [language, setLanguage] = useState<Language>("en")
  const [antiEffectChance, setAntiEffectChance] = useState(0.01) // 1% chance initially
  const [negativeEffects, setNegativeEffects] = useState<
    Array<{
      id: string
      name: string
      description: string
      effect: string
      duration: number
      fixCost: number
    }>
  >([])
  // Add state for music - default to off
  const [musicEnabled, setMusicEnabled] = useState(false)
  // Add state for unlocked cases
  const [unlockedCases, setUnlockedCases] = useState<string[]>(["basic"])
  // Счетчики открытых кейсов
  const [casesOpened, setCasesOpened] = useState<Record<string, number>>({
    basic: 0,
    premium: 0,
    elite: 0,
    legendary: 0,
  })
  // Add state for fortune wheel modal
  const [showFortuneWheel, setShowFortuneWheel] = useState(false)
  // Add state for interface type
  const [useDesktopInterface, setUseDesktopInterface] = useState(false)
  // Add state for desktop interface unlocked
  const [desktopInterfaceUnlocked, setDesktopInterfaceUnlocked] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  // Защита от антибонусов
  const [antiEffectProtection, setAntiEffectProtection] = useState(false)
  const [antiEffectProtectionTimeLeft, setAntiEffectProtectionTimeLeft] = useState(0)
  // Блокировка кнопки клика
  const [clickButtonBlocked, setClickButtonBlocked] = useState(false)
  // Создание собственной темы
  const [showCustomThemeCreator, setShowCustomThemeCreator] = useState(false)
  const [customThemes, setCustomThemes] = useState<
    Record<
      string,
      {
        name: string
        colors: {
          primary: string
          secondary: string
          accent: string
          background: string
        }
      }
    >
  >({})
  // Флаг для отслеживания действий пользователя, которые должны сбросить комбо
  const [userPerformedOtherAction, setUserPerformedOtherAction] = useState(false)

  // Update the upgrade costs to be more balanced
  const [upgrades, setUpgrades] = useState<
    Record<
      UpgradeId,
      {
        name: string
        description: string
        icon: React.ReactNode
        level: number
        baseCost: number
        costMultiplier: number
        owned: boolean
        effect: number
        effectMultiplier: number
        category: UpgradeCategory
        unlockCost: number
      }
    >
  >({
    doubleValue: {
      name: "Click Value",
      description: "Increase your credits per click by 1",
      icon: <TrendingUp className="h-5 w-5" />,
      level: 0,
      baseCost: 10, // Снижена с 5000 до 10
      costMultiplier: 1.5, // Lower multiplier for smoother progression
      owned: false,
      effect: 1, // Changed from 2 to 1 - adds 1 to multiplier instead of doubling
      effectMultiplier: 1.5,
      category: "basic",
      unlockCost: 0,
    },
    autoClicker: {
      name: "Auto Hack",
      description: "Automatically clicks once per second",
      icon: <Clock className="h-5 w-5" />,
      level: 0,
      baseCost: 50, // Снижена с 10000 до 50
      costMultiplier: 1.6,
      owned: false,
      effect: 1,
      effectMultiplier: 1,
      category: "basic",
      unlockCost: 0,
    },
    criticalClick: {
      name: "Critical Hack",
      description: "Chance to get 5x credits on click",
      icon: <Sparkles className="h-5 w-5" />,
      level: 0,
      baseCost: 100, // Снижена с 25000 до 100
      costMultiplier: 1.7,
      owned: false,
      effect: 0.05, // 5% chance per level
      effectMultiplier: 1.2,
      category: "basic",
      unlockCost: 0,
    },
    passiveIncome: {
      name: "Passive Income",
      description: "Earn credits over time without clicking",
      icon: <Repeat className="h-5 w-5" />,
      level: 0,
      baseCost: 200, // Снижена с 50000 до 200
      costMultiplier: 1.8,
      owned: false,
      effect: 0.5, // Снижена с 100 до 0.5
      effectMultiplier: 1.3,
      category: "basic",
      unlockCost: 0,
    },
    clickMultiplier: {
      name: "Click Multiplier",
      description: "Multiply your click value",
      icon: <Layers className="h-5 w-5" />,
      level: 0,
      baseCost: 100000, // Оставляем оригинальную цену
      costMultiplier: 1.9,
      owned: false,
      effect: 1.5, // 1.5x multiplier per level
      effectMultiplier: 1.1,
      category: "advanced",
      unlockCost: 200000, // Оставляем оригинальную цену
    },
    autoClickerSpeed: {
      name: "Auto Speed",
      description: "Increase auto hack speed",
      icon: <Cpu className="h-5 w-5" />,
      level: 0,
      baseCost: 250000, // Оставляем оригинальную цену
      costMultiplier: 2.0,
      owned: false,
      effect: 1, // +1 click per second per level
      effectMultiplier: 1.2,
      category: "advanced",
      unlockCost: 200000, // Оставляем оригинальную цену
    },
    clickCombo: {
      name: "Click Combo",
      description: "Consecutive clicks increase value",
      icon: <Gauge className="h-5 w-5" />,
      level: 0,
      baseCost: 500000, // Оставляем оригинальную цену
      costMultiplier: 2.1,
      owned: false,
      effect: 0.1, // 10% bonus per combo
      effectMultiplier: 1.1,
      category: "advanced",
      unlockCost: 200000, // Оставляем оригинальную цену
    },
    offlineEarnings: {
      name: "Offline Earnings",
      description: "Earn credits while away",
      icon: <Coins className="h-5 w-5" />,
      level: 0,
      baseCost: 1000000, // Оставляем оригинальную цену
      costMultiplier: 2.2,
      owned: false,
      effect: 0.1, // 10% of normal earnings per level
      effectMultiplier: 1.2,
      category: "advanced",
      unlockCost: 200000, // Оставляем оригинальную цену
    },
    luckyClicks: {
      name: "Lucky Clicks",
      description: "Random chance for bonus credits",
      icon: <Target className="h-5 w-5" />,
      level: 0,
      baseCost: 2500000, // Оставляем оригинальную цену
      costMultiplier: 2.3,
      owned: false,
      effect: 0.02, // 2% chance per level
      effectMultiplier: 1.3,
      category: "special",
      unlockCost: 5000000, // Оставляем оригинальную цену
    },
    megaClick: {
      name: "Mega Click",
      description: "Special ability: massive click value",
      icon: <Rocket className="h-5 w-5" />,
      level: 0,
      baseCost: 5000000, // Оставляем оригинальную цену
      costMultiplier: 2.5,
      owned: false,
      effect: 10, // 10x multiplier per level
      effectMultiplier: 1.5,
      category: "special",
      unlockCost: 5000000, // Оставляем оригинальную цену
    },
  })

  // Available skins with more options and higher price scaling
  const [skins, setSkins] = useState<
    Record<
      SkinId,
      {
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
    >
  >({
    cyberpunk: {
      name: "Cyberpunk",
      description: "Neon lights in the dark city",
      cost: 0, // Free default skin
      owned: true,
      unlockRequirement: null,
      colors: {
        primary: "#ff2a6d", // pink
        secondary: "#05d9e8", // blue
        accent: "#d300c5", // purple
        background: "#0d0221", // dark
      },
    },
    vaporwave: {
      name: "Vaporwave",
      description: "Retro aesthetics from digital dreams",
      cost: 100, // Снижена с 5000 до 100
      owned: false,
      unlockRequirement: "cyberpunk",
      colors: {
        primary: "#ff71ce", // pink
        secondary: "#01cdfe", // blue
        accent: "#b967ff", // purple
        background: "#05ffa1", // green
      },
    },
    retro: {
      name: "Retro",
      description: "8-bit nostalgia from the arcade era",
      cost: 250, // Снижена с 15000 до 250
      owned: false,
      unlockRequirement: "vaporwave",
      colors: {
        primary: "#f8b500", // yellow
        secondary: "#fc3c3c", // red
        accent: "#5d13e7", // purple
        background: "#22272e", // dark blue
      },
    },
    matrix: {
      name: "Matrix",
      description: "Enter the digital realm of code",
      cost: 500, // Снижена с 30000 до 500
      owned: false,
      unlockRequirement: "retro",
      colors: {
        primary: "#00ff41", // green
        secondary: "#008f11", // dark green
        accent: "#003b00", // darker green
        background: "#0d0208", // almost black
      },
    },
    neon: {
      name: "Neon City",
      description: "Bright lights of the metropolis",
      cost: 1000, // Снижена с 60000 до 1000
      owned: false,
      unlockRequirement: "matrix",
      colors: {
        primary: "#fe00fe", // magenta
        secondary: "#00ffff", // cyan
        accent: "#ffff00", // yellow
        background: "#121212", // dark
      },
    },
    synthwave: {
      name: "Synthwave",
      description: "Retro-futuristic sunset vibes",
      cost: 2000, // Снижена с 120000 до 2000
      owned: false,
      unlockRequirement: "neon",
      colors: {
        primary: "#fc28a8", // pink
        secondary: "#03edf9", // blue
        accent: "#ff8b00", // orange
        background: "#2b213a", // dark purple
      },
    },
    outrun: {
      name: "Outrun",
      description: "Fast cars and neon grids",
      cost: 4000, // Снижена с 250000 до 4000
      owned: false,
      unlockRequirement: "synthwave",
      colors: {
        primary: "#ff9933", // orange
        secondary: "#ff00ff", // magenta
        accent: "#0066ff", // blue
        background: "#000033", // dark blue
      },
    },
    holographic: {
      name: "Holographic",
      description: "Shimmering iridescent interface",
      cost: 8000, // Снижена с 500000 до 8000
      owned: false,
      unlockRequirement: "outrun",
      colors: {
        primary: "#88ffff", // cyan
        secondary: "#ff88ff", // pink
        accent: "#ffff88", // yellow
        background: "#111122", // dark blue
      },
    },
    glitch: {
      name: "Glitch",
      description: "Corrupted data aesthetic",
      cost: 15000, // Снижена с 1000000 до 15000
      owned: false,
      unlockRequirement: "holographic",
      colors: {
        primary: "#ff0000", // red
        secondary: "#00ff00", // green
        accent: "#0000ff", // blue
        background: "#000000", // black
      },
    },
    quantum: {
      name: "Quantum",
      description: "Beyond reality interface",
      cost: 30000, // Снижена с 2000000 до 30000
      owned: false,
      unlockRequirement: "glitch",
      colors: {
        primary: "#c0ffee", // teal
        secondary: "#facade", // pink
        accent: "#bada55", // lime
        background: "#010101", // near black
      },
    },
    // New skins with higher price scaling
    cosmic: {
      name: "Cosmic",
      description: "Explore the depths of the universe",
      cost: 60000, // Снижена с 5000000 до 60000
      owned: false,
      unlockRequirement: "quantum",
      colors: {
        primary: "#9d00ff", // purple
        secondary: "#00aaff", // blue
        accent: "#ffcc00", // gold
        background: "#000022", // deep space
      },
    },
    binary: {
      name: "Binary",
      description: "Pure digital existence",
      cost: 120000, // Снижена с 10000000 до 120000
      owned: false,
      unlockRequirement: "cosmic",
      colors: {
        primary: "#ffffff", // white
        secondary: "#000000", // black
        accent: "#00ff00", // green
        background: "#111111", // dark gray
      },
    },
    hyperspace: {
      name: "Hyperspace",
      description: "Beyond the limits of reality",
      cost: 250000, // Снижена с 25000000 до 250000
      owned: false,
      unlockRequirement: "binary",
      colors: {
        primary: "#ff00aa", // hot pink
        secondary: "#00ffcc", // teal
        accent: "#ffff00", // yellow
        background: "#110022", // deep purple
      },
    },
    digital: {
      name: "Digital Void",
      description: "The space between data",
      cost: 500000, // Снижена с 50000000 до 500000
      owned: false,
      unlockRequirement: "hyperspace",
      colors: {
        primary: "#0088ff", // blue
        secondary: "#00ff88", // green
        accent: "#ff0088", // pink
        background: "#000011", // near black
      },
    },
    ethereal: {
      name: "Ethereal",
      description: "Transcend physical limitations",
      cost: 1000000, // Снижена с 100000000 до 1000000
      owned: false,
      unlockRequirement: "digital",
      colors: {
        primary: "#aaccff", // light blue
        secondary: "#ffaacc", // light pink
        accent: "#ffffaa", // light yellow
        background: "#112233", // dark blue
      },
    },
  })

  // Active skin
  const [activeSkin, setActiveSkin] = useState<SkinId>("cyberpunk")

  // Check if categories are unlocked based on upgrade levels
  const isAdvancedUnlocked = useMemo(() => {
    return (
      upgrades.doubleValue.level >= ADVANCED_REQUIREMENTS.doubleValue &&
      upgrades.autoClicker.level >= ADVANCED_REQUIREMENTS.autoClicker &&
      upgrades.criticalClick.level >= ADVANCED_REQUIREMENTS.criticalClick &&
      upgrades.passiveIncome.level >= ADVANCED_REQUIREMENTS.passiveIncome
    )
  }, [upgrades])

  const isSpecialUnlocked = useMemo(() => {
    return (
      isAdvancedUnlocked &&
      upgrades.clickMultiplier.level >= SPECIAL_REQUIREMENTS.clickMultiplier &&
      upgrades.autoClickerSpeed.level >= SPECIAL_REQUIREMENTS.autoClickerSpeed &&
      upgrades.clickCombo.level >= SPECIAL_REQUIREMENTS.clickCombo &&
      upgrades.offlineEarnings.level >= SPECIAL_REQUIREMENTS.offlineEarnings
    )
  }, [isAdvancedUnlocked, upgrades])

  // Check if desktop interface should be unlocked (all skins owned)
  const checkDesktopInterfaceUnlock = useCallback(() => {
    const allSkinsOwned = Object.values(skins).every((skin) => skin.owned)
    if (allSkinsOwned && !desktopInterfaceUnlocked) {
      setDesktopInterfaceUnlocked(true)
      showAchievementNotification(
        language === "en"
          ? "Desktop Interface Unlocked! You can now switch between mobile and desktop layouts."
          : "Розблоковано десктопний інтерфейс! Тепер ви можете перемикатися між мобільним та десктопним макетами.",
      )
    }
  }, [skins, desktopInterfaceUnlocked, language])

  // Load game on initial render
  useEffect(() => {
    const loadSavedGame = () => {
      const savedGame = loadGame()
      if (savedGame) {
        // Set basic stats
        setMoney(savedGame.money)
        setTotalEarned(savedGame.totalEarned)
        setClickCount(savedGame.clickCount)
        setMoneyPerClick(savedGame.moneyPerClick)
        setPlayerName(savedGame.playerName || "Player")

        // Set prestige data
        if (savedGame.robocoins !== undefined) {
          setRobocoins(savedGame.robocoins)
          setTotalRobocoins(savedGame.totalRobocoins || savedGame.robocoins)
          setPrestigeCount(savedGame.prestigeCount || 0)
        }

        // Set language
        if (savedGame.language) {
          setLanguage(savedGame.language)
        }

        // Set active anti-effects
        if (savedGame.activeAntiEffects) {
          setActiveAntiEffects(savedGame.activeAntiEffects)
        }

        // Set music preference (default to off if not set)
        if (savedGame.musicEnabled !== undefined) {
          setMusicEnabled(savedGame.musicEnabled)
        }

        // Set unlocked cases
        if (savedGame.unlockedCases && savedGame.unlockedCases.length > 0) {
          setUnlockedCases(savedGame.unlockedCases)
        }

        // Set cases opened count
        if (savedGame.casesOpened) {
          setCasesOpened(savedGame.casesOpened)
        }

        // Set desktop interface preference
        if (savedGame.useDesktopInterface !== undefined) {
          setUseDesktopInterface(savedGame.useDesktopInterface)
        }

        // Set desktop interface unlock status
        if (savedGame.desktopInterfaceUnlocked !== undefined) {
          setDesktopInterfaceUnlocked(savedGame.desktopInterfaceUnlocked)
        }

        // Set custom themes
        if (savedGame.customThemes) {
          setCustomThemes(savedGame.customThemes)
        }

        // Set upgrades
        setUpgrades((prev) => {
          const newUpgrades = { ...prev }
          Object.entries(savedGame.upgrades).forEach(([id, data]) => {
            if (newUpgrades[id as UpgradeId]) {
              newUpgrades[id as UpgradeId].level = data.level
              newUpgrades[id as UpgradeId].owned = data.owned
            }
          })
          return newUpgrades
        })

        // Set skins
        setSkins((prev) => {
          const newSkins = { ...prev }
          Object.entries(savedGame.skins).forEach(([id, data]) => {
            if (newSkins[id as SkinId]) {
              newSkins[id as SkinId].owned = data.owned
            }
          })
          return newSkins
        })

        // Set active skin
        if (savedGame.activeSkin && skins[savedGame.activeSkin as SkinId]) {
          setActiveSkin(savedGame.activeSkin as SkinId)
        }

        // Set unlocked rewards
        if (savedGame.unlockedRewards) {
          const clickEffs: string[] = []
          const visualEffs: string[] = []
          const bonusEffs: string[] = []
          const specialEffs: string[] = []

          savedGame.unlockedRewards.forEach((id) => {
            // This is a simplified version - in a real implementation,
            // you'd need to map reward IDs to their types
            if (id.includes("click")) clickEffs.push(id)
            else if (id.includes("visual")) visualEffs.push(id)
            else if (id.includes("bonus")) bonusEffs.push(id)
            else if (id.includes("special")) specialEffs.push(id)
          })

          setClickEffects(clickEffs)
          setVisualEffects(visualEffs)
          setBonusEffects(bonusEffs)
          setSpecialEffects(specialEffs)
        }

        // Calculate offline earnings if applicable
        const offlineTime = Math.floor((Date.now() - savedGame.lastSaved) / 1000)
        if (offlineTime > 60 && upgrades.offlineEarnings.level > 0) {
          const offlineRate = upgrades.passiveIncome.level * upgrades.passiveIncome.effect
          const offlineEfficiency = upgrades.offlineEarnings.level * upgrades.offlineEarnings.effect
          const offlineEarnings = Math.floor(offlineTime * offlineRate * offlineEfficiency)

          if (offlineEarnings > 0) {
            setMoney((prev) => prev + offlineEarnings)
            setTotalEarned((prev) => prev + offlineEarnings)

            // Show notification
            setTimeout(() => {
              showAchievementNotification(`Earned ¥${offlineEarnings.toLocaleString()} while away!`)
            }, 1000)
          }
        }

        showAchievementNotification("Game loaded successfully!")
      }
    }

    loadSavedGame()

    // Set up auto-save with a proper interval
    const saveInterval = setInterval(() => {
      saveGameState()
      setLastSavedTime(Date.now())
      console.log("Auto-saved game at", new Date().toLocaleTimeString())
    }, 60000) // Auto-save every minute

    setAutoSaveInterval(saveInterval)

    return () => {
      if (saveInterval) clearInterval(saveInterval)
    }
  }, [])

  // Check for desktop interface unlock when skins change
  useEffect(() => {
    checkDesktopInterfaceUnlock()
  }, [skins, checkDesktopInterfaceUnlock])

  // Save game state
  const saveGameState = useCallback(() => {
    const gameState = {
      money,
      totalEarned,
      clickCount,
      moneyPerClick,
      upgrades: Object.entries(upgrades).reduce(
        (acc, [id, upgrade]) => {
          acc[id] = {
            level: upgrade.level,
            owned: upgrade.owned,
          }
          return acc
        },
        {} as Record<string, { level: number; owned: boolean }>,
      ),
      skins: Object.entries(skins).reduce(
        (acc, [id, skin]) => {
          acc[id] = {
            owned: skin.owned,
          }
          return acc
        },
        {} as Record<string, { owned: boolean }>,
      ),
      activeSkin,
      playerName,
      unlockedRewards: [...clickEffects, ...visualEffects, ...bonusEffects, ...specialEffects],
      lastSaved: Date.now(),
      // New fields
      robocoins,
      totalRobocoins,
      prestigeCount,
      activeAntiEffects,
      language,
      unlockedCases,
      casesOpened,
      musicEnabled,
      useDesktopInterface,
      desktopInterfaceUnlocked,
      customThemes,
    }

    saveGame(gameState)
    saveLeaderboardEntry(playerName, robocoins)
    setLastSavedTime(Date.now())
    showAchievementNotification(language === "en" ? "Game saved!" : "Гру збережено!")
  }, [
    money,
    totalEarned,
    clickCount,
    moneyPerClick,
    upgrades,
    skins,
    activeSkin,
    playerName,
    clickEffects,
    visualEffects,
    bonusEffects,
    specialEffects,
    robocoins,
    totalRobocoins,
    prestigeCount,
    activeAntiEffects,
    language,
    unlockedCases,
    casesOpened,
    musicEnabled,
    useDesktopInterface,
    desktopInterfaceUnlocked,
    customThemes,
  ])

  // Reset game
  const resetGameState = () => {
    if (confirm("Are you sure you want to reset your game? All progress will be lost!")) {
      resetGame()
      window.location.reload()
    }
  }

  const updateGameState = (newState: any) => {
    // Обновляем все состояния из админ-панели
    setMoney(newState.money)
    setTotalEarned(newState.totalEarned)
    setClickCount(newState.clickCount)
    setMoneyPerClick(newState.moneyPerClick)
    setPlayerName(newState.playerName)
    setRobocoins(newState.robocoins)
    setTotalRobocoins(newState.totalRobocoins)
    setPrestigeCount(newState.prestigeCount)
    setLanguage(newState.language)
    setMusicEnabled(newState.musicEnabled)
    setUseDesktopInterface(newState.useDesktopInterface)
    setDesktopInterfaceUnlocked(newState.desktopInterfaceUnlocked)
    setUpgrades(newState.upgrades)
    setSkins(newState.skins)
    setActiveSkin(newState.activeSkin)
    setUnlockedCases(newState.unlockedCases)
    setCasesOpened(newState.casesOpened || { basic: 0, premium: 0, elite: 0, legendary: 0 })
    setClickEffects(newState.clickEffects || [])
    setVisualEffects(newState.visualEffects || [])
    setBonusEffects(newState.bonusEffects || [])
    setSpecialEffects(newState.specialEffects || [])
    setCustomThemes(newState.customThemes || {})

    // Сохраняем изменения
    saveGameState()
  }

  // Auto-clicker effect
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (upgrades.autoClicker.level > 0) {
      // Check if auto-clicker is blocked by anti-effect
      const autoClickerBlocked = activeAntiEffects.some((e) => e.id === "auto-hack-block")

      if (!autoClickerBlocked) {
        // Calculate clicks per second with bonuses
        let clicksPerSecond =
          upgrades.autoClicker.level +
          (upgrades.autoClickerSpeed.level > 0 ? upgrades.autoClickerSpeed.level * upgrades.autoClickerSpeed.effect : 0)

        // Apply special effects if any
        if (specialEffects.includes("elite-5")) {
          clicksPerSecond *= 1.2 // 20% faster from Time Warp
        }

        if (specialEffects.includes("legendary-5")) {
          clicksPerSecond *= 1.3 // 30% faster from Time Dilation
        }

        // Apply anti-effect reduction
        const autoAntiEffect = activeAntiEffects.find((e) => e.type === "auto")
        if (autoAntiEffect) {
          clicksPerSecond *= 1 - autoAntiEffect.severity
        }

        interval = setInterval(() => {
          const autoClickValue = moneyPerClick * temporaryMultiplier

          // Apply income anti-effect
          let finalValue = autoClickValue
          const incomeAntiEffect = activeAntiEffects.find((e) => e.type === "income")
          if (incomeAntiEffect) {
            finalValue *= 1 - incomeAntiEffect.severity
          }

          addMoney(finalValue)
          setClickCount((prev) => prev + 1)
        }, 1000 / clicksPerSecond)
      }
    }

    return () => clearInterval(interval)
  }, [
    upgrades.autoClicker.level,
    upgrades.autoClickerSpeed.level,
    moneyPerClick,
    temporaryMultiplier,
    specialEffects,
    negativeEffects,
    activeAntiEffects,
  ])

  // Passive income effect
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (upgrades.passiveIncome.level > 0) {
      // Check if passive income is blocked by anti-effect
      const passiveIncomeBlocked = activeAntiEffects.some((e) => e.id === "passive-income-block")

      if (!passiveIncomeBlocked) {
        let incomePerSecond = upgrades.passiveIncome.level * upgrades.passiveIncome.effect

        // Apply bonuses if any
        if (bonusEffects.includes("legendary-3")) {
          incomePerSecond *= 1.25 // 25% more from Golden Touch
        }

        // Check if passive income is blocked by anti-effects
        const passiveAntiEffect = activeAntiEffects.find((e) => e.type === "passive")

        if (!passiveAntiEffect) {
          interval = setInterval(() => {
            // Apply income anti-effect
            let finalIncome = incomePerSecond * temporaryMultiplier
            const incomeAntiEffect = activeAntiEffects.find((e) => e.type === "income")
            if (incomeAntiEffect) {
              finalIncome *= 1 - incomeAntiEffect.severity
            }

            addMoney(finalIncome)
          }, 1000)
        }
      }
    }

    return () => clearInterval(interval)
  }, [upgrades.passiveIncome.level, temporaryMultiplier, bonusEffects, activeAntiEffects])

  // Combo timer effect
  useEffect(() => {
    if (comboCount > 0 && !comboTimerRef.current) {
      comboTimerRef.current = setInterval(() => {
        setComboTimer((prev) => {
          if (prev <= 0) {
            clearInterval(comboTimerRef.current as NodeJS.Timeout)
            comboTimerRef.current = null
            setComboCount(0)
            return 0
          }
          return prev - 0.1
        })
      }, 100)
    }

    return () => {
      if (comboTimerRef.current) {
        clearInterval(comboTimerRef.current)
      }
    }
  }, [comboCount])

  // Reset combo when user performs other actions
  useEffect(() => {
    if (userPerformedOtherAction && comboCount > 0) {
      setComboCount(0)
      setComboTimer(0)
      if (comboTimerRef.current) {
        clearInterval(comboTimerRef.current)
        comboTimerRef.current = null
      }
      setUserPerformedOtherAction(false)
    }
  }, [userPerformedOtherAction, comboCount])

  // Temporary multiplier effect
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (multiplierTimeLeft > 0) {
      interval = setInterval(() => {
        setMultiplierTimeLeft((prev) => {
          if (prev <= 1) {
            setTemporaryMultiplier(1)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [multiplierTimeLeft])

  // Anti-effect protection timer
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (antiEffectProtectionTimeLeft > 0) {
      setAntiEffectProtection(true)

      interval = setInterval(() => {
        setAntiEffectProtectionTimeLeft((prev) => {
          if (prev <= 1) {
            setAntiEffectProtection(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [antiEffectProtectionTimeLeft])

  // Helper function to add money and track total earned
  const addMoney = (amount: number) => {
    // Apply bonuses from case rewards
    let finalAmount = amount

    if (bonusEffects.includes("premium-3")) {
      finalAmount *= 1.1 // 10% more from Credit Boost
    }

    if (bonusEffects.includes("legendary-3")) {
      finalAmount *= 1.25 // 25% more from Golden Touch
    }

    // Apply prestige multiplier
    const prestigeMultiplier = calculateBonusMultiplier(robocoins)
    finalAmount *= prestigeMultiplier

    // Apply negative effects
    if (negativeEffects.some((e) => e.effect === "income-50")) {
      finalAmount *= 0.5 // 50% reduction
    }

    setMoney((prev) => prev + finalAmount)
    setTotalEarned((prev) => prev + finalAmount)

    // Check for unlocks based on total earned
    if (
      !isAdvancedUnlocked &&
      upgrades.doubleValue.level >= ADVANCED_REQUIREMENTS.doubleValue &&
      upgrades.autoClicker.level >= ADVANCED_REQUIREMENTS.autoClicker &&
      upgrades.criticalClick.level >= ADVANCED_REQUIREMENTS.criticalClick &&
      upgrades.passiveIncome.level >= ADVANCED_REQUIREMENTS.passiveIncome
    ) {
      showAchievementNotification(
        language === "en" ? "Advanced Upgrades Unlocked!" : "Розблоковано просунуті покращення!",
      )
    }

    if (
      isAdvancedUnlocked &&
      !isSpecialUnlocked &&
      upgrades.clickMultiplier.level >= SPECIAL_REQUIREMENTS.clickMultiplier &&
      upgrades.autoClickerSpeed.level >= SPECIAL_REQUIREMENTS.autoClickerSpeed &&
      upgrades.clickCombo.level >= SPECIAL_REQUIREMENTS.clickCombo &&
      upgrades.offlineEarnings.level >= SPECIAL_REQUIREMENTS.offlineEarnings
    ) {
      showAchievementNotification(
        language === "en" ? "Special Upgrades Unlocked!" : "Розблоковано спеціальні покращення!",
      )
    }

    // Random chance to generate a negative effect
    if (Math.random() < 0.01 && !antiEffectProtection) {
      generateAntiEffect()
    }
  }

  const showAchievementNotification = (text: string) => {
    setAchievementText(text)
    setShowAchievement(true)
    setTimeout(() => setShowAchievement(false), 3000)
  }

  const handleClick = (e: React.MouseEvent) => {
    // Check if click button is blocked
    if (clickButtonBlocked) {
      showAchievementNotification(
        language === "en"
          ? "Click button is blocked! Fix the anti-effect to continue clicking."
          : "Кнопка кліку заблокована! Виправте анти-ефект, щоб продовжити клікати.",
      )
      return
    }

    // Skip every 3rd click if that negative effect is active
    if (negativeEffects.some((e) => e.effect === "click-skip-3")) {
      const newClickCount = clickCount + 1
      if (newClickCount % 3 === 0) {
        setClickCount(newClickCount)
        return // Skip this click
      }
    }

    // Get click position for the effect
    const rect = e.currentTarget.getBoundingClientRect()
    setClickPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })

    // Handle combo system
    let comboMultiplier = 1
    if (upgrades.clickCombo.level > 0) {
      // Check if combo is blocked by anti-effects
      const comboAntiEffect = activeAntiEffects.find((e) => e.type === "combo")

      if (!comboAntiEffect) {
        setComboCount((prev) => prev + 1)
        setComboTimer(3) // Reset timer to 3 seconds

        comboMultiplier = 1 + comboCount * upgrades.clickCombo.level * upgrades.clickCombo.effect
      }
    }

    // Apply temporary multiplier if active
    comboMultiplier *= temporaryMultiplier

    // Check for critical click
    let earnedMoney = moneyPerClick * comboMultiplier
    let critChance = upgrades.criticalClick.level * upgrades.criticalClick.effect

    // Apply bonus from case rewards if any
    if (bonusEffects.includes("basic-4")) {
      critChance += 0.05 // +5% from Lucky Charm
    }

    // Check if critical clicks are blocked by anti-effects
    const criticalAntiEffect = activeAntiEffects.find((e) => e.type === "critical")
    const isCritical = !criticalAntiEffect && Math.random() < critChance

    if (isCritical) {
      earnedMoney *= 5
      setCritText(`CRITICAL! +¥${Math.floor(earnedMoney)}`)
      setShowCrit(true)
      setTimeout(() => setShowCrit(false), 1000)
    }

    // Check for lucky click
    const luckyChance = upgrades.luckyClicks.level * upgrades.luckyClicks.effect
    const isLucky = Math.random() < luckyChance

    if (isLucky) {
      const luckyBonus = Math.floor(earnedMoney * 10) // 10x bonus
      earnedMoney += luckyBonus

      setTimeout(
        () => {
          setCritText(`LUCKY! +¥${luckyBonus}`)
          setShowCrit(true)
          setTimeout(() => setShowCrit(false), 1000)
        },
        isCritical ? 1200 : 0,
      )
    }

    // Check for mega click (if owned)
    if (upgrades.megaClick.level > 0 && Math.random() < 0.01) {
      // 1% chance
      const megaMultiplier = upgrades.megaClick.level * upgrades.megaClick.effect
      earnedMoney *= megaMultiplier

      setTimeout(
        () => {
          setCritText(`MEGA! +¥${Math.floor(earnedMoney)}`)
          setShowCrit(true)
          setTimeout(() => setShowCrit(false), 1000)
        },
        isCritical || isLucky ? 1200 : 0,
      )
    }

    // Check for Temporal Shift special effect
    if (specialEffects.includes("elite-5") && Math.random() < 0.05) {
      // 5% chance
      earnedMoney *= 2

      setTimeout(
        () => {
          setCritText(`TEMPORAL SHIFT! +¥${Math.floor(earnedMoney)}`)
          setShowCrit(true)
          setTimeout(() => setShowCrit(false), 1000)
        },
        isCritical || isLucky ? 1400 : 0,
      )
    }

    // Check for anti-effects
    let antiEffectMultiplier = 1
    const clickAntiEffect = activeAntiEffects.find((e) => e.type === "click")
    const incomeAntiEffect = activeAntiEffects.find((e) => e.type === "income")

    if (clickAntiEffect) {
      antiEffectMultiplier *= 1 - clickAntiEffect.severity
    }

    if (incomeAntiEffect) {
      antiEffectMultiplier *= 1 - incomeAntiEffect.severity
    }

    // Apply anti-effect multiplier
    earnedMoney *= antiEffectMultiplier

    // Add money and increment click count
    addMoney(earnedMoney)
    setClickCount((prev) => prev + 1)

    // Trigger click effect
    setShowEffect(true)
    setTimeout(() => setShowEffect(false), 500)

    // Add a chance to trigger a new anti-effect
    if (!antiEffectProtection) {
      handleAntiEffects()
    }
  }

  const calculateUpgradeCost = (upgradeId: UpgradeId) => {
    const upgrade = upgrades[upgradeId]
    let cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level))

    // Apply discount if Efficiency Module is active
    if (bonusEffects.includes("elite-3")) {
      cost = Math.floor(cost * 0.85) // 15% discount
    }

    return cost
  }

  const buyUpgrade = (upgradeId: UpgradeId) => {
    // Mark that user performed an action that should reset combo
    setUserPerformedOtherAction(true)

    const upgrade = upgrades[upgradeId]
    const cost = calculateUpgradeCost(upgradeId)

    // Check if upgrades are blocked by ransomware
    const upgradesBlocked = activeAntiEffects.some((e) => e.id === "ransomware")
    if (upgradesBlocked) {
      showAchievementNotification(
        language === "en"
          ? "Upgrades are blocked by ransomware! Fix it first."
          : "Покращення заблоковані програмою-вимагачем! Спочатку виправте це.",
      )
      return
    }

    // Check if specific upgrade is blocked
    const upgradeBlocked = activeAntiEffects.some((e) => e.type === "upgrade" && e.targetUpgrade === upgradeId)
    if (upgradeBlocked) {
      showAchievementNotification(
        language === "en"
          ? `${upgrade.name} is blocked by an anti-effect! Fix it first.`
          : `${upgrade.name} заблоковано анти-ефектом! Спочатку виправте це.`,
      )
      return
    }

    if (money >= cost) {
      setMoney((prev) => prev - cost)

      setUpgrades((prev) => ({
        ...prev,
        [upgradeId]: {
          ...prev[upgradeId],
          level: prev[upgradeId].level + 1,
          owned: true,
        },
      }))

      // Apply upgrade effects
      if (upgradeId === "doubleValue") {
        // Увеличиваем moneyPerClick на effect вместо умножения
        setMoneyPerClick((prev) => prev + upgrade.effect)
      } else if (upgradeId === "clickMultiplier") {
        setMoneyPerClick((prev) => prev * upgrade.effect)
      }

      // Show achievement for first purchase of each category
      if (upgrade.level === 0) {
        if (upgrade.category === "advanced") {
          showAchievementNotification(`Advanced Upgrade: ${upgrade.name} Purchased!`)
        } else if (upgrade.category === "special") {
          showAchievementNotification(`Special Upgrade: ${upgrade.name} Purchased!`)
        }
      }

      // Auto-save after significant purchase
      if (cost > 10000) {
        saveGameState()
      }
    }
  }

  const buySkin = (skinId: SkinId) => {
    // Mark that user performed an action that should reset combo
    setUserPerformedOtherAction(true)

    const skin = skins[skinId]

    if (money >= skin.cost && !skin.owned) {
      setMoney((prev) => prev - skin.cost)

      setSkins((prev) => ({
        ...prev,
        [skinId]: {
          ...prev[skinId],
          owned: true,
        },
      }))

      showAchievementNotification(`New Skin Unlocked: ${skin.name}!`)

      // Check if all skins are now owned to unlock desktop interface
      checkDesktopInterfaceUnlock()

      // Auto-save after skin purchase
      saveGameState()
    }
  }

  const applySkin = (skinId: SkinId) => {
    // Mark that user performed an action that should reset combo
    setUserPerformedOtherAction(true)

    if (skins[skinId].owned) {
      setActiveSkin(skinId)

      // Apply theme colors
      document.documentElement.style.setProperty("--primary", skins[skinId].colors.primary)
      document.documentElement.style.setProperty("--secondary", skins[skinId].colors.secondary)
      document.documentElement.style.setProperty("--accent", skins[skinId].colors.accent)

      // Set theme based on skin
      if (skinId === "vaporwave" || skinId === "retro") {
        setTheme("light")
      } else {
        setTheme("dark")
      }
    }
  }

  // Apply custom theme
  const applyCustomTheme = (themeId: string) => {
    // Mark that user performed an action that should reset combo
    setUserPerformedOtherAction(true)

    if (customThemes[themeId]) {
      const theme = customThemes[themeId]

      // Apply theme colors
      document.documentElement.style.setProperty("--primary", theme.colors.primary)
      document.documentElement.style.setProperty("--secondary", theme.colors.secondary)
      document.documentElement.style.setProperty("--accent", theme.colors.accent)

      // Set dark theme
      setTheme("dark")

      showAchievementNotification(
        language === "en" ? `Applied custom theme: ${theme.name}` : `Застосовано власну тему: ${theme.name}`,
      )
    }
  }

  // Save custom theme
  const saveCustomTheme = (
    name: string,
    colors: {
      primary: string
      secondary: string
      accent: string
      background: string
    },
  ) => {
    // Mark that user performed an action that should reset combo
    setUserPerformedOtherAction(true)

    const themeId = `custom-${Date.now()}`

    setCustomThemes((prev) => ({
      ...prev,
      [themeId]: {
        name,
        colors,
      },
    }))

    showAchievementNotification(
      language === "en" ? `Custom theme "${name}" saved!` : `Власну тему "${name}" збережено!`,
    )

    setShowCustomThemeCreator(false)
    saveGameState()
  }

  // Handle fortune wheel spin
  const handleWheelSpin = (prize: Prize) => {
    // Mark that user performed an action that should reset combo
    setUserPerformedOtherAction(true)

    switch (prize.type) {
      case "money":
        addMoney(prize.value)
        showAchievementNotification(`Won ¥${prize.value.toLocaleString()}!`)
        break
      case "multiplier":
        setTemporaryMultiplier(prize.value)
        setMultiplierTimeLeft(prize.value === 2 ? 60 : 30) // 1 min or 30 sec
        showAchievementNotification(`${prize.value}x Multiplier for ${prize.value === 2 ? "60" : "30"} seconds!`)
        break
      case "boost":
        // Apply boost to auto clickers
        if (upgrades.autoClicker.level > 0) {
          setTemporaryMultiplier(prize.value)
          setMultiplierTimeLeft(120) // 2 minutes
          showAchievementNotification(`Auto Hack boosted by ${(prize.value - 1) * 100}% for 2 minutes!`)
        } else {
          // Fallback if no auto clickers
          addMoney(2000)
          showAchievementNotification(`No Auto Hack yet! Got ¥2,000 instead.`)
        }
        break
      case "special":
        // Random special prize
        const specialPrizes = [
          // Lucky day - all clicks are critical for 30 seconds
          () => {
            setTemporaryMultiplier(5)
            setMultiplierTimeLeft(30)
            showAchievementNotification(`Lucky Day! All clicks are 5x for 30 seconds!`)
          },
          // Anti-effect protection
          () => {
            setAntiEffectProtection(true)
            setAntiEffectProtectionTimeLeft(300) // 5 minutes
            showAchievementNotification(
              language === "en"
                ? "Anti-Effect Shield activated! Protected from anti-effects for 5 minutes."
                : "Щит від анти-ефектів активовано! Захист від анти-ефектів на 5 хвилин.",
            )
          },
          // Clear all anti-effects
          () => {
            if (activeAntiEffects.length > 0) {
              setActiveAntiEffects([])
              setClickButtonBlocked(false)
              showAchievementNotification(
                language === "en"
                  ? "System Cleanup! All anti-effects have been removed."
                  : "Очищення системи! Всі анти-ефекти видалено.",
              )
            } else {
              addMoney(5000)
              showAchievementNotification(
                language === "en"
                  ? "No anti-effects to clean! Got ¥5,000 instead."
                  : "Немає анти-ефектів для очищення! Отримано ¥5,000.",
              )
            }
          },
        ]

        // Choose random special prize
        const randomPrize = specialPrizes[Math.floor(Math.random() * specialPrizes.length)]
        randomPrize()
        break
    }
  }

  // Handle case opening
  const handleCaseOpen = (reward: CaseReward) => {
    // Mark that user performed an action that should reset combo
    setUserPerformedOtherAction(true)

    // Определяем стоимость кейса
    let caseCost = 0
    let caseType = ""

    if (reward.id.startsWith("basic")) {
      caseCost = 5000
      caseType = "basic"
    } else if (reward.id.startsWith("premium")) {
      caseCost = 25000
      caseType = "premium"
    } else if (reward.id.startsWith("elite")) {
      caseCost = 100000
      caseType = "elite"
    } else if (reward.id.startsWith("legendary")) {
      caseCost = 500000
      caseType = "legendary"
    }

    // Снимаем деньги
    setMoney((prev) => prev - caseCost)

    // Увеличиваем счетчик открытых кейсов
    setCasesOpened((prev) => ({
      ...prev,
      [caseType]: (prev[caseType] || 0) + 1,
    }))

    // Проверяем, нужно ли разблокировать следующий тип кейсов
    if (caseType === "basic" && casesOpened.basic + 1 >= 10 && !unlockedCases.includes("premium")) {
      setUnlockedCases((prev) => [...prev, "premium"])
      showAchievementNotification(
        language === "en"
          ? "Premium Cases Unlocked! You can now purchase premium cases."
          : "Преміум кейси розблоковано! Тепер ви можете купувати преміум кейси.",
      )
    } else if (caseType === "premium" && casesOpened.premium + 1 >= 10 && !unlockedCases.includes("elite")) {
      setUnlockedCases((prev) => [...prev, "elite"])
      showAchievementNotification(
        language === "en"
          ? "Elite Cases Unlocked! You can now purchase elite cases."
          : "Елітні кейси розблоковано! Тепер ви можете купувати елітні кейси.",
      )
    } else if (caseType === "elite" && casesOpened.elite + 1 >= 10 && !unlockedCases.includes("legendary")) {
      setUnlockedCases((prev) => [...prev, "legendary"])
      showAchievementNotification(
        language === "en"
          ? "Legendary Cases Unlocked! You can now purchase legendary cases."
          : "Легендарні кейси розблоковано! Тепер ви можете купувати легендарні кейси.",
      )
    }

    // Добавляем награду в соответствующую категорию
    switch (reward.type) {
      case "clickEffect":
        setClickEffects((prev) => [...prev, reward.id])
        break
      case "visualEffect":
        setVisualEffects((prev) => [...prev, reward.id])
        break
      case "bonus":
        setBonusEffects((prev) => [...prev, reward.id])
        break
      case "special":
        setSpecialEffects((prev) => [...prev, reward.id])
        break
    }

    // Шанс получить временную защиту от анти-эффектов
    if (Math.random() < 0.1) {
      // 10% шанс
      setAntiEffectProtection(true)
      setAntiEffectProtectionTimeLeft(180) // 3 минуты
      showAchievementNotification(
        language === "en"
          ? "Bonus: Anti-Effect Shield activated! Protected from anti-effects for 3 minutes."
          : "Бонус: Щит від анти-ефектів активовано! Захист від анти-ефектів на 3 хвилини.",
      )
    }

    // Auto-save after getting a reward
    saveGameState()
  }

  // Handle player name change
  const handleNameChange = (name: string) => {
    // Mark that user performed an action that should reset combo
    setUserPerformedOtherAction(true)

    setPlayerName(name)
    saveGameState()
  }

  // Generate anti-effect
  const generateAntiEffect = () => {
    // Создаем список всех возможных анти-эффектов
    const possibleAntiEffects = [...antiEffects]

    // Добавляем анти-эффект блокировки кнопки клика
    possibleAntiEffects.push({
      id: "click-button-block",
      name: language === "en" ? "Click Button Block" : "Блокування кнопки кліку",
      description: language === "en" ? "Blocks the click button completely" : "Повністю блокує кнопку кліку",
      type: "click",
      severity: 1,
      fixCost: Math.max(100, Math.floor(money * 0.1)), // 10% от текущих денег, но не менее 100
      duration: -1,
      applied: false,
    })

    // Добавляем анти-эффекты для каждого улучшения
    Object.entries(upgrades).forEach(([id, upgrade]) => {
      if (upgrade.level > 0) {
        possibleAntiEffects.push({
          id: `${id}-block`,
          name: language === "en" ? `${upgrade.name} Block` : `Блокування ${upgrade.name}`,
          description:
            language === "en" ? `Blocks the ${upgrade.name} upgrade effect` : `Блокує ефект покращення ${upgrade.name}`,
          type: "upgrade",
          targetUpgrade: id as UpgradeId,
          severity: 1,
          fixCost: Math.max(upgrade.baseCost, Math.floor(money * 0.05)), // 5% от текущих денег или базовая стоимость улучшения
          duration: -1,
          applied: false,
        })
      }
    })

    // Выбираем случайный анти-эффект
    const randomIndex = Math.floor(Math.random() * possibleAntiEffects.length)
    const selectedEffect = possibleAntiEffects[randomIndex]

    // Проверяем, достаточно ли денег для исправления
    if (money >= selectedEffect.fixCost) {
      // Если это блокировка кнопки клика
      if (selectedEffect.id === "click-button-block") {
        setClickButtonBlocked(true)
      }

      // Добавляем анти-эффект
      setActiveAntiEffects((prev) => [...prev, selectedEffect])

      // Показываем уведомление
      showAchievementNotification(
        language === "en" ? `Problem detected: ${selectedEffect.name}` : `Виявлено проблему: ${selectedEffect.name}`,
      )
    }
  }

  // Add a prestige function
  const performPrestige = () => {
    // Mark that user performed an action that should reset combo
    setUserPerformedOtherAction(true)

    // Проверяем, чи розблоковані всі можливості для першого престижу
    const allUpgradesUnlocked = Object.values(upgrades).every((upgrade) => upgrade.level > 0)
    const allSkinsOwned = Object.values(skins).every((skin) => skin.owned)

    // Якщо це перший престиж, перевіряємо умови
    if (prestigeCount === 0 && (!allUpgradesUnlocked || !allSkinsOwned)) {
      showAchievementNotification(
        language === "en"
          ? "You need to unlock all upgrades and skins before your first prestige!"
          : "Вам потрібно розблокувати всі покращення та скіни перед першим престижем!",
      )
      return
    }

    const prestigeGain = calculateRobocoinsGain(totalEarned)

    if (prestigeGain < 0.01) {
      showAchievementNotification(
        language === "en" ? "Not enough progress to prestige yet!" : "Недостатньо прогресу для престижу!",
      )
      return
    }

    // Confirm with the user
    if (
      !confirm(
        language === "en"
          ? `Are you sure you want to reset your progress? You will earn ${prestigeGain.toFixed(2)} Robocoins.`
          : `Ви впевнені, що хочете скинути прогрес? Ви отримаєте ${prestigeGain.toFixed(2)} Робокоїнів.`,
      )
    ) {
      return
    }

    // Update robocoins
    const newRobocoins = robocoins + prestigeGain
    setRobocoins(newRobocoins)
    setTotalRobocoins(totalRobocoins + prestigeGain)
    setPrestigeCount(prestigeCount + 1)

    // Reset game state
    setMoney(0)
    setTotalEarned(0)
    setClickCount(0)
    setMoneyPerClick(1) // Начальное значение клика теперь 1
    setComboCount(0)
    setComboTimer(0)
    setTemporaryMultiplier(1)
    setMultiplierTimeLeft(0)

    // Reset upgrades
    setUpgrades((prev) => {
      const resetUpgrades = { ...prev }
      Object.keys(resetUpgrades).forEach((key) => {
        resetUpgrades[key as UpgradeId].level = 0
        resetUpgrades[key as UpgradeId].owned = false
      })
      return resetUpgrades
    })

    // Сохраняем скины при престиже
    // Очищаем анти-эффекты
    setActiveAntiEffects([])
    setNegativeEffects([])
    setClickButtonBlocked(false)

    // Сбрасываем разблокированные кейсы до базового
    setUnlockedCases(["basic"])
    setCasesOpened({ basic: 0, premium: 0, elite: 0, legendary: 0 })

    // После первого престижа разблокируем возможность создания собственной темы
    if (prestigeCount === 0) {
      // Показываем уведомление о возможности создания собственной темы
      setTimeout(() => {
        showAchievementNotification(
          language === "en"
            ? "You can now create your own custom theme! Check the settings menu."
            : "Тепер ви можете створити власну тему! Перевірте меню налаштувань.",
        )
      }, 2000)
    }

    // Show achievement
    showAchievementNotification(
      language === "en"
        ? `Prestige complete! +${prestigeGain.toFixed(2)} Robocoins`
        : `Престиж завершено! +${prestigeGain.toFixed(2)} Робокоїнів`,
    )

    // Save game
    saveGameState()
  }

  // Add a function to handle anti-effects
  const handleAntiEffects = () => {
    // Check for new anti-effects on click (with increasing chance based on money)
    const effectChance = Math.min(0.05, antiEffectChance + (totalEarned / 1_000_000_000) * 0.01)
    const newEffect = applyRandomAntiEffect(activeAntiEffects, totalEarned, effectChance)

    if (newEffect) {
      // Если это блокировка кнопки клика
      if (newEffect.id === "click-button-block") {
        setClickButtonBlocked(true)
      }

      setActiveAntiEffects((prev) => [...prev, newEffect])
      showAchievementNotification(
        language === "en"
          ? `Problem detected: ${newEffect.id.charAt(0).toUpperCase() + newEffect.id.slice(1)}`
          : `Виявлено проблему: ${newEffect.name}`,
      )
    }
  }

  // Add a function to fix anti-effects
  const fixAntiEffect = (effectId: string) => {
    // Mark that user performed an action that should reset combo
    setUserPerformedOtherAction(true)

    const effectToFix = activeAntiEffects.find((e) => e.id === effectId)
    if (!effectToFix) return

    if (money >= effectToFix.fixCost) {
      setMoney((prev) => prev - effectToFix.fixCost)

      // Если это блокировка кнопки клика
      if (effectId === "click-button-block") {
        setClickButtonBlocked(false)
      }

      setActiveAntiEffects((prev) => prev.filter((e) => e.id !== effectId))
      showAchievementNotification(
        language === "en"
          ? `Fixed: ${effectId.charAt(0).toUpperCase() + effectId.slice(1)}`
          : `Виправлено: ${effectToFix.name}`,
      )
    }
  }

  // Handle negative effect durations
  useEffect(() => {
    if (negativeEffects.length === 0) return

    const interval = setInterval(() => {
      setNegativeEffects((prev) =>
        prev
          .map((effect) => ({
            ...effect,
            duration: effect.duration - 1,
          }))
          .filter((effect) => effect.duration > 0),
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [negativeEffects])

  // Add a useEffect to apply prestige bonus
  useEffect(() => {
    if (robocoins > 0) {
      const bonusMultiplier = calculateBonusMultiplier(robocoins)
      // Apply the bonus to base money per click (now 1 instead of 500)
      setMoneyPerClick(1 * bonusMultiplier)
    }
  }, [robocoins])

  // Add a useEffect to handle anti-effect timers
  useEffect(() => {
    if (activeAntiEffects.length === 0) return

    const interval = setInterval(() => {
      setActiveAntiEffects((prev) =>
        prev
          .map((effect) => {
            if (effect.timeRemaining !== undefined && effect.timeRemaining > 0) {
              return {
                ...effect,
                timeRemaining: effect.timeRemaining - 1,
              }
            }
            return effect
          })
          .filter((effect) => effect.timeRemaining === undefined || effect.timeRemaining > 0),
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [activeAntiEffects])

  // Get current skin colors
  const currentSkin = skins[activeSkin]

  // Add a function to check and unlock new cases based on progress
  const checkCaseUnlocks = useCallback(() => {
    // Теперь разблокировка кейсов происходит через счетчик открытых кейсов
    // Эта функция больше не используется для разблокировки кейсов
  }, [])

  // Add a timer for anti-effects based on game time
  useEffect(() => {
    const antiEffectInterval = setInterval(() => {
      // Если активна защита от анти-эффектов, пропускаем
      if (antiEffectProtection) return

      // Chance increases with total earned
      const baseChance = 0.005 // 0.5% base chance every 30 seconds
      const scaledChance = baseChance * (1 + totalEarned / 10000000)
      const cappedChance = Math.min(0.05, scaledChance) // Cap at 5%

      const newEffect = applyRandomAntiEffect(activeAntiEffects, totalEarned, cappedChance)

      if (newEffect) {
        // Если это блокировка кнопки клика
        if (newEffect.id === "click-button-block") {
          setClickButtonBlocked(true)
        }

        setActiveAntiEffects((prev) => [...prev, newEffect])
        showAchievementNotification(
          language === "en"
            ? `Problem detected: ${newEffect.id.charAt(0).toUpperCase() + newEffect.id.slice(1)}`
            : `Виявлено проблему: ${newEffect.name}`,
        )
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(antiEffectInterval)
  }, [totalEarned, activeAntiEffects, language, antiEffectProtection])

  // Toggle desktop interface
  const toggleInterface = () => {
    // Mark that user performed an action that should reset combo
    setUserPerformedOtherAction(true)

    if (desktopInterfaceUnlocked) {
      setUseDesktopInterface(!useDesktopInterface)
      showAchievementNotification(
        language === "en"
          ? `Switched to ${useDesktopInterface ? "mobile" : "desktop"} interface`
          : `Перемкнено на ${useDesktopInterface ? "мобільний" : "десктопний"} інтерфейс`,
      )
      saveGameState()
    }
  }

  // Исправление проблемы с админ-панелью
  // Добавим проверку URL параметра для открытия админ-панели
  useEffect(() => {
    // Проверяем наличие параметра admin=true в URL
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("admin") === "true") {
      setShowAdminPanel(true)
    }

    // Обработчик секретной комбинации клавиш (Ctrl+Shift+A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        setShowAdminPanel(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Функция для обработки действий, которые должны сбрасывать комбо
  const handleActionThatResetsCombo = () => {
    setUserPerformedOtherAction(true)
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-4 cyber-grid"
      style={{
        backgroundColor: currentSkin.colors.background,
        backgroundImage: `
          radial-gradient(circle at 50% 50%, ${currentSkin.colors.accent}10 0%, transparent 80%),
          linear-gradient(to bottom, ${currentSkin.colors.background}e6, ${currentSkin.colors.background})
        `,
      }}
    >
      {/* Scanline effect */}
      <div className="pointer-events-none fixed inset-0 z-50 h-screen w-screen overflow-hidden opacity-10">
        <div
          className="absolute h-[1px] w-full animate-scanline"
          style={{ backgroundColor: currentSkin.colors.secondary }}
        ></div>
      </div>

      {/* Digital rain effect if unlocked */}
      {visualEffects.includes("basic-5") && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-20">
          <div className="absolute inset-0 digital-rain"></div>
          <style jsx>{`
            .digital-rain {
              background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='0' y='10' fill='${currentSkin.colors.secondary.replace(
                "#",
                "%23",
              )}' fontFamily='monospace'%3E01%3C/text%3E%3Ctext x='20' y='30' fill='${currentSkin.colors.secondary.replace(
                "#",
                "%23",
              )}' fontFamily='monospace'%3E10%3C/text%3E%3Ctext x='40' y='50' fill='${currentSkin.colors.secondary.replace(
                "#",
                "%23",
              )}' fontFamily='monospace'%3E01%3C/text%3E%3Ctext x='60' y='70' fill='${currentSkin.colors.secondary.replace(
                "#",
                "%23",
              )}' fontFamily='monospace'%3E10%3C/text%3E%3Ctext x='80' y='90' fill='${currentSkin.colors.secondary.replace(
                "#",
                "%23",
              )}' fontFamily='monospace'%3E01%3C/text%3E%3C/svg%3E");
              animation: rain 20s linear infinite;
            }
            @keyframes rain {
              from { background-position: 0 0; }
              to { background-position: 0 1000px; }
            }
          `}</style>
        </div>
      )}

      {/* Achievement notification */}
      <AnimatePresence>
        {showAchievement && (
          <AchievementNotification
            text={achievementText}
            primaryColor={currentSkin.colors.primary}
            secondaryColor={currentSkin.colors.secondary}
          />
        )}
      </AnimatePresence>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md rounded-sm border-2 bg-black/90 p-6"
              style={{
                borderColor: currentSkin.colors.primary,
                boxShadow: `0 0 20px ${currentSkin.colors.primary}80`,
              }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="mb-6 text-center">
                <h2
                  className="text-2xl font-bold uppercase tracking-wider"
                  style={{ color: currentSkin.colors.primary }}
                >
                  Settings
                </h2>
              </div>

              <div className="mb-6 space-y-4">
                <div className="flex justify-between">
                  <span style={{ color: currentSkin.colors.secondary }}>
                    {language === "en" ? "Auto-save:" : "Автозбереження:"}
                  </span>
                  <span style={{ color: currentSkin.colors.primary }}>
                    {language === "en" ? "Every minute" : "Щохвилини"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span style={{ color: currentSkin.colors.secondary }}>
                    {language === "en" ? "Last saved:" : "Останнє збереження:"}
                  </span>
                  <span style={{ color: currentSkin.colors.primary }}>
                    {new Date(lastSavedTime).toLocaleTimeString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span style={{ color: currentSkin.colors.secondary }}>
                    {language === "en" ? "Player name:" : "Ім'я гравця:"}
                  </span>
                  <span style={{ color: currentSkin.colors.primary }}>{playerName}</span>
                </div>

                <div className="flex justify-between">
                  <span style={{ color: currentSkin.colors.secondary }}>
                    {language === "en" ? "RoboCoins:" : "РобоКоїни:"}
                  </span>
                  <span style={{ color: currentSkin.colors.primary }}>{robocoins}</span>
                </div>

                <div className="flex justify-between">
                  <span style={{ color: currentSkin.colors.secondary }}>
                    {language === "en" ? "Prestige Multiplier:" : "Множник престижу:"}
                  </span>
                  <span style={{ color: currentSkin.colors.primary }}>
                    x{calculateBonusMultiplier(robocoins).toFixed(1)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span style={{ color: currentSkin.colors.secondary }}>
                    {language === "en" ? "Language" : "Мова"}:
                  </span>
                  <div className="flex gap-2">
                    <button
                      className={`px-2 py-1 rounded-sm ${language === "en" ? "border-2" : "border"}`}
                      style={{
                        borderColor:
                          language === "en" ? currentSkin.colors.primary : `${currentSkin.colors.secondary}50`,
                        color: language === "en" ? currentSkin.colors.primary : currentSkin.colors.secondary,
                      }}
                      onClick={() => {
                        setLanguage("en")
                        handleActionThatResetsCombo()
                      }}
                    >
                      EN
                    </button>
                    <button
                      className={`px-2 py-1 rounded-sm ${language === "uk" ? "border-2" : "border"}`}
                      style={{
                        borderColor:
                          language === "uk" ? currentSkin.colors.primary : `${currentSkin.colors.secondary}50`,
                        color: language === "uk" ? currentSkin.colors.primary : currentSkin.colors.secondary,
                      }}
                      onClick={() => {
                        setLanguage("uk")
                        handleActionThatResetsCombo()
                      }}
                    >
                      UK
                    </button>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span style={{ color: currentSkin.colors.secondary }}>
                    {language === "en" ? "Music:" : "Музика:"}
                  </span>
                  <div className="flex gap-2">
                    <button
                      className={`px-2 py-1 rounded-sm ${musicEnabled ? "border-2" : "border"}`}
                      style={{
                        borderColor: musicEnabled ? currentSkin.colors.primary : `${currentSkin.colors.secondary}50`,
                        color: musicEnabled ? currentSkin.colors.primary : currentSkin.colors.secondary,
                      }}
                      onClick={() => {
                        setMusicEnabled(true)
                        handleActionThatResetsCombo()
                      }}
                    >
                      {language === "en" ? "On" : "Увімк."}
                    </button>
                    <button
                      className={`px-2 py-1 rounded-sm ${!musicEnabled ? "border-2" : "border"}`}
                      style={{
                        borderColor: !musicEnabled ? currentSkin.colors.primary : `${currentSkin.colors.secondary}50`,
                        color: !musicEnabled ? currentSkin.colors.primary : currentSkin.colors.secondary,
                      }}
                      onClick={() => {
                        setMusicEnabled(false)
                        handleActionThatResetsCombo()
                      }}
                    >
                      {language === "en" ? "Off" : "Вимк."}
                    </button>
                  </div>
                </div>

                {/* Interface selector (only if unlocked) */}
                {desktopInterfaceUnlocked && (
                  <div className="flex justify-between">
                    <span style={{ color: currentSkin.colors.secondary }}>
                      {language === "en" ? "Interface:" : "Інтерфейс:"}
                    </span>
                    <div className="flex gap-2">
                      <button
                        className={`px-2 py-1 rounded-sm ${!useDesktopInterface ? "border-2" : "border"}`}
                        style={{
                          borderColor: !useDesktopInterface
                            ? currentSkin.colors.primary
                            : `${currentSkin.colors.secondary}50`,
                          color: !useDesktopInterface ? currentSkin.colors.primary : currentSkin.colors.secondary,
                        }}
                        onClick={() => {
                          setUseDesktopInterface(false)
                          handleActionThatResetsCombo()
                        }}
                      >
                        {language === "en" ? "Mobile" : "Мобільний"}
                      </button>
                      <button
                        className={`px-2 py-1 rounded-sm ${useDesktopInterface ? "border-2" : "border"}`}
                        style={{
                          borderColor: useDesktopInterface
                            ? currentSkin.colors.primary
                            : `${currentSkin.colors.secondary}50`,
                          color: useDesktopInterface ? currentSkin.colors.primary : currentSkin.colors.secondary,
                        }}
                        onClick={() => {
                          setUseDesktopInterface(true)
                          handleActionThatResetsCombo()
                        }}
                      >
                        {language === "en" ? "Desktop" : "Десктопний"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Custom themes section (only if prestige > 0) */}
                {prestigeCount > 0 && (
                  <div className="mt-4 border-t pt-4" style={{ borderColor: `${currentSkin.colors.secondary}40` }}>
                    <div className="flex justify-between items-center mb-2">
                      <span style={{ color: currentSkin.colors.secondary }}>
                        {language === "en" ? "Custom Themes:" : "Власні теми:"}
                      </span>
                      <button
                        className="px-2 py-1 rounded-sm border"
                        style={{
                          borderColor: currentSkin.colors.primary,
                          color: currentSkin.colors.primary,
                        }}
                        onClick={() => {
                          setShowCustomThemeCreator(true)
                          handleActionThatResetsCombo()
                        }}
                      >
                        {language === "en" ? "Create New" : "Створити нову"}
                      </button>
                    </div>

                    {Object.keys(customThemes).length > 0 ? (
                      <div className="space-y-2 mt-2">
                        {Object.entries(customThemes).map(([id, theme]) => (
                          <div key={id} className="flex justify-between items-center">
                            <span style={{ color: currentSkin.colors.primary }}>{theme.name}</span>
                            <div className="flex gap-2">
                              <div className="flex gap-1">
                                {Object.values(theme.colors).map((color, index) => (
                                  <div
                                    key={index}
                                    className="w-3 h-3 rounded-sm"
                                    style={{ backgroundColor: color }}
                                  ></div>
                                ))}
                              </div>
                              <button
                                className="px-2 py-0.5 text-xs rounded-sm border"
                                style={{
                                  borderColor: currentSkin.colors.secondary,
                                  color: currentSkin.colors.secondary,
                                }}
                                onClick={() => {
                                  applyCustomTheme(id)
                                  handleActionThatResetsCombo()
                                }}
                              >
                                {language === "en" ? "Apply" : "Застосувати"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-center" style={{ color: `${currentSkin.colors.secondary}80` }}>
                        {language === "en"
                          ? "No custom themes yet. Create your first theme!"
                          : "Ще немає власних тем. Створіть свою першу тему!"}
                      </div>
                    )}
                  </div>
                )}

                {/* Anti-effect protection status */}
                {antiEffectProtection && (
                  <div
                    className="mt-4 p-2 border rounded-sm"
                    style={{
                      borderColor: currentSkin.colors.accent,
                      backgroundColor: `${currentSkin.colors.accent}10`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5" style={{ color: currentSkin.colors.accent }} />
                      <span style={{ color: currentSkin.colors.accent }}>
                        {language === "en" ? "Anti-Effect Protection:" : "Захист від анти-ефектів:"}
                      </span>
                      <span className="ml-auto" style={{ color: currentSkin.colors.accent }}>
                        {Math.floor(antiEffectProtectionTimeLeft / 60)}:
                        {(antiEffectProtectionTimeLeft % 60).toString().padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  className="rounded-sm border-2 py-2 font-bold uppercase tracking-wider transition-all"
                  style={{
                    borderColor: currentSkin.colors.secondary,
                    color: currentSkin.colors.secondary,
                    boxShadow: `0 0 10px ${currentSkin.colors.secondary}40`,
                  }}
                  onClick={() => {
                    saveGameState()
                    handleActionThatResetsCombo()
                  }}
                >
                  {language === "en" ? "Save Game" : "Зберегти гру"}
                </button>

                <button
                  className="rounded-sm border-2 py-2 font-bold uppercase tracking-wider transition-all"
                  style={{
                    borderColor: currentSkin.colors.primary,
                    color: currentSkin.colors.primary,
                    boxShadow: `0 0 10px ${currentSkin.colors.primary}40`,
                  }}
                  onClick={() => {
                    performPrestige()
                    handleActionThatResetsCombo()
                  }}
                >
                  {language === "en" ? "Prestige" : "Престиж"}
                </button>

                <button
                  className="rounded-sm border-2 py-2 font-bold uppercase tracking-wider transition-all"
                  style={{
                    borderColor: currentSkin.colors.accent,
                    color: currentSkin.colors.accent,
                    boxShadow: `0 0 10px ${currentSkin.colors.accent}40`,
                  }}
                  onClick={() => {
                    resetGameState()
                    handleActionThatResetsCombo()
                  }}
                >
                  {language === "en" ? "Reset Game" : "Скинути гру"}
                </button>

                <button
                  className="mt-4 rounded-sm border-2 py-2 font-bold uppercase tracking-wider transition-all"
                  style={{
                    borderColor: currentSkin.colors.primary,
                    color: currentSkin.colors.primary,
                    boxShadow: `0 0 10px ${currentSkin.colors.primary}40`,
                  }}
                  onClick={() => {
                    setShowSettings(false)
                    handleActionThatResetsCombo()
                  }}
                >
                  {language === "en" ? "Close" : "Закрити"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Theme Creator */}
      <AnimatePresence>
        {showCustomThemeCreator && (
          <CustomThemeCreator
            onClose={() => {
              setShowCustomThemeCreator(false)
              handleActionThatResetsCombo()
            }}
            onSave={saveCustomTheme}
            primaryColor={currentSkin.colors.primary}
            secondaryColor={currentSkin.colors.secondary}
            accentColor={currentSkin.colors.accent}
            language={language}
          />
        )}
      </AnimatePresence>

      {/* Settings, music and fortune wheel buttons */}
      <div className="fixed right-4 top-4 z-40 flex gap-2">
        <MusicPlayer
          enabled={musicEnabled}
          onToggle={() => {
            setMusicEnabled(!musicEnabled)
            handleActionThatResetsCombo()
          }}
          primaryColor={currentSkin.colors.primary}
          secondaryColor={currentSkin.colors.secondary}
        />

        <button
          className="flex h-10 w-10 items-center justify-center rounded-sm border-2 bg-black/50"
          style={{
            borderColor: currentSkin.colors.accent,
            color: currentSkin.colors.accent,
            boxShadow: `0 0 10px ${currentSkin.colors.accent}40`,
          }}
          onClick={() => {
            setShowFortuneWheel(!showFortuneWheel)
            handleActionThatResetsCombo()
          }}
          title={language === "en" ? "Fortune Wheel" : "Колесо Фортуни"}
        >
          <Sparkles className="h-5 w-5" />
        </button>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-sm border-2 bg-black/50"
          style={{
            borderColor: currentSkin.colors.primary,
            color: currentSkin.colors.primary,
            boxShadow: `0 0 10px ${currentSkin.colors.primary}40`,
          }}
          onClick={() => {
            setShowSettings(!showSettings)
            handleActionThatResetsCombo()
          }}
          title={language === "en" ? "Settings" : "Налаштування"}
        >
          <Settings className="h-5 w-5" />
        </button>

        {/* Interface toggle button (only if unlocked) */}
        {desktopInterfaceUnlocked && (
          <button
            className="flex h-10 w-10 items-center justify-center rounded-sm border-2 bg-black/50"
            style={{
              borderColor: currentSkin.colors.secondary,
              color: currentSkin.colors.secondary,
              boxShadow: `0 0 10px ${currentSkin.colors.secondary}40`,
            }}
            onClick={toggleInterface}
            title={language === "en" ? "Toggle Interface" : "Перемкнути інтерфейс"}
          >
            <Zap className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Main game interface */}
      {useDesktopInterface ? (
        <DesktopInterface
          money={money}
          totalEarned={totalEarned}
          clickCount={clickCount}
          moneyPerClick={moneyPerClick}
          robocoins={robocoins}
          totalRobocoins={totalRobocoins}
          prestigeCount={prestigeCount}
          playerName={playerName}
          language={language}
          musicEnabled={musicEnabled}
          activeTab={activeTab}
          activeCategory={activeCategory}
          activeSkin={activeSkin}
          upgrades={upgrades}
          skins={skins}
          activeAntiEffects={activeAntiEffects}
          unlockedCases={unlockedCases}
          clickEffects={clickEffects}
          visualEffects={visualEffects}
          bonusEffects={bonusEffects}
          specialEffects={specialEffects}
          showEffect={showEffect}
          clickPosition={clickPosition}
          showCrit={showCrit}
          critText={critText}
          comboCount={comboCount}
          comboTimer={comboTimer}
          showSettings={showSettings}
          isAdvancedUnlocked={isAdvancedUnlocked}
          isSpecialUnlocked={isSpecialUnlocked}
          showFortuneWheel={showFortuneWheel}
          clickButtonBlocked={clickButtonBlocked}
          antiEffectProtection={antiEffectProtection}
          antiEffectProtectionTimeLeft={antiEffectProtectionTimeLeft}
          onClickArea={handleClick}
          onToggleSettings={() => {
            setShowSettings(!showSettings)
            handleActionThatResetsCombo()
          }}
          onToggleMusic={() => {
            setMusicEnabled(!musicEnabled)
            handleActionThatResetsCombo()
          }}
          onToggleFortuneWheel={() => {
            setShowFortuneWheel(!showFortuneWheel)
            handleActionThatResetsCombo()
          }}
          onTabChange={(tab) => {
            setActiveTab(tab)
            handleActionThatResetsCombo()
          }}
          onCategoryChange={(category) => {
            setActiveCategory(category)
            handleActionThatResetsCombo()
          }}
          onBuyUpgrade={buyUpgrade}
          onBuySkin={buySkin}
          onApplySkin={applySkin}
          onWheelSpin={handleWheelSpin}
          onCaseOpen={handleCaseOpen}
          onPrestige={performPrestige}
          onFixAntiEffect={fixAntiEffect}
          onNameChange={handleNameChange}
          onSaveGame={saveGameState}
          onResetGame={resetGameState}
        />
      ) : (
        <MobileInterface
          money={money}
          totalEarned={totalEarned}
          clickCount={clickCount}
          moneyPerClick={moneyPerClick}
          robocoins={robocoins}
          totalRobocoins={totalRobocoins}
          prestigeCount={prestigeCount}
          playerName={playerName}
          language={language}
          musicEnabled={musicEnabled}
          activeTab={activeTab}
          activeCategory={activeCategory}
          activeSkin={activeSkin}
          upgrades={upgrades}
          skins={skins}
          activeAntiEffects={activeAntiEffects}
          unlockedCases={unlockedCases}
          clickEffects={clickEffects}
          visualEffects={visualEffects}
          bonusEffects={bonusEffects}
          specialEffects={specialEffects}
          showEffect={showEffect}
          clickPosition={clickPosition}
          showCrit={showCrit}
          critText={critText}
          comboCount={comboCount}
          comboTimer={comboTimer}
          showSettings={showSettings}
          isAdvancedUnlocked={isAdvancedUnlocked}
          isSpecialUnlocked={isSpecialUnlocked}
          showFortuneWheel={showFortuneWheel}
          clickButtonBlocked={clickButtonBlocked}
          antiEffectProtection={antiEffectProtection}
          antiEffectProtectionTimeLeft={antiEffectProtectionTimeLeft}
          onClickArea={handleClick}
          onToggleSettings={() => {
            setShowSettings(!showSettings)
            handleActionThatResetsCombo()
          }}
          onToggleMusic={() => {
            setMusicEnabled(!musicEnabled)
            handleActionThatResetsCombo()
          }}
          onToggleFortuneWheel={() => {
            setShowFortuneWheel(!showFortuneWheel)
            handleActionThatResetsCombo()
          }}
          onTabChange={(tab) => {
            setActiveTab(tab)
            handleActionThatResetsCombo()
          }}
          onCategoryChange={(category) => {
            setActiveCategory(category)
            handleActionThatResetsCombo()
          }}
          onBuyUpgrade={buyUpgrade}
          onBuySkin={buySkin}
          onApplySkin={applySkin}
          onWheelSpin={handleWheelSpin}
          onCaseOpen={handleCaseOpen}
          onPrestige={performPrestige}
          onFixAntiEffect={fixAntiEffect}
          onNameChange={handleNameChange}
          onSaveGame={saveGameState}
          onResetGame={resetGameState}
        />
      )}

      {/* Audio element for background music */}
      <audio
        id="background-music"
        loop
        src="https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=cyber-war-126419.mp3"
        style={{ display: "none" }}
      />

      {/* Админ-панель */}
      <AdminPanel
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
        gameState={{
          money,
          totalEarned,
          clickCount,
          moneyPerClick,
          robocoins,
          totalRobocoins,
          prestigeCount,
          playerName,
          language,
          musicEnabled,
          useDesktopInterface,
          desktopInterfaceUnlocked,
          upgrades,
          skins,
          activeSkin,
          unlockedCases,
          casesOpened,
          clickEffects,
          visualEffects,
          bonusEffects,
          specialEffects,
          customThemes,
        }}
        onUpdateGameState={updateGameState}
        onResetGame={resetGameState}
        primaryColor={currentSkin.colors.primary}
        secondaryColor={currentSkin.colors.secondary}
        accentColor={currentSkin.colors.accent}
        language={language}
      />

      {/* Fortune Wheel Modal */}
      <AnimatePresence>
        {showFortuneWheel && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-md rounded-sm border-2 bg-black/90 p-6"
              style={{
                borderColor: currentSkin.colors.primary,
                boxShadow: `0 0 20px ${currentSkin.colors.primary}80`,
              }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <button
                className="absolute right-4 top-4 text-gray-400 hover:text-white"
                onClick={() => {
                  setShowFortuneWheel(false)
                  handleActionThatResetsCombo()
                }}
              >
                ✕
              </button>
              <div className="flex justify-center">
                <FortuneWheel
                  onSpin={handleWheelSpin}
                  canSpin={true}
                  primaryColor={currentSkin.colors.primary}
                  secondaryColor={currentSkin.colors.secondary}
                  accentColor={currentSkin.colors.accent}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
