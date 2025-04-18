"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

export type Prize = {
  id: string
  type: "money" | "multiplier" | "boost" | "special"
  value: number
  label: string
}

interface FortuneWheelProps {
  onSpin: (prize: Prize) => void
  canSpin: boolean
  primaryColor: string
  secondaryColor: string
  accentColor: string
}

const prizes: Prize[] = [
  { id: "money-1", type: "money", value: 1000, label: "¥1K" },
  { id: "multiplier-1", type: "multiplier", value: 2, label: "2x" },
  { id: "money-2", type: "money", value: 5000, label: "¥5K" },
  { id: "boost-1", type: "boost", value: 1.5, label: "BOOST" },
  { id: "money-3", type: "money", value: 10000, label: "¥10K" },
  { id: "multiplier-2", type: "multiplier", value: 3, label: "3x" },
  { id: "money-4", type: "money", value: 25000, label: "¥25K" },
  { id: "special-1", type: "special", value: 5, label: "LUCKY" },
]

export default function FortuneWheel({
  onSpin,
  canSpin,
  primaryColor,
  secondaryColor,
  accentColor,
}: FortuneWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null)
  const [cooldownTime, setCooldownTime] = useState(0)
  const [cooldownEndTime, setCooldownEndTime] = useState<number | null>(null)
  const wheelRef = useRef<HTMLDivElement>(null)

  // Load cooldown from localStorage on mount
  useEffect(() => {
    const savedEndTime = localStorage.getItem("wheelCooldownEndTime")
    if (savedEndTime) {
      const endTime = Number.parseInt(savedEndTime, 10)
      if (endTime > Date.now()) {
        setCooldownEndTime(endTime)
        setCooldownTime(Math.ceil((endTime - Date.now()) / 1000))
      } else {
        // Cooldown has expired
        localStorage.removeItem("wheelCooldownEndTime")
      }
    }
  }, [])

  // Update cooldown timer
  useEffect(() => {
    if (cooldownTime <= 0 || !cooldownEndTime) return

    const interval = setInterval(() => {
      const newCooldown = Math.ceil((cooldownEndTime - Date.now()) / 1000)
      if (newCooldown <= 0) {
        setCooldownTime(0)
        setCooldownEndTime(null)
        localStorage.removeItem("wheelCooldownEndTime")
        clearInterval(interval)
      } else {
        setCooldownTime(newCooldown)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [cooldownTime, cooldownEndTime])

  const spinWheel = () => {
    if (isSpinning || cooldownTime > 0) return

    setIsSpinning(true)
    setSelectedPrize(null)

    // Random number of full rotations (3-5) plus random angle for prize
    const fullRotations = 3 + Math.floor(Math.random() * 3)
    const prizeIndex = Math.floor(Math.random() * prizes.length)
    const prizeAngle = (360 / prizes.length) * prizeIndex
    const randomOffset = Math.random() * (360 / prizes.length) * 0.5 // Small random offset within segment
    const finalRotation = fullRotations * 360 + prizeAngle + randomOffset

    setRotation(finalRotation)

    // Set timeout to handle prize selection after animation
    setTimeout(() => {
      setIsSpinning(false)
      const selectedPrize = prizes[prizeIndex]
      setSelectedPrize(selectedPrize)
      onSpin(selectedPrize)

      // Set random cooldown between 1-5 minutes
      const randomMinutes = 1 + Math.floor(Math.random() * 5)
      const cooldownSeconds = randomMinutes * 60
      setCooldownTime(cooldownSeconds)

      const endTime = Date.now() + cooldownSeconds * 1000
      setCooldownEndTime(endTime)
      localStorage.setItem("wheelCooldownEndTime", endTime.toString())
    }, 5000) // Match this with the animation duration
  }

  // Calculate the angle for each prize segment
  const segmentAngle = 360 / prizes.length

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-64 mb-4">
        {/* Wheel */}
        <motion.div
          ref={wheelRef}
          className="absolute inset-0 rounded-full border-4"
          style={{
            borderColor: primaryColor,
            backgroundColor: `${secondaryColor}20`,
            boxShadow: `0 0 15px ${primaryColor}80, inset 0 0 15px ${primaryColor}40`,
          }}
          animate={{ rotate: rotation }}
          transition={{ duration: 5, ease: "easeOut" }}
        >
          {/* Prize segments */}
          {prizes.map((prize, index) => {
            const angle = index * segmentAngle
            return (
              <div
                key={prize.id}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full"
                style={{
                  transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                }}
              >
                {/* Segment line */}
                <div
                  className="absolute top-1/2 left-1/2 h-[1px] w-full"
                  style={{ backgroundColor: `${primaryColor}80` }}
                ></div>

                {/* Prize label */}
                <div
                  className="absolute top-[15%] left-1/2 -translate-x-1/2 text-xs font-bold"
                  style={{
                    color:
                      prize.type === "money"
                        ? primaryColor
                        : prize.type === "multiplier"
                          ? accentColor
                          : prize.type === "boost"
                            ? secondaryColor
                            : "white",
                    textShadow: `0 0 5px ${
                      prize.type === "money"
                        ? `${primaryColor}80`
                        : prize.type === "multiplier"
                          ? `${accentColor}80`
                          : prize.type === "boost"
                            ? `${secondaryColor}80`
                            : "rgba(255,255,255,0.8)"
                    }`,
                  }}
                >
                  {prize.label}
                </div>
              </div>
            )
          })}

          {/* Center circle */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 flex items-center justify-center"
            style={{
              borderColor: primaryColor,
              backgroundColor: `${secondaryColor}40`,
              boxShadow: `0 0 10px ${primaryColor}60`,
            }}
          >
            <Sparkles className="w-6 h-6" style={{ color: accentColor }} />
          </div>
        </motion.div>

        {/* Pointer */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6"
          style={{ color: accentColor }}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 4L4 20h16L12 4z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Spin button */}
      <button
        className={`px-6 py-2 rounded-sm border-2 font-bold uppercase tracking-wider transition-all ${
          isSpinning || cooldownTime > 0 ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
        }`}
        style={{
          borderColor: primaryColor,
          color: primaryColor,
          backgroundColor: `${secondaryColor}20`,
          boxShadow: `0 0 10px ${primaryColor}40`,
        }}
        onClick={spinWheel}
        disabled={isSpinning || cooldownTime > 0}
      >
        {isSpinning
          ? "Spinning..."
          : cooldownTime > 0
            ? `Cooldown: ${Math.floor(cooldownTime / 60)}:${(cooldownTime % 60).toString().padStart(2, "0")}`
            : "Spin"}
      </button>

      {/* Selected prize notification */}
      {selectedPrize && !isSpinning && cooldownTime > 0 && (
        <div className="mt-4 text-center font-bold" style={{ color: accentColor }}>
          You won: {selectedPrize.label}!
        </div>
      )}
    </div>
  )
}
