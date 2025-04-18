"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, TrendingUp, Cpu, Layers, Repeat, Sparkles, Target, Coins, Gauge, Rocket, Zap } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import AchievementNotification from "@/components/achievement-notification"
import type { Prize } from "@/components/fortune-wheel"
import type { CaseReward } from "@/components/case-system"
import { saveGame, loadGame, resetGame, saveLeaderboardEntry } from "@/utils/save-system"
import { calculateRobocoinsGain, calculateBonusMultiplier } from "@/utils/prestige-system"
import { type AntiEffect, applyRandomAntiEffect } from "@/utils/anti-effects"
import type { Language } from "@/utils/language"
import MobileInterface from "@/components/mobile-interface"
import DesktopInterface from "@/components/desktop-interface"
import type { UpgradeId, SkinId, TabId, UpgradeCategory } from "@/types/game-types"
import { Settings } from "lucide-react"
import MusicPlayer from "@/components/music-player"

// Define the unlock requirements for advanced and special upgrades
const ADVANCED_REQUIREMENTS = {
  doubleValue: 1,
  autoClicker: 1,
  criticalClick: 1,
  passiveIncome: 1,
}

const SPECIAL_REQUIREMENTS = {
  clickMultiplier: 1,
  autoClickerSpeed: 1,
  clickCombo: 1,
  offlineEarnings: 1,
}

