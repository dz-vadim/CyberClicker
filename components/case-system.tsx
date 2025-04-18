"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface CaseSystemProps {
  onOpen: (reward: CaseReward) => void
  money: number
  onSpendMoney: (amount: number) => void
  primaryColor: string
  secondaryColor: string
  accentColor: string
  unlockedCases?: string[] // Add this prop
}

export type CaseReward = {
  id: string
  name: string
  type: "clickEffect" | "visualEffect" | "bonus" | "special"
  description: string
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
  value: number
}

// Define case types
const caseTypes = [
  {
    id: "basic",
    name: "Basic Case",
    cost: 5000,
    description: "Common rewards with a small chance for something special",
    color: "#05d9e8",
    image: "📦",
  },
  {
    id: "premium",
    name: "Premium Case",
    cost: 25000,
    description: "Better rewards with higher chances for rare items",
    color: "#ff2a6d",
    image: "🎁",
  },
  {
    id: "elite",
    name: "Elite Case",
    cost: 100000,
    description: "High-quality rewards with guaranteed rare or better",
    color: "#d300c5",
    image: "💎",
  },
  {
    id: "legendary",
    name: "Legendary Case",
    cost: 500000,
    description: "The best rewards with a chance for legendary items",
    color: "#39ff14",
    image: "🏆",
  },
]

// Define possible rewards
const possibleRewards: Record<string, CaseReward[]> = {
  basic: [
    {
      id: "basic-1",
      name: "Pixel Dust",
      type: "clickEffect",
      description: "Adds pixel particles to your clicks",
      rarity: "common",
      value: 1,
    },
    {
      id: "basic-2",
      name: "Echo Click",
      type: "clickEffect",
      description: "Creates echo ripples when clicking",
      rarity: "common",
      value: 1,
    },
    {
      id: "basic-3",
      name: "Neon Glow",
      type: "visualEffect",
      description: "Adds a subtle neon glow to the game",
      rarity: "uncommon",
      value: 2,
    },
    {
      id: "basic-4",
      name: "Lucky Charm",
      type: "bonus",
      description: "+5% chance for critical clicks",
      rarity: "uncommon",
      value: 5,
    },
    {
      id: "basic-5",
      name: "Digital Rain",
      type: "visualEffect",
      description: "Matrix-style digital rain in the background",
      rarity: "rare",
      value: 3,
    },
  ],
  premium: [
    {
      id: "premium-1",
      name: "Plasma Burst",
      type: "clickEffect",
      description: "Explosive plasma effect on clicks",
      rarity: "uncommon",
      value: 2,
    },
    {
      id: "premium-2",
      name: "Cyber Grid",
      type: "visualEffect",
      description: "Enhanced grid background with animations",
      rarity: "uncommon",
      value: 2,
    },
    {
      id: "premium-3",
      name: "Credit Boost",
      type: "bonus",
      description: "+10% credits per click",
      rarity: "rare",
      value: 10,
    },
    {
      id: "premium-4",
      name: "Hologram Click",
      type: "clickEffect",
      description: "Holographic projection on each click",
      rarity: "rare",
      value: 3,
    },
    {
      id: "premium-5",
      name: "Time Warp",
      type: "special",
      description: "Auto clickers run 20% faster",
      rarity: "epic",
      value: 20,
    },
  ],
  elite: [
    {
      id: "elite-1",
      name: "Quantum Particles",
      type: "clickEffect",
      description: "Quantum particle effects on clicks",
      rarity: "rare",
      value: 3,
    },
    {
      id: "elite-2",
      name: "Neural Network",
      type: "visualEffect",
      description: "Neural network animations in the background",
      rarity: "rare",
      value: 3,
    },
    {
      id: "elite-3",
      name: "Efficiency Module",
      type: "bonus",
      description: "Upgrades cost 15% less",
      rarity: "epic",
      value: 15,
    },
    {
      id: "elite-4",
      name: "Fractal Click",
      type: "clickEffect",
      description: "Fractal patterns explode from clicks",
      rarity: "epic",
      value: 4,
    },
    {
      id: "elite-5",
      name: "Temporal Shift",
      type: "special",
      description: "Chance to get double credits randomly",
      rarity: "legendary",
      value: 5,
    },
  ],
  legendary: [
    {
      id: "legendary-1",
      name: "Supernova",
      type: "clickEffect",
      description: "Cosmic explosion on critical clicks",
      rarity: "epic",
      value: 4,
    },
    {
      id: "legendary-2",
      name: "Reality Glitch",
      type: "visualEffect",
      description: "Reality-bending visual glitches",
      rarity: "epic",
      value: 4,
    },
    {
      id: "legendary-3",
      name: "Golden Touch",
      type: "bonus",
      description: "+25% credits from all sources",
      rarity: "legendary",
      value: 25,
    },
    {
      id: "legendary-4",
      name: "Dimensional Rift",
      type: "clickEffect",
      description: "Opens rifts in reality when clicking",
      rarity: "legendary",
      value: 5,
    },
    {
      id: "legendary-5",
      name: "Time Dilation",
      type: "special",
      description: "Everything runs 30% faster",
      rarity: "legendary",
      value: 30,
    },
  ],
}

// Rarity colors
const rarityColors = {
  common: "#aaaaaa",
  uncommon: "#1eff00",
  rare: "#0070dd",
  epic: "#a335ee",
  legendary: "#ff8000",
}