export default function MoneyClicker() {
  const [money, setMoney] = useState(0)
  const [totalEarned, setTotalEarned] = useState(0)
  const [clickCount, setClickCount] = useState(0)
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 })
  const [showEffect, setShowEffect] = useState(false)
  // Update the initial money per click to make early game easier
  const [moneyPerClick, setMoneyPerClick] = useState(500)
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
  // Add state for fortune wheel modal
  const [showFortuneWheel, setShowFortuneWheel] = useState(false)
  // Add state for interface type
  const [useDesktopInterface, setUseDesktopInterface] = useState(false)
  // Add state for desktop interface unlocked
  const [desktopInterfaceUnlocked, setDesktopInterfaceUnlocked] = useState(false)

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
      name: "Double Value",
      description: "Double your credits per click",
      icon: <TrendingUp className="h-5 w-5" />,
      level: 0,
      baseCost: 5000, // Reduced from 100000
      costMultiplier: 1.5, // Lower multiplier for smoother progression
      owned: false,
      effect: 2,
      effectMultiplier: 1.5,
      category: "basic",
      unlockCost: 0,
    },
    autoClicker: {
      name: "Auto Hack",
      description: "Automatically clicks once per second",
      icon: <Clock className="h-5 w-5" />,
      level: 0,
      baseCost: 10000, // Reduced from 250000
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
      baseCost: 25000, // Reduced from 500000
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
      baseCost: 50000, // Reduced from 1000000
      costMultiplier: 1.8,
      owned: false,
      effect: 100, // Increased from 50
      effectMultiplier: 1.3,
      category: "basic",
      unlockCost: 0,
    },
    clickMultiplier: {
      name: "Click Multiplier",
      description: "Multiply your click value",
      icon: <Layers className="h-5 w-5" />,
      level: 0,
      baseCost: 100000, // Reduced from 5000000
      costMultiplier: 1.9,
      owned: false,
      effect: 1.5, // 1.5x multiplier per level
      effectMultiplier: 1.1,
      category: "advanced",
      unlockCost: 200000, // Reduced threshold
    },
    autoClickerSpeed: {
      name: "Auto Speed",
      description: "Increase auto hack speed",
      icon: <Cpu className="h-5 w-5" />,
      level: 0,
      baseCost: 250000, // Reduced from 10000000
      costMultiplier: 2.0,
      owned: false,
      effect: 1, // +1 click per second per level
      effectMultiplier: 1.2,
      category: "advanced",
      unlockCost: 200000, // Reduced threshold
    },
    clickCombo: {
      name: "Click Combo",
      description: "Consecutive clicks increase value",
      icon: <Gauge className="h-5 w-5" />,
      level: 0,
      baseCost: 500000, // Reduced from 50000000
      costMultiplier: 2.1,
      owned: false,
      effect: 0.1, // 10% bonus per combo
      effectMultiplier: 1.1,
      category: "advanced",
      unlockCost: 200000, // Reduced threshold
    },
    offlineEarnings: {
      name: "Offline Earnings",
      description: "Earn credits while away",
      icon: <Coins className="h-5 w-5" />,
      level: 0,
      baseCost: 1000000, // Reduced from 100000000
      costMultiplier: 2.2,
      owned: false,
      effect: 0.1, // 10% of normal earnings per level
      effectMultiplier: 1.2,
      category: "advanced",
      unlockCost: 200000, // Reduced threshold
    },
    luckyClicks: {
      name: "Lucky Clicks",
      description: "Random chance for bonus credits",
      icon: <Target className="h-5 w-5" />,
      level: 0,
      baseCost: 2500000, // Reduced from 500000000
      costMultiplier: 2.3,
      owned: false,
      effect: 0.02, // 2% chance per level
      effectMultiplier: 1.3,
      category: "special",
      unlockCost: 5000000, // Reduced threshold
    },
    megaClick: {
      name: "Mega Click",
      description: "Special ability: massive click value",
      icon: <Rocket className="h-5 w-5" />,
      level: 0,
      baseCost: 5000000, // Reduced from 1000000000
      costMultiplier: 2.5,
      owned: false,
      effect: 10, // 10x multiplier per level
      effectMultiplier: 1.5,
      category: "special",
      unlockCost: 5000000, // Reduced threshold
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
      cost: 5000,
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
      cost: 15000,
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
      cost: 30000,
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
      cost: 60000,
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
      cost: 120000,
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
      cost: 250000,
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
      cost: 500000,
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
      cost: 1000000,
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
      cost: 2000000,
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
      cost: 5000000,
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
      cost: 10000000,
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
      cost: 25000000,
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
      cost: 50000000,
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
      cost: 100000000,
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

        // Set desktop interface preference
        if (savedGame.useDesktopInterface !== undefined) {
          setUseDesktopInterface(savedGame.useDesktopInterface)
        }

        // Set desktop interface unlock status
        if (savedGame.desktopInterfaceUnlocked !== undefined) {
          setDesktopInterfaceUnlocked(savedGame.desktopInterfaceUnlocked)
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
      musicEnabled,
      useDesktopInterface,
      desktopInterfaceUnlocked,
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
    musicEnabled,
    useDesktopInterface,
    desktopInterfaceUnlocked,
  ])

  // Reset game
  const resetGameState = () => {
    if (confirm("Are you sure you want to reset your game? All progress will be lost!")) {
      resetGame()
      window.location.reload()
    }
  }

  // Auto-clicker effect
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (upgrades.autoClicker.level > 0) {
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
    if (Math.random() < 0.01) {
      generateNegativeEffect()
    }
  }

  const showAchievementNotification = (text: string) => {
    setAchievementText(text)
    setShowAchievement(true)
    setTimeout(() => setShowAchievement(false), 3000)
  }

  const handleClick = (e: React.MouseEvent) => {
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
    handleAntiEffects()
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
    const upgrade = upgrades[upgradeId]
    const cost = calculateUpgradeCost(upgradeId)

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
      if (upgradeId === "doubleValue" && upgrade.level === 0) {
        setMoneyPerClick((prev) => prev * upgrade.effect)
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

  // Handle fortune wheel spin
  const handleWheelSpin = (prize: Prize) => {
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
        // Lucky day - all clicks are critical for 30 seconds
        setTemporaryMultiplier(5)
        setMultiplierTimeLeft(30)
        showAchievementNotification(`Lucky Day! All clicks are 5x for 30 seconds!`)
        break
    }
  }

  // Handle case opening
  const handleCaseOpen = (reward: CaseReward) => {
    // Add the reward to the appropriate category
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

    // Auto-save after getting a reward
    saveGameState()
  }

  // Handle player name change
  const handleNameChange = (name: string) => {
    setPlayerName(name)
    saveGameState()
  }

  // Add a prestige function
  const performPrestige = () => {
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
    setMoneyPerClick(500) // Use the new base value
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

    // Keep skins
    // Clear anti-effects
    setActiveAntiEffects([])
    setNegativeEffects([])

    // Reset unlocked cases to just basic
    setUnlockedCases(["basic"])

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
    const newEffect = applyRandomAntiEffect(activeAntiEffects, effectChance)

    if (newEffect) {
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
    const effectToFix = activeAntiEffects.find((e) => e.id === effectId)
    if (!effectToFix) return

    if (money >= effectToFix.fixCost) {
      setMoney((prev) => prev - effectToFix.fixCost)
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
      // Apply the bonus to base money per click (now 500 instead of 100)
      setMoneyPerClick(500 * bonusMultiplier)
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

  // Declare the missing variables
  const generateNegativeEffect = () => {
    // Implement the logic to generate a negative effect and add it to the state
    // This is a placeholder, replace with your actual implementation
    console.log("Generating negative effect")
  }

  // Add a function to check and unlock new cases based on progress
  const checkCaseUnlocks = useCallback(() => {
    const newUnlocks = []

    if (!unlockedCases.includes("premium") && totalEarned >= 500000) {
      newUnlocks.push("premium")
    }

    if (!unlockedCases.includes("elite") && totalEarned >= 5000000) {
      newUnlocks.push("elite")
    }

    if (!unlockedCases.includes("legendary") && totalEarned >= 50000000) {
      newUnlocks.push("legendary")
    }

    if (newUnlocks.length > 0) {
      setUnlockedCases((prev) => [...prev, ...newUnlocks])

      // Show notification for each new case
      newUnlocks.forEach((caseType) => {
        setTimeout(() => {
          showAchievementNotification(
            language === "en"
              ? `New case unlocked: ${caseType.charAt(0).toUpperCase() + caseType.slice(1)}!`
              : `Розблоковано новий кейс: ${caseType.charAt(0).toUpperCase() + caseType.slice(1)}!`,
          )
        }, 500)
      })
    }
  }, [totalEarned, unlockedCases, language])

  // Call this function whenever totalEarned changes
  useEffect(() => {
    checkCaseUnlocks()
  }, [totalEarned, checkCaseUnlocks])

  // Add a timer for anti-effects based on game time
  useEffect(() => {
    const antiEffectInterval = setInterval(() => {
      // Chance increases with total earned
      const baseChance = 0.005 // 0.5% base chance every 30 seconds
      const scaledChance = baseChance * (1 + totalEarned / 10000000)
      const cappedChance = Math.min(0.05, scaledChance) // Cap at 5%

      const newEffect = applyRandomAntiEffect(activeAntiEffects, cappedChance)

      if (newEffect) {
        setActiveAntiEffects((prev) => [...prev, newEffect])
        showAchievementNotification(
          language === "en"
            ? `Problem detected: ${newEffect.id.charAt(0).toUpperCase() + newEffect.id.slice(1)}`
            : `Виявлено проблему: ${newEffect.name}`,
        )
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(antiEffectInterval)
  }, [totalEarned, activeAntiEffects, language])

  // Toggle desktop interface
  const toggleInterface = () => {
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
              background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='0' y='10' fill='${currentSkin.colors.secondary.replace("#", "%23")}' fontFamily='monospace'%3E01%3C/text%3E%3Ctext x='20' y='30' fill='${currentSkin.colors.secondary.replace("#", "%23")}' fontFamily='monospace'%3E10%3C/text%3E%3Ctext x='40' y='50' fill='${currentSkin.colors.secondary.replace("#", "%23")}' fontFamily='monospace'%3E01%3C/text%3E%3Ctext x='60' y='70' fill='${currentSkin.colors.secondary.replace("#", "%23")}' fontFamily='monospace'%3E10%3C/text%3E%3Ctext x='80' y='90' fill='${currentSkin.colors.secondary.replace("#", "%23")}' fontFamily='monospace'%3E01%3C/text%3E%3C/svg%3E");
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
                      onClick={() => setLanguage("en")}
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
                      onClick={() => setLanguage("uk")}
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
                      onClick={() => setMusicEnabled(true)}
                    >
                      {language === "en" ? "On" : "Увімк."}
                    </button>
                    <button
                      className={`px-2 py-1 rounded-sm ${!musicEnabled ? "border-2" : "border"}`}
                      style={{
                        borderColor: !musicEnabled ? currentSkin.colors.primary : `${currentSkin.colors.secondary}50`,
                        color: !musicEnabled ? currentSkin.colors.primary : currentSkin.colors.secondary,
                      }}
                      onClick={() => setMusicEnabled(false)}
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
                        onClick={() => setUseDesktopInterface(false)}
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
                        onClick={() => setUseDesktopInterface(true)}
                      >
                        {language === "en" ? "Desktop" : "Десктопний"}
                      </button>
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
                  onClick={saveGameState}
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
                  onClick={() => performPrestige()}
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
                  onClick={resetGameState}
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
                  onClick={() => setShowSettings(false)}
                >
                  {language === "en" ? "Close" : "Закрити"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings, music and fortune wheel buttons */}
      <div className="fixed right-4 top-4 z-40 flex gap-2">
        <MusicPlayer
          enabled={musicEnabled}
          onToggle={() => setMusicEnabled(!musicEnabled)}
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
          onClick={() => setShowFortuneWheel(!showFortuneWheel)}
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
          onClick={() => setShowSettings(!showSettings)}
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
          onClickArea={handleClick}
          onToggleSettings={() => setShowSettings(!showSettings)}
          onToggleMusic={() => setMusicEnabled(!musicEnabled)}
          onToggleFortuneWheel={() => setShowFortuneWheel(!showFortuneWheel)}
          onTabChange={setActiveTab}
          onCategoryChange={setActiveCategory}
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
          onClickArea={handleClick}
          onToggleSettings={() => setShowSettings(!showSettings)}
          onToggleMusic={() => setMusicEnabled(!musicEnabled)}
          onToggleFortuneWheel={() => setShowFortuneWheel(!showFortuneWheel)}
          onTabChange={setActiveTab}
          onCategoryChange={setActiveCategory}
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
    </div>
  )
}