export default function CaseSystem({
  onOpen,
  money,
  onSpendMoney,
  primaryColor,
  secondaryColor,
  accentColor,
  unlockedCases = ["basic"], // Default to only basic case
}: CaseSystemProps) {
  const [selectedCase, setSelectedCase] = useState<string | null>(null)
  const [isOpening, setIsOpening] = useState(false)
  const [reward, setReward] = useState<CaseReward | null>(null)
  const [showReward, setShowReward] = useState(false)

  // Filter case types based on unlocked cases
  const availableCaseTypes = caseTypes.filter((caseType) => unlockedCases.includes(caseType.id))

  const openCase = (caseId: string) => {
    const caseType = caseTypes.find((c) => c.id === caseId)
    if (!caseType || money < caseType.cost) return

    onSpendMoney(caseType.cost)
    setSelectedCase(caseId)
    setIsOpening(true)

    // Simulate opening animation
    setTimeout(() => {
      // Select random reward based on case type
      const rewards = possibleRewards[caseId]
      const selectedReward = rewards[Math.floor(Math.random() * rewards.length)]

      setReward(selectedReward)
      setIsOpening(false)
      setShowReward(true)
      onOpen(selectedReward)
    }, 3000)
  }

  const closeReward = () => {
    setShowReward(false)
    setReward(null)
    setSelectedCase(null)
  }

  return (
    <div className="w-full">
      {/* Case selection */}
      {!isOpening && !showReward && (
        <div className="grid grid-cols-2 gap-3">
          {availableCaseTypes.map((caseType) => (
            <div
              key={caseType.id}
              className={cn(
                "flex cursor-pointer flex-col items-center rounded-sm border-2 p-3 transition-all duration-300",
                money < caseType.cost ? "opacity-50" : "hover:bg-opacity-20",
              )}
              style={{
                borderColor: caseType.color,
                boxShadow: `0 0 10px ${caseType.color}40`,
              }}
              onClick={() => money >= caseType.cost && openCase(caseType.id)}
            >
              <div className="mb-2 text-3xl">{caseType.image}</div>
              <div className="mb-1 text-center text-sm font-bold" style={{ color: caseType.color }}>
                {caseType.name}
              </div>
              <div className="mb-2 text-center text-xs opacity-70">{caseType.description}</div>
              <div
                className="text-center text-xs font-bold"
                style={{ color: money >= caseType.cost ? secondaryColor : "gray" }}
              >
                ¥{caseType.cost.toLocaleString()}
              </div>
            </div>
          ))}

          {/* Show locked cases as coming soon */}
          {caseTypes
            .filter((caseType) => !unlockedCases.includes(caseType.id))
            .map((caseType) => (
              <div
                key={caseType.id}
                className="flex cursor-not-allowed flex-col items-center rounded-sm border-2 border-opacity-30 p-3 opacity-50"
                style={{
                  borderColor: "gray",
                }}
              >
                <div className="mb-2 text-3xl">?</div>
                <div className="mb-1 text-center text-sm font-bold" style={{ color: "gray" }}>
                  {caseType.name}
                </div>
                <div className="mb-2 text-center text-xs opacity-70">Unlock by earning more credits</div>
                <div className="text-center text-xs font-bold" style={{ color: "gray" }}>
                  LOCKED
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Opening animation */}
      {isOpening && (
        <div className="flex h-64 flex-col items-center justify-center">
          <div className="mb-4 text-2xl font-bold" style={{ color: primaryColor }}>
            Opening Case...
          </div>
          <motion.div
            className="text-6xl"
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              rotate: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
              scale: { duration: 1, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
            }}
          >
            {caseTypes.find((c) => c.id === selectedCase)?.image || "📦"}
          </motion.div>
          <div className="mt-4 text-sm" style={{ color: secondaryColor }}>
            Discovering your reward...
          </div>
        </div>
      )}

      {/* Reward display */}
      <AnimatePresence>
        {showReward && reward && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-md rounded-sm border-2 bg-black/90 p-6"
              style={{
                borderColor: rarityColors[reward.rarity],
                boxShadow: `0 0 30px ${rarityColors[reward.rarity]}`,
              }}
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
            >
              <button className="absolute right-2 top-2 text-gray-400 hover:text-white" onClick={closeReward}>
                <X className="h-6 w-6" />
              </button>

              <div className="mb-4 text-center">
                <div
                  className="text-xl font-bold uppercase tracking-wider"
                  style={{ color: rarityColors[reward.rarity] }}
                >
                  {reward.rarity} Reward!
                </div>
              </div>

              <div className="mb-6 flex items-center justify-center">
                <motion.div
                  className="flex h-24 w-24 items-center justify-center rounded-full border-2"
                  style={{
                    borderColor: rarityColors[reward.rarity],
                    boxShadow: `0 0 20px ${rarityColors[reward.rarity]}`,
                  }}
                  animate={{
                    boxShadow: [
                      `0 0 20px ${rarityColors[reward.rarity]}`,
                      `0 0 40px ${rarityColors[reward.rarity]}`,
                      `0 0 20px ${rarityColors[reward.rarity]}`,
                    ],
                  }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  <Sparkles className="h-12 w-12" style={{ color: rarityColors[reward.rarity] }} />
                </motion.div>
              </div>

              <div className="mb-2 text-center text-xl font-bold" style={{ color: rarityColors[reward.rarity] }}>
                {reward.name}
              </div>

              <div className="mb-4 text-center text-sm opacity-80">{reward.description}</div>

              <div className="flex justify-center">
                <button
                  className="rounded-sm border-2 px-6 py-2 font-bold uppercase tracking-wider transition-all duration-300"
                  style={{
                    borderColor: rarityColors[reward.rarity],
                    color: rarityColors[reward.rarity],
                    boxShadow: `0 0 10px ${rarityColors[reward.rarity]}80`,
                  }}
                  onClick={closeReward}
                >
                  Awesome!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

